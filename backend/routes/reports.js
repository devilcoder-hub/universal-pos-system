const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Daily sales report
router.get('/sales/daily', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    const result = await req.db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as order_count, SUM(total) as total_sales, SUM(discount) as total_discount
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [start_date || '2024-01-01', end_date || new Date().toISOString()]
    );

    res.json({ success: true, report: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Product sales report
router.get('/products/sales', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const result = await req.db.query(
      `SELECT p.id, p.name, p.sku, SUM(oi.quantity) as total_quantity, SUM(oi.quantity * oi.price) as total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       GROUP BY p.id, p.name, p.sku
       ORDER BY total_revenue DESC
       LIMIT 50`
    );

    res.json({ success: true, report: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer analytics
router.get('/customers/analytics', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const result = await req.db.query(
      `SELECT c.id, c.name, c.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent, c.loyalty_points
       FROM customers c
       LEFT JOIN orders o ON c.id = o.customer_id
       GROUP BY c.id, c.name, c.email, c.loyalty_points
       ORDER BY total_spent DESC
       LIMIT 100`
    );

    res.json({ success: true, report: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Inventory report
router.get('/inventory', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const result = await req.db.query(
      `SELECT id, name, sku, stock, price, cost, (price - cost) * stock as potential_profit
       FROM products
       WHERE active = true
       ORDER BY stock ASC`
    );

    res.json({ success: true, report: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Low stock alert
router.get('/inventory/low-stock', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  const { threshold } = req.query;

  try {
    const result = await req.db.query(
      `SELECT id, name, sku, stock
       FROM products
       WHERE active = true AND stock <= $1
       ORDER BY stock ASC`,
      [threshold || 10]
    );

    res.json({ success: true, alert: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Revenue dashboard
router.get('/dashboard', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    // Total revenue
    const revenueResult = await req.db.query('SELECT SUM(total) as total FROM orders');
    const totalRevenue = revenueResult.rows[0].total || 0;

    // Total orders
    const ordersResult = await req.db.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = ordersResult.rows[0].count || 0;

    // Total products
    const productsResult = await req.db.query('SELECT COUNT(*) as count FROM products WHERE active = true');
    const totalProducts = productsResult.rows[0].count || 0;

    // Total customers
    const customersResult = await req.db.query('SELECT COUNT(*) as count FROM customers');
    const totalCustomers = customersResult.rows[0].count || 0;

    // Today's revenue
    const todayResult = await req.db.query(
      `SELECT SUM(total) as total FROM orders WHERE DATE(created_at) = CURRENT_DATE`
    );
    const todayRevenue = todayResult.rows[0].total || 0;

    res.json({
      success: true,
      dashboard: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_products: totalProducts,
        total_customers: totalCustomers,
        today_revenue: todayRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
