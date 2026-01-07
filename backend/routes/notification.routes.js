const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

// GET /api/notifications - Get all notifications for the logged-in user
router.get('/', authenticateToken, notificationController.getUserNotifications);

// GET /api/notifications/unread - Get unread notifications for the logged-in user
router.get('/unread', authenticateToken, notificationController.getUnreadNotifications);

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', authenticateToken, notificationController.markNotificationAsRead);

// Admin routes
// POST /api/notifications/send - Send a new notification (admin only)
router.post('/send', authenticateToken, isAdmin, notificationController.sendNotification);

// POST /api/notifications/broadcast - Send a broadcast notification to multiple users (admin only)
router.post('/broadcast', authenticateToken, isAdmin, notificationController.broadcastNotification);

// GET /api/notifications/all - Get all notifications (admin only)
router.get('/all', authenticateToken, isAdmin, notificationController.getAllNotifications);

// GET /api/notifications/failed - Get all failed notifications (admin only)
router.get('/failed', authenticateToken, isAdmin, notificationController.getFailedNotifications);

// POST /api/notifications/retry - Retry failed notifications (admin only)
router.post('/retry', authenticateToken, isAdmin, notificationController.retryFailedNotifications);

// PUT /api/notifications/settings - Update notification settings for the logged-in user
router.put('/settings', authenticateToken, notificationController.updateNotificationSettings);

module.exports = router;
