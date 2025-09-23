import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db.js';
import PDFDocument from 'pdfkit';
import { errorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation middleware
const validateReportRequest = [
  body('type').isIn(['inventory', 'supplies', 'production', 'financial']).withMessage('Invalid report type'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date')
];

// Helper function to generate natural language summary
function generateSummary(type, data) {
  switch (type) {
    case 'inventory':
      return `Inventory Report Summary: The system currently has ${data.totalItems || 0} inventory items with a total weight of ${data.totalWeight || 0}kg. ${data.lowStockItems || 0} items are below minimum stock levels and require attention. The most recent additions include ${data.recentAdditions || 0} items added in the last 7 days.`;

    case 'supplies':
      return `Supply Report Summary: There are ${data.totalRequests || 0} supplier requests in the system. ${data.pendingRequests || 0} requests are pending, ${data.completedRequests || 0} have been completed, and ${data.rejectedRequests || 0} were rejected. The total quantity requested is ${data.totalQuantity || 0}kg across ${data.activeSuppliers || 0} active suppliers.`;

    case 'production':
      return `Production Report Summary: The production system shows ${data.totalBatches || 0} production batches. ${data.completedBatches || 0} batches have been completed successfully, ${data.inProgressBatches || 0} are currently in progress, and ${data.qualityIssues || 0} batches had quality issues. The average production time is ${data.avgProductionTime || 0} hours per batch.`;

    case 'financial':
      return `Financial Report Summary: The financial overview shows ${data.totalPayments || 0} payments totaling $${data.totalAmount || 0}. ${data.pendingPayments || 0} payments are pending, and ${data.completedPayments || 0} have been completed. The average payment amount is $${data.avgPayment || 0} with ${data.activeSuppliers || 0} suppliers receiving payments.`;

    default:
      return 'Report summary not available for this report type.';
  }
}

// Helper function to create PDF
function createPDF(title, summary, data, type) {
  const doc = new PDFDocument();
  const buffers = [];
  
  doc.on('data', buffers.push.bind(buffers));
  
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    
    doc.on('error', reject);

    // Add title
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    // Add generation date
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown(2);

    // Add summary
    doc.fontSize(14).text('Executive Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(summary, { align: 'justify' });
    doc.moveDown(2);

    // Add detailed data based on type
    switch (type) {
      case 'inventory':
        if (data.items && data.items.length > 0) {
          doc.fontSize(14).text('Inventory Details', { underline: true });
          doc.moveDown();
          
          // Table headers
          doc.fontSize(10);
          doc.text('Item Name', 50, doc.y);
          doc.text('Weight (kg)', 200, doc.y);
          doc.text('Status', 300, doc.y);
          doc.text('Date Added', 400, doc.y);
          doc.moveDown();
          
          // Table rows
          data.items.forEach(item => {
            doc.text(item.name || 'N/A', 50, doc.y);
            doc.text(item.weight_kg || '0', 200, doc.y);
            doc.text(item.status || 'available', 300, doc.y);
            doc.text(new Date(item.created_at).toLocaleDateString(), 400, doc.y);
            doc.moveDown();
          });
        }
        break;

      case 'supplies':
        if (data.requests && data.requests.length > 0) {
          doc.fontSize(14).text('Supply Request Details', { underline: true });
          doc.moveDown();
          
          // Table headers
          doc.fontSize(10);
          doc.text('Supplier', 50, doc.y);
          doc.text('Product', 150, doc.y);
          doc.text('Quantity', 250, doc.y);
          doc.text('Status', 320, doc.y);
          doc.text('Date', 400, doc.y);
          doc.moveDown();
          
          // Table rows
          data.requests.forEach(request => {
            doc.text(request.supplier_name || 'N/A', 50, doc.y);
            doc.text(request.product || 'N/A', 150, doc.y);
            doc.text(request.quantity || '0', 250, doc.y);
            doc.text(request.status || 'assigned', 320, doc.y);
            doc.text(new Date(request.created_at).toLocaleDateString(), 400, doc.y);
            doc.moveDown();
          });
        }
        break;

      case 'production':
        if (data.batches && data.batches.length > 0) {
          doc.fontSize(14).text('Production Batch Details', { underline: true });
          doc.moveDown();
          
          // Table headers
          doc.fontSize(10);
          doc.text('Batch ID', 50, doc.y);
          doc.text('Product', 150, doc.y);
          doc.text('Quantity', 250, doc.y);
          doc.text('Status', 320, doc.y);
          doc.text('Date', 400, doc.y);
          doc.moveDown();
          
          // Table rows
          data.batches.forEach(batch => {
            doc.text(batch.id || 'N/A', 50, doc.y);
            doc.text(batch.product || 'N/A', 150, doc.y);
            doc.text(batch.quantity || '0', 250, doc.y);
            doc.text(batch.status || 'pending', 320, doc.y);
            doc.text(new Date(batch.created_at).toLocaleDateString(), 400, doc.y);
            doc.moveDown();
          });
        }
        break;

      case 'financial':
        if (data.payments && data.payments.length > 0) {
          doc.fontSize(14).text('Payment Details', { underline: true });
          doc.moveDown();
          
          // Table headers
          doc.fontSize(10);
          doc.text('Supplier', 50, doc.y);
          doc.text('Amount', 200, doc.y);
          doc.text('Method', 280, doc.y);
          doc.text('Status', 350, doc.y);
          doc.text('Date', 420, doc.y);
          doc.moveDown();
          
          // Table rows
          data.payments.forEach(payment => {
            doc.text(payment.supplier_name || 'N/A', 50, doc.y);
            doc.text(`$${payment.amount || '0'}`, 200, doc.y);
            doc.text(payment.payment_method || 'N/A', 280, doc.y);
            doc.text(payment.status || 'pending', 350, doc.y);
            doc.text(new Date(payment.payment_date).toLocaleDateString(), 420, doc.y);
            doc.moveDown();
          });
        }
        break;
    }

    doc.end();
  });
}

// GET /api/reports/inventory - Generate inventory report
router.get('/inventory', authenticateToken, authorizeRoles(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    let query = `
      SELECT id, name, weight_kg, status, created_at, updated_at
      FROM raw_tea_leaves
      WHERE 1=1
    `;
    const queryParams = [];

    if (startDate) {
      query += ` AND created_at >= ?`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= ?`;
      queryParams.push(endDate);
    }

    query += ` ORDER BY created_at DESC`;

    const [items] = await db.execute(query, queryParams);

    // Get summary statistics
    const [totalStats] = await db.execute(`
      SELECT 
        COUNT(*) as totalItems,
        SUM(weight_kg) as totalWeight,
        COUNT(CASE WHEN weight_kg <= COALESCE(min_quantity, 10) THEN 1 END) as lowStockItems
      FROM raw_tea_leaves
    `);

    const [recentStats] = await db.execute(`
      SELECT COUNT(*) as recentAdditions
      FROM raw_tea_leaves
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const data = {
      items: items,
      totalItems: totalStats[0].totalItems,
      totalWeight: totalStats[0].totalWeight,
      lowStockItems: totalStats[0].lowStockItems,
      recentAdditions: recentStats[0].recentAdditions
    };

    const summary = generateSummary('inventory', data);

    if (format === 'pdf') {
      const pdfBuffer = await createPDF('Inventory Report', summary, data, 'inventory');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${new Date().toISOString().split('T')[0]}.pdf"`);
      res.send(pdfBuffer);
    } else {
      res.json({
        success: true,
        report: {
          type: 'inventory',
          summary: summary,
          data: data,
          generatedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/supplies - Generate supplies report
router.get('/supplies', authenticateToken, authorizeRoles(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    let query = `
      SELECT sr.*, s.supplier_name, u.name as assigned_by_name
      FROM supplier_requests sr
      LEFT JOIN suppliers s ON sr.supplier_id = s.id
      LEFT JOIN users u ON sr.assigned_by = u.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (startDate) {
      query += ` AND sr.created_at >= ?`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND sr.created_at <= ?`;
      queryParams.push(endDate);
    }

    query += ` ORDER BY sr.created_at DESC`;

    const [requests] = await db.execute(query, queryParams);

    // Get summary statistics
    const [totalStats] = await db.execute(`
      SELECT 
        COUNT(*) as totalRequests,
        SUM(quantity) as totalQuantity,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as pendingRequests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedRequests,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedRequests
      FROM supplier_requests
    `);

    const [supplierStats] = await db.execute(`
      SELECT COUNT(DISTINCT supplier_id) as activeSuppliers
      FROM supplier_requests
    `);

    const data = {
      requests: requests,
      totalRequests: totalStats[0].totalRequests,
      totalQuantity: totalStats[0].totalQuantity,
      pendingRequests: totalStats[0].pendingRequests,
      completedRequests: totalStats[0].completedRequests,
      rejectedRequests: totalStats[0].rejectedRequests,
      activeSuppliers: supplierStats[0].activeSuppliers
    };

    const summary = generateSummary('supplies', data);

    if (format === 'pdf') {
      const pdfBuffer = await createPDF('Supplies Report', summary, data, 'supplies');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="supplies_report_${new Date().toISOString().split('T')[0]}.pdf"`);
      res.send(pdfBuffer);
    } else {
      res.json({
        success: true,
        report: {
          type: 'supplies',
          summary: summary,
          data: data,
          generatedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/production - Generate production report
router.get('/production', authenticateToken, authorizeRoles(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // For now, we'll create a mock production report since production tables might not exist
    const data = {
      batches: [],
      totalBatches: 0,
      completedBatches: 0,
      inProgressBatches: 0,
      qualityIssues: 0,
      avgProductionTime: 0
    };

    const summary = generateSummary('production', data);

    if (format === 'pdf') {
      const pdfBuffer = await createPDF('Production Report', summary, data, 'production');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="production_report_${new Date().toISOString().split('T')[0]}.pdf"`);
      res.send(pdfBuffer);
    } else {
      res.json({
        success: true,
        report: {
          type: 'production',
          summary: summary,
          data: data,
          generatedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/financial - Generate financial report
router.get('/financial', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    let query = `
      SELECT p.*, s.supplier_name
      FROM payments p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (startDate) {
      query += ` AND p.payment_date >= ?`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND p.payment_date <= ?`;
      queryParams.push(endDate);
    }

    query += ` ORDER BY p.payment_date DESC`;

    const [payments] = await db.execute(query, queryParams);

    // Get summary statistics
    const [totalStats] = await db.execute(`
      SELECT 
        COUNT(*) as totalPayments,
        SUM(amount) as totalAmount,
        AVG(amount) as avgPayment,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingPayments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedPayments
      FROM payments
    `);

    const [supplierStats] = await db.execute(`
      SELECT COUNT(DISTINCT supplier_id) as activeSuppliers
      FROM payments
    `);

    const data = {
      payments: payments,
      totalPayments: totalStats[0].totalPayments,
      totalAmount: totalStats[0].totalAmount,
      avgPayment: totalStats[0].avgPayment,
      pendingPayments: totalStats[0].pendingPayments,
      completedPayments: totalStats[0].completedPayments,
      activeSuppliers: supplierStats[0].activeSuppliers
    };

    const summary = generateSummary('financial', data);

    if (format === 'pdf') {
      const pdfBuffer = await createPDF('Financial Report', summary, data, 'financial');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="financial_report_${new Date().toISOString().split('T')[0]}.pdf"`);
      res.send(pdfBuffer);
    } else {
      res.json({
        success: true,
        report: {
          type: 'financial',
          summary: summary,
          data: data,
          generatedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/summary - Get all reports summary
router.get('/summary', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    // Get quick stats for dashboard
    const [inventoryStats] = await db.execute(`
      SELECT 
        COUNT(*) as totalItems,
        SUM(weight_kg) as totalWeight,
        COUNT(CASE WHEN weight_kg <= COALESCE(min_quantity, 10) THEN 1 END) as lowStockItems
      FROM raw_tea_leaves
    `);

    const [supplyStats] = await db.execute(`
      SELECT 
        COUNT(*) as totalRequests,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as pendingRequests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedRequests
      FROM supplier_requests
    `);

    const [paymentStats] = await db.execute(`
      SELECT 
        COUNT(*) as totalPayments,
        SUM(amount) as totalAmount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingPayments
      FROM payments
    `);

    res.json({
      success: true,
      summary: {
        inventory: inventoryStats[0],
        supplies: supplyStats[0],
        payments: paymentStats[0],
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;