const User = require('../models/user.model');

// Simple in-memory event emitter for SSE
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

// SSE endpoint: GET /api/events/updates
// Query param: ?role=admin (optional, to filter by role)
exports.sseUpdates = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  const sendEvent = (type, data) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Send a ping every 30 seconds to keep connection alive
  const pingInterval = setInterval(() => {
    sendEvent('ping', {});
  }, 30000);

  // Listen for payment updates and forward to this client
  const onPaymentUpdate = (data) => {
    sendEvent('paymentUpdate', data);
  };
  eventEmitter.on('paymentUpdate', onPaymentUpdate);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(pingInterval);
    eventEmitter.off('paymentUpdate', onPaymentUpdate);
    res.end();
  });
};

// Helper: call this from webhook after updating paymentStatus
exports.emitPaymentUpdate = (userId, paymentStatus) => {
  eventEmitter.emit('paymentUpdate', { userId, paymentStatus });
};
module.exports = { sseUpdates: exports.sseUpdates, emitPaymentUpdate: exports.emitPaymentUpdate };
