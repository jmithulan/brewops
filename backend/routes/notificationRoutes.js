import express from "express";
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Notification routes
router.post("/", createNotification);
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:id/read", markNotificationAsRead);
router.put("/mark-all-read", markAllNotificationsAsRead);
router.delete("/:id", deleteNotification);

export default router;
