import express from "express";
<<<<<<< HEAD
=======
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
>>>>>>> b34fc7b (init)

const router = express.Router();

// Get user profile
<<<<<<< HEAD
router.get("/", (req, res) => {
  res.json({
    success: true,
    profile: null
  });
});

// Update user profile
router.put("/", (req, res) => {
  res.json({
    success: true,
    message: "Profile updated successfully"
  });
});

=======
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
    const { password, token_version, ...userProfile } = user;


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
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address, avatar, employee_id } = req.body;
    const userId = req.user.id;


    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({
        success: false,
        message: "Email is already taken"
      });
    }

    // Update user profile
    const updateData = {
      name,
      email,
      phone: phone || null,
      address: address || null,
      employee_id: employee_id || null,
      avatar: avatar || null,
      updated_at: new Date()
    };

    const updatedUser = await User.update(userId, updateData);
    
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

// Upload profile image
router.post("/upload-avatar", authenticateToken, async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user.id;


    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Avatar image is required"
      });
    }

    // Update user avatar
    const updateData = {
      avatar,
      updated_at: new Date()
    };

    const updatedUser = await User.update(userId, updateData);
    
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
      message: "Avatar updated successfully",
      profile: userProfile
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

>>>>>>> b34fc7b (init)
export default router;