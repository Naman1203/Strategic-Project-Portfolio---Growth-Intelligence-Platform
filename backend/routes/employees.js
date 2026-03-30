const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  getAvailableEmployees
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getEmployees)
  .post(protect, createEmployee);

router.get('/available', protect, getAvailableEmployees);
router.get('/department/:department', protect, getEmployeesByDepartment);

router.route('/:id')
  .get(protect, getEmployee)
  .put(protect, updateEmployee)
  .delete(protect, deleteEmployee);

module.exports = router;
