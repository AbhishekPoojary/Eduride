const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const rfidController = require('../controllers/rfid.controller');

// POST /api/rfid - Record new RFID scan from Arduino device
router.post('/', rfidController.recordRfidScan);

// GET /api/rfid/student/:studentId - Get attendance records for a specific student
router.get('/student/:studentId', authenticateToken, rfidController.getStudentAttendance);

// GET /api/rfid/bus/:busId - Get attendance records for a specific bus
router.get('/bus/:busId', authenticateToken, rfidController.getBusAttendance);

// GET /api/rfid/today - Get today's attendance records (admin only)
router.get('/today', authenticateToken, isAdmin, rfidController.getTodayAttendance);

// GET /api/rfid/report - Get attendance report for a date range (admin only)
router.get('/report', authenticateToken, isAdmin, rfidController.getAttendanceReport);

module.exports = router;
