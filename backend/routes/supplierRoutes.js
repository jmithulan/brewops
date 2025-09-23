import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  registerSupplier,
  getSupplierProfile,
  updateSupplierProfile,
  getSupplierTransactions,
  getAllSuppliers,
  getSupplierDetails,
  updateSupplier,
  deleteSupplier,
  createDelivery,
  getDeliveryStats
} from "../controllers/supplierController.js";

const router = express.Router();

// Supplier registration (public route)
router.post("/register", registerSupplier);

// Supplier profile routes (authenticated)
router.get("/:id/profile", authenticateToken, getSupplierProfile);
router.put("/:id/profile", authenticateToken, updateSupplierProfile);
router.get("/:id/transactions", authenticateToken, getSupplierTransactions);

// Staff/Admin routes for managing suppliers
router.get("/", authenticateToken, getAllSuppliers);
router.get("/:id", authenticateToken, getSupplierDetails);
router.put("/:id", authenticateToken, updateSupplier);
router.delete("/:id", authenticateToken, deleteSupplier);

// Delivery management routes
router.post("/:id/deliveries", authenticateToken, createDelivery);
router.get("/stats/deliveries", authenticateToken, getDeliveryStats);

// Additional routes for missing endpoints
router.get("/active", authenticateToken, async (req, res) => {
  try {
    const suppliers = await getAllSuppliers(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const { supplier_id } = req.query;
    if (!supplier_id) {
      return res.status(400).json({
        success: false,
        message: "supplier_id parameter is required"
      });
    }
    const transactions = await getSupplierTransactions({ params: { id: supplier_id } }, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

router.get("/paymentSummary", authenticateToken, async (req, res) => {
  try {
    const { supplier_id, date_from, date_to } = req.query;
    if (!supplier_id || !date_from || !date_to) {
      return res.status(400).json({
        success: false,
        message: "supplier_id, date_from, and date_to parameters are required"
      });
    }
    const summary = await getPaymentSummary({ params: { supplier_id }, query: { date_from, date_to } }, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

export default router;