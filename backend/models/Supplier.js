import { db } from "../config/db.js";

export default class Supplier {
  static async create(supplierData) {
    const {
      supplier_id,
      name,
      contact_number,
      nic_number,
      address,
      bank_account_number,
      bank_name,
      rate = 150.00,
      is_active = true
    } = supplierData;

    const [result] = await db.execute(
      `INSERT INTO suppliers (supplier_id, name, contact_number, nic_number, address, bank_account_number, bank_name, rate, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, name, contact_number, nic_number, address, bank_account_number, bank_name, rate, is_active]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT * FROM suppliers WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findBySupplierId(supplierId) {
    const [rows] = await db.execute(
      `SELECT * FROM suppliers WHERE supplier_id = ?`,
      [supplierId]
    );
    return rows[0];
  }

  static async findAll(limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT * FROM suppliers 
       WHERE is_active = 1 
       ORDER BY created_at DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    return rows;
  }

  static async findActive() {
    const [rows] = await db.execute(
      `SELECT * FROM suppliers WHERE is_active = 1 ORDER BY created_at DESC`
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
      `UPDATE suppliers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'UPDATE suppliers SET is_active = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async generateSupplierId() {
    const [rows] = await db.execute(
      'SELECT MAX(CAST(SUBSTRING(supplier_id, 5) AS UNSIGNED)) as max_num FROM suppliers WHERE supplier_id LIKE "SUP%"'
    );
    const maxNum = rows[0].max_num || 0;
    return `SUP${String(maxNum + 1).padStart(5, '0')}`;
  }

  static async getSupplierStats(supplierId) {
    const [deliveryStats] = await db.execute(
      `SELECT 
         COUNT(*) as total_deliveries,
         SUM(quantity) as total_quantity,
         SUM(total_amount) as total_value,
         AVG(rate_per_kg) as avg_rate
       FROM deliveries 
       WHERE supplier_id = ?`,
      [supplierId]
    );

    const [paymentStats] = await db.execute(
      `SELECT 
         COUNT(*) as total_payments,
         SUM(amount) as total_paid,
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount
       FROM payments 
       WHERE supplier_id = ?`,
      [supplierId]
    );

    return {
      deliveries: deliveryStats[0],
      payments: paymentStats[0]
    };
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM suppliers WHERE is_active = 1');
    return rows[0].count;
  }
}