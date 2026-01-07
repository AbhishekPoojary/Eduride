const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Bus = require('../models/bus.model');
const notificationService = require('../services/notification.service');

// Get all notifications for the logged-in user
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('student', 'name')
      .populate('bus', 'busId name')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread notifications for the logged-in user
const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      read: false
    })
      .populate('student', 'name')
      .populate('bus', 'busId name')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user is the recipient of the notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }
    
    notification.read = true;
    await notification.save();
    
    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a new notification (admin only)
const sendNotification = async (req, res) => {
  try {
    const { recipientId, studentId, busId, type, message } = req.body;
    
    if (!recipientId || !type || !message) {
      return res.status(400).json({ message: 'Recipient ID, type, and message are required' });
    }
    
    const recipient = await User.findById(recipientId);
    
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    let student = null;
    if (studentId) {
      student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
    }
    
    let bus = null;
    if (busId) {
      bus = await Bus.findOne({ busId });
      if (!bus) {
        return res.status(404).json({ message: 'Bus not found' });
      }
    }
    
    // Create notification
    const notification = new Notification({
      recipient: recipient._id,
      student: student ? student._id : null,
      bus: bus ? bus._id : null,
      type,
      message,
      sentVia: [],
      status: 'pending'
    });
    
    await notification.save();
    
    // Send notification asynchronously
    notificationService.sendNotification(notification._id);
    
    return res.status(201).json({
      message: 'Notification created and queued for delivery',
      notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a broadcast notification to multiple users (admin only)
const broadcastNotification = async (req, res) => {
  try {
    const { recipientIds, recipientRole, type, message, busId } = req.body;
    
    if ((!recipientIds && !recipientRole) || !type || !message) {
      return res.status(400).json({ 
        message: 'Either recipient IDs or recipient role, along with type and message are required' 
      });
    }
    
    let userIds = [];
    
    if (recipientIds && Array.isArray(recipientIds)) {
      userIds = recipientIds;
    } else if (recipientRole) {
      const users = await User.find({ role: recipientRole }).select('_id');
      userIds = users.map(user => user._id);
    }
    
    if (userIds.length === 0) {
      return res.status(400).json({ message: 'No recipients found' });
    }
    
    try {
      const notifications = await notificationService.sendBroadcastNotification(
        userIds,
        type,
        message,
        busId
      );
      
      return res.status(201).json({
        message: `Broadcast notification sent to ${userIds.length} recipients`,
        count: notifications.length
      });
    } catch (error) {
      console.error('Error in broadcast notification:', error);
      return res.status(500).json({ message: 'Error sending broadcast', error: error.message });
    }
  } catch (error) {
    console.error('Error in broadcastNotification:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all notifications (admin only)
const getAllNotifications = async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find({})
      .populate('recipient', 'name email role')
      .populate('student', 'name')
      .populate('bus', 'busId name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments({});
    
    return res.status(200).json({
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting all notifications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all failed notifications (admin only)
const getFailedNotifications = async (req, res) => {
  try {
    const failedNotifications = await Notification.find({ status: 'failed' })
      .populate('recipient', 'name email role')
      .populate('student', 'name')
      .populate('bus', 'busId name')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(failedNotifications);
  } catch (error) {
    console.error('Error getting failed notifications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Retry failed notifications (admin only)
const retryFailedNotifications = async (req, res) => {
  try {
    const count = await notificationService.retryFailedNotifications();
    
    return res.status(200).json({
      message: `Retrying ${count} failed notifications`,
      count
    });
  } catch (error) {
    console.error('Error retrying failed notifications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update notification settings for the logged-in user
const updateNotificationSettings = async (req, res) => {
  try {
    const { sms, email } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.notificationPreferences = {
      sms: sms !== undefined ? sms : user.notificationPreferences.sms,
      email: email !== undefined ? email : user.notificationPreferences.email
    };
    
    await user.save();
    
    return res.status(200).json({
      message: 'Notification settings updated successfully',
      notificationPreferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  sendNotification,
  broadcastNotification,
  getAllNotifications,
  getFailedNotifications,
  retryFailedNotifications,
  updateNotificationSettings
};
