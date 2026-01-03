const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  checkAuth  // ← IMPORTANT: Add this import
} = require('../controllers/authController');

// ===============================
// AUTH ROUTES
// ===============================
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ===============================
// CHECK LOGIN STATUS (COOKIE) - UPDATED
// ===============================
router.get('/me', checkAuth);  // ← Use the controller function instead of inline

module.exports = router;