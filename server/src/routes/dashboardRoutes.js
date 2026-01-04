const express = require('express');
const router = express.Router();
const { query } = require('../config/authdb');
const { authenticate } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// Apply authentication to all routes
router.use(authenticate);

// =======================
// Dashboard statistics
// =======================
router.get('/stats', dashboardController.getDashboardStats);

// =======================
// Get all appointments (existing)
// =======================
router.get('/appointments', async (req, res) => {
    try {
        const { rows } = await query(`
            SELECT a.*, u.name as customer_name, u.email, u.phone,
                   s.name as service_name, s.price
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            JOIN services s ON a.service_id = s.id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `);
        res.json({
            success: true,
            appointments: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// =======================
// Create new appointment (existing)
// =======================
router.post('/appointments', async (req, res) => {
    const { user_id, service_id, appointment_date, appointment_time, notes } = req.body;
    
    try {
        const { rows } = await query(
            'INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, service_id, appointment_date, appointment_time, notes]
        );
        res.json({
            success: true,
            appointment: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// =======================
// New dashboard routes from dashboardController
// =======================
router.get('/income', dashboardController.getIncomeByDateRange);
router.get('/category-stats', dashboardController.getCategoryStats);

module.exports = router;