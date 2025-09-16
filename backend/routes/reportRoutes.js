import express from "express";
import {
  getDailySupplierReport,
  getMonthlySupplierReport,
  getDailyInventoryReport,
  getMonthlyInventoryReport,
  getDashboardReport
} from "../controllers/reportController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Supplier reports
router.get("/suppliers/daily/:date", getDailySupplierReport);
router.get("/suppliers/monthly/:year/:month", getMonthlySupplierReport);

// Inventory reports
router.get("/inventory/daily/:date", getDailyInventoryReport);
router.get("/inventory/monthly/:year/:month", getMonthlyInventoryReport);

// Dashboard report
router.get("/dashboard", getDashboardReport);

export default router;
