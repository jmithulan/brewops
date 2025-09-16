import Delivery from "../models/Delivery.js";
import Supplier from "../models/Supplier.js";

// REQ-3: Staff enter supplier details
export async function createDelivery(req, res) {
  try {
    const deliveryData = {
      ...req.body,
      supplier_id: req.params.supplierId
    };

    // Validate supplier exists
    const supplier = await Supplier.findById(deliveryData.supplier_id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

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

// Get all deliveries
export async function getAllDeliveries(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const deliveries = await Delivery.findAll(parseInt(limit), offset);

    res.json({
      success: true,
      deliveries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: deliveries.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get all deliveries error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get delivery by ID
export async function getDeliveryById(req, res) {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    res.json({
      success: true,
      delivery
    });
  } catch (error) {
    console.error("Get delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Update delivery
export async function updateDelivery(req, res) {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    const updatedDelivery = await Delivery.update(id, req.body);
    
    res.json({
      success: true,
      message: "Delivery updated successfully",
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error("Update delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Delete delivery
export async function deleteDelivery(req, res) {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    const deleted = await Delivery.delete(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: "Delivery deleted successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete delivery"
      });
    }
  } catch (error) {
    console.error("Delete delivery error:", error);
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

// Get monthly delivery report
export async function getMonthlyDeliveryReport(req, res) {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required"
      });
    }

    const stats = await Delivery.getMonthlyStats(parseInt(year), parseInt(month));
    
    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      stats
    });
  } catch (error) {
    console.error("Get monthly delivery report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}




