import express from "express";
import { registerUser, loginUser, getUser } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import setupGoogleOAuth from "../config/googleOAuth.js";
import User from "../models/User.js";

// Initialize Google OAuth
const googlePassport = setupGoogleOAuth();
const router = express.Router();

// LOGIN route
router.post("/login", loginUser);

// Register route
router.post("/register", registerUser);

// Endpoint to get logged-in user details
router.get("/user", authenticateToken, getUser);

// Google OAuth routes
router.get("/google", (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Google OAuth is not properly configured. Missing client ID or secret.");
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google-oauth-not-configured`);
  }
  
  console.log("Starting Google OAuth flow - redirecting to Google...");
  
  // Proceed with Google authentication - extended scope for better profile data
  googlePassport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: 'select_account', // Always prompt user to select account
    accessType: 'offline' // Request a refresh token
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  // Log the callback request for debugging
  console.log("Google OAuth callback received", {
    query: req.query,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    }
  });
  
  // If there's an error in the callback, handle it
  if (req.query.error) {
    console.error("Google OAuth error:", req.query.error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${req.query.error}`);
  }
  
  // Authenticate with passport - custom error handling
  googlePassport.authenticate("google", { 
    session: false,
    failureRedirect: null // Don't auto-redirect on failure
  }, (err, user, info) => {
    // Handle authentication errors
    if (err) {
      console.error("Google OAuth authentication error:", err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message || "authentication-failed")}`);
    }
    
    // If no user was returned
    if (!user) {
      console.error("Google OAuth failed - no user returned", info);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no-user-data`);
    }
    
    try {
      // User is authenticated, generate JWT
      console.log("Google OAuth successful for user:", user.email);
      
      // Map manager role to have admin privileges
      const effectiveRole = user.role === 'manager' ? 'admin' : user.role;
      
      // Get permissions for the role
      const permissions = getRolePermissions(effectiveRole);
      
      // Generate JWT token with more debug info
      const jwtToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          effectiveRole: effectiveRole,
          name: user.name,
          permissions: permissions,
          tokenVersion: user.token_version || 0,
          authMethod: 'google',
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_KEY || "your_jwt_secret_key_here",
        { 
          expiresIn: process.env.JWT_EXPIRE || "1d",
          audience: "brewops-app",
          issuer: "brewops-api"
        }
      );
      
      // Update last login timestamp - catch errors but continue
      try {
        User.updateLastLogin(user.id);
      } catch (updateError) {
        console.warn("Failed to update last login time:", updateError.message);
      }
      
      // Get the frontend URL from the environment or detect all possible ports
      const possiblePorts = ['5173', '5174', '5175', '5176', '5177', '5191'];
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5176';
      
      // Add some additional debug for troubleshooting
      const redirectUrl = `${frontendBaseUrl}/auth/google/success?token=${jwtToken}`;
      console.log("Redirecting to:", redirectUrl);
      
      // Redirect to frontend with token
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google OAuth callback JWT generation error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error.message || "server-error")}`);
    }
  })(req, res, next);
});

// Helper function to get role permissions (copied from authController for consistency)
function getRolePermissions(role) {
  const basePermissions = ['view_profile', 'edit_profile'];
  
  switch (role) {
    case 'admin':
      return [
        ...basePermissions,
        'manage_users',
        'manage_suppliers',
        'view_reports',
        'manage_inventory',
        'manage_payments',
        'approve_deliveries',
        'manage_production',
        'view_analytics'
      ];
    case 'manager':
      return [
        ...basePermissions,
        'manage_users',
        'manage_suppliers',
        'view_reports',
        'manage_inventory',
        'manage_payments',
        'approve_deliveries',
        'manage_production',
        'view_analytics'
      ];
    case 'staff':
      return [
        ...basePermissions,
        'record_deliveries',
        'view_inventory',
        'process_payments'
      ];
    case 'supplier':
      return [
        ...basePermissions,
        'view_deliveries',
        'view_payments',
        'schedule_deliveries'
      ];
    default:
      return basePermissions;
  }
}

export default router;
