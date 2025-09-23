import { db } from "../config/db.js";

export default class Inventory {
  static async create(inventoryData) {
<<<<<<< HEAD
    const { inventoryid, quantity } = inventoryData;
=======
    const {
      inventoryid,
      quantity
    } = inventoryData;
>>>>>>> b34fc7b (init)

    const [result] = await db.execute(
      `INSERT INTO inventory (inventoryid, quantity) VALUES (?, ?)`,
      [inventoryid, quantity]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
<<<<<<< HEAD
    const [rows] = await db.execute(`SELECT * FROM inventory WHERE id = ?`, [
      id,
    ]);
=======
    const [rows] = await db.execute(
      `SELECT * FROM inventory WHERE id = ?`,
      [id]
    );
>>>>>>> b34fc7b (init)
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

<<<<<<< HEAD
    Object.keys(updateData).forEach((key) => {
=======
    Object.keys(updateData).forEach(key => {
>>>>>>> b34fc7b (init)
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
<<<<<<< HEAD
      throw new Error("No fields to update");
=======
      throw new Error('No fields to update');
>>>>>>> b34fc7b (init)
    }

    values.push(id);
    const [result] = await db.execute(
<<<<<<< HEAD
      `UPDATE inventory SET ${fields.join(
        ", "
      )}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
=======
      `UPDATE inventory SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
>>>>>>> b34fc7b (init)
      values
    );

    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async delete(id) {
<<<<<<< HEAD
    const [result] = await db.execute("DELETE FROM inventory WHERE id = ?", [
      id,
    ]);
=======
    const [result] = await db.execute(
      'DELETE FROM inventory WHERE id = ?',
      [id]
    );
>>>>>>> b34fc7b (init)
    return result.affectedRows > 0;
  }

  static async generateInventoryId() {
    const date = new Date();
<<<<<<< HEAD
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, "");
=======
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
>>>>>>> b34fc7b (init)
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
<<<<<<< HEAD
    const [rows] = await db.execute("SELECT COUNT(*) as count FROM inventory");
    return rows[0].count;
  }
}
=======
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM inventory');
    return rows[0].count;
  }
}







>>>>>>> b34fc7b (init)
