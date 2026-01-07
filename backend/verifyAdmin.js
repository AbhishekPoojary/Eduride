// verifyAdmin.js
const mongoose = require('mongoose');
const User = require('./models/user.model');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file.');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

const verifyAdmin = async () => {
  await connectDB();

  try {
    const adminEmail = 'pavan28@gmail.com';
    const adminPassword = 'password123';

    console.log('Verifying admin user...');
    
    // Find admin user
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('  Email:', admin.email);
    console.log('  Name:', admin.name);
    console.log('  Role:', admin.role);
    console.log('  Password Hash:', admin.password ? 'Hashed password exists' : 'No password');

    // Test password comparison
    if (admin.password) {
      const isMatch = await admin.comparePassword(adminPassword);
      console.log('  Password comparison:', isMatch ? '✅ Password matches' : '❌ Password does not match');
    } else {
      console.log('  ❌ No password set for admin user');
    }

  } catch (error) {
    console.error('Error verifying admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

verifyAdmin();
