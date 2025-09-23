import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
dotenv.config();

export async function registerUser(req, res) {
  const { name, email, password, role, phone, employeeId } = req.body;

  try {
    console.log("Registration attempt:", { name, email, role, phone, employeeId });

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, password, and role are required" 
      });
    }

    // Employee ID validation removed for now - can be added later with proper employee table

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.error("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user using the User model
    const userData = {
      name,
      email,
      password,
      role,
      phone: phone || null,
      employee_id: employeeId || null
    };

    const newUser = await User.create(userData);
    console.log("User registered successfully:", newUser);

    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        employee_id: newUser.employee_id
      }
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
}

export async function loginUser(req, res) {
  const { email, password, isUsername } = req.body;

  try {
    // Log login attempt for security auditing
    console.log(`Login attempt for ${isUsername ? "username" : "email"}:`, email);
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Login credentials and password are required" 
      });
    }

    // Find user by email or username
    let user;
    if (isUsername) {
      user = await User.findByUsername(email);
      console.log("Attempting username login for:", email);
    } else {
      user = await User.findByEmail(email);
      console.log("Attempting email login for:", email);
    }
    
    if (!user) {
      console.log(`Login failed: User not found for ${isUsername ? "username" : "email"}:`, email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Verify password
<<<<<<< HEAD
    const isValid = await User.comparePassword(password, user.password_hash);
=======
    const isValid = await User.comparePassword(password, user.password);
>>>>>>> b34fc7b (init)
    if (!isValid) {
      console.log("Login failed: Invalid password for email:", email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

<<<<<<< HEAD
    // Check if account is active
    if (user.is_active === false) {
=======
    // Check if account is active (if column exists)
    if (user.is_active !== undefined && user.is_active === false) {
>>>>>>> b34fc7b (init)
      console.log("Login failed: Account is inactive for email:", email);
      return res.status(403).json({ 
        success: false,
        message: "Your account is currently inactive. Please contact support." 
      });
    }

    // Map manager role to have admin privileges
    const effectiveRole = user.role === 'manager' ? 'admin' : user.role;
    
    // Generate JWT token with both actual role and effective role
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        effectiveRole: effectiveRole,
        name: user.name,
        permissions: getRolePermissions(effectiveRole),
        tokenVersion: user.token_version || 0, // For token invalidation on password change
        iat: Math.floor(Date.now() / 1000) // Issued at time
      },
      process.env.JWT_KEY || "your_jwt_secret_key_here",
      { 
        expiresIn: process.env.JWT_EXPIRE || "1d",
        audience: "brewops-app",
        issuer: "brewops-api"
      }
    );
    
    console.log(`User ${user.id} (${user.name}) logged in successfully with role ${user.role} (effective: ${effectiveRole})`);

    // Update last login timestamp in database
    await User.updateLastLogin(user.id);
    
    // Return successful response with user data and token
    res.json({ 
      success: true,
      message: "Login successful", 
      jwtToken, 
      role: user.role,
      effectiveRole: effectiveRole,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        effectiveRole: effectiveRole,
        permissions: getRolePermissions(effectiveRole)
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false,
      message: "An error occurred during login. Please try again.", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

// Helper function to get role permissions
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

export async function getUser(req, res) {
  try {
    // The user data should be available from the auth middleware
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      employee_id: user.employee_id
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
}
