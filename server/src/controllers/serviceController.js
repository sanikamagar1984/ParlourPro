const { query } = require('../config/authdb');

// =======================
// Get all services
// =======================
exports.getAllServices = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM services ORDER BY category, name'
    );

    res.json({
      success: true,
      count: result.rows.length,
      services: result.rows
    });
  } catch (error) {
    console.error('❌ Get services error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get services by category
// =======================
exports.getServicesByCategory = async (req, res) => {
  try {
   const { category } = req.query; 
    const result = await query(
      'SELECT * FROM services WHERE category = $1 ORDER BY name',
      [category]
    );

    res.json({
      success: true,
      count: result.rows.length,
      services: result.rows
    });
  } catch (error) {
    console.error('❌ Get services by category error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get service by ID
// =======================
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM services WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      service: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Get service by ID error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Create new service
// =======================
exports.createService = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;

    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name, category and price are required'
      });
    }

    const result = await query(
      `INSERT INTO services (name, category, price, description) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, category, price, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create service error:', error.message);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'Service with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Update service
// =======================
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description } = req.body;

    const result = await query(
      `UPDATE services 
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           price = COALESCE($3, price),
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, category, price, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update service error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Delete service
// =======================
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const checkResult = await query(
      'SELECT id FROM services WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Delete the service
    await query('DELETE FROM services WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete service error:', error.message);
    
    // If service is referenced in daily_records
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete service. It has related records.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Search services
// =======================
exports.searchServices = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const result = await query(
      `SELECT * FROM services 
       WHERE name ILIKE $1 OR category ILIKE $1 OR description ILIKE $1
       ORDER BY name`,
      [`%${search}%`]
    );

    res.json({
      success: true,
      count: result.rows.length,
      services: result.rows
    });
  } catch (error) {
    console.error('❌ Search services error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};