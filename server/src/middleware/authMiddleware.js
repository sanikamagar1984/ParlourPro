const jwt = require('jsonwebtoken');



const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.auth_token || req.cookies?.token || 
                  req.headers?.authorization?.split(' ')[1];

    // If no token → not logged in
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access. Please login first.'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'parlour_secret'
    );

    //  Attach decoded payload consistently
    req.user = {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'employee'
    };

    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/* ======================================================
   ROLE-BASED AUTHORIZATION MIDDLEWARE
   - Checks if user has required role
====================================================== */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Convert single role to array
    if (typeof allowedRoles === 'string') {
      allowedRoles = [allowedRoles];
    }

    // Allow access if no roles specified (just need to be authenticated)
    if (allowedRoles.length === 0) {
      return next();
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/* ======================================================
   CONVENIENCE MIDDLEWARES
====================================================== */
const isAdmin = (req, res, next) => {
  return authorize(['admin'])(req, res, next);
};

const isEmployee = (req, res, next) => {
  return authorize(['employee', 'admin'])(req, res, next);
};

const isCustomer = (req, res, next) => {
  return authorize(['customer', 'employee', 'admin'])(req, res, next);
};

/* ======================================================
   EXPORTS
====================================================== */
module.exports = {
  authenticate: authMiddleware, // For backward compatibility
  authorize,
  isAdmin,
  isEmployee,
  isCustomer
};