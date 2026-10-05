const express = require('express');
const PDFDocument = require('pdfkit');
const { verifyToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now();
};

// Create order
router.post('/', verifyToken, async (req, res) => {
  const { customer_id, items, payment_method, discount, currency_code } = req.body;

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');

    // Calculate totals
    let subtotal = 0;
    let tax = 0;

    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1', [
        item.product_id,
      ]);
      const product = productResult.rows[0];

      const itemSubtotal = product.price * item.quantity;
      const itemTax = itemSubtotal * (product.tax_rate / 100);

      subtotal += itemSubtotal;
      tax += itemTax;
    }

    const total = subtotal - (discount || 0) + tax;

    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, currency_code, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING *`,
      [orderNumber, customer_id, req.user.id, subtotal, discount || 0, tax, total, payment_method, currency_code]
    );

    const order = orderResult.rows[0];

    // Add order items and update stock
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, discount_percent)
         SELECT $1, $2, $3, price, $4 FROM products WHERE id = $2`,
        [order.id, item.product_id, item.quantity, item.discount_percent || 0]
      );

      // Update product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      // Log inventory change
      await client.query(
        `INSERT INTO inventory_logs (product_id, action, quantity_change, new_stock, reason, user_id)
         SELECT $1, 'sale', -$2, stock, 'Order Sale', $3 FROM products WHERE id = $1`,
        [item.product_id, item.quantity, req.user.id]
      );
    }

    // Update customer total spent
    if (customer_id) {
      await client.query(
        'UPDATE customers SET total_spent = total_spent + $1 WHERE id = $2',
        [total, customer_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        ...order,
        items: items,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// Get all orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await req.db.query(
      `SELECT o.*, c.name as customer_name FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       ORDER BY o.created_at DESC LIMIT 100`
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get order by ID with items
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const orderResult = await req.db.query(
      `SELECT o.*, c.name as customer_name FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [req.params.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const itemsResult = await req.db.query(
      `SELECT oi.*, p.name, p.sku FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    res.json({
      success: true,
      order: {
        ...orderResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Generate PDF Receipt
router.get('/:id/receipt', verifyToken, async (req, res) => {
  try {
    const orderResult = await req.db.query(
      `SELECT o.*, c.name as customer_name, c.phone FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [req.params.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await req.db.query(
      `SELECT oi.*, p.name, p.sku FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    const doc = new PDFDocument();
    const filename = `receipt_${order.order_number}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('UNIVERSAL POS SYSTEM', { align: 'center' });
    doc.fontSize(12).text('Receipt', { align: 'center' });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Order details
    doc.fontSize(10);
    doc.text(`Order #: ${order.order_number}`);
    doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`);
    if (order.customer_name) {
      doc.text(`Customer: ${order.customer_name}`);
    }
    doc.text(`Payment Method: ${order.payment_method}`);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Items
    doc.text('Item', 50, doc.y + 10);
    doc.text('Qty', 350, doc.y - 10);
    doc.text('Price', 450, doc.y - 10);

    itemsResult.rows.forEach((item) => {
      doc.text(item.name, 50, doc.y + 5);
      doc.text(item.quantity.toString(), 350, doc.y - 5);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 450, doc.y - 5);
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Totals
    doc.fontSize(10);
    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`Discount: -$${order.discount.toFixed(2)}`, { align: 'right' });
    doc.text(`Tax: $${order.tax.toFixed(2)}`, { align: 'right' });
    doc.fontSize(14).text(`Total: $${order.total.toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
