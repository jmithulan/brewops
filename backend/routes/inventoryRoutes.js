import express from "express";
import {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  generateInventoryIdEndpoint,
<<<<<<< HEAD
  searchInventories,
=======
>>>>>>> b34fc7b (init)
} from "../controllers/inventoryController.js";

const router = express.Router();

// Inventory ID generation route (should be before /:id route)
router.get("/generate-inventory-id", generateInventoryIdEndpoint);

<<<<<<< HEAD
// Search route (should be before /:id route)
router.get("/search", searchInventories);

=======
>>>>>>> b34fc7b (init)
// CRUD Routes
router.post("/", createInventory);
router.get("/", getInventories);
router.get("/:id", getInventoryById);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

export default router;
