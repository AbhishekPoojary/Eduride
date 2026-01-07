const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  type: {
    type: String,
    enum: ['entry', 'exit', 'delay', 'emergency', 'announcement'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sentVia: [{
    type: String,
    enum: ['sms', 'email', 'push'],
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
