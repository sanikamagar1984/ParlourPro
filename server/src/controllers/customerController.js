// server/src/controllers/customerController.js
const { query } = require('../config/authdb');

// =======================
// Get all customers
// =======================
exports.getAllCustomers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, phone, email, address, created_at, updated_at 
       FROM customers 
       ORDER BY name`
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
      `SELECT id, name, phone, email, address, created_at, updated_at 
       FROM customers WHERE id = $1`,
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
       RETURNING id, name, phone, email, address, created_at, updated_at`,
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
       RETURNING id, name, phone, email, address, created_at, updated_at`,
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
// Delete customer - SIMPLE WORKING VERSION
// =======================
exports.deleteCustomer = async (req, res) => {
  console.log('🔴 DELETE /api/customers called for ID:', req.params.id);
  
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      console.log('Invalid ID format');
      return res.status(400).json({
        success: false,
        error: 'Invalid customer ID'
      });
    }
    
    const customerId = parseInt(id);
    
    // 1. Check if customer exists
    console.log('Checking if customer exists...');
    const customerCheck = await query(
      'SELECT id, name FROM customers WHERE id = $1',
      [customerId]
    );
    
    if (customerCheck.rows.length === 0) {
      console.log('Customer not found');
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    const customerName = customerCheck.rows[0].name;
    console.log(`Found customer: ${customerName}`);
    
    // 2. Check for service records
    console.log('Checking for service records...');
    const recordsCheck = await query(
      'SELECT COUNT(*) as count FROM daily_records WHERE customer_id = $1',
      [customerId]
    );
    
    const recordCount = parseInt(recordsCheck.rows[0].count);
    console.log(`Record count: ${recordCount}`);
    
    if (recordCount > 0) {
      console.log(`Cannot delete - has ${recordCount} records`);
      return res.status(400).json({
        success: false,
        error: `Cannot delete customer "${customerName}" because they have ${recordCount} service record(s). Please delete the records first.`,
        recordCount: recordCount
      });
    }
    
    // 3. Delete the customer
    console.log('Deleting customer...');
    const deleteResult = await query(
      'DELETE FROM customers WHERE id = $1 RETURNING id, name',
      [customerId]
    );
    
    console.log(`✅ Successfully deleted: ${deleteResult.rows[0].name}`);
    
    res.json({
      success: true,
      message: `Customer "${customerName}" deleted successfully`,
      deletedCustomer: deleteResult.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Delete customer error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific database errors
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        error: 'Cannot delete customer because they have related records in other tables.'
      });
    }
    
    if (error.code === '23505') { // Unique constraint
      return res.status(400).json({
        success: false,
        error: 'Database constraint error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while deleting customer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      `SELECT id, name, phone, email, address, created_at, updated_at 
       FROM customers 
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
// Get top customers by date (NEWEST CUSTOMERS)
// =======================
exports.getTopCustomers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await query(
      `SELECT id, name, phone, email, address, created_at, updated_at 
       FROM customers 
       ORDER BY created_at DESC 
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
