import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  getDeliveryStats,
  getMonthlyDeliveryReport
} from "../controllers/deliveryController.js";

const router = express.Router();

// All delivery routes require authentication
router.use(authenticateToken);

// Delivery CRUD operations
router.post("/", createDelivery);
router.get("/", getAllDeliveries);
router.get("/stats", getDeliveryStats);
router.get("/monthly-report", getMonthlyDeliveryReport);
router.get("/:id", getDeliveryById);
router.put("/:id", updateDelivery);
router.delete("/:id", deleteDelivery);

export default router;







