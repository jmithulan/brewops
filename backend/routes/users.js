import express from "express";

const router = express.Router();

// Get all users
router.get("/", (req, res) => {
  res.json({
    success: true,
    users: []
  });
});

// Get user by ID
router.get("/:id", (req, res) => {
  res.json({
    success: true,
    user: null
  });
});

export default router;