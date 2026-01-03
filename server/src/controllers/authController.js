const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authPool } = require('../config/authdb');
const transporter = require('../config/email');

const JWT_SECRET = process.env.JWT_SECRET || 'parlour_secret';

/* ======================================================
   HELPER: Generate JWT Token
====================================================== */
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

/* ======================================================
   SIGNUP
====================================================== */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const checkUser = await authPool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Email or phone already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role is 'employee' for new signups
    const role = 'employee';

    const result = await authPool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role`,
      [name, email, hashedPassword, phone, role]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/* ======================================================
   LOGIN
====================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authPool.query(
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
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Create token with role
    const token = generateToken(user.id, user.role);

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send response with role
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/* ======================================================
   CHECK AUTH STATUS (RETURNS USER DATA WITH ROLE)
====================================================== */
exports.checkAuth = async (req, res) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.json({ authenticated: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database including role
    const result = await authPool.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.json({ authenticated: false });
    }

    const user = result.rows[0];

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Auth check error:', error);
    res.json({ authenticated: false });
  }
};

/* ======================================================
   LOGOUT
====================================================== */
exports.logout = (req, res) => {
  res.clearCookie('auth_token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/* ======================================================
   FORGOT PASSWORD
====================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const result = await authPool.query(
      'SELECT id, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email not registered'
      });
    }

    const { id: userId, name } = result.rows[0];

    const resetToken = jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await authPool.query(
      `UPDATE users
       SET reset_token = $1, reset_token_expiry = $2
       WHERE id = $3`,
      [resetToken, expiry, userId]
    );

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Parlour App Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request – Parlour App',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset</h2>
          <p>Dear <strong>${name}</strong>,</p>
          <p>We received a request to reset your password.</p>
          <p>Please click the button below to reset your password:</p>
          <p>
            <a href="${resetLink}"
               style="display:inline-block;
                      padding:10px 16px;
                      background:#2563eb;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:4px;">
              Reset Password
            </a>
          </p>
          <p>This link is valid for <strong>1 hour</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Regards,<br><strong>Tressence by Simi</strong></p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/* ======================================================
   RESET PASSWORD
====================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await authPool.query(
      `SELECT id FROM users
       WHERE id = $1
       AND reset_token = $2
       AND reset_token_expiry > NOW()`,
      [decoded.userId, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset link' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await authPool.query(
      `UPDATE users
       SET password = $1,
           reset_token = NULL,
           reset_token_expiry = NULL
       WHERE id = $2`,
      [hashedPassword, decoded.userId]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(400).json({ success: false, error: 'Reset link expired or invalid' });
  }
};