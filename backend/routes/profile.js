import express from "express";

const router = express.Router();

// Get user profile
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

export default router;