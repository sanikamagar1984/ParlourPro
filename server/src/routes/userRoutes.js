const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  getAllUsers,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

// =======================
// USER ROUTES
// =======================

// GET /api/users - Get all users (AUTH REQUIRED)
router.get('/', authMiddleware, getAllUsers);

// GET /api/users/profile/me - Logged-in user profile
router.get('/profile/me', authMiddleware, getUserProfile);

// GET /api/users/:id - Get user profile by ID (AUTH REQUIRED)
router.get('/:id', authMiddleware, getUserProfile);

// PUT /api/users/:id - Update user profile (AUTH REQUIRED)
router.put('/:id', authMiddleware, updateUserProfile);

module.exports = router;
