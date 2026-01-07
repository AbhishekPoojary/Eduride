const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Initialize Twilio client if credentials are available
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Initialize email transporter if credentials are available
let emailTransporter;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Send notification based on notification ID
const sendNotification = async (notificationId) => {
  try {
    const notification = await Notification.findById(notificationId)
      .populate('recipient')
      .populate('student')
      .populate('bus');
    
    if (!notification) {
      console.error(`Notification with ID ${notificationId} not found`);
      return;
    }
    
    if (notification.status === 'sent') {
      console.log(`Notification ${notificationId} already sent`);
      return;
    }
    
    const recipient = notification.recipient;
    const sentVia = [];
    
    // Send SMS if enabled for recipient
    if (recipient.notificationPreferences.sms && recipient.phone && twilioClient) {
      try {
        await sendSMS(recipient.phone, notification.message);
        sentVia.push('sms');
      } catch (error) {
        console.error('Error sending SMS:', error);
      }
    }
    
    // Send email if enabled for recipient
    if (recipient.notificationPreferences.email && recipient.email && emailTransporter) {
      try {
        await sendEmail(recipient.email, notification.type, notification.message);
        sentVia.push('email');
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
    
    // Update notification status
    if (sentVia.length > 0) {
      notification.sentVia = sentVia;
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
      console.log(`Notification ${notificationId} sent via ${sentVia.join(', ')}`);
    } else {
      notification.status = 'failed';
      await notification.save();
      console.error(`Failed to send notification ${notificationId}`);
    }
  } catch (error) {
    console.error('Error in sendNotification:', error);
  }
};

// Send SMS using Twilio
const sendSMS = async (phoneNumber, message) => {
  if (!twilioClient) {
    throw new Error('Twilio client not initialized');
  }
  
  return twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
};

// Send email using Nodemailer
const sendEmail = async (email, subject, message) => {
  if (!emailTransporter) {
    throw new Error('Email transporter not initialized');
  }
  
  const subjectPrefix = 'EduRide Notification: ';
  let emailSubject;
  
  switch (subject) {
    case 'entry':
      emailSubject = `${subjectPrefix}Bus Entry`;
      break;
    case 'exit':
      emailSubject = `${subjectPrefix}Bus Exit`;
      break;
    case 'delay':
      emailSubject = `${subjectPrefix}Bus Delay`;
      break;
    case 'emergency':
      emailSubject = `${subjectPrefix}EMERGENCY ALERT`;
      break;
    default:
      emailSubject = `${subjectPrefix}Notification`;
  }
  
  return emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@eduride.com',
    to: email,
    subject: emailSubject,
    text: message,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #4a6da7;">EduRide Notification</h2>
      <p style="font-size: 16px;">${message}</p>
      <hr style="border: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">This is an automated message from the EduRide College Bus Tracking System. Please do not reply to this email.</p>
    </div>`
  });
};

// Send broadcast notification to multiple users
const sendBroadcastNotification = async (userIds, type, message, busId = null) => {
  try {
    const users = await User.find({ _id: { $in: userIds } });
    const bus = busId ? await Bus.findOne({ busId }) : null;
    
    const notifications = [];
    
    for (const user of users) {
      const notification = new Notification({
        recipient: user._id,
        student: null,
        bus: bus ? bus._id : null,
        type,
        message,
        sentVia: [],
        status: 'pending'
      });
      
      await notification.save();
      notifications.push(notification);
      
      // Send notification asynchronously
      sendNotification(notification._id);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error in sendBroadcastNotification:', error);
    throw error;
  }
};

// Retry failed notifications
const retryFailedNotifications = async () => {
  try {
    const failedNotifications = await Notification.find({ status: 'failed' });
    
    console.log(`Retrying ${failedNotifications.length} failed notifications`);
    
    for (const notification of failedNotifications) {
      sendNotification(notification._id);
    }
    
    return failedNotifications.length;
  } catch (error) {
    console.error('Error in retryFailedNotifications:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  sendSMS,
  sendEmail,
  sendBroadcastNotification,
  retryFailedNotifications
};
