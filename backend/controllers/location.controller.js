const LocationLog = require('../models/location.model');
const Bus = require('../models/bus.model');

// Record new location from GPS device
const recordLocation = async (req, res) => {
  try {
    const { busId, lat, lng, timestamp } = req.body;
    
    if (!busId || !lat || !lng) {
      return res.status(400).json({ message: 'Missing required fields: busId, lat, lng' });
    }
    
    // Find the bus by busId
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    // Create new location log
    const locationLog = new LocationLog({
      bus: bus._id,
      busId,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      timestamp: timestamp || new Date()
    });
    
    await locationLog.save();
    
    // Update bus current location
    bus.currentLocation = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
      lastUpdated: timestamp || new Date()
    };
    
    await bus.save();
    
    return res.status(201).json({ message: 'Location recorded successfully', locationLog });
  } catch (error) {
    console.error('Error recording location:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get latest location of a specific bus
const getBusLocation = async (req, res) => {
  try {
    const { busId } = req.params;
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    return res.status(200).json({
      busId: bus.busId,
      name: bus.name,
      currentLocation: bus.currentLocation,
      lastUpdated: bus.currentLocation.lastUpdated
    });
  } catch (error) {
    console.error('Error getting bus location:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get location history of a specific bus
const getBusLocationHistory = async (req, res) => {
  try {
    const { busId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;
    
    const bus = await Bus.findOne({ busId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    const query = { busId };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const locationLogs = await LocationLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    return res.status(200).json({
      busId,
      locationHistory: locationLogs
    });
  } catch (error) {
    console.error('Error getting bus location history:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get latest location of all buses (admin only)
const getAllBusLocations = async (req, res) => {
  try {
    const buses = await Bus.find({});
    
    const busLocations = buses.map(bus => ({
      busId: bus.busId,
      name: bus.name,
      currentLocation: bus.currentLocation,
      lastUpdated: bus.currentLocation.lastUpdated,
      status: bus.status
    }));
    
    return res.status(200).json(busLocations);
  } catch (error) {
    console.error('Error getting all bus locations:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  recordLocation,
  getBusLocation,
  getBusLocationHistory,
  getAllBusLocations
};
