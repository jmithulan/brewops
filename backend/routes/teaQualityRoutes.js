import express from "express";
import {
  createTeaQuality,
  getAllTeaQualities,
  getTeaQualityById,
  updateTeaQuality,
  deleteTeaQuality
} from "../controllers/teaQualityController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// CRUD Routes
router.post("/", createTeaQuality);
router.get("/", getAllTeaQualities);
router.get("/:id", getTeaQualityById);
router.put("/:id", updateTeaQuality);
router.delete("/:id", deleteTeaQuality);

export default router;
