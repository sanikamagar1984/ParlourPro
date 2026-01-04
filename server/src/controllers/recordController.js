const { query } = require('../config/authdb');

// =======================
// Get all daily records
// =======================
exports.getAllRecords = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      customerId, 
      serviceId, 
      category,
      paymentMethod,
      page = 1, 
      limit = 50 
    } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;
    
    // Build WHERE clause dynamically
    if (startDate && endDate) {
      whereConditions.push(`date BETWEEN $${paramCount} AND $${paramCount + 1}`);
      queryParams.push(startDate, endDate);
      paramCount += 2;
    }
    
    if (customerId) {
      whereConditions.push(`customer_id = $${paramCount}`);
      queryParams.push(customerId);
      paramCount++;
    }
    
    if (serviceId) {
      whereConditions.push(`service_id = $${paramCount}`);
      queryParams.push(serviceId);
      paramCount++;
    }
    
    if (category) {
      whereConditions.push(`category = $${paramCount}`);
      queryParams.push(category);
      paramCount++;
    }
    
    if (paymentMethod) {
      whereConditions.push(`payment_method = $${paramCount}`);
      queryParams.push(paymentMethod);
      paramCount++;
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM daily_records ${whereClause}`,
      queryParams
    );
    
    // Get records with pagination
    const recordsResult = await query(
      `SELECT dr.*, c.email as customer_email, c.address as customer_address
       FROM daily_records dr
       LEFT JOIN customers c ON dr.customer_id = c.id
       ${whereClause}
       ORDER BY dr.date DESC, dr.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...queryParams, limit, offset]
    );
    
    // Calculate total income
    const incomeResult = await query(
      `SELECT COALESCE(SUM(price), 0) as total_income 
       FROM daily_records ${whereClause}`,
      queryParams
    );
    
    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total),
      totalPages: Math.ceil(countResult.rows[0].total / limit),
      totalIncome: parseFloat(incomeResult.rows[0].total_income),
      records: recordsResult.rows
    });
    
  } catch (error) {
    console.error('❌ Get records error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get record by ID
// =======================
exports.getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT dr.*, 
              c.name as customer_name, 
              c.email as customer_email,
              c.phone as customer_phone,
              c.address as customer_address,
              s.name as service_full_name,
              s.description as service_description
       FROM daily_records dr
       LEFT JOIN customers c ON dr.customer_id = c.id
       LEFT JOIN services s ON dr.service_id = s.id
       WHERE dr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      record: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Get record by ID error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Create new record
// =======================
exports.createRecord = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      phone,
      serviceId,
      serviceName,
      category,
      price,
      paymentMethod = 'cash',
      date,
      notes,
      staffId
    } = req.body;

    // Validation
    if (!serviceId || !price || !date) {
      return res.status(400).json({
        success: false,
        error: 'Service ID, price and date are required'
      });
    }

    // Get service details
    let serviceDetails = null;
    if (serviceId) {
      const serviceResult = await query(
        'SELECT name, category, price FROM services WHERE id = $1',
        [serviceId]
      );
      
      if (serviceResult.rows.length > 0) {
        serviceDetails = serviceResult.rows[0];
      }
    }

    // Determine final values
    const finalServiceName = serviceName || (serviceDetails ? serviceDetails.name : 'Unknown Service');
    const finalCategory = category || (serviceDetails ? serviceDetails.category : 'hair');
    const finalPrice = price || (serviceDetails ? serviceDetails.price : 0);

    // Start transaction
    const client = await query.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert the record
      const recordResult = await client.query(
        `INSERT INTO daily_records (
          customer_id, customer_name, phone, 
          service_id, service_name, category, 
          price, payment_method, date, notes, staff_id
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [
          customerId || null,
          customerName || 'Walk-in Customer',
          phone || null,
          serviceId || null,
          finalServiceName,
          finalCategory,
          finalPrice,
          paymentMethod,
          date,
          notes || null,
          staffId || null
        ]
      );
      
      // Update customer stats if customer exists
      if (customerId) {
        await client.query(
          `UPDATE customers 
           SET total_visits = total_visits + 1,
               total_spent = total_spent + $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [finalPrice, customerId]
        );
      }
      
      // If customer doesn't exist but name/phone provided, create new customer
      if (!customerId && customerName && customerName !== 'Walk-in Customer' && phone) {
        // Check if customer already exists with this phone
        const existingCustomer = await client.query(
          'SELECT id FROM customers WHERE phone = $1',
          [phone]
        );
        
        if (existingCustomer.rows.length === 0) {
          // Create new customer
          const newCustomer = await client.query(
            `INSERT INTO customers (name, phone, total_visits, total_spent) 
             VALUES ($1, $2, 1, $3) 
             RETURNING id`,
            [customerName, phone, finalPrice]
          );
          
          // Update record with new customer ID
          await client.query(
            'UPDATE daily_records SET customer_id = $1 WHERE id = $2',
            [newCustomer.rows[0].id, recordResult.rows[0].id]
          );
        } else {
          // Customer exists, update their record
          await client.query(
            `UPDATE customers 
             SET total_visits = total_visits + 1,
                 total_spent = total_spent + $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [finalPrice, existingCustomer.rows[0].id]
          );
          
          // Update record with existing customer ID
          await client.query(
            'UPDATE daily_records SET customer_id = $1 WHERE id = $2',
            [existingCustomer.rows[0].id, recordResult.rows[0].id]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Get the full record with customer details
      const fullRecordResult = await query(
        `SELECT dr.*, c.email as customer_email 
         FROM daily_records dr
         LEFT JOIN customers c ON dr.customer_id = c.id
         WHERE dr.id = $1`,
        [recordResult.rows[0].id]
      );
      
      res.status(201).json({
        success: true,
        message: 'Record created successfully',
        record: fullRecordResult.rows[0]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Create record error:', error.message);
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        error: 'Invalid service or customer ID'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Update record
// =======================
exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if record exists
    const checkResult = await query(
      'SELECT customer_id, price FROM daily_records WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    const oldRecord = checkResult.rows[0];
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    // Add updatable fields
    const updatableFields = [
      'customer_id', 'customer_name', 'phone',
      'service_id', 'service_name', 'category',
      'price', 'payment_method', 'date', 'notes', 'staff_id'
    ];
    
    updatableFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(updates[field]);
        paramCount++;
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    // Add ID as last parameter
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE daily_records 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await query(updateQuery, updateValues);
    
    // If customer_id or price changed, update customer stats
    if (updates.price && updates.price !== oldRecord.price) {
      const priceDiff = updates.price - oldRecord.price;
      
      if (oldRecord.customer_id) {
        await query(
          `UPDATE customers 
           SET total_spent = total_spent + $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [priceDiff, oldRecord.customer_id]
        );
      }
    }
    
    res.json({
      success: true,
      message: 'Record updated successfully',
      record: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Update record error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Delete record
// =======================
exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Get record details before deletion
    const recordResult = await query(
      'SELECT customer_id, price FROM daily_records WHERE id = $1',
      [id]
    );

    if (recordResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    const record = recordResult.rows[0];
    
    // Start transaction
    const client = await query.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete the record
      await client.query('DELETE FROM daily_records WHERE id = $1', [id]);
      
      // Update customer stats if customer exists
      if (record.customer_id) {
        await client.query(
          `UPDATE customers 
           SET total_visits = total_visits - 1,
               total_spent = total_spent - $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [record.price, record.customer_id]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Record deleted successfully'
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Delete record error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get income statistics
// =======================
exports.getIncomeStats = async (req, res) => {
  try {
    const { groupBy = 'day', startDate, endDate } = req.query;
    
    let dateCondition = '';
    let params = [];
    
    if (startDate && endDate) {
      dateCondition = 'WHERE date BETWEEN $1 AND $2';
      params = [startDate, endDate];
    }
    
    let groupByClause = '';
    let selectFields = '';
    
    switch (groupBy) {
      case 'day':
        groupByClause = 'GROUP BY date';
        selectFields = 'date as period';
        break;
      case 'week':
        groupByClause = 'GROUP BY EXTRACT(WEEK FROM date), EXTRACT(YEAR FROM date)';
        selectFields = 'CONCAT(\'Week \', EXTRACT(WEEK FROM date), \'/\', EXTRACT(YEAR FROM date)) as period';
        break;
      case 'month':
        groupByClause = 'GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)';
        selectFields = 'TO_CHAR(date, \'Mon YYYY\') as period';
        break;
      case 'category':
        groupByClause = 'GROUP BY category';
        selectFields = 'category as period';
        break;
      case 'payment_method':
        groupByClause = 'GROUP BY payment_method';
        selectFields = 'payment_method as period';
        break;
      default:
        groupByClause = 'GROUP BY date';
        selectFields = 'date as period';
    }
    
    const result = await query(
      `SELECT 
         ${selectFields},
         COUNT(*) as records_count,
         SUM(price) as total_income,
         ROUND(AVG(price), 2) as avg_price
       FROM daily_records
       ${dateCondition}
       ${groupByClause}
       ORDER BY total_income DESC`,
      params
    );
    
    // Calculate summary
    const summary = {
      totalRecords: result.rows.reduce((sum, row) => sum + parseInt(row.records_count), 0),
      totalIncome: result.rows.reduce((sum, row) => sum + parseFloat(row.total_income), 0),
      avgPrice: result.rows.length > 0 ? 
        result.rows.reduce((sum, row) => sum + parseFloat(row.avg_price), 0) / result.rows.length : 0
    };
    
    res.json({
      success: true,
      groupBy: groupBy,
      stats: result.rows,
      summary: summary
    });
    
  } catch (error) {
    console.error('❌ Get income stats error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Export records to CSV/Excel data
// =======================
exports.exportRecords = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    let whereConditions = [];
    let params = [];
    let paramCount = 1;
    
    if (startDate && endDate) {
      whereConditions.push(`date BETWEEN $${paramCount} AND $${paramCount + 1}`);
      params.push(startDate, endDate);
      paramCount += 2;
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    const result = await query(
      `SELECT 
         dr.id,
         dr.date,
         dr.customer_name,
         dr.phone,
         dr.service_name,
         dr.category,
         dr.price,
         dr.payment_method,
         dr.notes,
         dr.created_at,
         c.email as customer_email,
         c.address as customer_address
       FROM daily_records dr
       LEFT JOIN customers c ON dr.customer_id = c.id
       ${whereClause}
       ORDER BY dr.date DESC, dr.created_at DESC`,
      params
    );
    
    // Calculate totals
    const totals = {
      totalRecords: result.rows.length,
      totalIncome: result.rows.reduce((sum, row) => sum + parseFloat(row.price), 0),
      dateRange: startDate && endDate ? `${startDate} to ${endDate}` : 'All records'
    };
    
    if (format === 'csv') {
      // Prepare CSV data
      const headers = ['ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Service', 'Category', 'Price', 'Payment Method', 'Notes'];
      const csvRows = result.rows.map(row => [
        row.id,
        row.date,
        row.customer_name,
        row.phone || '',
        row.customer_email || '',
        row.service_name,
        row.category,
        row.price,
        row.payment_method,
        row.notes || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Add totals row
      const totalsRow = `\n\nTOTALS:,${totals.totalRecords} records,Total Income:,${totals.totalIncome},Date Range:,${totals.dateRange}`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=records-${Date.now()}.csv`);
      res.send(csvContent + totalsRow);
      
    } else {
      // Return JSON data
      res.json({
        success: true,
        totals: totals,
        records: result.rows
      });
    }
    
  } catch (error) {
    console.error('❌ Export records error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};