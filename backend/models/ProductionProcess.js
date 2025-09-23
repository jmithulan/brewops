import { db } from "../config/db.js";

class ProductionProcess {
  static async create(processData) {
    try {
      const {
        process_name,
        description,
        estimated_duration_hours,
        required_temperature,
        required_humidity,
        quality_standards,
        is_active = true
      } = processData;

      const [result] = await db.execute(
        `INSERT INTO production_process 
         (process_name, description, estimated_duration_hours, required_temperature, required_humidity, quality_standards, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [process_name, description, estimated_duration_hours, required_temperature, required_humidity, quality_standards, is_active]
      );

      return {
        id: result.insertId,
        process_name,
        description,
        estimated_duration_hours,
        required_temperature,
        required_humidity,
        quality_standards,
        is_active
      };
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM production_process WHERE is_active = TRUE ORDER BY process_name"
      );
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute("SELECT * FROM production_process WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async update(id, processData) {
    try {
      const fields = [];
      const values = [];

      Object.keys(processData).forEach(key => {
        if (processData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(processData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);
      const [result] = await db.execute(
        `UPDATE production_process SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
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
        "UPDATE production_process SET is_active = FALSE WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
}

export default ProductionProcess;
