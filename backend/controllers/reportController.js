import { db } from "../config/db.js";

// Daily supplier delivery report
export async function getDailySupplierReport(req, res) {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required (YYYY-MM-DD format)"
      });
    }

    const [deliveryStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_deliveries,
        SUM(quantity) as total_quantity,
        SUM(total_amount) as total_amount,
        AVG(rate_per_kg) as avg_rate,
        COUNT(DISTINCT supplier_id) as unique_suppliers
      FROM deliveries 
      WHERE DATE(delivery_date) = ?
    `, [date]);

    const [supplierBreakdown] = await db.execute(`
      SELECT 
        s.name as supplier_name,
        s.supplier_id,
        COUNT(d.id) as delivery_count,
        SUM(d.quantity) as total_quantity,
        SUM(d.total_amount) as total_amount,
        AVG(d.rate_per_kg) as avg_rate
      FROM deliveries d
      JOIN suppliers s ON d.supplier_id = s.id
      WHERE DATE(d.delivery_date) = ?
      GROUP BY s.id, s.name, s.supplier_id
      ORDER BY total_amount DESC
    `, [date]);

    const [paymentStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_payment_amount,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM payments 
      WHERE DATE(payment_date) = ?
    `, [date]);

    res.json({
      success: true,
      date,
      deliveryStats: deliveryStats[0],
      supplierBreakdown,
      paymentStats: paymentStats[0]
    });
  } catch (error) {
    console.error("Get daily supplier report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Monthly supplier delivery report
export async function getMonthlySupplierReport(req, res) {
  try {
    const { year, month } = req.params;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month parameters are required"
      });
    }

    const [monthlyStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_deliveries,
        SUM(quantity) as total_quantity,
        SUM(total_amount) as total_amount,
        AVG(rate_per_kg) as avg_rate,
        COUNT(DISTINCT supplier_id) as unique_suppliers,
        MIN(delivery_date) as first_delivery,
        MAX(delivery_date) as last_delivery
      FROM deliveries 
      WHERE YEAR(delivery_date) = ? AND MONTH(delivery_date) = ?
    `, [year, month]);

    const [dailyBreakdown] = await db.execute(`
      SELECT 
        DATE(delivery_date) as delivery_date,
        COUNT(*) as daily_deliveries,
        SUM(quantity) as daily_quantity,
        SUM(total_amount) as daily_amount
      FROM deliveries 
      WHERE YEAR(delivery_date) = ? AND MONTH(delivery_date) = ?
      GROUP BY DATE(delivery_date)
      ORDER BY delivery_date
    `, [year, month]);

    const [supplierRanking] = await db.execute(`
      SELECT 
        s.name as supplier_name,
        s.supplier_id,
        COUNT(d.id) as delivery_count,
        SUM(d.quantity) as total_quantity,
        SUM(d.total_amount) as total_amount,
        AVG(d.rate_per_kg) as avg_rate,
        RANK() OVER (ORDER BY SUM(d.total_amount) DESC) as ranking
      FROM deliveries d
      JOIN suppliers s ON d.supplier_id = s.id
      WHERE YEAR(d.delivery_date) = ? AND MONTH(d.delivery_date) = ?
      GROUP BY s.id, s.name, s.supplier_id
      ORDER BY total_amount DESC
    `, [year, month]);

    res.json({
      success: true,
      period: { year: parseInt(year), month: parseInt(month) },
      monthlyStats: monthlyStats[0],
      dailyBreakdown,
      supplierRanking
    });
  } catch (error) {
    console.error("Get monthly supplier report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Daily inventory report
export async function getDailyInventoryReport(req, res) {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required (YYYY-MM-DD format)"
      });
    }

    const [inventoryStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        AVG(quantity) as avg_quantity,
        MIN(quantity) as min_quantity,
        MAX(quantity) as max_quantity
      FROM inventory 
      WHERE DATE(createdAt) = ?
    `, [date]);

    const [lowStockItems] = await db.execute(`
      SELECT 
        inventoryid,
        quantity,
        createdAt
      FROM inventory 
      WHERE quantity < 1000 AND DATE(createdAt) = ?
      ORDER BY quantity ASC
    `, [date]);

    const [processingStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_batches,
        SUM(input_weight_kg) as total_input_weight,
        SUM(output_weight) as total_output_weight,
        AVG(efficiency) as avg_efficiency
      FROM production_batches 
      WHERE DATE(scheduled_date) = ? AND status = 'completed'
    `, [date]);

    res.json({
      success: true,
      date,
      inventoryStats: inventoryStats[0],
      lowStockItems,
      processingStats: processingStats[0]
    });
  } catch (error) {
    console.error("Get daily inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Monthly inventory report
export async function getMonthlyInventoryReport(req, res) {
  try {
    const { year, month } = req.params;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month parameters are required"
      });
    }

    const [monthlyInventoryStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        AVG(quantity) as avg_quantity,
        MIN(quantity) as min_quantity,
        MAX(quantity) as max_quantity,
        COUNT(CASE WHEN quantity < 1000 THEN 1 END) as low_stock_count
      FROM inventory 
      WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
    `, [year, month]);

    const [dailyInventoryTrend] = await db.execute(`
      SELECT 
        DATE(createdAt) as inventory_date,
        COUNT(*) as daily_items,
        SUM(quantity) as daily_quantity
      FROM inventory 
      WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
      GROUP BY DATE(createdAt)
      ORDER BY inventory_date
    `, [year, month]);

    const [productionStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_batches,
        SUM(input_weight_kg) as total_input_weight,
        SUM(output_weight) as total_output_weight,
        AVG(efficiency) as avg_efficiency,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_batches,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_batches
      FROM production_batches 
      WHERE YEAR(scheduled_date) = ? AND MONTH(scheduled_date) = ?
    `, [year, month]);

    res.json({
      success: true,
      period: { year: parseInt(year), month: parseInt(month) },
      monthlyInventoryStats: monthlyInventoryStats[0],
      dailyInventoryTrend,
      productionStats: productionStats[0]
    });
  } catch (error) {
    console.error("Get monthly inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Comprehensive dashboard report
export async function getDashboardReport(req, res) {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    let params = [];
    
    switch (period) {
      case '7d':
        dateCondition = 'AND delivery_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateCondition = 'AND delivery_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateCondition = 'AND delivery_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)';
        break;
      default:
        dateCondition = 'AND delivery_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    // Supplier statistics
    const [supplierStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT d.supplier_id) as active_suppliers,
        COUNT(d.id) as total_deliveries,
        SUM(d.quantity) as total_quantity,
        SUM(d.total_amount) as total_amount,
        AVG(d.rate_per_kg) as avg_rate
      FROM deliveries d
      WHERE 1=1 ${dateCondition}
    `);

    // Inventory statistics
    const [inventoryStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        COUNT(CASE WHEN quantity < 1000 THEN 1 END) as low_stock_items
      FROM inventory
    `);

    // Payment statistics
    const [paymentStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
      FROM payments
      WHERE 1=1 ${dateCondition}
    `);

    // Recent activities
    const [recentActivities] = await db.execute(`
      SELECT 
        'delivery' as type,
        d.delivery_date as date,
        CONCAT('Delivery from ', s.name, ' - ', d.quantity, 'kg') as description,
        d.total_amount as amount
      FROM deliveries d
      JOIN suppliers s ON d.supplier_id = s.id
      WHERE 1=1 ${dateCondition}
      ORDER BY d.delivery_date DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      period,
      supplierStats: supplierStats[0],
      inventoryStats: inventoryStats[0],
      paymentStats: paymentStats[0],
      recentActivities
    });
  } catch (error) {
    console.error("Get dashboard report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}
