import { db } from "../config/db.js";

class TeaQuality {
  static async create(qualityData) {
    try {
      const {
        quality_name,
        description,
        price_per_kg,
        min_weight,
        max_weight,
        is_active = true
      } = qualityData;

      const [result] = await db.execute(
        `INSERT INTO tea_quality (quality_name, description, price_per_kg, min_weight, max_weight, is_active) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quality_name, description, price_per_kg, min_weight, max_weight, is_active]
      );

      return {
        id: result.insertId,
        quality_name,
        description,
        price_per_kg,
        min_weight,
        max_weight,
        is_active
      };
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM tea_quality WHERE is_active = TRUE ORDER BY price_per_kg DESC"
      );
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute("SELECT * FROM tea_quality WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async update(id, qualityData) {
    try {
      const fields = [];
      const values = [];

      Object.keys(qualityData).forEach(key => {
        if (qualityData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(qualityData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);
      const [result] = await db.execute(
        `UPDATE tea_quality SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute(
        "UPDATE tea_quality SET is_active = FALSE WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
}

export default TeaQuality;
