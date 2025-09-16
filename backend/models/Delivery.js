import { db } from "../config/db.js";

export default class Delivery {
  static async create(deliveryData) {
    const {
      supplier_id,
      delivery_date,
      quantity,
      rate_per_kg,
      total_amount,
      payment_method = 'monthly',
      notes
    } = deliveryData;

    const [result] = await db.execute(
      `INSERT INTO deliveries (supplier_id, delivery_date, quantity, rate_per_kg, total_amount, payment_method, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, delivery_date, quantity, rate_per_kg, total_amount, payment_method, notes]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT d.*, s.name as supplier_name, s.contact_number as supplier_contact
       FROM deliveries d 
       LEFT JOIN suppliers s ON d.supplier_id = s.id 
       WHERE d.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll(limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT d.*, s.name as supplier_name, s.contact_number as supplier_contact
       FROM deliveries d 
       LEFT JOIN suppliers s ON d.supplier_id = s.id 
       ORDER BY d.delivery_date DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    return rows;
  }

  static async findBySupplierId(supplierId, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT d.*, s.name as supplier_name, s.contact_number as supplier_contact
       FROM deliveries d 
       LEFT JOIN suppliers s ON d.supplier_id = s.id 
       WHERE d.supplier_id = ?
       ORDER BY d.delivery_date DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      [supplierId]
    );
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
      `UPDATE deliveries SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM deliveries WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getDeliveryStats(supplierId = null) {
    let query = `
      SELECT 
         COUNT(*) as total_deliveries,
         SUM(quantity) as total_quantity,
         SUM(total_amount) as total_value,
         AVG(rate_per_kg) as avg_rate,
         COUNT(CASE WHEN payment_method = 'monthly' THEN 1 END) as monthly_deliveries,
         COUNT(CASE WHEN payment_method = 'spot' THEN 1 END) as spot_deliveries
       FROM deliveries
    `;
    
    const params = [];
    if (supplierId) {
      query += ' WHERE supplier_id = ?';
      params.push(supplierId);
    }

    const [rows] = await db.execute(query, params);
    return rows[0];
  }

  static async getMonthlyStats(year, month) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_deliveries,
         SUM(quantity) as total_quantity,
         SUM(total_amount) as total_value,
         AVG(rate_per_kg) as avg_rate
       FROM deliveries 
       WHERE YEAR(delivery_date) = ? AND MONTH(delivery_date) = ?`,
      [year, month]
    );
    return rows[0];
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM deliveries');
    return rows[0].count;
  }
}




