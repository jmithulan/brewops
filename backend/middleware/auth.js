import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

/**
 * Middleware to authenticate JWT tokens and validate user permissions
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    // Verify the token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_KEY || "your_jwt_secret_key_here",
      {
        audience: "brewops-app",
        issuer: "brewops-api"
      }
    );

    // Check if the user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if token version matches (for invalidating tokens after password change)
    if (user.token_version && decoded.tokenVersion !== user.token_version) {
      return res.status(403).json({
        success: false,
        message: "Token has been invalidated. Please login again.",
      });
    }

    // Check if user is active
    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

    // Add user information to request
    req.user = {
      ...decoded,
      // Update effectiveRole to ensure managers are treated as admins
      effectiveRole: decoded.role === 'manager' ? 'admin' : decoded.role
    };
    
    next();
  } catch (err) {
    console.error("Token authentication error:", err);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    
    return res.status(403).json({
      success: false,
      message: "Invalid token. Please login again.",
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userRole = req.user.effectiveRole || req.user.role;
    
    // Allow access if user's role is in the permitted roles
    if (roles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. Insufficient permissions.",
    });
  };
};

<<<<<<< HEAD
export { authenticateToken, checkRole };
=======
/**
 * Middleware to authorize specific roles (alias for checkRole)
 */
const authorizeRoles = (roles) => {
  return checkRole(roles);
};

export { authenticateToken, checkRole, authorizeRoles };
>>>>>>> b34fc7b (init)
