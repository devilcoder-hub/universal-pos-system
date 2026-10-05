const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-intent', verifyToken, async (req, res) => {
  const { amount, currency, order_id } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: { order_id },
    });

    // Save payment in database
    await req.db.query(
      `INSERT INTO payments (order_id, amount, payment_method, stripe_payment_id, status)
       VALUES ($1, $2, 'stripe', $3, 'pending')`,
      [order_id, amount, paymentIntent.id]
    );

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Confirm payment
router.post('/confirm', verifyToken, async (req, res) => {
  const { payment_intent_id, order_id } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      await req.db.query(
        `UPDATE orders SET payment_status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [order_id]
      );

      // Update payment status
      await req.db.query(
        `UPDATE payments SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_id = $1`,
        [payment_intent_id]
      );

      res.json({
        success: true,
        message: 'Payment successful',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get payment methods for an order
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
      [req.params.orderId]
    );
    res.json({ success: true, payments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Refund payment
router.post('/refund', verifyToken, async (req, res) => {
  const { payment_id } = req.body;

  try {
    const paymentResult = await req.db.query('SELECT * FROM payments WHERE id = $1', [payment_id]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    if (payment.stripe_payment_id) {
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_id,
      });

      await req.db.query(
        'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['refunded', payment_id]
      );

      res.json({
        success: true,
        message: 'Refund processed successfully',
        refund,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund not available for this payment method',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
