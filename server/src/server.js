const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import database connection
const { connectDB } = require('./config/authdb');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const staffRoutes = require('./routes/staffRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Connect to database - FIXED LINE! Changed from connectAuthDB() to connectDB()
connectDB();

// ✅ MIDDLEWARE (UPDATED)
app.use(cors({
  origin: 'http://localhost:3000', // React app
  credentials: true               // ALLOW COOKIES
}));

app.use(express.json());
app.use(cookieParser());           // REQUIRED FOR COOKIES

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Parlour Management System API',
    status: 'Running',
    database: 'PostgreSQL connected',
    version: '2.0.0',
    endpoints: {
      auth: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'POST /api/auth/forgot-password',
        'POST /api/auth/reset-password/:token',
        'GET /api/auth/me'
      ],
      dashboard: [
        'GET /api/dashboard/stats',
        'GET /api/dashboard/income',
        'GET /api/dashboard/category-stats'
      ],
      services: [
        'GET /api/services',
        'GET /api/services/category/:category',
        'GET /api/services/:id',
        'POST /api/services',
        'PUT /api/services/:id',
        'DELETE /api/services/:id'
      ],
      customers: [
        'GET /api/customers',
        'GET /api/customers/:id',
        'POST /api/customers',
        'PUT /api/customers/:id',
        'DELETE /api/customers/:id'
      ],
      staff: [
        'GET /api/staff',
        'GET /api/staff/:id',
        'POST /api/staff',
        'PUT /api/staff/:id',
        'DELETE /api/staff/:id'
      ],
      records: [
        'GET /api/records',
        'GET /api/records/:id',
        'POST /api/records',
        'PUT /api/records/:id',
        'DELETE /api/records/:id'
      ]
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Parlour Management System API is running',
    database: 'connected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'API endpoint not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🚀 API Documentation: http://localhost:${PORT}/`);
  console.log(`💾 Database: ${process.env.DB_NAME || 'parlour_db'}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
