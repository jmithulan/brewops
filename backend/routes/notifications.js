import express from "express";
import { 
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authenticateToken);

// Get all notifications for current user
router.get("/", getNotifications);

// Create notification
router.post("/", createNotification);

// Mark notification as read
router.put("/:id/read", markNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", markAllNotificationsAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

export default router;