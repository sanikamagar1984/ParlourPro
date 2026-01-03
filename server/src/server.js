const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // ✅ ADD THIS

// Load environment variables
dotenv.config();

// Import database connection
const { connectAuthDB } = require('./config/authdb');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Connect to database
connectAuthDB();

// ✅ MIDDLEWARE (UPDATED)
app.use(cors({
  origin: 'http://localhost:3000', // React app
  credentials: true               // ⭐ ALLOW COOKIES
}));

app.use(express.json());
app.use(cookieParser());           // ⭐ REQUIRED FOR COOKIES

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Parlour Backend API with PostgreSQL',
    status: 'Running',
    database: 'PostgreSQL connected',
    endpoints: [
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'POST /api/auth/forgot-password',
      'GET /api/users'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Parlour Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
