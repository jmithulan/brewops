import RawTeaLeaves from "../models/RawTeaLeaves.js";
import ProductionBatch from "../models/ProductionBatch.js";
import { db } from "../config/db.js";

// REQ-1: Staff log incoming tea leaves and categorize them
export async function logTeaLeaves(req, res) {
  try {
    const leavesData = {
      created_by: req.user.id,
      ...req.body,
    };

    // Validate required fields
    if (
      !leavesData.quality_id ||
      !leavesData.weight_kg ||
      !leavesData.received_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: quality_id, weight_kg, received_date",
      });
    }

    const leaves = await RawTeaLeaves.create(leavesData);

    res.status(201).json({
      success: true,
      message: "Tea leaves logged successfully",
      leaves,
    });
  } catch (error) {
    console.error("Log tea leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Get all raw tea leaves inventory
export async function getAllRawTeaLeaves(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      quality_id,
      date_from,
      date_to,
    } = req.query;
    const offset = (page - 1) * limit;

    const filters = {};
    if (status) filters.status = status;
    if (quality_id) filters.quality_id = quality_id;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const leaves = await RawTeaLeaves.findAll(parseInt(limit), offset, filters);

    res.json({
      success: true,
      leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: leaves.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all raw tea leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Get inventory summary
export async function getInventorySummary(req, res) {
  try {
    const summary = await RawTeaLeaves.getInventorySummary();

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Get inventory summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Update tea leaves status
export async function updateTeaLeavesStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const leaves = await RawTeaLeaves.findById(id);

    if (!leaves) {
      return res.status(404).json({
        success: false,
        message: "Tea leaves record not found",
      });
    }

    const updatedLeaves = await RawTeaLeaves.update(id, { status });

    res.json({
      success: true,
      message: "Tea leaves status updated successfully",
      leaves: updatedLeaves,
    });
  } catch (error) {
    console.error("Update tea leaves status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// REQ-3: Production manager request raw materials
export async function requestRawMaterials(req, res) {
  try {
    const requestData = {
      requested_by: req.user.id,
      ...req.body,
    };

    // Generate request number
    const requestNumber = `RMR-${Date.now()}`;
    requestData.request_number = requestNumber;

    // Validate required fields
    if (
      !requestData.quality_id ||
      !requestData.quantity_kg ||
      !requestData.required_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: quality_id, quantity_kg, required_date",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO raw_material_requests 
       (request_number, requested_by, quality_id, quantity_kg, required_date, priority, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        requestData.request_number,
        requestData.requested_by,
        requestData.quality_id,
        requestData.quantity_kg,
        requestData.required_date,
        requestData.priority || "medium",
        requestData.notes,
      ]
    );

    const request = await this.getRawMaterialRequestById(result.insertId);

    res.status(201).json({
      success: true,
      message: "Raw material request created successfully",
      request,
    });
  } catch (error) {
    console.error("Request raw materials error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Get raw material request by ID
export async function getRawMaterialRequestById(id) {
  const [rows] = await db.execute(
    `SELECT rmr.*, 
            u.name as requested_by_name,
            tq.quality_name, tq.price_per_kg,
            approver.name as approved_by_name
     FROM raw_material_requests rmr
     LEFT JOIN users u ON rmr.requested_by = u.id
     LEFT JOIN tea_quality tq ON rmr.quality_id = tq.id
     LEFT JOIN users approver ON rmr.approved_by = approver.id
     WHERE rmr.id = ?`,
    [id]
  );
  return rows[0];
}

// Get all raw material requests
export async function getAllRawMaterialRequests(req, res) {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT rmr.*, 
                        u.name as requested_by_name,
                        tq.quality_name,
                        approver.name as approved_by_name
                 FROM raw_material_requests rmr
                 LEFT JOIN users u ON rmr.requested_by = u.id
                 LEFT JOIN tea_quality tq ON rmr.quality_id = tq.id
                 LEFT JOIN users approver ON rmr.approved_by = approver.id
                 WHERE 1=1`;

    const values = [];

    if (status) {
      query += " AND rmr.status = ?";
      values.push(status);
    }

    if (priority) {
      query += " AND rmr.priority = ?";
      values.push(priority);
    }

    query += " ORDER BY rmr.created_at DESC";
    query += " LIMIT ? OFFSET ?";
    values.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, values);

    res.json({
      success: true,
      requests: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: rows.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all raw material requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// REQ-4: Schedule tea processing
export async function scheduleTeaProcessing(req, res) {
  try {
    const batchData = {
      created_by: req.user.id,
      ...req.body,
    };

    // Generate batch number
    const batchNumber = `BATCH-${Date.now()}`;
    batchData.batch_number = batchNumber;

    // Validate required fields
    if (
      !batchData.raw_tea_id ||
      !batchData.process_id ||
      !batchData.scheduled_date ||
      !batchData.input_weight_kg
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: raw_tea_id, process_id, scheduled_date, input_weight_kg",
      });
    }

    const batch = await ProductionBatch.create(batchData);

    res.status(201).json({
      success: true,
      message: "Tea processing scheduled successfully",
      batch,
    });
  } catch (error) {
    console.error("Schedule tea processing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Get all production batches
export async function getAllProductionBatches(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      process_id,
      date_from,
      date_to,
    } = req.query;
    const offset = (page - 1) * limit;

    const filters = {};
    if (status) filters.status = status;
    if (process_id) filters.process_id = process_id;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const batches = await ProductionBatch.findAll(
      parseInt(limit),
      offset,
      filters
    );

    res.json({
      success: true,
      batches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: batches.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all production batches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Start production batch
export async function startProductionBatch(req, res) {
  try {
    const { id } = req.params;
    const { actual_start_date } = req.body;

    const batch = await ProductionBatch.startBatch(
      id,
      actual_start_date || new Date()
    );

    if (!batch) {
      return res.status(400).json({
        success: false,
        message:
          "Failed to start batch. Batch may not exist or is not in scheduled status.",
      });
    }

    res.json({
      success: true,
      message: "Production batch started successfully",
      batch,
    });
  } catch (error) {
    console.error("Start production batch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Complete production batch
export async function completeProductionBatch(req, res) {
  try {
    const { id } = req.params;
    const { actual_end_date, output_weight, output_quality } = req.body;

    if (!output_weight || !output_quality) {
      return res.status(400).json({
        success: false,
        message: "output_weight and output_quality are required",
      });
    }

    const batch = await ProductionBatch.completeBatch(
      id,
      actual_end_date || new Date(),
      output_weight,
      output_quality
    );

    if (!batch) {
      return res.status(400).json({
        success: false,
        message:
          "Failed to complete batch. Batch may not exist or is not in progress.",
      });
    }

    res.json({
      success: true,
      message: "Production batch completed successfully",
      batch,
    });
  } catch (error) {
    console.error("Complete production batch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// REQ-5: Daily inventory reports
export async function getDailyInventoryReport(req, res) {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const report = await RawTeaLeaves.getDailyInventory(date);

    res.json({
      success: true,
      date,
      report,
    });
  } catch (error) {
    console.error("Get daily inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// REQ-5: Monthly inventory reports
export async function getMonthlyInventoryReport(req, res) {
  try {
    const { year, month } = req.params;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month parameters are required",
      });
    }

    const report = await RawTeaLeaves.getMonthlyInventory(
      parseInt(year),
      parseInt(month)
    );

    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      report,
    });
  } catch (error) {
    console.error("Get monthly inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// REQ-5: Daily production reports
export async function getDailyProductionReport(req, res) {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const report = await ProductionBatch.getDailyProduction(date);

    res.json({
      success: true,
      date,
      report,
    });
  } catch (error) {
    console.error("Get daily production report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// REQ-5: Monthly production reports
export async function getMonthlyProductionReport(req, res) {
  try {
    const { year, month } = req.params;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month parameters are required",
      });
    }

    const report = await ProductionBatch.getMonthlyProduction(
      parseInt(year),
      parseInt(month)
    );

    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      report,
    });
  } catch (error) {
    console.error("Get monthly production report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Get available tea qualities
export async function getTeaQualities(req, res) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM tea_quality WHERE is_active = TRUE ORDER BY price_per_kg DESC"
    );

    res.json({
      success: true,
      qualities: rows,
    });
  } catch (error) {
    console.error("Get tea qualities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Get production processes
export async function getProductionProcesses(req, res) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM production_process WHERE is_active = TRUE ORDER BY process_name"
    );

    res.json({
      success: true,
      processes: rows,
    });
  } catch (error) {
    console.error("Get production processes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// CRUD functions for inventory management (required by routes)
export async function createInventory(req, res) {
  try {
    const { inventoryid, quantity } = req.body;

    if (!inventoryid || !quantity) {
      return res.status(400).json({
        success: false,
        message: "inventoryid and quantity are required",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO inventory (inventoryid, quantity) VALUES (?, ?)",
      [inventoryid, quantity]
    );

    res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      inventory: { id: result.insertId, inventoryid, quantity },
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export async function getInventories(req, res) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM inventory ORDER BY createdAt DESC"
    );

    res.json({
      success: true,
      inventories: rows,
    });
  } catch (error) {
    console.error("Get inventories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export async function getInventoryById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM inventory WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    res.json({
      success: true,
      inventory: rows[0],
    });
  } catch (error) {
    console.error("Get inventory by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const { inventoryid, quantity } = req.body;

    if (!inventoryid || !quantity) {
      return res.status(400).json({
        success: false,
        message: "inventoryid and quantity are required",
      });
    }

    const [result] = await db.execute(
      "UPDATE inventory SET inventoryid = ?, quantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [inventoryid, quantity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    res.json({
      success: true,
      message: "Inventory updated successfully",
      inventory: { id, inventoryid, quantity },
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export async function deleteInventory(req, res) {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM inventory WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    res.json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export async function generateInventoryIdEndpoint(req, res) {
  try {
    // Generate a unique inventory ID
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const inventoryId = `INV-${timestamp}-${randomNum}`;

    res.json({
      success: true,
      inventoryId,
    });
  } catch (error) {
    console.error("Generate inventory ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export async function searchInventories(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = `%${q}%`;
    const [rows] = await db.execute(
      `SELECT * FROM inventory 
       WHERE inventory_id LIKE ? 
       OR product_type LIKE ? 
       OR grade LIKE ? 
       OR status LIKE ?
       ORDER BY created_at DESC`,
      [searchQuery, searchQuery, searchQuery, searchQuery]
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Search inventories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
