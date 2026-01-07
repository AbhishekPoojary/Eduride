// addAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

dotenv.config();

const [,, emailArg, passwordArg, nameArg, phoneArg] = process.argv;
const adminEmail = (emailArg || 'admin2@example.com').toLowerCase().trim();
const adminPassword = passwordArg || 'Admin@123';
const adminName = nameArg || 'Admin Two';
const adminPhone = phoneArg || '';

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`User with email ${adminEmail} already exists. (role: ${existing.role})`);
      process.exit(0);
    }

    const user = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      phone: adminPhone || undefined,
      role: 'admin'
    });

    await user.save();
    console.log('Admin user created successfully');
    console.log('----------------------------------');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password:', adminPassword);
    console.log('----------------------------------');
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    if (err.code === 11000) {
      console.error('Duplicate key error (email or rfidTag).');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

run();
