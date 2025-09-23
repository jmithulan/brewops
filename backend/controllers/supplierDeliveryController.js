import SupplierDelivery from "../models/SupplierDelivery.js";
import RawTeaLeaves from "../models/RawTeaLeaves.js";
import { db } from "../config/db.js";

// REQ-3: Staff enter supplier details
export async function createSupplierDelivery(req, res) {
  try {
    const deliveryData = {
      staff_id: req.user.id,
      ...req.body
    };

    // Validate required fields
    if (!deliveryData.supplier_id || !deliveryData.delivery_date || !deliveryData.weight_kg || !deliveryData.quality_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: supplier_id, delivery_date, weight_kg, quality_id"
      });
    }

    // Calculate total amount if not provided
    if (!deliveryData.price_per_kg) {
      // Get standard price from tea quality
      const [qualityRows] = await db.execute(
        "SELECT price_per_kg FROM tea_quality WHERE id = ?",
        [deliveryData.quality_id]
      );
      
      if (qualityRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid quality ID"
        });
      }
      
      deliveryData.price_per_kg = qualityRows[0].price_per_kg;
    }

    if (!deliveryData.total_amount) {
      deliveryData.total_amount = deliveryData.weight_kg * deliveryData.price_per_kg;
    }

    const delivery = await SupplierDelivery.create(deliveryData);

    // Create raw tea leaves entry
    const rawLeavesData = {
      delivery_id: delivery.id,
      quality_id: deliveryData.quality_id,
      weight_kg: deliveryData.weight_kg,
      received_date: deliveryData.delivery_date,
      location: deliveryData.location || 'Main Storage',
      status: 'fresh',
      notes: `From delivery #${delivery.id}`,
      created_by: req.user.id
    };

    await RawTeaLeaves.create(rawLeavesData);

    res.status(201).json({
      success: true,
      message: "Supplier delivery recorded successfully",
      delivery
    });
  } catch (error) {
    console.error("Create supplier delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get all supplier deliveries
export async function getAllSupplierDeliveries(req, res) {
  try {
    const { page = 1, limit = 20, supplier_id, date_from, date_to, status } = req.query;
    const offset = (page - 1) * limit;

    const filters = {};
    if (supplier_id) filters.supplier_id = supplier_id;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (status) filters.status = status;

    const deliveries = await SupplierDelivery.findAll(parseInt(limit), offset, filters);

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
    console.error("Get all supplier deliveries error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get supplier delivery by ID
export async function getSupplierDeliveryById(req, res) {
  try {
    const { id } = req.params;
    const delivery = await SupplierDelivery.findById(id);
    
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
    console.error("Get supplier delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Update supplier delivery
export async function updateSupplierDelivery(req, res) {
  try {
    const { id } = req.params;
    const delivery = await SupplierDelivery.findById(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    const updatedDelivery = await SupplierDelivery.update(id, req.body);
    
    res.json({
      success: true,
      message: "Delivery updated successfully",
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error("Update supplier delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// REQ-5: Daily reports for supplier deliveries
export async function getDailyDeliveryReport(req, res) {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
      });
    }

    const report = await SupplierDelivery.getDailyReport(date);

    res.json({
      success: true,
      date,
      report
    });
  } catch (error) {
    console.error("Get daily delivery report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// REQ-5: Monthly reports for supplier deliveries
export async function getMonthlyDeliveryReport(req, res) {
  try {
    const { year, month } = req.params;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month parameters are required"
      });
    }

    const report = await SupplierDelivery.getMonthlyReport(parseInt(year), parseInt(month));

    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      report
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

// Approve delivery
export async function approveDelivery(req, res) {
  try {
    const { id } = req.params;
    const delivery = await SupplierDelivery.findById(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    const updatedDelivery = await SupplierDelivery.update(id, { status: 'approved' });
    
    res.json({
      success: true,
      message: "Delivery approved successfully",
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error("Approve delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Reject delivery
export async function rejectDelivery(req, res) {
  try {
    const { id } = req.params;
    const delivery = await SupplierDelivery.findById(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    const updatedDelivery = await SupplierDelivery.update(id, { status: 'rejected' });
    
    res.json({
      success: true,
      message: "Delivery rejected",
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error("Reject delivery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}
