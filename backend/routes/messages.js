import express from "express";
import { 
  getUserMessages,
  getConversation,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadMessages,
  getMessageStats,
<<<<<<< HEAD
  getRecentConversations
=======
  getRecentConversations,
  searchUsers
>>>>>>> b34fc7b (init)
} from "../controllers/messageController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all message routes
router.use(authenticateToken);

// Get all messages for the current user
router.get("/", getUserMessages);

// Get conversation between the current user and another user
router.get("/conversation/:userId", getConversation);

// Send a message
router.post("/send", sendMessage);

// Mark message as read
router.patch("/:messageId/read", markMessageAsRead);

// Mark entire conversation as read
router.patch("/conversation/:userId/read", markConversationAsRead);

// Get unread messages
router.get("/unread", getUnreadMessages);

// Get message statistics
router.get("/stats", getMessageStats);

// Get recent conversations
router.get("/conversations/recent", getRecentConversations);

<<<<<<< HEAD
=======
// Search users endpoint used by the UI (prevents 404)
router.get("/search-users", searchUsers);

>>>>>>> b34fc7b (init)
export default router;