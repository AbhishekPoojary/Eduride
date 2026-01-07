const mongoose = require('mongoose');

const locationLogSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  busId: {
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
  speed: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create geospatial index for location
locationLogSchema.index({ 'location': '2dsphere' });
// Create index for efficient querying
locationLogSchema.index({ bus: 1, timestamp: 1 });

const LocationLog = mongoose.model('LocationLog', locationLogSchema);

module.exports = LocationLog;
