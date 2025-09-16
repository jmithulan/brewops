import { db } from "../config/db.js";
import bcrypt from "bcryptjs";

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
  
  static async findByGoogleId(googleId) {
    try {
      // Try to query using google_id
      try {
        const [rows] = await db.execute("SELECT * FROM users WHERE google_id = ?", [googleId]);
        return rows[0];
      } catch (columnError) {
        // If column doesn't exist, log warning and return null
        if (columnError.message.includes("Unknown column 'google_id'")) {
          console.warn("google_id column not found in users table. Assuming user doesn't exist by Google ID.");
          return null;
        }
        // If it's another error, throw it
        throw columnError;
      }
    } catch (error) {
      console.error("Error finding user by Google ID:", error);
      throw new Error("Database error: " + error.message);
    }
  }
  
  static async findByUsername(username) {
    try {
      // First try to match on employee_id as it's more specific
      const [employeeIdRows] = await db.execute("SELECT * FROM users WHERE employee_id = ?", [
        username,
      ]);
      
      if (employeeIdRows.length > 0) {
        return employeeIdRows[0];
      }
      
      // If not found, try by name (case insensitive)
      const [nameRows] = await db.execute("SELECT * FROM users WHERE LOWER(name) = LOWER(?)", [
        username,
      ]);
      
      if (nameRows.length > 0) {
        return nameRows[0];
      }
      
      // If still not found, check if it's an email (for flexibility)
      const [emailRows] = await db.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [
        username,
      ]);
      
      return emailRows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async create(userData) {
    try {
      const {
        name,
        email,
        password,
        role = "staff",
        phone = null, // Default to null if not provided
        employee_id = null, // Default to null if not provided
        google_id = null,
        profile_image = null
      } = userData;

      // Password strength validation
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      // Hash password with stronger security
      const hashedPassword = await bcrypt.hash(password, 12);

      // Set initial token version for JWT invalidation capability
      const token_version = 1;
      
      // Set is_active to true by default
      const is_active = true;
      
      // Determine which columns exist in the database
      let tableInfo;
      try {
        [tableInfo] = await db.execute("DESCRIBE users");
      } catch (error) {
        console.error("Failed to query users table structure:", error);
        throw new Error("Database error: Unable to determine table structure. Check if users table exists.");
      }
      
      const columns = tableInfo.map(col => col.Field);
      console.log("Available columns:", columns.join(', '));
      
      // Build dynamic query based on available columns
      let fields = ['name', 'email', 'password_hash', 'role'];
      let placeholders = ['?', '?', '?', '?'];
      let values = [name, email, hashedPassword, role];
      
      // Only add these if not null
      if (phone !== null) {
        fields.push('phone');
        placeholders.push('?');
        values.push(phone);
      }
      
      if (employee_id !== null) {
        fields.push('employee_id');
        placeholders.push('?');
        values.push(employee_id);
      }
      
      // Add optional columns if they exist
      if (columns.includes('token_version')) {
        fields.push('token_version');
        placeholders.push('?');
        values.push(token_version);
      }
      
      if (columns.includes('is_active')) {
        fields.push('is_active');
        placeholders.push('?');
        values.push(is_active);
      }
      
      if (columns.includes('last_login')) {
        fields.push('last_login');
        placeholders.push('NOW()');
      }
      
      // Add Google OAuth fields if they exist and values are provided
      if (columns.includes('google_id') && google_id) {
        fields.push('google_id');
        placeholders.push('?');
        values.push(google_id);
      }
      
      if (columns.includes('profile_image') && profile_image) {
        fields.push('profile_image');
        placeholders.push('?');
        values.push(profile_image);
      }
      
      // Build the final query
      const query = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
      console.log(`Creating user with fields: ${fields.join(', ')}`);
      console.log("Values:", values.map(v => v === null ? 'NULL' : (typeof v === 'string' ? v : typeof v)).join(', '));
      
      const [result] = await db.execute(query, values);

      return {
        id: result.insertId,
        name,
        email,
        role,
        phone,
        employee_id,
        google_id,
        is_active,
        token_version
      };
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Email or employee ID already exists");
      }
      throw new Error(error.message || "Database error during user creation");
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(
        `SELECT id, name, email, role, phone, employee_id, is_active, 
         created_at, last_login FROM users ORDER BY created_at DESC`
      );
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
  
  static async updateLastLogin(userId) {
    try {
      await db.execute(
        "UPDATE users SET last_login = NOW() WHERE id = ?",
        [userId]
      );
      return true;
    } catch (error) {
      console.error("Error updating last login:", error);
      return false;
    }
  }

  static async updatePassword(userId, newPassword) {
    try {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Increment token version to invalidate existing tokens
      await db.execute(
        "UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?",
        [hashedPassword, userId]
      );
      
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      throw new Error("Failed to update password");
    }
  }
  
  static async updateStatus(userId, isActive) {
    try {
      await db.execute(
        "UPDATE users SET is_active = ? WHERE id = ?",
        [isActive, userId]
      );
      return true;
    } catch (error) {
      throw new Error("Failed to update user status");
    }
  }

  static async getRoles() {
    // Return available roles for user registration
    return [
      { id: 'staff', name: 'Staff Member' },
      { id: 'manager', name: 'Manager (Admin Access)' },
      { id: 'supplier', name: 'Tea Leaf Supplier' },
    ];
  }
}

export default User;
