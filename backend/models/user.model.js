const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'parent', 'student', 'faculty'],
    default: 'student'
  },
  rfidTag: {
    type: String,
    sparse: true,
    unique: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedBus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    default: null
  },
  notificationPreferences: {
    sms: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    }
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue', 'exempt'],
    default: 'pending'
  },
  lastScan: {
    time: {
      type: Date,
      default: null
    },
    busId: {
      type: String
    },
    result: {
      type: String,
      enum: ['entry', 'exit', 'denied'],
      default: undefined
    },
    doorAction: {
      type: String,
      enum: ['open', 'locked'],
      default: undefined
    },
    message: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
