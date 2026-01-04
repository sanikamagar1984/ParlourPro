const bcrypt = require('bcryptjs');
const { query } = require('../config/authdb');

/* =====================================
   GET ALL EMPLOYEES
===================================== */
exports.getAllEmployees = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, phone, role, created_at
       FROM users
       WHERE role = 'employee'
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      staff: result.rows
    });
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ success: false });
  }
};

/* =====================================
   UPDATE EMPLOYEE (NAME + EMAIL + PHONE)
===================================== */
exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    /* ========= BASIC VALIDATION ========= */
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 3 characters'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number'
      });
    }

    /* ========= UNIQUE EMAIL CHECK ========= */
    const emailCheck = await query(
      `SELECT id FROM users WHERE email = $1 AND id != $2`,
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    /* ========= UNIQUE PHONE CHECK ========= */
    const phoneCheck = await query(
      `SELECT id FROM users WHERE phone = $1 AND id != $2`,
      [phone, id]
    );

    if (phoneCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Phone number already exists'
      });
    }

    /* ========= UPDATE ========= */
    await query(
      `UPDATE users
       SET name = $1,
           email = $2,
           phone = $3
       WHERE id = $4 AND role = 'employee'`,
      [name, email, phone, id]
    );

    res.json({
      success: true,
      message: 'Employee updated successfully'
    });
  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ success: false });
  }
};

/* =====================================
   UPDATE EMPLOYEE PASSWORD
===================================== */
exports.updateEmployeePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    /* ========= PASSWORD VALIDATION ========= */
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error:
          'Password must be 8+ chars, include number & special character'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await query(
      `UPDATE users
       SET password = $1
       WHERE id = $2 AND role = 'employee'`,
      [hashed, id]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ success: false });
  }
};

/* =====================================
   DELETE EMPLOYEE
===================================== */
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    await query(
      `DELETE FROM users
       WHERE id = $1 AND role = 'employee'`,
      [id]
    );

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ success: false });
  }
};
