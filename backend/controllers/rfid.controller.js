const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');
const Bus = require('../models/bus.model');
const Notification = require('../models/notification.model');
const notificationService = require('../services/notification.service');

const queueParentNotification = async (student, bus, type, message) => {
  if (!student.parentId) {
    return false;
  }

  const parent = await User.findById(student.parentId);
  if (
    !parent ||
    !parent.notificationPreferences ||
    (!parent.notificationPreferences.email && !parent.notificationPreferences.sms)
  ) {
    return false;
  }

  const notification = new Notification({
    recipient: parent._id,
    student: student._id,
    bus: bus ? bus._id : null,
    type,
    message,
    sentVia: [],
    status: 'pending'
  });

  await notification.save();
  notificationService.sendNotification(notification._id);
  return true;
};

// Record new RFID scan from Arduino device
const recordRfidScan = async (req, res) => {
  try {
    const { uid, busId, timestamp } = req.body;
    
    if (!uid || !busId) {
      return res.status(400).json({ message: 'Missing required fields: uid, busId' });
    }
    
    // Find the student by RFID tag
    const student = await User.findOne({ rfidTag: uid, role: 'student' });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found with this RFID tag' });
    }
    
    // Find the bus by busId
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    // Check if student is assigned to this bus
    if (student.assignedBus && student.assignedBus.toString() !== bus._id.toString()) {
      return res.status(400).json({ message: 'Student is not assigned to this bus' });
    }
    
    // Enforce payment: only 'paid' can enter
    const isFeeCleared = ['paid', 'exempt'].includes(student.paymentStatus);
    
    if (!isFeeCleared) {
      const timestampToStore = timestamp ? new Date(timestamp) : new Date();
      student.lastScan = {
        time: timestampToStore,
        busId,
        result: 'denied',
        doorAction: 'locked',
        message: 'Access denied: bus fee pending.'
      };
      await student.save();
      
      const parentNotified = await queueParentNotification(
        student,
        bus,
        'fee_pending',
        `Bus fee pending for ${student.name}. Access denied at Bus #${bus.busId}.`
      );
      
      return res.status(402).json({
        message: 'Bus fee pending. Access denied until payment is completed.',
        allowEntry: false,
        doorAction: 'locked',
        student: {
          id: student._id,
          name: student.name,
          paymentStatus: student.paymentStatus
        },
        parentNotified
      });
    }
    
    // Check if there's an existing entry for today without exit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      student: student._id,
      bus: bus._id,
      date: { $gte: today },
      status: 'entry'
    });
    
    let attendance;
    let notificationType;
    
    if (existingAttendance) {
      // This is an exit scan
      existingAttendance.exitTime = timestamp || new Date();
      existingAttendance.exitLocation = {
        type: 'Point',
        coordinates: bus.currentLocation.coordinates
      };
      existingAttendance.status = 'complete';
      
      attendance = await existingAttendance.save();
      notificationType = 'exit';
    } else {
      // This is an entry scan
      attendance = new Attendance({
        student: student._id,
        bus: bus._id,
        busId,
        rfidTag: uid,
        entryTime: timestamp || new Date(),
        entryLocation: {
          type: 'Point',
          coordinates: bus.currentLocation.coordinates
        },
        status: 'entry',
        date: new Date()
      });
      
      await attendance.save();
      notificationType = 'entry';
    }
    
    // Send notification to parent if student has a parent linked
    const action = notificationType === 'entry' ? 'boarded' : 'exited';
    const referenceTime = notificationType === 'entry' ? attendance.entryTime : attendance.exitTime;
    
    await queueParentNotification(
      student,
      bus,
      notificationType,
      `Your child, ${student.name}, ${action} Bus #${bus.busId} at ${referenceTime.toLocaleTimeString()}`
    );
    
    student.lastScan = {
      time: referenceTime,
      busId,
      result: notificationType,
      doorAction: 'open',
      message: notificationType === 'entry'
        ? 'Gate opened - student boarded successfully.'
        : 'Gate opened - student exit recorded.'
    };
    await student.save();
    
    return res.status(201).json({
      message: 'RFID scan recorded successfully',
      allowEntry: true,
      doorAction: 'open',
      attendance,
      student: {
        id: student._id,
        name: student.name,
        lastScan: student.lastScan
      }
    });
  } catch (error) {
    console.error('Error recording RFID scan:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance records for a specific student
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Check if user is authorized to view this student's attendance
    if (req.user.role !== 'admin' && req.user.role !== 'faculty' && 
        req.user._id.toString() !== studentId && 
        (!req.user.parentId || req.user.parentId.toString() !== studentId)) {
      return res.status(403).json({ message: 'Not authorized to view this student\'s attendance' });
    }
    
    const query = { student: studentId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate('bus', 'busId name')
      .sort({ date: -1 });
    
    return res.status(200).json(attendance);
  } catch (error) {
    console.error('Error getting student attendance:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance records for a specific bus
const getBusAttendance = async (req, res) => {
  try {
    const { busId } = req.params;
    const { date } = req.query;
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    const query = { bus: bus._id };
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: targetDate,
        $lt: nextDay
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate('student', 'name rfidTag')
      .sort({ entryTime: -1 });
    
    return res.status(200).json(attendance);
  } catch (error) {
    console.error('Error getting bus attendance:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get today's attendance records (admin only)
const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('student', 'name rfidTag')
      .populate('bus', 'busId name')
      .sort({ entryTime: -1 });
    
    return res.status(200).json(attendance);
  } catch (error) {
    console.error('Error getting today\'s attendance:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance report for a date range (admin only)
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, busId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (busId) {
      const bus = await Bus.findOne({ busId });
      if (bus) {
        query.bus = bus._id;
      }
    }
    
    const attendance = await Attendance.find(query)
      .populate('student', 'name rfidTag')
      .populate('bus', 'busId name')
      .sort({ date: -1, entryTime: -1 });
    
    return res.status(200).json(attendance);
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  recordRfidScan,
  getStudentAttendance,
  getBusAttendance,
  getTodayAttendance,
  getAttendanceReport
};
