const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// Configure Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Process payment based on payment method
 */
async function processPayment(paymentData) {
  try {
    const {
      userId,
      amount,
      currency = 'USD',
      paymentMethod,
      paymentDetails
    } = paymentData;

    let paymentResult;

    switch (paymentMethod.toLowerCase()) {
      case 'stripe':
        paymentResult = await processStripePayment(amount, currency, paymentDetails);
        break;
      case 'paypal':
        paymentResult = await processPayPalPayment(amount, currency, paymentDetails);
        break;
      case 'razorpay':
        paymentResult = await processRazorpayPayment(amount, currency, paymentDetails);
        break;
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    // Save payment record
    const paymentRecord = {
      id: paymentResult.paymentId,
      userId,
      amount,
      currency,
      paymentMethod,
      status: paymentResult.status,
      transactionId: paymentResult.transactionId,
      createdAt: new Date().toISOString()
    };

    // In production, save to database
    console.log('Payment record:', paymentRecord);

    return {
      success: true,
      paymentId: paymentResult.paymentId,
      transactionId: paymentResult.transactionId,
      status: paymentResult.status,
      amount,
      currency,
      paymentMethod
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Process Stripe payment
 */
async function processStripePayment(amount, currency, paymentDetails) {
  try {
    const { token, customerId } = paymentDetails;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method: token,
      confirmation_method: 'manual',
      confirm: true,
      customer: customerId,
      metadata: {
        source: 'ai-trip-planner'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      return {
        paymentId: paymentIntent.id,
        transactionId: paymentIntent.id,
        status: 'completed'
      };
    } else if (paymentIntent.status === 'requires_action') {
      return {
        paymentId: paymentIntent.id,
        transactionId: paymentIntent.id,
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret
      };
    } else {
      throw new Error(`Payment failed with status: ${paymentIntent.status}`);
    }

  } catch (error) {
    console.error('Stripe payment error:', error);
    throw new Error(`Stripe payment failed: ${error.message}`);
  }
}

/**
 * Process PayPal payment
 */
async function processPayPalPayment(amount, currency, paymentDetails) {
  try {
    const { returnUrl, cancelUrl } = paymentDetails;

    const createPayment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: returnUrl,
        cancel_url: cancelUrl
      },
      transactions: [{
        amount: {
          total: amount.toString(),
          currency: currency.toUpperCase()
        },
        description: 'AI Trip Planner Booking'
      }]
    };

    return new Promise((resolve, reject) => {
      paypal.payment.create(createPayment, (error, payment) => {
        if (error) {
          reject(new Error(`PayPal payment creation failed: ${error.message}`));
        } else {
          // Find approval URL
          const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
          
          resolve({
            paymentId: payment.id,
            transactionId: payment.id,
            status: 'pending',
            approvalUrl: approvalUrl.href
          });
        }
      });
    });

  } catch (error) {
    console.error('PayPal payment error:', error);
    throw new Error(`PayPal payment failed: ${error.message}`);
  }
}

/**
 * Process Razorpay payment
 */
async function processRazorpayPayment(amount, currency, paymentDetails) {
  try {
    const { orderId, paymentId, signature } = paymentDetails;

    // Verify payment signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid payment signature');
    }

    // Fetch payment details
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.status === 'captured') {
      return {
        paymentId: payment.id,
        transactionId: payment.id,
        status: 'completed'
      };
    } else {
      throw new Error(`Payment not captured. Status: ${payment.status}`);
    }

  } catch (error) {
    console.error('Razorpay payment error:', error);
    throw new Error(`Razorpay payment failed: ${error.message}`);
  }
}

/**
 * Create Razorpay order
 */
async function createRazorpayOrder(amount, currency = 'INR') {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt: `order_${uuidv4()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
}

/**
 * Create Stripe payment intent
 */
async function createStripePaymentIntent(amount, currency = 'USD') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        source: 'ai-trip-planner'
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };

  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw new Error(`Failed to create Stripe payment intent: ${error.message}`);
  }
}

/**
 * Refund payment
 */
async function refundPayment(paymentId, paymentMethod, amount = null, reason = 'requested_by_customer') {
  try {
    let refundResult;

    switch (paymentMethod.toLowerCase()) {
      case 'stripe':
        refundResult = await stripe.refunds.create({
          payment_intent: paymentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason: reason
        });
        break;
      case 'razorpay':
        refundResult = await razorpay.payments.refund(paymentId, {
          amount: amount ? Math.round(amount * 100) : undefined,
          notes: {
            reason: reason
          }
        });
        break;
      case 'paypal':
        // PayPal refund logic would go here
        refundResult = { id: `refund_${uuidv4()}`, status: 'completed' };
        break;
      default:
        throw new Error(`Unsupported payment method for refund: ${paymentMethod}`);
    }

    return {
      refundId: refundResult.id,
      status: refundResult.status,
      amount: refundResult.amount ? refundResult.amount / 100 : amount
    };

  } catch (error) {
    console.error('Refund error:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
}

/**
 * Get payment status
 */
async function getPaymentStatus(paymentId, paymentMethod) {
  try {
    let payment;

    switch (paymentMethod.toLowerCase()) {
      case 'stripe':
        payment = await stripe.paymentIntents.retrieve(paymentId);
        break;
      case 'razorpay':
        payment = await razorpay.payments.fetch(paymentId);
        break;
      case 'paypal':
        // PayPal payment status logic would go here
        payment = { id: paymentId, status: 'completed' };
        break;
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    return {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount ? payment.amount / 100 : null,
      currency: payment.currency
    };

  } catch (error) {
    console.error('Get payment status error:', error);
    throw new Error(`Failed to get payment status: ${error.message}`);
  }
}

/**
 * Webhook handlers
 */
async function handleStripeWebhook(payload, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };

  } catch (error) {
    console.error('Stripe webhook error:', error);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

async function handleRazorpayWebhook(payload) {
  try {
    const { event, contains } = payload;

    switch (event) {
      case 'payment.captured':
        await handlePaymentSuccess(payload.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailure(payload.payload.payment.entity);
        break;
      default:
        console.log(`Unhandled Razorpay event: ${event}`);
    }

    return { received: true };

  } catch (error) {
    console.error('Razorpay webhook error:', error);
    throw new Error(`Razorpay webhook processing failed: ${error.message}`);
  }
}

/**
 * Payment event handlers
 */
async function handlePaymentSuccess(payment) {
  console.log('Payment succeeded:', payment.id);
  // Update booking status, send confirmation emails, etc.
}

async function handlePaymentFailure(payment) {
  console.log('Payment failed:', payment.id);
  // Handle payment failure, notify user, etc.
}

module.exports = {
  processPayment,
  createRazorpayOrder,
  createStripePaymentIntent,
  refundPayment,
  getPaymentStatus,
  handleStripeWebhook,
  handleRazorpayWebhook
};
