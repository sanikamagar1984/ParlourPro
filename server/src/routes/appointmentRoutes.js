const express = require('express');
const router = express.Router();
const { query } = require('../config/authdb');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication to all routes
router.use(authenticate);

// =======================
// Get all appointments
// =======================
router.get('/', async (req, res) => {
    try {
        const { rows } = await query(`
            SELECT a.*, 
                   u.name as customer_name, 
                   u.email, 
                   u.phone,
                   s.name as service_name, 
                   s.price,
                   s.category as service_category
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN services s ON a.service_id = s.id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            appointments: rows
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// =======================
// Get appointment by ID
// =======================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { rows } = await query(`
            SELECT a.*, 
                   u.name as customer_name, 
                   u.email, 
                   u.phone,
                   s.name as service_name, 
                   s.price,
                   s.category as service_category
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN services s ON a.service_id = s.id
            WHERE a.id = $1
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        
        res.json({
            success: true,
            appointment: rows[0]
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// =======================
// Create new appointment
// =======================
router.post('/', async (req, res) => {
    const { user_id, service_id, appointment_date, appointment_time, notes, status } = req.body;
    
    // Validation
    if (!user_id || !service_id || !appointment_date || !appointment_time) {
        return res.status(400).json({
            success: false,
            error: 'User ID, service ID, appointment date and time are required'
        });
    }
    
    try {
        const { rows } = await query(
            `INSERT INTO appointments 
             (user_id, service_id, appointment_date, appointment_time, notes, status) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [user_id, service_id, appointment_date, appointment_time, notes || null, status || 'scheduled']
        );
        
        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            appointment: rows[0]
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                error: 'Invalid user or service ID'
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// =======================
// Update appointment
// =======================
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, service_id, appointment_date, appointment_time, notes, status } = req.body;
    
    try {
        // Check if appointment exists
        const checkResult = await query(
            'SELECT id FROM appointments WHERE id = $1',
            [id]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        
        const { rows } = await query(
            `UPDATE appointments 
             SET user_id = COALESCE($1, user_id),
                 service_id = COALESCE($2, service_id),
                 appointment_date = COALESCE($3, appointment_date),
                 appointment_time = COALESCE($4, appointment_time),
                 notes = COALESCE($5, notes),
                 status = COALESCE($6, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING *`,
            [user_id, service_id, appointment_date, appointment_time, notes, status, id]
        );
        
        res.json({
            success: true,
            message: 'Appointment updated successfully',
            appointment: rows[0]
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// =======================
// Delete appointment
// =======================
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if appointment exists
        const checkResult = await query(
            'SELECT id FROM appointments WHERE id = $1',
            [id]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        
        await query('DELETE FROM appointments WHERE id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// =======================
// Get today's appointments
// =======================
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const { rows } = await query(`
            SELECT a.*, 
                   u.name as customer_name, 
                   u.email, 
                   u.phone,
                   s.name as service_name, 
                   s.price
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN services s ON a.service_id = s.id
            WHERE a.appointment_date = $1
            ORDER BY a.appointment_time
        `, [today]);
        
        res.json({
            success: true,
            date: today,
            count: rows.length,
            appointments: rows
        });
    } catch (error) {
        console.error('Get today appointments error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

module.exports = router;