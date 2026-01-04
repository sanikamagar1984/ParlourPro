const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Record routes
router.get('/', recordController.getAllRecords);
router.get('/stats/income', recordController.getIncomeStats);
router.get('/export', recordController.exportRecords);
router.get('/:id', recordController.getRecordById);
router.post('/', recordController.createRecord);
router.put('/:id', recordController.updateRecord);
router.delete('/:id', recordController.deleteRecord);

module.exports = router;