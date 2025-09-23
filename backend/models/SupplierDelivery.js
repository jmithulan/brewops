import { db } from "../config/db.js";

export default class SupplierDelivery {
  static async create(deliveryData) {
    const {
      supplier_id,
      staff_id,
      delivery_date,
      weight_kg,
      quality_id,
      price_per_kg,
      total_amount,
      notes
    } = deliveryData;

    const [result] = await db.execute(
      `INSERT INTO supplier_deliveries 
       (supplier_id, staff_id, delivery_date, weight_kg, quality_id, price_per_kg, total_amount, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, staff_id, delivery_date, weight_kg, quality_id, price_per_kg, total_amount, notes]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT sd.*, 
              s.supplier_name, s.contact_person, s.phone as supplier_phone,
              u.name as staff_name,
              tq.quality_name, tq.price_per_kg as standard_price
       FROM supplier_deliveries sd
       LEFT JOIN suppliers s ON sd.supplier_id = s.id
       LEFT JOIN users u ON sd.staff_id = u.id
       LEFT JOIN tea_quality tq ON sd.quality_id = tq.id
       WHERE sd.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findBySupplier(supplierId, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT sd.*, 
              s.supplier_name, s.contact_person,
              u.name as staff_name,
              tq.quality_name
       FROM supplier_deliveries sd
       LEFT JOIN suppliers s ON sd.supplier_id = s.id
       LEFT JOIN users u ON sd.staff_id = u.id
       LEFT JOIN tea_quality tq ON sd.quality_id = tq.id
       WHERE sd.supplier_id = ?
       ORDER BY sd.delivery_date DESC, sd.created_at DESC
       LIMIT ? OFFSET ?`,
      [supplierId, limit, offset]
    );
    return rows;
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    let query = `SELECT sd.*, 
                        s.supplier_name, s.contact_person,
                        u.name as staff_name,
                        tq.quality_name
                 FROM supplier_deliveries sd
                 LEFT JOIN suppliers s ON sd.supplier_id = s.id
                 LEFT JOIN users u ON sd.staff_id = u.id
                 LEFT JOIN tea_quality tq ON sd.quality_id = tq.id
                 WHERE 1=1`;
    
    const values = [];

    if (filters.supplier_id) {
      query += ' AND sd.supplier_id = ?';
      values.push(filters.supplier_id);
    }

    if (filters.date_from) {
      query += ' AND sd.delivery_date >= ?';
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND sd.delivery_date <= ?';
      values.push(filters.date_to);
    }

    if (filters.status) {
      query += ' AND sd.status = ?';
      values.push(filters.status);
    }

    query += ' ORDER BY sd.delivery_date DESC, sd.created_at DESC';
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
      `UPDATE supplier_deliveries SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async getDailyReport(date) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_deliveries,
         SUM(weight_kg) as total_weight,
         SUM(total_amount) as total_value,
         AVG(price_per_kg) as avg_price,
         s.supplier_name,
         tq.quality_name
       FROM supplier_deliveries sd
       LEFT JOIN suppliers s ON sd.supplier_id = s.id
       LEFT JOIN tea_quality tq ON sd.quality_id = tq.id
       WHERE sd.delivery_date = ?
       GROUP BY sd.supplier_id, sd.quality_id
       ORDER BY total_value DESC`,
      [date]
    );
    return rows;
  }

  static async getMonthlyReport(year, month) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_deliveries,
         SUM(weight_kg) as total_weight,
         SUM(total_amount) as total_value,
         AVG(price_per_kg) as avg_price,
         s.supplier_name,
         tq.quality_name
       FROM supplier_deliveries sd
       LEFT JOIN suppliers s ON sd.supplier_id = s.id
       LEFT JOIN tea_quality tq ON sd.quality_id = tq.id
       WHERE YEAR(sd.delivery_date) = ? AND MONTH(sd.delivery_date) = ?
       GROUP BY sd.supplier_id, sd.quality_id
       ORDER BY total_value DESC`,
      [year, month]
    );
    return rows;
  }
}
