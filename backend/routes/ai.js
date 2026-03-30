const express = require('express');
const {
  predictSuccess,
  analyzeRisk,
  getInsights,
  getProjectPredictions,
  getPortfolioInsights
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/predict-success', protect, predictSuccess);
router.post('/analyze-risk', protect, analyzeRisk);
router.get('/insights', protect, getInsights);
router.get('/predictions/:projectId', protect, getProjectPredictions);
router.get('/portfolio-insights', protect, getPortfolioInsights);

module.exports = router;
