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

export default router;