import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { registerUser, loginUser, getUser } from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/user", authenticateToken, getUser);

export default router;




