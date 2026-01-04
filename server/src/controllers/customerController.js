const { query } = require('../config/authdb');

// =======================
// Get all customers
// =======================
exports.getAllCustomers = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM customers 
       ORDER BY 
         CASE WHEN total_spent > 0 THEN 0 ELSE 1 END,
         total_spent DESC, 
         name`
    );

    res.json({
      success: true,
      count: result.rows.length,
      customers: result.rows
    });
  } catch (error) {
    console.error('❌ Get customers error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get customer by ID
// =======================
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT * FROM customers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Get customer's service history
    const historyResult = await query(
      `SELECT dr.*, s.name as service_name, s.category
       FROM daily_records dr
       LEFT JOIN services s ON dr.service_id = s.id
       WHERE dr.customer_id = $1
       ORDER BY dr.date DESC, dr.created_at DESC
       LIMIT 20`,
      [id]
    );

    res.json({
      success: true,
      customer: result.rows[0],
      history: historyResult.rows
    });
  } catch (error) {
    console.error('❌ Get customer by ID error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Create new customer
// =======================
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone are required'
      });
    }

    // Check if customer already exists with same phone
    const existingResult = await query(
      'SELECT id FROM customers WHERE phone = $1',
      [phone]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer with this phone number already exists'
      });
    }

    const result = await query(
      `INSERT INTO customers (name, phone, email, address) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, phone, email || null, address || null]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create customer error:', error.message);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'Customer with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Update customer
// =======================
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    // Check if customer exists
    const checkResult = await query(
      'SELECT id FROM customers WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check if phone is being updated to an existing phone
    if (phone) {
      const phoneCheck = await query(
        'SELECT id FROM customers WHERE phone = $1 AND id != $2',
        [phone, id]
      );
      
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Another customer with this phone number already exists'
        });
      }
    }

    const result = await query(
      `UPDATE customers 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           address = COALESCE($4, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, phone, email, address, id]
    );

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update customer error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Delete customer
// =======================
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const checkResult = await query(
      'SELECT id FROM customers WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check if customer has records
    const recordsCheck = await query(
      'SELECT COUNT(*) as count FROM daily_records WHERE customer_id = $1',
      [id]
    );

    if (parseInt(recordsCheck.rows[0].count) > 0) {
      // Instead of deleting, mark as inactive or just don't delete
      return res.status(400).json({
        success: false,
        error: 'Cannot delete customer with service records. Consider archiving instead.'
      });
    }

    // Delete the customer
    await query('DELETE FROM customers WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete customer error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Search customers
// =======================
exports.searchCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const result = await query(
      `SELECT * FROM customers 
       WHERE name ILIKE $1 
          OR phone ILIKE $1 
          OR email ILIKE $1 
          OR address ILIKE $1
       ORDER BY name`,
      [`%${search}%`]
    );

    res.json({
      success: true,
      count: result.rows.length,
      customers: result.rows
    });
  } catch (error) {
    console.error('❌ Search customers error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get top customers by spending
// =======================
exports.getTopCustomers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await query(
      `SELECT * FROM customers 
       WHERE total_spent > 0
       ORDER BY total_spent DESC 
       LIMIT $1`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      count: result.rows.length,
      customers: result.rows
    });
  } catch (error) {
    console.error('❌ Get top customers error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Update customer stats after service
// =======================
exports.updateCustomerStats = async (customerId, servicePrice) => {
  try {
    await query(
      `UPDATE customers 
       SET total_visits = total_visits + 1,
           total_spent = total_spent + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [servicePrice, customerId]
    );
    return true;
  } catch (error) {
    console.error('❌ Update customer stats error:', error.message);
    return false;
  }
};