import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation middleware
const validateUser = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'manager', 'staff', 'supplier']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('employee_id').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Employee ID must be 1-20 characters')
];

const validateUserUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'manager', 'staff', 'supplier']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('employee_id').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Employee ID must be 1-20 characters')
];

// GET /api/admin/users - Get all users
router.get('/users', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.phone, u.employee_id, 
             u.created_at, 'active' as status, NULL as last_login, NULL as avatar
      FROM users u
      WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      query += ` AND u.role = ?`;
      queryParams.push(role);
    }

    if (status && status !== 'all') {
      // Since we don't have status field, we'll filter by role or other criteria
      // For now, we'll just ignore status filtering
    }

    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [users] = await db.execute(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM users u WHERE 1=1
    `;
    const countParams = [];

    if (search) {
      countQuery += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      countQuery += ` AND u.role = ?`;
      countParams.push(role);
    }

    if (status && status !== 'all') {
      // Since we don't have status field, we'll filter by role or other criteria
      // For now, we'll just ignore status filtering
    }

    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      success: true,
      users: users,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users - Create new user
router.post('/users', authenticateToken, authorizeRoles(['admin', 'manager']), validateUser, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, phone, employee_id } = req.body;

    // Check if user already exists
    const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role, phone, employee_id, is_active, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 1, 'active', NOW())`,
      [name, email, hashedPassword, role, phone || null, employee_id || null]
    );

    // Get created user
    const [newUser] = await db.execute('SELECT id, name, email, role, phone, employee_id, is_active, status, created_at FROM users WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users/:id - Get user by ID
router.get('/users/:id', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [users] = await db.execute(
      'SELECT id, name, email, role, phone, employee_id, is_active, status, last_login, created_at, avatar FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/users/:id - Update user
router.patch('/users/:id', authenticateToken, authorizeRoles(['admin', 'manager']), upload.single('avatar'), validateUserUpdate, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email, role, phone, employee_id, status } = req.body;

    // Check if user exists
    const [existingUser] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const [emailCheck] = await db.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another user'
        });
      }
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (employee_id !== undefined) {
      updateFields.push('employee_id = ?');
      updateValues.push(employee_id);
    }
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (req.file) {
      updateFields.push('avatar = ?');
      updateValues.push(`/uploads/avatars/${req.file.filename}`);
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    if (updateFields.length === 1) { // Only updated_at
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    await db.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [updatedUser] = await db.execute(
      'SELECT id, name, email, role, phone, employee_id, is_active, status, last_login, created_at, avatar FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUser] = await db.execute('SELECT id, role FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the current user
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by setting is_active to false
    await db.execute('UPDATE users SET is_active = 0, status = "inactive" WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/status - Update user status
router.put('/users/:id/status', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or pending'
      });
    }

    // Check if user exists
    const [existingUser] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isActive = status === 'active' ? 1 : 0;
    await db.execute('UPDATE users SET status = ?, is_active = ?, updated_at = NOW() WHERE id = ?', [status, isActive, id]);

    res.json({
      success: true,
      message: `User status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users/change-password - Change user password
router.post('/users/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get current user
    const [users] = await db.execute('SELECT id, password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password and increment token version
    await db.execute(
      'UPDATE users SET password = ?, token_version = token_version + 1, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;