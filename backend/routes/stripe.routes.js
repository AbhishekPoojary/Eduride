const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const stripeController = require('../controllers/stripe.controller');

// Create Checkout Session (auth)
router.post('/create-checkout-session', authenticateToken, stripeController.createCheckoutSession);

// Webhook is registered at server level with raw body (see server.js)

module.exports = router;
