import { db } from "../config/db.js";

export default class RawTeaLeaves {
  static async create(leavesData) {
    const {
      delivery_id,
      quality_id,
      weight_kg,
      received_date,
      location,
      status = 'fresh',
      notes,
      created_by
    } = leavesData;

    const [result] = await db.execute(
      `INSERT INTO raw_tea_leaves 
       (delivery_id, quality_id, weight_kg, received_date, location, status, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [delivery_id, quality_id, weight_kg, received_date, location, status, notes, created_by]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT rtl.*, 
              sd.delivery_date, sd.weight_kg as delivery_weight,
              s.supplier_name,
              tq.quality_name, tq.price_per_kg,
              u.name as created_by_name
       FROM raw_tea_leaves rtl
       LEFT JOIN supplier_deliveries sd ON rtl.delivery_id = sd.id
       LEFT JOIN suppliers s ON sd.supplier_id = s.id
       LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
       LEFT JOIN users u ON rtl.created_by = u.id
       WHERE rtl.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    let query = `SELECT rtl.*, 
                        sd.delivery_date,
                        s.supplier_name,
                        tq.quality_name, tq.price_per_kg,
                        u.name as created_by_name
                 FROM raw_tea_leaves rtl
                 LEFT JOIN supplier_deliveries sd ON rtl.delivery_id = sd.id
                 LEFT JOIN suppliers s ON sd.supplier_id = s.id
                 LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
                 LEFT JOIN users u ON rtl.created_by = u.id
                 WHERE 1=1`;
    
    const values = [];

    if (filters.status) {
      query += ' AND rtl.status = ?';
      values.push(filters.status);
    }

    if (filters.quality_id) {
      query += ' AND rtl.quality_id = ?';
      values.push(filters.quality_id);
    }

    if (filters.date_from) {
      query += ' AND rtl.received_date >= ?';
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND rtl.received_date <= ?';
      values.push(filters.date_to);
    }

    query += ' ORDER BY rtl.received_date DESC, rtl.created_at DESC';
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
      `UPDATE raw_tea_leaves SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async getInventorySummary() {
    const [rows] = await db.execute(
      `SELECT 
         tq.quality_name,
         COUNT(*) as total_batches,
         SUM(weight_kg) as total_weight,
         SUM(CASE WHEN status = 'fresh' THEN weight_kg ELSE 0 END) as fresh_weight,
         SUM(CASE WHEN status = 'processing' THEN weight_kg ELSE 0 END) as processing_weight,
         SUM(CASE WHEN status = 'processed' THEN weight_kg ELSE 0 END) as processed_weight,
         SUM(CASE WHEN status = 'spoiled' THEN weight_kg ELSE 0 END) as spoiled_weight
       FROM raw_tea_leaves rtl
       LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
       GROUP BY rtl.quality_id, tq.quality_name
       ORDER BY total_weight DESC`
    );
    return rows;
  }

  static async getDailyInventory(date) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_batches,
         SUM(weight_kg) as total_weight,
         tq.quality_name,
         s.supplier_name
       FROM raw_tea_leaves rtl
       LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
       LEFT JOIN supplier_deliveries sd ON rtl.delivery_id = sd.id
       LEFT JOIN suppliers s ON sd.supplier_id = s.id
       WHERE rtl.received_date = ?
       GROUP BY rtl.quality_id, sd.supplier_id
       ORDER BY total_weight DESC`,
      [date]
    );
    return rows;
  }

  static async getMonthlyInventory(year, month) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_batches,
         SUM(weight_kg) as total_weight,
         tq.quality_name,
         s.supplier_name
       FROM raw_tea_leaves rtl
       LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
       LEFT JOIN supplier_deliveries sd ON rtl.delivery_id = sd.id
       LEFT JOIN suppliers s ON sd.supplier_id = s.id
       WHERE YEAR(rtl.received_date) = ? AND MONTH(rtl.received_date) = ?
       GROUP BY rtl.quality_id, sd.supplier_id
       ORDER BY total_weight DESC`,
      [year, month]
    );
    return rows;
  }

  static async getAvailableForProcessing(qualityId = null) {
    let query = `SELECT rtl.*, 
                        tq.quality_name,
                        s.supplier_name
                 FROM raw_tea_leaves rtl
                 LEFT JOIN tea_quality tq ON rtl.quality_id = tq.id
                 LEFT JOIN supplier_deliveries sd ON rtl.delivery_id = sd.id
                 LEFT JOIN suppliers s ON sd.supplier_id = s.id
                 WHERE rtl.status = 'fresh'`;
    
    const values = [];
    
    if (qualityId) {
      query += ' AND rtl.quality_id = ?';
      values.push(qualityId);
    }

    query += ' ORDER BY rtl.received_date ASC';

    const [rows] = await db.execute(query, values);
    return rows;
  }
}
