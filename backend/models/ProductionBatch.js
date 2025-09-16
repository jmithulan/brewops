import { db } from "../config/db.js";

export default class ProductionBatch {
  static async create(batchData) {
    const {
      batch_number,
      raw_tea_id,
      process_id,
      scheduled_date,
      input_weight_kg,
      notes,
      created_by
    } = batchData;

    const [result] = await db.execute(
      `INSERT INTO production_batches 
       (batch_number, raw_tea_id, process_id, scheduled_date, input_weight_kg, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [batch_number, raw_tea_id, process_id, scheduled_date, input_weight_kg, notes, created_by]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT pb.*, 
              rtl.weight_kg as raw_weight, rtl.received_date,
              tq.quality_name,
              pp.process_name, pp.description as process_description,
              u.name as created_by_name
       FROM production_batches pb
       LEFT JOIN raw_tea_leaves rtl ON pb.raw_tea_id = rtl.id
       LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
       LEFT JOIN production_process pp ON pb.process_id = pp.id
       LEFT JOIN users u ON pb.created_by = u.id
       WHERE pb.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    let query = `SELECT pb.*, 
                        rtl.weight_kg as raw_weight, rtl.received_date,
                        tq.quality_name,
                        pp.process_name,
                        u.name as created_by_name
                 FROM production_batches pb
                 LEFT JOIN raw_tea_leaves rtl ON pb.raw_tea_id = rtl.id
                 LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
                 LEFT JOIN production_process pp ON pb.process_id = pp.id
                 LEFT JOIN users u ON pb.created_by = u.id
                 WHERE 1=1`;
    
    const values = [];

    if (filters.status) {
      query += ' AND pb.status = ?';
      values.push(filters.status);
    }

    if (filters.process_id) {
      query += ' AND pb.process_id = ?';
      values.push(filters.process_id);
    }

    if (filters.date_from) {
      query += ' AND pb.scheduled_date >= ?';
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND pb.scheduled_date <= ?';
      values.push(filters.date_to);
    }

    query += ' ORDER BY pb.scheduled_date DESC, pb.created_at DESC';
    query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const [result] = await db.execute(
      `UPDATE production_batches SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async startBatch(id, actualStartDate) {
    const [result] = await db.execute(
      `UPDATE production_batches 
       SET status = 'in_progress', actual_start_date = ? 
       WHERE id = ? AND status = 'scheduled'`,
      [actualStartDate, id]
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async completeBatch(id, actualEndDate, outputWeight, outputQuality) {
    const [result] = await db.execute(
      `UPDATE production_batches 
       SET status = 'completed', actual_end_date = ?, output_weight_kg = ?, output_quality = ? 
       WHERE id = ? AND status = 'in_progress'`,
      [actualEndDate, outputWeight, outputQuality, id]
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async getScheduledBatches(date) {
    const [rows] = await db.execute(
      `SELECT pb.*, 
              rtl.weight_kg as raw_weight,
              tq.quality_name,
              pp.process_name, pp.estimated_duration_hours
       FROM production_batches pb
       LEFT JOIN raw_tea_leaves rtl ON pb.raw_tea_id = rtl.id
       LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
       LEFT JOIN production_process pp ON pb.process_id = pp.id
       WHERE pb.scheduled_date = ? AND pb.status = 'scheduled'
       ORDER BY pb.scheduled_date ASC`,
      [date]
    );
    return rows;
  }

  static async getProductionSummary(dateFrom, dateTo) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_batches,
         SUM(input_weight_kg) as total_input_weight,
         SUM(output_weight_kg) as total_output_weight,
         AVG(output_weight_kg / input_weight_kg * 100) as efficiency_percentage,
         pp.process_name,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_batches,
         COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_batches,
         COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_batches
       FROM production_batches pb
       LEFT JOIN production_process pp ON pb.process_id = pp.id
       WHERE pb.scheduled_date >= ? AND pb.scheduled_date <= ?
       GROUP BY pb.process_id, pp.process_name
       ORDER BY total_batches DESC`,
      [dateFrom, dateTo]
    );
    return rows;
  }

  static async getDailyProduction(date) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_batches,
         SUM(input_weight_kg) as total_input_weight,
         SUM(output_weight_kg) as total_output_weight,
         pp.process_name,
         tq.quality_name
       FROM production_batches pb
       LEFT JOIN production_process pp ON pb.process_id = pp.id
       LEFT JOIN raw_tea_leaves rtl ON pb.raw_tea_id = rtl.id
       LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
       WHERE pb.scheduled_date = ?
       GROUP BY pb.process_id, rtl.quality_id
       ORDER BY total_input_weight DESC`,
      [date]
    );
    return rows;
  }

  static async getMonthlyProduction(year, month) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_batches,
         SUM(input_weight_kg) as total_input_weight,
         SUM(output_weight_kg) as total_output_weight,
         pp.process_name,
         tq.quality_name
       FROM production_batches pb
       LEFT JOIN production_process pp ON pb.process_id = pp.id
       LEFT JOIN raw_tea_leaves rtl ON pb.raw_tea_id = rtl.id
       LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
       WHERE YEAR(pb.scheduled_date) = ? AND MONTH(pb.scheduled_date) = ?
       GROUP BY pb.process_id, rtl.quality_id
       ORDER BY total_input_weight DESC`,
      [year, month]
    );
    return rows;
  }
}
