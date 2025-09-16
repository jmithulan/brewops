import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllPayments,
  createPayment,
  getPaymentById,
  updatePayment,
  completePayment,
  cancelPayment,
  getPaymentSummary,
  getDailyPaymentReport,
  getMonthlyPaymentReport
} from "../controllers/paymentController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Payment management routes
router.get("/", getAllPayments);
router.post("/", createPayment);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.put("/:id/complete", completePayment);
router.put("/:id/cancel", cancelPayment);

// Payment summary and reports
router.get("/summary/:supplier_id", getPaymentSummary);
router.get("/reports/daily/:date", getDailyPaymentReport);
router.get("/reports/monthly/:year/:month", getMonthlyPaymentReport);

export default router;