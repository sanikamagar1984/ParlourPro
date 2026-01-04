const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');

const {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  getCurrentUser
} = require('../controllers/userController');

// =======================
// USER ROUTES
// =======================

// All user routes require authentication
router.use(authenticate);

// GET /api/users - Get all users (ADMIN ONLY)
router.get('/', authorize(['admin']), getAllUsers);

// GET /api/users/profile/me - Get current logged-in user profile
router.get('/profile/me', getCurrentUser);

// GET /api/users/profile - Alternative route for current user
router.get('/profile', getCurrentUser);

// GET /api/users/:id - Get user profile by ID (ADMIN/EMPLOYEE ONLY)
router.get('/:id', authorize(['admin', 'employee']), getUserProfile);

// PUT /api/users/profile - Update current user profile
router.put('/profile', updateUserProfile);

// PUT /api/users/:id - Update user profile by ID (ADMIN ONLY)
router.put('/:id', authorize(['admin']), updateUserProfile);

module.exports = router;