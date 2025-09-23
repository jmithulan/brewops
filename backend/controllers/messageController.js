import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { db } from "../config/db.js";

// Get all messages for the current user
export async function getUserMessages(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await Message.findByUser(userId, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get conversation between two users
export async function getConversation(req, res) {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    const { limit = 50, offset = 0 } = req.query;
    
    // Validate the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    const conversation = await Message.getConversation(
      currentUserId, 
      otherUserId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    // Mark conversation as read
    await Message.markConversationAsRead(otherUserId, currentUserId);
    
    res.json({
      success: true,
      data: {
        messages: conversation,
        user: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role,
          profile_image: otherUser.profile_image
        }
      },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Send a message
export async function sendMessage(req, res) {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }
    
    // Validate the receiver exists
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found"
      });
    }
    
    // Create the message
    const newMessage = await Message.create({
      sender_id,
      receiver_id,
      message
    });
    
    // Get sender details
    const sender = await User.findById(sender_id);
    
    // Create a notification for the receiver
    await Notification.create({
      title: `New message from ${sender.name}`,
      message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
      type: 'message',
      recipient_id: receiver_id,
      metadata: JSON.stringify({ 
        senderId: sender_id,
        messageId: newMessage.id,
        senderName: sender.name,
        senderRole: sender.role
      }),
      priority: 'medium'
    });
    
    // Add sender details to the response
    newMessage.sender_name = sender.name;
    newMessage.sender_email = sender.email;
    newMessage.receiver_name = receiver.name;
    newMessage.receiver_email = receiver.email;
    
    // Get the socketIO instance from the app
    const io = req.app.get('io');
    
    // Emit to the specific receiver's room
    if (io) {
      io.to(`user_${receiver_id}`).emit('newMessage', {
        id: newMessage.id,
        senderId: sender_id,
        senderName: sender.name,
        senderRole: sender.role,
        message: message,
        timestamp: newMessage.timestamp
      });
      
      // Also emit a notification event
      io.to(`user_${receiver_id}`).emit('notification', {
        type: 'message',
        title: `New message from ${sender.name}`,
        message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
        senderId: sender_id,
        senderName: sender.name,
        timestamp: new Date()
      });
    }
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Mark message as read
export async function markMessageAsRead(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    // Check if user is the receiver
    if (message.receiver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Can only mark messages sent to you as read"
      });
    }
    
    await Message.markAsRead(messageId);
    
    // Get the socketIO instance from the app
    const io = req.app.get('io');
    
    // Notify sender that their message was read
    if (io) {
      io.to(`user_${message.sender_id}`).emit('messageRead', {
        messageId,
        readBy: userId,
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      message: "Message marked as read"
    });
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Mark entire conversation as read
export async function markConversationAsRead(req, res) {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    
    await Message.markConversationAsRead(otherUserId, currentUserId);
    
    // Get the socketIO instance from the app
    const io = req.app.get('io');
    
    // Notify the other user that their messages were read
    if (io) {
      io.to(`user_${otherUserId}`).emit('conversationRead', {
        userId: currentUserId,
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      message: "All messages in conversation marked as read"
    });
  } catch (error) {
    console.error("Mark conversation as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get unread messages
export async function getUnreadMessages(req, res) {
  try {
    const userId = req.user.id;
    
    const unreadMessages = await Message.getUnreadMessages(userId);
    
    res.json({
      success: true,
      data: unreadMessages,
      count: unreadMessages.length
    });
  } catch (error) {
    console.error("Get unread messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get message stats
export async function getMessageStats(req, res) {
  try {
    const userId = req.user.id;
    
    const stats = await Message.getMessageStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get message stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get recent conversations
export async function getRecentConversations(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    
    // Get all messages for the user
    const allMessages = await Message.findByUser(userId, 1000, 0);
    
    // Group messages by conversation partner
    const conversations = {};
    
    allMessages.forEach(message => {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const partnerName = message.sender_id === userId ? message.receiver_name : message.sender_name;
      const partnerEmail = message.sender_id === userId ? message.receiver_email : message.sender_email;
      
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          user: {
            id: partnerId,
            name: partnerName,
            email: partnerEmail
          },
          lastMessage: {
            id: message.id,
            message: message.message,
            timestamp: message.timestamp,
            isRead: message.read_status === 1,
            sentByMe: message.sender_id === userId
          },
          unreadCount: message.sender_id !== userId && message.read_status === 0 ? 1 : 0
        };
      } else {
        // Check if this message is more recent than the stored one
        const currentTimestamp = new Date(conversations[partnerId].lastMessage.timestamp);
        const newTimestamp = new Date(message.timestamp);
        
        if (newTimestamp > currentTimestamp) {
          conversations[partnerId].lastMessage = {
            id: message.id,
            message: message.message,
            timestamp: message.timestamp,
            isRead: message.read_status === 1,
            sentByMe: message.sender_id === userId
          };
        }
        
        // Count unread messages
        if (message.sender_id !== userId && message.read_status === 0) {
          conversations[partnerId].unreadCount++;
        }
      }
    });
    
    // Convert to array and sort by last message timestamp
    let conversationArray = Object.values(conversations)
      .sort((a, b) => {
        const dateA = new Date(a.lastMessage.timestamp);
        const dateB = new Date(b.lastMessage.timestamp);
        return dateB - dateA; // Newest first
      })
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: conversationArray
    });
  } catch (error) {
    console.error("Get recent conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Search users for messaging (used by /api/messages/search-users)
export async function searchUsers(req, res) {
  try {
    const { query = "" } = req.query;
    const q = String(query).trim().toLowerCase();
    if (!q || q.length < 1) {
      return res.json({ success: true, data: [] });
    }

    // Search by name, email, or employee_id
    const like = `%${q}%`;
    const [rows] = await db.execute(
      `SELECT id, name, email, role, employee_id
       FROM users
       WHERE LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(employee_id) LIKE ?
       ORDER BY name ASC
       LIMIT 20`,
      [like, like, like]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}