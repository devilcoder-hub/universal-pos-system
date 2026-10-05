const express = require('express');
const bcrypt = require('bcrypt');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT id, username, email, role, active, created_at FROM users ORDER BY id DESC'
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user role (admin only)
router.put('/:id/role', verifyToken, checkRole(['admin']), async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'manager', 'cashier'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  try {
    const result = await req.db.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [role, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User role updated',
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Disable user (admin only)
router.put('/:id/disable', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const result = await req.db.query(
      'UPDATE users SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User disabled',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
