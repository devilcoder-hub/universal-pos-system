const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const API_URL = 'https://v6.exchangerate-api.com/v6';

// Get current exchange rates
router.get('/current', verifyToken, async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      success: false,
      message: 'Please provide from and to currency codes',
    });
  }

  try {
    const response = await axios.get(
      `${API_URL}/${API_KEY}/latest/${from.toUpperCase()}`
    );

    if (response.data.result === 'success') {
      const rate = response.data.conversion_rates[to.toUpperCase()];

      if (!rate) {
        return res.status(400).json({
          success: false,
          message: 'Currency not found',
        });
      }

      // Store in database
      await req.db.query(
        `INSERT INTO exchange_rates (from_currency, to_currency, rate)
         VALUES ($1, $2, $3)
         ON CONFLICT (from_currency, to_currency) DO UPDATE SET rate = $3, updated_at = CURRENT_TIMESTAMP`,
        [from.toUpperCase(), to.toUpperCase(), rate]
      );

      res.json({
        success: true,
        rate,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch exchange rates',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all stored exchange rates
router.get('/stored', verifyToken, async (req, res) => {
  try {
    const result = await req.db.query('SELECT * FROM exchange_rates ORDER BY updated_at DESC');
    res.json({ success: true, rates: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
