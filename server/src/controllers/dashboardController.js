const { query } = require('../config/authdb');

// =======================
// Get dashboard statistics
// =======================
exports.getDashboardStats = async (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Today's income
    const todayIncomeResult = await query(
      `SELECT COALESCE(SUM(price), 0) as total FROM daily_records WHERE date = $1`,
      [today]
    );
    
    // 2. Weekly income (last 7 days)
    const weeklyIncomeResult = await query(
      `SELECT COALESCE(SUM(price), 0) as total 
       FROM daily_records 
       WHERE date >= CURRENT_DATE - INTERVAL '7 days'`,
      []
    );
    
    // 3. Monthly income (last 30 days)
    const monthlyIncomeResult = await query(
      `SELECT COALESCE(SUM(price), 0) as total 
       FROM daily_records 
       WHERE date >= CURRENT_DATE - INTERVAL '30 days'`,
      []
    );
    
    // 4. Total customers
    const totalCustomersResult = await query(
      'SELECT COUNT(*) as count FROM customers',
      []
    );
    
    // 5. Total staff
    const totalStaffResult = await query(
      'SELECT COUNT(*) as count FROM staff WHERE status = $1',
      ['active']
    );
    
    // 6. Total services
    const totalServicesResult = await query(
      'SELECT COUNT(*) as count FROM services',
      []
    );
    
    // 7. Today's appointments/records
    const todayRecordsResult = await query(
      `SELECT COUNT(*) as count FROM daily_records WHERE date = $1`,
      [today]
    );
    
    // 8. Recent records (last 5)
    const recentRecordsResult = await query(
      `SELECT dr.*, c.email as customer_email
       FROM daily_records dr
       LEFT JOIN customers c ON dr.customer_id = c.id
       ORDER BY created_at DESC 
       LIMIT 5`,
      []
    );
    
    // 9. Top services by revenue
    const topServicesResult = await query(
      `SELECT service_name, category, COUNT(*) as service_count, SUM(price) as revenue
       FROM daily_records
       WHERE date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY service_name, category
       ORDER BY revenue DESC
       LIMIT 5`,
      []
    );
    
    // 10. Customer growth (last 30 days)
    const customerGrowthResult = await query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as new_customers
       FROM customers
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      []
    );

    res.json({
      success: true,
      stats: {
        dailyIncome: parseFloat(todayIncomeResult.rows[0].total),
        weeklyIncome: parseFloat(weeklyIncomeResult.rows[0].total),
        monthlyIncome: parseFloat(monthlyIncomeResult.rows[0].total),
        totalCustomers: parseInt(totalCustomersResult.rows[0].count),
        totalStaff: parseInt(totalStaffResult.rows[0].count),
        totalServices: parseInt(totalServicesResult.rows[0].count),
        todayAppointments: parseInt(todayRecordsResult.rows[0].count)
      },
      recentRecords: recentRecordsResult.rows,
      topServices: topServicesResult.rows,
      customerGrowth: customerGrowthResult.rows
    });
    
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get income by date range
// =======================
exports.getIncomeByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    const result = await query(
      `SELECT 
         date,
         COUNT(*) as records_count,
         SUM(price) as total_income,
         ARRAY_AGG(DISTINCT payment_method) as payment_methods
       FROM daily_records
       WHERE date BETWEEN $1 AND $2
       GROUP BY date
       ORDER BY date`,
      [startDate, endDate]
    );
    
    // Calculate summary
    const summary = {
      totalRecords: result.rows.reduce((sum, row) => sum + parseInt(row.records_count), 0),
      totalIncome: result.rows.reduce((sum, row) => sum + parseFloat(row.total_income), 0),
      daysCount: result.rows.length
    };
    
    res.json({
      success: true,
      data: result.rows,
      summary: summary
    });
    
  } catch (error) {
    console.error('❌ Get income by date range error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =======================
// Get category-wise statistics
// =======================
exports.getCategoryStats = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    let dateCondition = '';
    let params = [];
    
    switch (period) {
      case 'today':
        dateCondition = 'WHERE date = CURRENT_DATE';
        break;
      case '7days':
        dateCondition = 'WHERE date >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case '30days':
        dateCondition = 'WHERE date >= CURRENT_DATE - INTERVAL \'30 days\'';
        break;
      case 'all':
      default:
        dateCondition = '';
    }
    
    const result = await query(
      `SELECT 
         category,
         COUNT(*) as service_count,
         SUM(price) as total_revenue,
         ROUND(AVG(price), 2) as avg_price
       FROM daily_records
       ${dateCondition}
       GROUP BY category
       ORDER BY total_revenue DESC`,
      params
    );
    
    res.json({
      success: true,
      period: period,
      stats: result.rows
    });
    
  } catch (error) {
    console.error('❌ Get category stats error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};