const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.getAllEmployees);
router.put('/:id', staffController.updateEmployee);
router.put('/:id/password', staffController.updateEmployeePassword);
router.delete('/:id', staffController.deleteEmployee);

module.exports = router;
