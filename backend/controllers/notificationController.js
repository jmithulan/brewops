import Notification from "../models/Notification.js";

// Create notification
export async function createNotification(req, res) {
  try {
    const notificationData = {
      title: req.body.title,
      message: req.body.message,
      type: req.body.type || 'info',
      recipient_id: req.body.recipient_id,
      recipient_role: req.body.recipient_role,
      metadata: req.body.metadata,
      priority: req.body.priority || 'medium'
    };

    // Validation
    if (!notificationData.title || !notificationData.message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    const newNotification = await Notification.create(notificationData);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: newNotification
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get notifications for current user
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 50, offset = 0, unread_only = false } = req.query;

    let notifications = await Notification.findByRecipient(userId, userRole);

    if (unread_only === 'true') {
      notifications = notifications.filter(n => !n.is_read);
    }

    // Apply pagination
    const paginatedNotifications = notifications.slice(offset, offset + parseInt(limit));

    const unreadCount = await Notification.getUnreadCount(userId, userRole);

    res.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        total: notifications.length,
        unread: unreadCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: notifications.length > offset + parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Mark notification as read
export async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await Notification.markAsRead(id, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;

    const count = await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: `${count} notifications marked as read`
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await Notification.delete(id, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get unread count
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const count = await Notification.getUnreadCount(userId, userRole);

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}
