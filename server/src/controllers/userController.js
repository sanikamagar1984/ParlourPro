const { authPool } = require('../config/authdb');

// =======================
// Get all users
// =======================
exports.getAllUsers = async (req, res) => {
  try {
    const result = await authPool.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    console.error('❌ Get users error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get user profile
// =======================
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.userId; // ✅ FIXED

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await authPool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Update user profile
// =======================
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.userId; // ✅ FIXED
    const { name, phone } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await authPool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, phone, role, created_at`,
      [name, phone, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
