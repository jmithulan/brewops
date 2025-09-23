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

// Get all users
router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      users: users.map(user => {
        const { password, token_version, ...userProfile } = user;
        return userProfile;
      })
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Get user by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { password, token_version, ...userProfile } = user;
    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Get user profile (for frontend compatibility)
router.get("/profile", authenticateToken, async (req, res) => {
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
      profile: userProfile,
      // Also return user data directly for compatibility
      ...userProfile
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

// Update user profile (for frontend compatibility)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("Received profile update data:", req.body);
    
    // Only extract fields that exist in database schema
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    // Only check email conflicts if email is being updated
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken"
        });
      }
    }

    // Update user profile (only using columns that exist in database)
    const updateData = {
      name,
      phone: phone || null
    };
    
    // Only include email if provided
    if (email) updateData.email = email;

    console.log("Updating user with data:", updateData);

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

// Upload profile image
router.put("/profile/image", authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required"
      });
    }

    // Update user profile image
    const profileImagePath = `/uploads/profiles/${req.file.filename}`;
    const updatedUser = await User.update(userId, {
      avatar: profileImagePath,
      updated_at: new Date()
    });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Remove sensitive information
    const { password, token_version, ...userProfile } = updatedUser;

    res.json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: profileImagePath
    });
  } catch (error) {
    console.error("Upload profile image error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Update notification settings
router.put("/notification-settings", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationSettings = req.body;

    // For now, we'll store notification settings in a simple way
    // In a real application, you might want to create a separate table for user preferences
    const updatedUser = await User.update(userId, {
      notification_settings: JSON.stringify(notificationSettings),
      updated_at: new Date()
    });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      settings: notificationSettings
    });
  } catch (error) {
    console.error("Update notification settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Change password (for frontend compatibility)
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
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
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

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.update(userId, {
      password: hashedNewPassword,
      token_version: (user.token_version || 0) + 1, // Invalidate existing tokens
      updated_at: new Date()
    });

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

export default router;