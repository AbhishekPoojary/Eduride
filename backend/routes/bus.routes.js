const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const busController = require('../controllers/bus.controller');

// Admin routes
// POST /api/buses - Create a new bus (admin only)
router.post('/', authenticateToken, isAdmin, busController.createBus);

// GET /api/buses - Get all buses
router.get('/', authenticateToken, busController.getAllBuses);

// GET /api/buses/:busId - Get bus by ID
router.get('/:busId', authenticateToken, busController.getBusById);

// PUT /api/buses/:busId - Update bus by ID (admin only)
router.put('/:busId', authenticateToken, isAdmin, busController.updateBusById);

// DELETE /api/buses/:busId - Delete bus by ID (admin only)
router.delete('/:busId', authenticateToken, isAdmin, busController.deleteBusById);

// GET /api/buses/:busId/students - Get all students assigned to a bus
router.get('/:busId/students', authenticateToken, busController.getBusStudents);

// POST /api/buses/:busId/assign-student - Assign student to bus (admin only)
router.post('/:busId/assign-student', authenticateToken, isAdmin, busController.assignStudentToBus);

// POST /api/buses/:busId/remove-student - Remove student from bus (admin only)
router.post('/:busId/remove-student', authenticateToken, isAdmin, busController.removeStudentFromBus);

// PUT /api/buses/:busId/update-route - Update bus route (admin only)
router.put('/:busId/update-route', authenticateToken, isAdmin, busController.updateBusRoute);

// PUT /api/buses/:busId/update-status - Update bus status (admin only)
router.put('/:busId/update-status', authenticateToken, isAdmin, busController.updateBusStatus);

module.exports = router;
