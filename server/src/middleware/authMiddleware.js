const jwt = require('jsonwebtoken');

/* ======================================================
   AUTH MIDDLEWARE
   - Checks JWT token from cookie
   - Allows access only if logged in
====================================================== */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies?.auth_token;

    // If no token → not logged in
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'parlour_secret'
    );

    // ✅ Attach decoded payload consistently
    req.user = decoded; // { userId: ... }

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;
