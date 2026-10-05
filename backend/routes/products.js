const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all products
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await req.db.query('SELECT * FROM products WHERE active = true ORDER BY id DESC');
    res.json({ success: true, products: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get product by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await req.db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Search products by barcode or SKU
router.get('/search/barcode', verifyToken, async (req, res) => {
  const { barcode } = req.query;
  try {
    const result = await req.db.query(
      'SELECT * FROM products WHERE barcode = $1 OR sku = $1',
      [barcode]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create product
router.post(
  '/',
  verifyToken,
  checkRole(['manager', 'admin']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('price').isDecimal().withMessage('Price must be decimal'),
    body('cost').isDecimal().withMessage('Cost must be decimal'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, sku, category, description, price, cost, stock, tax_rate, barcode } = req.body;

    try {
      const result = await req.db.query(
        `INSERT INTO products (name, sku, category, description, price, cost, stock, tax_rate, barcode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [name, sku, category, description, price, cost, stock || 0, tax_rate || 0, barcode]
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Update product
router.put(
  '/:id',
  verifyToken,
  checkRole(['manager', 'admin']),
  async (req, res) => {
    const { name, sku, price, cost, stock, tax_rate } = req.body;

    try {
      const result = await req.db.query(
        `UPDATE products SET name = $1, sku = $2, price = $3, cost = $4, stock = $5, tax_rate = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 RETURNING *`,
        [name, sku, price, cost, stock, tax_rate, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Delete product
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const result = await req.db.query(
      'UPDATE products SET active = false WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
