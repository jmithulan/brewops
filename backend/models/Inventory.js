import { db } from "../config/db.js";

export default class Inventory {
  static async create(inventoryData) {
    const { inventoryid, quantity } = inventoryData;

    const [result] = await db.execute(
      `INSERT INTO inventory (inventoryid, quantity) VALUES (?, ?)`,
      [inventoryid, quantity]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(`SELECT * FROM inventory WHERE id = ?`, [
      id,
    ]);
    return rows[0];
  }

  static async findByInventoryId(inventoryId) {
    const [rows] = await db.execute(
      `SELECT * FROM inventory WHERE inventoryid = ?`,
      [inventoryId]
    );
    return rows[0];
  }

  static async findAll(limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT * FROM inventory 
       ORDER BY createdAt DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    return rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);
    const [result] = await db.execute(
      `UPDATE inventory SET ${fields.join(
        ", "
      )}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM inventory WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async generateInventoryId() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, "");
    return `INV-${dateStr}-${timeStr}`;
  }

  static async getInventoryStats() {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_items,
         SUM(quantity) as total_quantity,
         AVG(quantity) as avg_quantity,
         MAX(quantity) as max_quantity,
         MIN(quantity) as min_quantity
       FROM inventory`
    );
    return rows[0];
  }

  static async getRecentInventory(limit = 10) {
    const [rows] = await db.execute(
      `SELECT * FROM inventory 
       ORDER BY createdAt DESC 
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async count() {
    const [rows] = await db.execute("SELECT COUNT(*) as count FROM inventory");
    return rows[0].count;
  }
}
