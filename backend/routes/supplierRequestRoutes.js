import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db.js';
import { errorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation middleware
const validateSupplierRequest = [
  body('supplier_id').isInt().withMessage('Valid supplier ID is required'),
  body('product').trim().isLength({ min: 1, max: 255 }).withMessage('Product name is required'),
  body('quantity').isFloat({ min: 0.1 }).withMessage('Valid quantity is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

// GET /api/supplier-requests - Get all supplier requests
router.get('/', authenticateToken, authorizeRoles(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '', supplier_id = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sr.*, s.supplier_name, s.contact_person, s.phone as supplier_contact,
             u.name as assigned_by_name
      FROM supplier_requests sr
      LEFT JOIN suppliers s ON sr.supplier_id = s.id
      LEFT JOIN users u ON sr.assigned_by = u.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (status) {
      query += ` AND sr.status = ?`;
      queryParams.push(status);
    }

    if (supplier_id) {
      query += ` AND sr.supplier_id = ?`;
      queryParams.push(supplier_id);
    }

    query += ` ORDER BY sr.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [requests] = await db.execute(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM supplier_requests sr WHERE 1=1
    `;
    const countParams = [];

    if (status) {
      countQuery += ` AND sr.status = ?`;
      countParams.push(status);
    }

    if (supplier_id) {
      countQuery += ` AND sr.supplier_id = ?`;
      countParams.push(supplier_id);
    }

    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      success: true,
      requests: requests,
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

// POST /api/supplier-requests - Create new supplier request
router.post('/', authenticateToken, authorizeRoles(['admin', 'manager', 'staff']), validateSupplierRequest, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { supplier_id, product, quantity, notes } = req.body;

    // Check if supplier exists
    const [suppliers] = await db.execute('SELECT id, supplier_name FROM suppliers WHERE id = ?', [supplier_id]);
    if (suppliers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Create supplier request
    const [result] = await db.execute(
      `INSERT INTO supplier_requests (supplier_id, assigned_by, product, quantity, notes, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'assigned', NOW())`,
      [supplier_id, req.user.id, product, quantity, notes || null]
    );

    // Get created request with supplier details
    const [newRequest] = await db.execute(`
      SELECT sr.*, s.supplier_name, s.contact_person, s.phone as supplier_contact,
             u.name as assigned_by_name
      FROM supplier_requests sr
      LEFT JOIN suppliers s ON sr.supplier_id = s.id
      LEFT JOIN users u ON sr.assigned_by = u.id
      WHERE sr.id = ?
    `, [result.insertId]);

    // Create notification for supplier
    await db.execute(
      `INSERT INTO notifications (user_id, type, title, message, data, read_bool, created_at) 
       VALUES (?, 'supplier_request', 'New Supply Request', ?, ?, FALSE, NOW())`,
      [
        supplier_id,
        `New supply request for ${quantity}kg of ${product}`,
        JSON.stringify({
          request_id: result.insertId,
          product: product,
          quantity: quantity,
          assigned_by: req.user.name
        })
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Supplier request created successfully',
      request: newRequest[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/supplier-requests/my - Get supplier's own requests
router.get('/my', authenticateToken, authorizeRoles(['supplier']), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sr.*, u.name as assigned_by_name
      FROM supplier_requests sr
      LEFT JOIN users u ON sr.assigned_by = u.id
      WHERE sr.supplier_id = ?
    `;
    const queryParams = [req.user.id];

    if (status) {
      query += ` AND sr.status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY sr.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [requests] = await db.execute(query, queryParams);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM supplier_requests sr WHERE sr.supplier_id = ?`;
    const countParams = [req.user.id];

    if (status) {
      countQuery += ` AND sr.status = ?`;
      countParams.push(status);
    }

    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      success: true,
      requests: requests,
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

// PUT /api/supplier-requests/:id/status - Update request status
router.put('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['assigned', 'accepted', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be assigned, accepted, completed, or rejected'
      });
    }

    // Check if request exists
    const [requests] = await db.execute('SELECT * FROM supplier_requests WHERE id = ?', [id]);
    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    // Check permissions
    if (req.user.role === 'supplier' && request.supplier_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update status
    await db.execute(
      'UPDATE supplier_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Create notification for admin/staff
    if (req.user.role === 'supplier') {
      const [suppliers] = await db.execute('SELECT supplier_name FROM suppliers WHERE id = ?', [request.supplier_id]);
      const supplierName = suppliers[0]?.supplier_name || 'Unknown Supplier';

      await db.execute(
        `INSERT INTO notifications (user_id, type, title, message, data, read_bool, created_at) 
         VALUES (?, 'request_status_update', 'Request Status Updated', ?, ?, FALSE, NOW())`,
        [
          request.assigned_by,
          `Supplier ${supplierName} updated request status to ${status}`,
          JSON.stringify({
            request_id: id,
            status: status,
            supplier_id: request.supplier_id
          })
        ]
      );
    }

    res.json({
      success: true,
      message: `Request status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/supplier-requests/:id - Get request by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [requests] = await db.execute(`
      SELECT sr.*, s.supplier_name, s.contact_person, s.phone as supplier_contact,
             u.name as assigned_by_name
      FROM supplier_requests sr
      LEFT JOIN suppliers s ON sr.supplier_id = s.id
      LEFT JOIN users u ON sr.assigned_by = u.id
      WHERE sr.id = ?
    `, [id]);

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    // Check permissions
    if (req.user.role === 'supplier' && request.supplier_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      request: request
    });
  } catch (error) {
    next(error);
  }
});

export default router;