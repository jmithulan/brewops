import { db } from "../config/db.js";

export default class Payment {
  static async create(paymentData) {
    const {
      supplier_id,
      payment_type,
      payment_month,
      amount,
      payment_date,
      payment_method = 'Bank Transfer',
      status = 'pending',
      reference_number,
      notes
    } = paymentData;

    const [result] = await db.execute(
      `INSERT INTO payments 
       (supplier_id, payment_type, payment_month, amount, payment_date, payment_method, status, reference_number, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, payment_type, payment_month, amount, payment_date, payment_method, status, reference_number, notes]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT p.*, s.supplier_name, s.phone as supplier_contact
       FROM payments p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findBySupplier(supplierId, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT p.*, s.supplier_name, s.phone as supplier_contact
       FROM payments p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.supplier_id = ?
       ORDER BY p.payment_date DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [supplierId, limit, offset]
    );
    return rows;
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    let query = `SELECT p.*, s.supplier_name, s.phone as supplier_contact
                 FROM payments p
                 LEFT JOIN suppliers s ON p.supplier_id = s.id
                 WHERE 1=1`;
    
    const values = [];

    if (filters.supplier_id) {
      query += ' AND p.supplier_id = ?';
      values.push(filters.supplier_id);
    }

    if (filters.date_from) {
      query += ' AND p.payment_date >= ?';
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND p.payment_date <= ?';
      values.push(filters.date_to);
    }

    if (filters.status) {
      query += ' AND p.status = ?';
      values.push(filters.status);
    }

    if (filters.payment_method) {
      query += ' AND p.payment_method = ?';
      values.push(filters.payment_method);
    }

    if (filters.payment_type) {
      query += ' AND p.payment_type = ?';
      values.push(filters.payment_type);
    }

    query += ' ORDER BY p.payment_date DESC, p.created_at DESC';
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
      `UPDATE payments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async getPaymentSummary(supplierId, dateFrom, dateTo) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_payments,
         SUM(amount) as total_amount,
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
         payment_method,
         COUNT(*) as payment_count
       FROM payments 
       WHERE supplier_id = ? 
         AND payment_date >= ? 
         AND payment_date <= ?
       GROUP BY payment_method`,
      [supplierId, dateFrom, dateTo]
    );
    return rows;
  }

  static async getDailyPayments(date) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_payments,
         SUM(amount) as total_amount,
         s.supplier_name,
         p.payment_method
       FROM payments p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.payment_date = ?
       GROUP BY p.supplier_id, p.payment_method
       ORDER BY total_amount DESC`,
      [date]
    );
    return rows;
  }

  static async getMonthlyPayments(year, month) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_payments,
         SUM(amount) as total_amount,
         s.supplier_name,
         p.payment_method
       FROM payments p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE YEAR(p.payment_date) = ? AND MONTH(p.payment_date) = ?
       GROUP BY p.supplier_id, p.payment_method
       ORDER BY total_amount DESC`,
      [year, month]
    );
    return rows;
  }

  static async getPaymentStatistics() {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(DISTINCT supplier_id) as total_suppliers,
         COUNT(*) as total_payments,
         SUM(CASE WHEN payment_type = 'monthly' THEN amount ELSE 0 END) as monthly_payments_total,
         SUM(CASE WHEN payment_type = 'spot-cash' THEN amount ELSE 0 END) as spot_cash_total,
         SUM(amount) as total_amount,
         AVG(amount) as average_payment,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
         COUNT(CASE WHEN status = 'paid' THEN 1 END) as completed_payments,
         COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_payments
       FROM payments 
       WHERE payment_date >= (CURDATE() - INTERVAL 1 YEAR)`
    );
    return rows[0];
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM payments');
    return rows[0].count;
  }
}