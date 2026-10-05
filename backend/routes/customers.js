const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await req.db.query('SELECT * FROM customers ORDER BY id DESC');
    res.json({ success: true, customers: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get customer by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await req.db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create customer
router.post('/', verifyToken, async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    const result = await req.db.query(
      'INSERT INTO customers (name, phone, email, loyalty_points) VALUES ($1, $2, $3, 0) RETURNING *',
      [name, phone, email]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update customer
router.put('/:id', verifyToken, async (req, res) => {
  const { name, phone, email, loyalty_points } = req.body;

  try {
    const result = await req.db.query(
      `UPDATE customers SET name = $1, phone = $2, email = $3, loyalty_points = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [name, phone, email, loyalty_points, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
