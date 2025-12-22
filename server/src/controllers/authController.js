const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authPool } = require('../config/authdb');  // ⬅️ CHANGED from pool to authPool

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'parlour_secret',
    { expiresIn: '7d' }
  );
};

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email and password are required' 
      });
    }
    
    // Check if user exists
    const checkUser = await authPool.query(  // ⬅️ CHANGED pool to authPool
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (checkUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: 'User already exists with this email' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert into PostgreSQL
    const result = await authPool.query(  // ⬅️ CHANGED pool to authPool
      `INSERT INTO users (name, email, password, phone) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, hashedPassword, phone]
    );
    
    const newUser = result.rows[0];
    
    // Generate token
    const token = generateToken(newUser.id);
    
    console.log('✅ New user registered:', newUser.email);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error: ' + error.message  // ⬅️ Added error message for debugging
    });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await authPool.query(  // ⬅️ CHANGED pool to authPool
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const result = await authPool.query(  // ⬅️ CHANGED pool to authPool
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No account found with this email' 
      });
    }
    
    res.json({
      success: true,
      message: 'Password reset instructions sent to email',
      email: email
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};