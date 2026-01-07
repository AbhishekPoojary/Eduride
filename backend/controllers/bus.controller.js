const Bus = require('../models/bus.model');
const User = require('../models/user.model');

// Create a new bus (admin only)
const createBus = async (req, res) => {
  try {
    const { busId, name, capacity, driver, route, deviceId } = req.body;
    
    // Check if bus already exists
    const existingBus = await Bus.findOne({ busId });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus already exists with this ID' });
    }
    
    // Create new bus
    const bus = new Bus({
      busId,
      name,
      capacity,
      driver,
      route,
      deviceId,
      status: 'active'
    });
    
    await bus.save();
    
    return res.status(201).json({
      message: 'Bus created successfully',
      bus
    });
  } catch (error) {
    console.error('Error creating bus:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all buses
const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find({});
    return res.status(200).json(buses);
  } catch (error) {
    console.error('Error getting all buses:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get bus by ID
const getBusById = async (req, res) => {
  try {
    const { busId } = req.params;
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    return res.status(200).json(bus);
  } catch (error) {
    console.error('Error getting bus by ID:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update bus by ID (admin only)
const updateBusById = async (req, res) => {
  try {
    const { busId } = req.params;
    const { name, capacity, driver, deviceId, status } = req.body;
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    // Update bus fields
    if (name) bus.name = name;
    if (capacity) bus.capacity = capacity;
    if (driver) bus.driver = { ...bus.driver, ...driver };
    if (deviceId) bus.deviceId = deviceId;
    if (status) bus.status = status;
    
    await bus.save();
    
    return res.status(200).json({
      message: 'Bus updated successfully',
      bus
    });
  } catch (error) {
    console.error('Error updating bus by ID:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete bus by ID (admin only)
const deleteBusById = async (req, res) => {
  try {
    const { busId } = req.params;
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    // Check if there are students assigned to this bus
    const assignedStudents = await User.countDocuments({ assignedBus: bus._id });
    
    if (assignedStudents > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete bus with assigned students. Please reassign students first.',
        assignedStudents
      });
    }
    
    await Bus.findByIdAndDelete(bus._id);
    
    return res.status(200).json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus by ID:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all students assigned to a bus
const getBusStudents = async (req, res) => {
  try {
    const { busId } = req.params;
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    const students = await User.find({ 
      assignedBus: bus._id,
      role: 'student'
    }).select('-password');
    
    return res.status(200).json(students);
  } catch (error) {
    console.error('Error getting bus students:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign student to bus (admin only)
const assignStudentToBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }
    
    // Count current students assigned to this bus
    const currentStudents = await User.countDocuments({ 
      assignedBus: bus._id,
      role: 'student'
    });
    
    if (currentStudents >= bus.capacity) {
      return res.status(400).json({ 
        message: 'Bus is at full capacity',
        capacity: bus.capacity,
        currentStudents
      });
    }
    
    student.assignedBus = bus._id;
    await student.save();
    
    return res.status(200).json({
      message: 'Student assigned to bus successfully',
      student: {
        id: student._id,
        name: student.name
      },
      bus: {
        id: bus._id,
        busId: bus.busId,
        name: bus.name
      }
    });
  } catch (error) {
    console.error('Error assigning student to bus:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove student from bus (admin only)
const removeStudentFromBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (student.assignedBus && student.assignedBus.toString() !== bus._id.toString()) {
      return res.status(400).json({ message: 'Student is not assigned to this bus' });
    }
    
    student.assignedBus = null;
    await student.save();
    
    return res.status(200).json({
      message: 'Student removed from bus successfully',
      student: {
        id: student._id,
        name: student.name
      }
    });
  } catch (error) {
    console.error('Error removing student from bus:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update bus route (admin only)
const updateBusRoute = async (req, res) => {
  try {
    const { busId } = req.params;
    const { route } = req.body;
    
    if (!route || !route.name || !route.stops || !Array.isArray(route.stops)) {
      return res.status(400).json({ message: 'Valid route with name and stops array is required' });
    }
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    bus.route = route;
    await bus.save();
    
    return res.status(200).json({
      message: 'Bus route updated successfully',
      bus
    });
  } catch (error) {
    console.error('Error updating bus route:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update bus status (admin only)
const updateBusStatus = async (req, res) => {
  try {
    const { busId } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'maintenance', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (active, maintenance, or inactive)' });
    }
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    bus.status = status;
    await bus.save();
    
    return res.status(200).json({
      message: 'Bus status updated successfully',
      bus: {
        id: bus._id,
        busId: bus.busId,
        name: bus.name,
        status: bus.status
      }
    });
  } catch (error) {
    console.error('Error updating bus status:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBus,
  getAllBuses,
  getBusById,
  updateBusById,
  deleteBusById,
  getBusStudents,
  assignStudentToBus,
  removeStudentFromBus,
  updateBusRoute,
  updateBusStatus
};
