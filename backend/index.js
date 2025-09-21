import bodyParser from "body-parser";
import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import messagesRoutes from "./routes/messages.js";
import notificationsRoutes from "./routes/notifications.js";
import usersRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import supplierDeliveryRoutes from "./routes/supplierDeliveryRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import teaQualityRoutes from "./routes/teaQualityRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import connectDB from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import passport from "passport";
import "./config/googleOAuth.js";
dotenv.config();

const app = express();

// Ensure database connection
connectDB()
  .then(() => {
    console.log("MySQL connected");
  })
  .catch((err) => console.error("MySQL connection error:", err));

// CORS configuration for frontend integration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed patterns
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5191",
      ];

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost")
      ) {
        callback(null, true);
      } else {
        console.warn(`Origin ${origin} not allowed by CORS`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Special handling for Stripe webhook endpoint (needs raw body)
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));

// Regular JSON body parser for all other routes
app.use(bodyParser.json());

// Initialize passport for Google OAuth
app.use(passport.initialize());

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BrewOps API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "BrewOps API",

    version: "1.0.0",
    endpoints: {
      users: {
        list: "GET /api/users",
        search: "GET /api/users?search=query",
        getUser: "GET /api/users/:id",
        updateStatus: "PUT /api/users/:id/status",
      },
      messages: {
        list: "GET /api/messages",
        chat: "GET /api/messages/chat/:userId",
        send: "POST /api/messages/send",
        markRead: "PATCH /api/messages/:messageId/read",
        markAllRead: "POST /api/messages/mark-all-read/:userId",
      },
      notifications: {
        list: "GET /api/notifications",
        unreadCount: "GET /api/notifications/unread-count",
        getNotification: "GET /api/notifications/:id",
        markRead: "PATCH /api/notifications/:id/read",
        markAllRead: "POST /api/notifications/mark-all-read",
        create: "POST /api/notifications",
        delete: "DELETE /api/notifications/:id",
      },
      profile: {
        get: "GET /api/profile",
        basic: "GET /api/profile/basic",
        update: "PUT /api/profile",
        changePassword: "POST /api/profile/change-password",
        uploadAvatar: "POST /api/profile/upload-avatar",
        stats: "GET /api/profile/stats",
        permissions: "GET /api/profile/permissions",
        updatePreferences: "PUT /api/profile/preferences",
        deactivate: "POST /api/profile/deactivate",
      },
    },
  });
});

// Public routes (login, registration)
app.use("/api/users", authRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/auth", authRoutes);

// JWT authentication middleware for protected routes only
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(
      token,
      process.env.JWT_KEY || "your_jwt_secret_key_here",
      (err, decoded) => {
        if (decoded != null) {
          console.log(decoded);
          req.user = decoded;
          next();
        } else {
          console.log("Token is not provided");
          res.status(403).json({
            message: "Token is not provided",
          });
        }
      }
    );
  } else {
    next();
  }
});

// Protected profile routes
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/users", usersRoutes);

// Payment module routes
app.use("/api/suppliers", supplierRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/supplier-deliveries", supplierDeliveryRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/tea-qualities", teaQualityRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/orders", orderRoutes);

// WebSocket server setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      // Check if origin matches allowed patterns
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5191",
      ];

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost")
      ) {
        callback(null, true);
      } else {
        console.warn(`Origin ${origin} not allowed by Socket.IO CORS`);
        callback(null, false);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available in Express routes
app.set("io", io);

// Authentication middleware for Socket.IO
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(
      token,
      process.env.JWT_KEY || "your_jwt_secret_key_here",
      (err, decoded) => {
        if (err) {
          return next(new Error("Authentication error: Invalid token"));
        }

        // Add user data to socket
        socket.user = decoded;
        next();
      }
    );
  } catch (error) {
    next(new Error("Authentication error: " + error.message));
  }
});

// Real-time notifications/messages
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "User ID:", socket.user?.id);

  // Join user to their own room for targeted messages
  if (socket.user?.id) {
    const userId = socket.user.id;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);

    // Also join role-based room for role-specific broadcasts
    if (socket.user.role) {
      socket.join(`role_${socket.user.role}`);
      console.log(`User ${userId} joined ${socket.user.role} role room`);
    }

    // Notify other users that this user is online
    socket.broadcast.emit("userStatus", {
      userId: userId,
      status: "online",
      timestamp: new Date(),
    });

    // Send list of online users to the newly connected user
    const onlineUsers = Array.from(io.sockets.sockets.values())
      .filter((s) => s.user?.id)
      .map((s) => ({
        userId: s.user.id,
        userName: s.user.name,
        userRole: s.user.role,
      }));

    socket.emit("onlineUsers", onlineUsers);
  }

  // Handle real-time message sending
  socket.on("sendMessage", async (data) => {
    try {
      const { receiverId, message } = data;
      const senderId = socket.user.id;

      // Create message record in the database
      const Message = (await import("./models/Message.js")).default;
      const User = (await import("./models/User.js")).default;
      const Notification = (await import("./models/Notification.js")).default;

      // Get sender and receiver
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);

      if (!receiver) {
        socket.emit("error", { message: "Receiver not found" });
        return;
      }

      // Create the message
      const newMessage = await Message.create({
        sender_id: senderId,
        receiver_id: receiverId,
        message,
      });

      // Create a notification
      await Notification.create({
        title: `New message from ${sender.name}`,
        message:
          message.length > 30 ? `${message.substring(0, 30)}...` : message,
        type: "message",
        recipient_id: receiverId,
        metadata: JSON.stringify({
          senderId,
          messageId: newMessage.id,
          senderName: sender.name,
          senderRole: sender.role,
        }),
        priority: "medium",
      });

      // Emit to the receiver's room
      io.to(`user_${receiverId}`).emit("newMessage", {
        id: newMessage.id,
        senderId,
        senderName: sender.name,
        senderRole: sender.role,
        message,
        timestamp: newMessage.timestamp || new Date(),
      });

      // Also emit a notification event
      io.to(`user_${receiverId}`).emit("notification", {
        type: "message",
        title: `New message from ${sender.name}`,
        message:
          message.length > 30 ? `${message.substring(0, 30)}...` : message,
        senderId,
        senderName: sender.name,
        timestamp: new Date(),
      });

      // Confirm to sender
      socket.emit("messageSent", {
        id: newMessage.id,
        receiverId,
        message,
        timestamp: newMessage.timestamp || new Date(),
      });
    } catch (error) {
      console.error("Socket send message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle message read notifications
  socket.on("markMessageRead", async (data) => {
    try {
      const { messageId } = data;
      const userId = socket.user.id;

      const Message = (await import("./models/Message.js")).default;

      const message = await Message.findById(messageId);

      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      // Check if user is the receiver
      if (message.receiver_id !== userId) {
        socket.emit("error", {
          message: "Can only mark messages sent to you as read",
        });
        return;
      }

      await Message.markAsRead(messageId);

      // Notify sender that their message was read
      io.to(`user_${message.sender_id}`).emit("messageRead", {
        messageId,
        readBy: userId,
        timestamp: new Date(),
      });

      // Confirm to the user who marked the message as read
      socket.emit("messageMarkedRead", { messageId });
    } catch (error) {
      console.error("Socket mark message read error:", error);
      socket.emit("error", { message: "Failed to mark message as read" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { receiverId, isTyping } = data;
    const userId = socket.user?.id;

    if (userId && receiverId) {
      // Emit typing status to the recipient
      io.to(`user_${receiverId}`).emit("userTyping", {
        userId,
        isTyping,
      });
    }
  });

  // Handle user presence
  socket.on("setStatus", (status) => {
    if (socket.user?.id) {
      // Broadcast status change to all users
      socket.broadcast.emit("userStatus", {
        userId: socket.user.id,
        status,
        timestamp: new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Notify other users that this user went offline
    if (socket.user?.id) {
      socket.broadcast.emit("userStatus", {
        userId: socket.user.id,
        status: "offline",
        timestamp: new Date(),
      });
    }
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
const PORT = process.env.PORT || 4321; // Using a less common port
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
