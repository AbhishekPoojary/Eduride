const express = require('express');
const router = express.Router();
const { sseUpdates } = require('../controllers/event.controller');

// SSE endpoint for real-time updates
router.get('/updates', sseUpdates);

module.exports = router;
