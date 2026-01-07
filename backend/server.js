const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const locationRoutes = require('./routes/location.routes');
const rfidRoutes = require('./routes/rfid.routes');
const userRoutes = require('./routes/user.routes');
const busRoutes = require('./routes/bus.routes');
const notificationRoutes = require('./routes/notification.routes');
const fareRoutes = require('./routes/fare.routes');
const paymentRoutes = require('./routes/payment.routes');
const paymentController = require('./controllers/payment.controller');
const stripeRoutes = require('./routes/stripe.routes');
const stripeController = require('./controllers/stripe.controller');
const eventRoutes = require('./routes/event.routes');

const app = express();

// Middleware
app.use(cors());

// Razorpay webhook must be registered BEFORE express.json to access raw body
app.post('/api/payments/webhook', express.raw({ type: '*/*' }), paymentController.webhook);
// Stripe webhook (raw body)
app.post('/api/stripe/webhook', express.raw({ type: '*/*' }), stripeController.webhook);

// JSON parser (after webhook)
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduride', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/location', locationRoutes);
app.use('/api/rfid', rfidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/events', eventRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('EduRide API is running');
});

// Start server

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});

