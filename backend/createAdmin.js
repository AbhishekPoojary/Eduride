// createAdmin.js
const mongoose = require('mongoose');
const User = require('./models/user.model'); // Assumes user.model.js is in a 'models' subdirectory
const dotenv = require('dotenv');

// Configure dotenv to load environment variables
// Adjust the path if your .env file is located elsewhere (e.g., in the root of 'backend')
dotenv.config(); // Loads .env from the current directory (backend root)

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

const createAdminUser = async () => {
  await connectDB();

  // !!! IMPORTANT: Change these details before running the script !!!
  const adminEmail = 'pavan28@gmail.com'; 
  const adminPassword = 'password123';   
  const adminName = 'Administrator';
  const adminPhone = '6362148961'; // Optional: Change or remove

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user with email '${adminEmail}' already exists.`);
      return; // Exit if admin already exists
    }

    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // The pre-save hook in user.model.js will hash this
      role: 'admin',
      phone: adminPhone, 
      // Ensure all other fields that are 'required' in your schema 
      // and don't have a 'default' value are provided here.
      // For EduRide, 'name', 'email', 'password', 'role' are the main ones.
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('----------------------------------');
    console.log('Name:', adminUser.name);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Password: (the one you set in the script - *remember this for login*)');
    console.log('----------------------------------');
    console.log('You can now log in with these credentials.');

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    if (error.code === 11000) {
        console.error('This could be due to a duplicate email or another unique field (like rfidTag if you set one).');
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

createAdminUser();
