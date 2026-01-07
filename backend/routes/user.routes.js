const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

// POST /api/users/register - Register a new user
router.post('/register', userController.registerUser);

// POST /api/users/login - User login
router.post('/login', userController.loginUser);

// GET /api/users/profile - Get user profile
router.get('/profile', authenticateToken, userController.getUserProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateToken, userController.updateUserProfile);

// Admin routes
// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

// GET /api/users/:userId - Get user by ID (admin only)
router.get('/:userId', authenticateToken, isAdmin, userController.getUserById);

// PUT /api/users/:userId - Update user by ID (admin only)
router.put('/:userId', authenticateToken, isAdmin, userController.updateUserById);

// DELETE /api/users/:userId - Delete user by ID (admin only)
router.delete('/:userId', authenticateToken, isAdmin, userController.deleteUserById);

// POST /api/users/student/assign-rfid - Assign RFID tag to student (admin only)
router.post('/student/assign-rfid', authenticateToken, isAdmin, userController.assignRfidToStudent);

// GET /api/users/students - Get all students (admin only)
router.get('/role/students', authenticateToken, isAdmin, userController.getAllStudents);

// GET /api/users/parents - Get all parents (admin only)
router.get('/role/parents', authenticateToken, isAdmin, userController.getAllParents);

// GET /api/users/faculty - Get all faculty (admin only)
router.get('/role/faculty', authenticateToken, isAdmin, userController.getAllFaculty);

// POST /api/users/parent/link-student - Link student to parent (admin only)
router.post('/parent/link-student', authenticateToken, isAdmin, userController.linkStudentToParent);

module.exports = router;
