const express = require('express');
const {
  getDashboardAnalytics,
  getProjectAnalytics,
  getEmployeeAnalytics,
  getFinancialAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/projects', protect, getProjectAnalytics);
router.get('/employees', protect, getEmployeeAnalytics);
router.get('/financials', protect, getFinancialAnalytics);

module.exports = router;
