const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/user.model');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// GET /api/payments/key
const getKey = (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({ message: 'Razorpay not configured' });
  }
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// POST /api/payments/create-order (auth required)
// body: { amountInINR?: number }
const createOrder = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    const instance = getRazorpayInstance();

    const amountInINR = Number(req.body?.amountInINR) || Number(process.env.BUS_FEE_INR || 1000);
    const amountInPaise = Math.round(amountInINR * 100);

    const order = await instance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: user._id.toString(),
      notes: {
        userId: user._id.toString(),
        email: user.email,
      },
    });

    res.status(201).json({ order });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// POST /api/payments/webhook (RAW body)
const webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    const body = req.body; // raw buffer
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const payload = JSON.parse(body.toString('utf8'));
    // Accept a few success events
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid' || event === 'payment.authorized') {
      // Try to extract userId from notes or receipt
      let userId = payload?.payload?.payment?.entity?.notes?.userId
        || payload?.payload?.order?.entity?.receipt
        || null;

      if (userId) {
        await User.findByIdAndUpdate(userId, { paymentStatus: 'paid' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getKey, createOrder, webhook };
