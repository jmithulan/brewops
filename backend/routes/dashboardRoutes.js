import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/dashboard/summary - Get dashboard summary data
router.get('/summary', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.effectiveRole || req.user.role;

    // Get basic counts
    const [usersCount] = await db.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const [suppliersCount] = await db.execute('SELECT COUNT(*) as count FROM suppliers');
    const [inventoryCount] = await db.execute('SELECT COUNT(*) as count FROM raw_tea_leaves WHERE status != "spoiled"');
    const [paymentsCount] = await db.execute('SELECT COUNT(*) as count FROM payments WHERE status = "completed"');

    // Get total inventory weight
    const [inventoryWeight] = await db.execute('SELECT COALESCE(SUM(weight_kg), 0) as total_weight FROM raw_tea_leaves WHERE status != "spoiled"');

    // Get recent activities (last 7 days)
    const [recentUsers] = await db.execute(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const [recentInventory] = await db.execute(`
      SELECT COUNT(*) as count FROM raw_tea_leaves 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Get low stock items
    const [lowStockItems] = await db.execute(`
      SELECT COUNT(*) as count FROM raw_tea_leaves 
      WHERE weight_kg <= COALESCE(min_quantity, 10) AND COALESCE(status, 'available') != "spoiled"
    `);

    // Get monthly revenue (if payments table exists)
    let monthlyRevenue = 0;
    try {
      const [revenue] = await db.execute(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue 
        FROM payments 
        WHERE status = "completed" 
        AND payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
      monthlyRevenue = revenue[0]?.revenue || 0;
    } catch (error) {
      console.log('Payments table not available for revenue calculation');
    }

    const summary = {
      users: {
        total: usersCount[0].count,
        recent: recentUsers[0].count
      },
      suppliers: {
        total: suppliersCount[0].count
      },
      inventory: {
        total_items: inventoryCount[0].count,
        total_weight_kg: inventoryWeight[0].total_weight,
        recent_additions: recentInventory[0].count,
        low_stock_items: lowStockItems[0].count
      },
      payments: {
        total_completed: paymentsCount[0].count,
        monthly_revenue: monthlyRevenue
      },
      alerts: {
        low_stock: lowStockItems[0].count > 0,
        low_stock_count: lowStockItems[0].count
      }
    };

    res.json({
      success: true,
      data: summary,
      user_role: userRole,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    next(error);
  }
});

// GET /api/dashboard/stats - Get detailed statistics
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days

    // Get inventory by quality
    const [inventoryByQuality] = await db.execute(`
      SELECT tq.quality_name, COUNT(rtl.id) as count, SUM(rtl.weight_kg) as total_weight
      FROM raw_tea_leaves rtl
      JOIN tea_quality tq ON rtl.quality_id = tq.id
      WHERE rtl.status != "spoiled"
      GROUP BY tq.id, tq.quality_name
      ORDER BY total_weight DESC
    `);

    // Get inventory by status
    const [inventoryByStatus] = await db.execute(`
      SELECT status, COUNT(*) as count, SUM(weight_kg) as total_weight
      FROM raw_tea_leaves
      GROUP BY status
      ORDER BY count DESC
    `);

    // Get recent activities
    const [recentActivities] = await db.execute(`
      SELECT 'user_registration' as type, name as description, created_at
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      UNION ALL
      SELECT 'inventory_added' as type, CONCAT('Added ', weight_kg, 'kg of tea leaves') as description, created_at
      FROM raw_tea_leaves
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY created_at DESC
      LIMIT 10
    `, [period, period]);

    res.json({
      success: true,
      data: {
        inventory_by_quality: inventoryByQuality,
        inventory_by_status: inventoryByStatus,
        recent_activities: recentActivities
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    next(error);
  }
});

export default router;
