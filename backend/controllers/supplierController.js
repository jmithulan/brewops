import Supplier from "../models/Supplier.js";
import Delivery from "../models/Delivery.js";
import Payment from "../models/Payment.js";

// REQ-1: Supplier registration
export async function registerSupplier(req, res) {
  try {
    const supplierData = {
      ...req.body,
      supplier_id: await Supplier.generateSupplierId()
    };

    // Check if supplier already exists with same NIC
    if (supplierData.nic_number) {
      const existingSupplier = await Supplier.findBySupplierId(supplierData.supplier_id);
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: "Supplier with this NIC already exists"
        });
      }
    }

    const supplier = await Supplier.create(supplierData);
    
    res.status(201).json({
      success: true,
      message: "Supplier registered successfully",
      supplier
    });
  } catch (error) {
    console.error("Supplier registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get supplier profile
export async function getSupplierProfile(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    // Get supplier statistics
    const stats = await Supplier.getSupplierStats(id);

    res.json({
      success: true,
      supplier,
      stats
    });
  } catch (error) {
    console.error("Get supplier profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Update supplier profile
export async function updateSupplierProfile(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    const updatedSupplier = await Supplier.update(id, req.body);
    
    res.json({
      success: true,
      message: "Supplier profile updated successfully",
      supplier: updatedSupplier
    });
  } catch (error) {
    console.error("Update supplier profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// REQ-2: Get supplier transaction history
export async function getSupplierTransactions(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const deliveries = await Delivery.findBySupplierId(id, parseInt(limit), offset);
    const payments = await Payment.findBySupplier(id, parseInt(limit), offset);

    res.json({
      success: true,
      deliveries,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: deliveries.length === parseInt(limit) || payments.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get supplier transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Staff: Get all suppliers
export async function getAllSuppliers(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const suppliers = await Supplier.findAll(parseInt(limit), offset);

    res.json({
      success: true,
      suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: suppliers.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get all suppliers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Staff: Get supplier details
export async function getSupplierDetails(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    const stats = await Supplier.getSupplierStats(id);

    res.json({
      success: true,
      supplier,
      stats
    });
  } catch (error) {
    console.error("Get supplier details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Staff: Update supplier
export async function updateSupplier(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    const updatedSupplier = await Supplier.update(id, req.body);
    
    res.json({
      success: true,
      message: "Supplier updated successfully",
      supplier: updatedSupplier
    });
  } catch (error) {
    console.error("Update supplier error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Staff: Delete supplier
export async function deleteSupplier(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    const deleted = await Supplier.delete(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: "Supplier deleted successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete supplier"
      });
    }
  } catch (error) {
    console.error("Delete supplier error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Staff: Create delivery record
export async function createDelivery(req, res) {
  try {
    const deliveryData = {
      ...req.body,
      supplier_id: req.params.id
    };

    const delivery = await Delivery.create(deliveryData);
    
    res.status(201).json({
      success: true,
      message: "Delivery recorded successfully",
      delivery
    });
  } catch (error) {
    console.error("Create delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get delivery statistics
export async function getDeliveryStats(req, res) {
  try {
    const { supplierId } = req.query;
    const stats = await Delivery.getDeliveryStats(supplierId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Get delivery stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}