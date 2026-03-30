const express = require('express');
const {
  getFinancials,
  getFinancial,
  createFinancial,
  updateFinancial,
  deleteFinancial,
  getFinancialsByProject,
  getFinancialSummary
} = require('../controllers/financialController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getFinancials)
  .post(protect, createFinancial);

router.get('/summary', protect, getFinancialSummary);
router.get('/project/:projectId', protect, getFinancialsByProject);

router.route('/:id')
  .get(protect, getFinancial)
  .put(protect, updateFinancial)
  .delete(protect, deleteFinancial);

module.exports = router;
