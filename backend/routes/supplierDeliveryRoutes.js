import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createSupplierDelivery,
  getAllSupplierDeliveries,
  getSupplierDeliveryById,
  updateSupplierDelivery,
  getDailyDeliveryReport,
  getMonthlyDeliveryReport,
  approveDelivery,
  rejectDelivery
} from "../controllers/supplierDeliveryController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Staff routes for managing supplier deliveries
router.post("/", createSupplierDelivery);
router.get("/", getAllSupplierDeliveries);
router.get("/:id", getSupplierDeliveryById);
router.put("/:id", updateSupplierDelivery);
router.put("/:id/approve", approveDelivery);
router.put("/:id/reject", rejectDelivery);

// Reporting routes
router.get("/reports/daily/:date", getDailyDeliveryReport);
router.get("/reports/monthly/:year/:month", getMonthlyDeliveryReport);

export default router;

