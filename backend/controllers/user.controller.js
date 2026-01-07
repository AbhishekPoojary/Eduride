const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, rfidTag, assignedBus, parentId, parentName, paymentStatus } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Only admin can create admin accounts
    if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admin can create admin accounts' });
    }
    
    // Create new user
    const user = new User({
      name,
      email: normalizedEmail,
      password,
      phone,
      role: role || 'student',
      ...(rfidTag && { rfidTag }),
      ...(assignedBus && { 
        // Handle assignedBus - check if it's a valid ObjectId or mock data
        assignedBus: (assignedBus && assignedBus.match(/^[0-9a-fA-F]{24}$/)) ? assignedBus : null 
      }),
      ...(parentId && { parentId }),
      ...(parentName && { parentName }),
      paymentStatus: paymentStatus || 'pending'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'eduride_secret_key',
      { expiresIn: '24h' }
    );
    
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rfidTag: user.rfidTag,
        assignedBus: user.assignedBus,
        parentId: user.parentId,
        parentName: user.parentName,
        paymentStatus: user.paymentStatus,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    
    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'eduride_secret_key',
      { expiresIn: '7d' }
    );
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, notificationPreferences } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }
    
    await user.save();
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin routes
// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user by ID (admin only)
const updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, role, rfidTag, assignedBus, parentId, parentName, paymentStatus, notificationPreferences } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (rfidTag !== undefined) user.rfidTag = rfidTag;
    if (assignedBus !== undefined) {
      // Handle assignedBus - it could be null, a string ID, or undefined
      if (assignedBus === null || assignedBus === '') {
        user.assignedBus = null;
      } else if (typeof assignedBus === 'string') {
        // Check if it's a valid ObjectId format, if not, keep as string for now
        if (assignedBus.match(/^[0-9a-fA-F]{24}$/)) {
          user.assignedBus = assignedBus;
        } else {
          // For mock data that's not a real ObjectId, store as is or set to null
          user.assignedBus = null;
        }
      } else {
        user.assignedBus = assignedBus;
      }
    }
    if (parentId !== undefined) user.parentId = parentId;
    if (parentName !== undefined) user.parentName = parentName;
    if (paymentStatus !== undefined) user.paymentStatus = paymentStatus;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }
    
    await user.save();
    
    return res.status(200).json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rfidTag: user.rfidTag,
        assignedBus: user.assignedBus,
        parentId: user.parentId,
        parentName: user.parentName,
        paymentStatus: user.paymentStatus,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user by ID (admin only)
const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.findByIdAndDelete(userId);
    
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user by ID:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign RFID tag to student (admin only)
const assignRfidToStudent = async (req, res) => {
  try {
    const { studentId, rfidTag } = req.body;
    
    if (!studentId || !rfidTag) {
      return res.status(400).json({ message: 'Student ID and RFID tag are required' });
    }
    
    // Check if RFID tag is already assigned to another student
    const existingUser = await User.findOne({ rfidTag });
    if (existingUser && existingUser._id.toString() !== studentId) {
      return res.status(400).json({ message: 'RFID tag is already assigned to another user' });
    }
    
    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }
    
    student.rfidTag = rfidTag;
    await student.save();
    
    return res.status(200).json({
      message: 'RFID tag assigned successfully',
      student: {
        id: student._id,
        name: student.name,
        rfidTag: student.rfidTag
      }
    });
  } catch (error) {
    console.error('Error assigning RFID tag to student:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all students (admin only)
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    return res.status(200).json(students);
  } catch (error) {
    console.error('Error getting all students:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all parents (admin only)
const getAllParents = async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' }).select('-password');
    return res.status(200).json(parents);
  } catch (error) {
    console.error('Error getting all parents:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all faculty (admin only)
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).select('-password');
    return res.status(200).json(faculty);
  } catch (error) {
    console.error('Error getting all faculty:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Link student to parent (admin only)
const linkStudentToParent = async (req, res) => {
  try {
    const { studentId, parentId } = req.body;
    
    if (!studentId || !parentId) {
      return res.status(400).json({ message: 'Student ID and Parent ID are required' });
    }
    
    const student = await User.findById(studentId);
    const parent = await User.findById(parentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }
    
    if (parent.role !== 'parent') {
      return res.status(400).json({ message: 'User is not a parent' });
    }
    
    student.parentId = parentId;
    await student.save();
    
    return res.status(200).json({
      message: 'Student linked to parent successfully',
      student: {
        id: student._id,
        name: student.name,
        parentId: student.parentId
      }
    });
  } catch (error) {
    console.error('Error linking student to parent:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  assignRfidToStudent,
  getAllStudents,
  getAllParents,
  getAllFaculty,
  linkStudentToParent
};
