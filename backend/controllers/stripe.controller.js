const stripeSdk = require('stripe');
const User = require('../models/user.model');
const { emitPaymentUpdate } = require('./event.controller');

const stripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
  return stripeSdk(process.env.STRIPE_SECRET_KEY);
};

// POST /api/stripe/create-checkout-session (auth)
// body: { amountInINR?: number }
exports.createCheckoutSession = async (req, res) => {
  try {
    const user = req.user;
    const amountInINR = Number(req.body?.amountInINR) || Number(process.env.BUS_FEE_INR || 1000);
    const amountInPaise = Math.round(amountInINR * 100);

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'], // add 'upi' when your Stripe account supports it
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: 'EduRide Bus Fee' },
            unit_amount: amountInPaise,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/payment?status=success`,
      cancel_url: `${baseUrl}/payment?status=cancel`,
      metadata: {
        userId: user._id.toString(),
        email: user.email,
      },
    });

    res.status(201).json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ message: 'Failed to create Stripe session', error: err.message });
  }
};

// POST /api/stripe/webhook (raw body)
exports.webhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) return res.status(500).json({ message: 'Missing STRIPE_WEBHOOK_SECRET' });

    const stripeInstance = stripe();
    let event;

    try {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Stripe webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout.session.completed or payment_intent.succeeded
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId) {
        // Update student payment status
        await User.findByIdAndUpdate(userId, { paymentStatus: 'paid' });
        
        // Find the student to get their parentId
        const student = await User.findById(userId);
        if (student && student.parentId) {
          // Update parent payment status
          await User.findByIdAndUpdate(student.parentId, { paymentStatus: 'paid' });
          // Emit real-time update for parent as well
          emitPaymentUpdate(student.parentId, 'paid');
        }
        
        // Emit real-time update for student
        emitPaymentUpdate(userId, 'paid');
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const userId = pi.metadata?.userId;
      if (userId) {
        // Update student payment status
        await User.findByIdAndUpdate(userId, { paymentStatus: 'paid' });
        
        // Find the student to get their parentId
        const student = await User.findById(userId);
        if (student && student.parentId) {
          // Update parent payment status
          await User.findByIdAndUpdate(student.parentId, { paymentStatus: 'paid' });
          // Emit real-time update for parent as well
          emitPaymentUpdate(student.parentId, 'paid');
        }
        
        // Emit real-time update for student
        emitPaymentUpdate(userId, 'paid');
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
