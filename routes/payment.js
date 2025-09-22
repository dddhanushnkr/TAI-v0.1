const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { processPayment, createRazorpayOrder, createStripePaymentIntent, refundPayment, getPaymentStatus } = require('../services/paymentService');

// Process payment
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      currency = 'USD',
      paymentMethod,
      paymentDetails
    } = req.body;

    if (!amount || !paymentMethod || !paymentDetails) {
      return res.status(400).json({
        error: 'Missing required fields: amount, paymentMethod, paymentDetails'
      });
    }

    const paymentResult = await processPayment({
      userId: req.user.id,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentDetails
    });

    if (paymentResult.success) {
      res.json({
        success: true,
        payment: paymentResult,
        message: 'Payment processed successfully'
      });
    } else {
      res.status(400).json({
        error: 'Payment failed',
        message: paymentResult.message
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: error.message
    });
  }
});

// Create Razorpay order
router.post('/razorpay/order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
      return res.status(400).json({
        error: 'Amount is required'
      });
    }

    const order = await createRazorpayOrder(parseFloat(amount), currency);

    res.json({
      success: true,
      order,
      message: 'Razorpay order created successfully'
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      error: 'Failed to create Razorpay order',
      message: error.message
    });
  }
});

// Create Stripe payment intent
router.post('/stripe/intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.body;

    if (!amount) {
      return res.status(400).json({
        error: 'Amount is required'
      });
    }

    const paymentIntent = await createStripePaymentIntent(parseFloat(amount), currency);

    res.json({
      success: true,
      paymentIntent,
      message: 'Stripe payment intent created successfully'
    });

  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    res.status(500).json({
      error: 'Failed to create Stripe payment intent',
      message: error.message
    });
  }
});

// Process refund
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const {
      paymentId,
      paymentMethod,
      amount,
      reason = 'requested_by_customer'
    } = req.body;

    if (!paymentId || !paymentMethod) {
      return res.status(400).json({
        error: 'Missing required fields: paymentId, paymentMethod'
      });
    }

    const refundResult = await refundPayment(paymentId, paymentMethod, amount, reason);

    res.json({
      success: true,
      refund: refundResult,
      message: 'Refund processed successfully'
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      error: 'Refund processing failed',
      message: error.message
    });
  }
});

// Get payment status
router.get('/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod } = req.query;

    if (!paymentMethod) {
      return res.status(400).json({
        error: 'Payment method is required'
      });
    }

    const paymentStatus = await getPaymentStatus(paymentId, paymentMethod);

    res.json({
      success: true,
      payment: paymentStatus
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      error: 'Failed to get payment status',
      message: error.message
    });
  }
});

// Stripe webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const { handleStripeWebhook } = require('../services/paymentService');
    
    const result = await handleStripeWebhook(req.body, signature);
    
    res.json(result);
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

// Razorpay webhook
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const { handleRazorpayWebhook } = require('../services/paymentService');
    
    const result = await handleRazorpayWebhook(req.body);
    
    res.json(result);
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(400).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

module.exports = router;

