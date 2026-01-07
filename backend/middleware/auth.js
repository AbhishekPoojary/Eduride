const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eduride_secret_key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

// Middleware to check if user is faculty
const isFaculty = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'faculty')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Faculty privileges required' });
  }
};

// Middleware to check if user is parent
const isParent = (req, res, next) => {
  if (req.user && req.user.role === 'parent') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Parent privileges required' });
  }
};

// Middleware to check if user is student
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Student privileges required' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  isFaculty,
  isParent,
  isStudent
};
