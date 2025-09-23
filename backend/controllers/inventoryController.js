import RawTeaLeaves from "../models/RawTeaLeaves.js";
import ProductionBatch from "../models/ProductionBatch.js";
import { db } from "../config/db.js";

// REQ-1: Staff log incoming tea leaves and categorize them
export async function logTeaLeaves(req, res) {
  try {
    const leavesData = {
      created_by: req.user.id,
<<<<<<< HEAD
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
=======
      ...req.body
    };

    // Validate required fields
    if (!leavesData.quality_id || !leavesData.weight_kg || !leavesData.received_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: quality_id, weight_kg, received_date"
>>>>>>> b34fc7b (init)
      });
    }

    const leaves = await RawTeaLeaves.create(leavesData);
<<<<<<< HEAD

    res.status(201).json({
      success: true,
      message: "Tea leaves logged successfully",
      leaves,
=======
    
    res.status(201).json({
      success: true,
      message: "Tea leaves logged successfully",
      leaves
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Log tea leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// Get all raw tea leaves inventory
export async function getAllRawTeaLeaves(req, res) {
  try {
<<<<<<< HEAD
    const {
      page = 1,
      limit = 20,
      status,
      quality_id,
      date_from,
      date_to,
    } = req.query;
=======
    const { page = 1, limit = 20, status, quality_id, date_from, date_to } = req.query;
>>>>>>> b34fc7b (init)
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
<<<<<<< HEAD
        hasMore: leaves.length === parseInt(limit),
      },
=======
        hasMore: leaves.length === parseInt(limit)
      }
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get all raw tea leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// Get inventory summary
export async function getInventorySummary(req, res) {
  try {
    const summary = await RawTeaLeaves.getInventorySummary();

    res.json({
      success: true,
<<<<<<< HEAD
      summary,
=======
      summary
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get inventory summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// Update tea leaves status
export async function updateTeaLeavesStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
<<<<<<< HEAD

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
=======
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
>>>>>>> b34fc7b (init)
      });
    }

    const leaves = await RawTeaLeaves.findById(id);
<<<<<<< HEAD

    if (!leaves) {
      return res.status(404).json({
        success: false,
        message: "Tea leaves record not found",
=======
    
    if (!leaves) {
      return res.status(404).json({
        success: false,
        message: "Tea leaves record not found"
>>>>>>> b34fc7b (init)
      });
    }

    const updatedLeaves = await RawTeaLeaves.update(id, { status });
<<<<<<< HEAD

    res.json({
      success: true,
      message: "Tea leaves status updated successfully",
      leaves: updatedLeaves,
=======
    
    res.json({
      success: true,
      message: "Tea leaves status updated successfully",
      leaves: updatedLeaves
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Update tea leaves status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// REQ-3: Production manager request raw materials
export async function requestRawMaterials(req, res) {
  try {
    const requestData = {
      requested_by: req.user.id,
<<<<<<< HEAD
      ...req.body,
=======
      ...req.body
>>>>>>> b34fc7b (init)
    };

    // Generate request number
    const requestNumber = `RMR-${Date.now()}`;
    requestData.request_number = requestNumber;

    // Validate required fields
<<<<<<< HEAD
    if (
      !requestData.quality_id ||
      !requestData.quantity_kg ||
      !requestData.required_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: quality_id, quantity_kg, required_date",
=======
    if (!requestData.quality_id || !requestData.quantity_kg || !requestData.required_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: quality_id, quantity_kg, required_date"
>>>>>>> b34fc7b (init)
      });
    }

    const [result] = await db.execute(
      `INSERT INTO raw_material_requests 
       (request_number, requested_by, quality_id, quantity_kg, required_date, priority, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
<<<<<<< HEAD
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
=======
      [requestData.request_number, requestData.requested_by, requestData.quality_id, 
       requestData.quantity_kg, requestData.required_date, requestData.priority || 'medium', 
       requestData.notes]
    );

    const request = await this.getRawMaterialRequestById(result.insertId);
    
    res.status(201).json({
      success: true,
      message: "Raw material request created successfully",
      request
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Request raw materials error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
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
<<<<<<< HEAD

    const values = [];

    if (status) {
      query += " AND rmr.status = ?";
=======
    
    const values = [];

    if (status) {
      query += ' AND rmr.status = ?';
>>>>>>> b34fc7b (init)
      values.push(status);
    }

    if (priority) {
<<<<<<< HEAD
      query += " AND rmr.priority = ?";
      values.push(priority);
    }

    query += " ORDER BY rmr.created_at DESC";
    query += " LIMIT ? OFFSET ?";
=======
      query += ' AND rmr.priority = ?';
      values.push(priority);
    }

    query += ' ORDER BY rmr.created_at DESC';
    query += ' LIMIT ? OFFSET ?';
>>>>>>> b34fc7b (init)
    values.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, values);

    res.json({
      success: true,
      requests: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
<<<<<<< HEAD
        hasMore: rows.length === parseInt(limit),
      },
=======
        hasMore: rows.length === parseInt(limit)
      }
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get all raw material requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// REQ-4: Schedule tea processing
export async function scheduleTeaProcessing(req, res) {
  try {
    const batchData = {
      created_by: req.user.id,
<<<<<<< HEAD
      ...req.body,
=======
      ...req.body
>>>>>>> b34fc7b (init)
    };

    // Generate batch number
    const batchNumber = `BATCH-${Date.now()}`;
    batchData.batch_number = batchNumber;

    // Validate required fields
<<<<<<< HEAD
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
=======
    if (!batchData.raw_tea_id || !batchData.process_id || !batchData.scheduled_date || !batchData.input_weight_kg) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: raw_tea_id, process_id, scheduled_date, input_weight_kg"
>>>>>>> b34fc7b (init)
      });
    }

    const batch = await ProductionBatch.create(batchData);
<<<<<<< HEAD

    res.status(201).json({
      success: true,
      message: "Tea processing scheduled successfully",
      batch,
=======
    
    res.status(201).json({
      success: true,
      message: "Tea processing scheduled successfully",
      batch
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Schedule tea processing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// Get all production batches
export async function getAllProductionBatches(req, res) {
  try {
<<<<<<< HEAD
    const {
      page = 1,
      limit = 20,
      status,
      process_id,
      date_from,
      date_to,
    } = req.query;
=======
    const { page = 1, limit = 20, status, process_id, date_from, date_to } = req.query;
>>>>>>> b34fc7b (init)
    const offset = (page - 1) * limit;

    const filters = {};
    if (status) filters.status = status;
    if (process_id) filters.process_id = process_id;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

<<<<<<< HEAD
    const batches = await ProductionBatch.findAll(
      parseInt(limit),
      offset,
      filters
    );
=======
    const batches = await ProductionBatch.findAll(parseInt(limit), offset, filters);
>>>>>>> b34fc7b (init)

    res.json({
      success: true,
      batches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
<<<<<<< HEAD
        hasMore: batches.length === parseInt(limit),
      },
=======
        hasMore: batches.length === parseInt(limit)
      }
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get all production batches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// Start production batch
export async function startProductionBatch(req, res) {
  try {
    const { id } = req.params;
    const { actual_start_date } = req.body;
<<<<<<< HEAD

    const batch = await ProductionBatch.startBatch(
      id,
      actual_start_date || new Date()
    );

    if (!batch) {
      return res.status(400).json({
        success: false,
        message:
          "Failed to start batch. Batch may not exist or is not in scheduled status.",
=======
    
    const batch = await ProductionBatch.startBatch(id, actual_start_date || new Date());
    
    if (!batch) {
      return res.status(400).json({
        success: false,
        message: "Failed to start batch. Batch may not exist or is not in scheduled status."
>>>>>>> b34fc7b (init)
      });
    }

    res.json({
      success: true,
      message: "Production batch started successfully",
<<<<<<< HEAD
      batch,
=======
      batch
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Start production batch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// Complete production batch
export async function completeProductionBatch(req, res) {
  try {
    const { id } = req.params;
    const { actual_end_date, output_weight, output_quality } = req.body;
<<<<<<< HEAD

    if (!output_weight || !output_quality) {
      return res.status(400).json({
        success: false,
        message: "output_weight and output_quality are required",
=======
    
    if (!output_weight || !output_quality) {
      return res.status(400).json({
        success: false,
        message: "output_weight and output_quality are required"
>>>>>>> b34fc7b (init)
      });
    }

    const batch = await ProductionBatch.completeBatch(
<<<<<<< HEAD
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
=======
      id, 
      actual_end_date || new Date(), 
      output_weight, 
      output_quality
    );
    
    if (!batch) {
      return res.status(400).json({
        success: false,
        message: "Failed to complete batch. Batch may not exist or is not in progress."
>>>>>>> b34fc7b (init)
      });
    }

    res.json({
      success: true,
      message: "Production batch completed successfully",
<<<<<<< HEAD
      batch,
=======
      batch
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Complete production batch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// REQ-5: Daily inventory reports
export async function getDailyInventoryReport(req, res) {
  try {
    const { date } = req.params;
<<<<<<< HEAD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
=======
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
>>>>>>> b34fc7b (init)
      });
    }

    const report = await RawTeaLeaves.getDailyInventory(date);

    res.json({
      success: true,
      date,
<<<<<<< HEAD
      report,
=======
      report
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get daily inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// REQ-5: Monthly inventory reports
export async function getMonthlyInventoryReport(req, res) {
  try {
    const { year, month } = req.params;
<<<<<<< HEAD

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
=======
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month parameters are required"
      });
    }

    const report = await RawTeaLeaves.getMonthlyInventory(parseInt(year), parseInt(month));
>>>>>>> b34fc7b (init)

    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
<<<<<<< HEAD
      report,
=======
      report
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get monthly inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// REQ-5: Daily production reports
export async function getDailyProductionReport(req, res) {
  try {
    const { date } = req.params;
<<<<<<< HEAD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
=======
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
>>>>>>> b34fc7b (init)
      });
    }

    const report = await ProductionBatch.getDailyProduction(date);

    res.json({
      success: true,
      date,
<<<<<<< HEAD
      report,
=======
      report
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get daily production report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

// REQ-5: Monthly production reports
export async function getMonthlyProductionReport(req, res) {
  try {
    const { year, month } = req.params;
<<<<<<< HEAD

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
=======
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month parameters are required"
      });
    }

    const report = await ProductionBatch.getMonthlyProduction(parseInt(year), parseInt(month));
>>>>>>> b34fc7b (init)

    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
<<<<<<< HEAD
      report,
=======
      report
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get monthly production report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
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
<<<<<<< HEAD
      qualities: rows,
=======
      qualities: rows
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get tea qualities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
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
<<<<<<< HEAD
      processes: rows,
=======
      processes: rows
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get production processes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
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
<<<<<<< HEAD
        message: "inventoryid and quantity are required",
=======
        message: "inventoryid and quantity are required"
>>>>>>> b34fc7b (init)
      });
    }

    const [result] = await db.execute(
      "INSERT INTO inventory (inventoryid, quantity) VALUES (?, ?)",
      [inventoryid, quantity]
    );

    res.status(201).json({
      success: true,
      message: "Inventory created successfully",
<<<<<<< HEAD
      inventory: { id: result.insertId, inventoryid, quantity },
=======
      inventory: { id: result.insertId, inventoryid, quantity }
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

export async function getInventories(req, res) {
  try {
<<<<<<< HEAD
    const [rows] = await db.execute(
      "SELECT * FROM inventory ORDER BY createdAt DESC"
    );

    res.json({
      success: true,
      inventories: rows,
=======
    const [rows] = await db.execute("SELECT * FROM raw_tea_leaves ORDER BY created_at DESC");

    res.json({
      success: true,
      inventories: rows
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get inventories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

export async function getInventoryById(req, res) {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const [rows] = await db.execute("SELECT * FROM inventory WHERE id = ?", [
      id,
    ]);
=======
    const [rows] = await db.execute("SELECT * FROM raw_tea_leaves WHERE id = ?", [id]);
>>>>>>> b34fc7b (init)

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
<<<<<<< HEAD
        message: "Inventory not found",
=======
        message: "Inventory not found"
>>>>>>> b34fc7b (init)
      });
    }

    res.json({
      success: true,
<<<<<<< HEAD
      inventory: rows[0],
=======
      inventory: rows[0]
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Get inventory by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
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
<<<<<<< HEAD
        message: "inventoryid and quantity are required",
=======
        message: "inventoryid and quantity are required"
>>>>>>> b34fc7b (init)
      });
    }

    const [result] = await db.execute(
<<<<<<< HEAD
      "UPDATE inventory SET inventoryid = ?, quantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [inventoryid, quantity, id]
=======
      "UPDATE raw_tea_leaves SET weight_kg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [quantity, id]
>>>>>>> b34fc7b (init)
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
<<<<<<< HEAD
        message: "Inventory not found",
=======
        message: "Inventory not found"
>>>>>>> b34fc7b (init)
      });
    }

    res.json({
      success: true,
      message: "Inventory updated successfully",
<<<<<<< HEAD
      inventory: { id, inventoryid, quantity },
=======
      inventory: { id, inventoryid, quantity }
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
    });
  }
}

export async function deleteInventory(req, res) {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const [result] = await db.execute("DELETE FROM inventory WHERE id = ?", [
      id,
    ]);
=======
    const [result] = await db.execute("DELETE FROM raw_tea_leaves WHERE id = ?", [id]);
>>>>>>> b34fc7b (init)

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
<<<<<<< HEAD
        message: "Inventory not found",
=======
        message: "Inventory not found"
>>>>>>> b34fc7b (init)
      });
    }

    res.json({
      success: true,
<<<<<<< HEAD
      message: "Inventory deleted successfully",
=======
      message: "Inventory deleted successfully"
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
      error: error.message,
=======
      error: error.message
>>>>>>> b34fc7b (init)
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
<<<<<<< HEAD
      inventoryId,
=======
      inventoryId
>>>>>>> b34fc7b (init)
    });
  } catch (error) {
    console.error("Generate inventory ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
<<<<<<< HEAD
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
=======
      error: error.message
    });
  }
}
>>>>>>> b34fc7b (init)
