const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

// Public: return publishable key to frontend
router.get('/key', paymentController.getKey);

// Auth: create an order for the logged-in user
router.post('/create-order', authenticateToken, paymentController.createOrder);

// Razorpay webhook: must use raw body for signature verification
router.post('/webhook', express.raw({ type: '*/*' }), paymentController.webhook);

module.exports = router;
