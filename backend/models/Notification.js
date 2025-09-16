import { db } from "../config/db.js";

class Notification {
  static async create(notificationData) {
    try {
      const {
        title,
        message,
        type = 'info',
        recipient_id = null,
        recipient_role = null,
        metadata = null,
        priority = 'medium'
      } = notificationData;

      const [result] = await db.execute(
        `INSERT INTO notifications 
         (title, message, type, recipient_id, recipient_role, metadata, priority, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [title, message, type, recipient_id, recipient_role, metadata, priority]
      );

      return {
        id: result.insertId,
        title,
        message,
        type,
        recipient_id,
        recipient_role,
        metadata,
        priority,
        is_read: false,
        created_at: new Date()
      };
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findByRecipient(recipientId, recipientRole = null) {
    try {
      let query = `
        SELECT n.*, u.name as recipient_name 
        FROM notifications n
        LEFT JOIN users u ON n.recipient_id = u.id
        WHERE (n.recipient_id = ? OR (n.recipient_role = ? AND n.recipient_id IS NULL))
        ORDER BY n.created_at DESC
      `;
      
      const [rows] = await db.execute(query, [recipientId, recipientRole]);
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      const [result] = await db.execute(
        "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ?",
        [notificationId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async markAllAsRead(userId) {
    try {
      const [result] = await db.execute(
        "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE recipient_id = ? AND is_read = FALSE",
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async getUnreadCount(userId, userRole = null) {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) as count 
         FROM notifications 
         WHERE (recipient_id = ? OR (recipient_role = ? AND recipient_id IS NULL)) 
         AND is_read = FALSE`,
        [userId, userRole]
      );
      return rows[0].count;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async delete(notificationId, userId) {
    try {
      const [result] = await db.execute(
        "DELETE FROM notifications WHERE id = ? AND recipient_id = ?",
        [notificationId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  // Static method to send notifications to specific roles
  static async sendToRole(role, notificationData) {
    try {
      const notification = {
        ...notificationData,
        recipient_role: role,
        recipient_id: null
      };
      return await this.create(notification);
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  // Static method to send notifications to specific users
  static async sendToUser(userId, notificationData) {
    try {
      const notification = {
        ...notificationData,
        recipient_id: userId,
        recipient_role: null
      };
      return await this.create(notification);
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
}

export default Notification;
