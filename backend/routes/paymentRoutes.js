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

// Additional routes for missing endpoints
router.get("/statistics", authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const filters = {};
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    
    const payments = await getAllPayments({ query: { ...filters, limit: 1000 } }, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

export default router;