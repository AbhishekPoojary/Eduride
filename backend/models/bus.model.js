const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  driver: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    licenseNumber: {
      type: String,
      required: true
    }
  },
  route: {
    name: {
      type: String,
      required: true
    },
    stops: [{
      name: {
        type: String,
        required: true
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
      arrivalTime: {
        type: String,
        required: true
      }
    }]
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Create geospatial index for current location
busSchema.index({ 'currentLocation': '2dsphere' });

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
