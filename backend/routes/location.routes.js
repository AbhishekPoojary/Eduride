const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const locationController = require('../controllers/location.controller');

// POST /api/location - Record new location from GPS device
router.post('/', locationController.recordLocation);

// GET /api/location/bus/:busId - Get latest location of a specific bus
router.get('/bus/:busId', authenticateToken, locationController.getBusLocation);

// GET /api/location/bus/:busId/history - Get location history of a specific bus
router.get('/bus/:busId/history', authenticateToken, locationController.getBusLocationHistory);

// GET /api/location/all - Get latest location of all buses (admin only)
router.get('/all', authenticateToken, isAdmin, locationController.getAllBusLocations);

module.exports = router;
