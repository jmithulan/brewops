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
    const { name, email, phone, avatar } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    // Update user profile (only using columns that exist)
    const updateData = {
      name: name.trim(),
      phone: phone?.trim() || null,
      updated_at: new Date()
    };
    
    // Only include email and avatar if they are provided
    if (email) updateData.email = email.trim();
    if (avatar) updateData.avatar = avatar;

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