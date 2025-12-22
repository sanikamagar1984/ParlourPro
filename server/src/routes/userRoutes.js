const express = require('express');
const router = express.Router();
const { getAllUsers, getUserProfile, updateUserProfile } = require('../controllers/userController');

// GET /api/users - Get all users (for testing)
router.get('/', getAllUsers);

// GET /api/users/:id - Get user profile
router.get('/:id', getUserProfile);

// PUT /api/users/:id - Update user profile
router.put('/:id', updateUserProfile);

// GET /api/users/profile/me - Get current user profile (will add auth later)
router.get('/profile/me', getUserProfile);

module.exports = router;