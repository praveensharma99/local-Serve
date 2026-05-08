const express = require('express');
const cors = require('cors');
const path = require('path'); // Path module zaroori hai
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();



// 1. Sequelize Connection aur Models Import
// const sequelize = require('./models/db');
// const User = require('./models/UserModel'); 
// const ProviderProfile = require('./models/providerModel');

const { sequelize, User, ProviderProfile, Booking } = require('./models');


//booking
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/payment');
const chatRoutes = require('./routes/chatRoutes');
const { startReminderJob } = require('./jobs/reminderJob');
const setupChatSocket = require('./socket/chatSocket');


// 2. Routes Import
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const providerRoutes = require('./routes/providerRoutes');

const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
  },
});

setupChatSocket(io);

// 3. Middlewares
app.use(cors())
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://192.168.11.203:5173', 'http://192.168.137.1:5173'],
//   credentials: true
// }));
app.use(express.json());

// ✅ Tera UPLOADS wala folder yahan static set kar diya hai
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

//booking
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'LocalServe Backend (Sequelize) Chal Raha Hai!' });
});

// 5. Database Sync aur Server Start
const PORT = process.env.PORT || 5000;

// Proper Startup Sequence
const startServer = async () => {
  try {
    // Phase 1: Test DB Connection
    await sequelize.authenticate();
    console.log('✅ DB Connection Successful!');

    // Phase 2: Sync Tables
    console.log('⏳ Syncing Database Models to Neon PostgreSQL...');
    
    // alter: true will safely update schema without dropping data
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database Synced Successfully! All tables are ready in the public schema.');

    // Phase 3: Start Jobs and Listen
    startReminderJob();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Access from mobile: http://192.168.11.203:${PORT}`);
    });

  } catch (error) {
    console.error('❌ FATAL STARTUP ERROR:');
    console.error('Failed to connect or sync database:', error.message);
    console.error('Detailed Stack Trace:', error);
    
    // Exit process with failure so Render knows it failed to start
    process.exit(1);
  }
};

startServer();
