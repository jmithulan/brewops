import { db } from "../config/db.js";

export default class Message {
  static async create(messageData) {
    const {
      sender_id,
      receiver_id,
      message
    } = messageData;

    const [result] = await db.execute(
      `INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`,
      [sender_id, receiver_id, message]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT m.*, 
              s.name as sender_name, s.email as sender_email,
              r.name as receiver_name, r.email as receiver_email
       FROM messages m
       LEFT JOIN users s ON m.sender_id = s.id
       LEFT JOIN users r ON m.receiver_id = r.id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUser(userId, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT m.*, 
              s.name as sender_name, s.email as sender_email,
              r.name as receiver_name, r.email as receiver_email
       FROM messages m
       LEFT JOIN users s ON m.sender_id = s.id
       LEFT JOIN users r ON m.receiver_id = r.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.timestamp DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, limit, offset]
    );
    return rows;
  }

  static async getConversation(user1Id, user2Id, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT m.*, 
              s.name as sender_name, s.email as sender_email,
              r.name as receiver_name, r.email as receiver_email
       FROM messages m
       LEFT JOIN users s ON m.sender_id = s.id
       LEFT JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.timestamp ASC
       LIMIT ? OFFSET ?`,
      [user1Id, user2Id, user2Id, user1Id, limit, offset]
    );
    return rows;
  }

  static async getUnreadMessages(userId) {
    const [rows] = await db.execute(
      `SELECT m.*, 
              s.name as sender_name, s.email as sender_email
       FROM messages m
       LEFT JOIN users s ON m.sender_id = s.id
       WHERE m.receiver_id = ? AND m.read_status = 0
       ORDER BY m.timestamp DESC`,
      [userId]
    );
    return rows;
  }

  static async markAsRead(messageId) {
    const [result] = await db.execute(
      'UPDATE messages SET read_status = 1 WHERE id = ?',
      [messageId]
    );
    return result.affectedRows > 0;
  }

  static async markConversationAsRead(user1Id, user2Id) {
    const [result] = await db.execute(
      `UPDATE messages SET read_status = 1 
       WHERE ((sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)) 
         AND read_status = 0`,
      [user1Id, user2Id, user2Id, user1Id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM messages WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getMessageStats(userId) {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as total_messages,
         COUNT(CASE WHEN sender_id = ? THEN 1 END) as sent_messages,
         COUNT(CASE WHEN receiver_id = ? THEN 1 END) as received_messages,
         COUNT(CASE WHEN receiver_id = ? AND read_status = 0 THEN 1 END) as unread_messages
       FROM messages 
       WHERE sender_id = ? OR receiver_id = ?`,
      [userId, userId, userId, userId, userId]
    );
    return rows[0];
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM messages');
    return rows[0].count;
  }
}







