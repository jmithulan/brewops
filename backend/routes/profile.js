import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profiles');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

const router = express.Router();

// Get user profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Remove sensitive information
    const { password_hash, token_version, ...userProfile } = user;

    res.json({
      success: true,
      profile: userProfile
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Update user profile
router.put("/", authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    // Build update data (only using columns that exist in the database)
    const updateData = {
      name: name.trim(),
      phone: phone?.trim() || null,
      updated_at: new Date()
    };

    // Add profile image if uploaded
    if (req.file) {
      updateData.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await User.update(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get fresh user data after update
    const refreshedUser = await User.findById(userId);
    const { password_hash, token_version, ...userProfile } = refreshedUser;

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: userProfile
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Change password
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long"
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has a password set (for OAuth users)
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: "Cannot change password for accounts created with Google OAuth. Please use Google to manage your password."
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await User.comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password using the User model method
    await User.updatePassword(userId, newPassword);

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Upload profile image (separate endpoint for image uploads)
router.post("/upload-avatar", authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar image is required"
      });
    }

    // Update user avatar
    const avatarPath = `/uploads/profiles/${req.file.filename}`;
    const updateData = {
      avatar: avatarPath,
      updated_at: new Date()
    };

    const updatedUser = await User.update(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get fresh user data
    const refreshedUser = await User.findById(userId);
    const { password_hash, token_version, ...userProfile } = refreshedUser;

    res.json({
      success: true,
      message: "Avatar updated successfully",
      profile: userProfile,
      avatarUrl: avatarPath
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Get user permissions
router.get("/permissions", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get role permissions
    const permissions = getRolePermissions(user.role);

    res.json({
      success: true,
      permissions,
      role: user.role,
      effectiveRole: user.effectiveRole || user.role
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Helper function to get role permissions
function getRolePermissions(role) {
  const basePermissions = ['view_profile', 'edit_profile'];
  
  switch (role) {
    case 'admin':
      return [
        ...basePermissions,
        'view_all_users', 'create_user', 'edit_user', 'delete_user',
        'view_all_suppliers', 'create_supplier', 'edit_supplier', 'delete_supplier',
        'view_all_inventory', 'create_inventory', 'edit_inventory', 'delete_inventory',
        'view_all_reports', 'generate_reports', 'export_data',
        'view_system_settings', 'manage_backups', 'view_audit_logs'
      ];
    case 'manager':
      return [
        ...basePermissions,
        'view_all_users', 'create_user', 'edit_user',
        'view_all_suppliers', 'create_supplier', 'edit_supplier',
        'view_all_inventory', 'create_inventory', 'edit_inventory',
        'view_all_reports', 'generate_reports', 'export_data'
      ];
    case 'staff':
      return [
        ...basePermissions,
        'view_suppliers', 'create_supplier', 'edit_supplier',
        'view_inventory', 'create_inventory', 'edit_inventory',
        'view_reports', 'generate_reports'
      ];
    case 'supplier':
      return [
        ...basePermissions,
        'view_own_deliveries', 'create_delivery', 'edit_own_deliveries',
        'view_own_transactions', 'view_own_reports'
      ];
    default:
      return basePermissions;
  }
}

export default router;