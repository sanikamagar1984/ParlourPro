const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Public routes (no auth required for viewing services)
router.get('/', serviceController.getAllServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/search', serviceController.searchServices);
router.get('/:id', serviceController.getServiceById);

// Protected routes (admin only)
router.post('/', authenticate, authorize(['admin', 'employee']), serviceController.createService);
router.put('/:id', authenticate, authorize(['admin']), serviceController.updateService);
router.delete('/:id', authenticate, authorize(['admin']), serviceController.deleteService);

module.exports = router;