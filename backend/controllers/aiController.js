const Project = require('../models/Project');
const Prediction = require('../models/Prediction');
const {
  predictProjectSuccess,
  analyzeProjectRisk,
  generateRecommendations
} = require('../utils/aiAlgorithms');

// @desc    Predict project success
// @route   POST /api/ai/predict-success
// @access  Private
exports.predictSuccess = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate success prediction
    const prediction = predictProjectSuccess(project);

    // Save prediction to database
    const predictionRecord = await Prediction.create({
      projectId: project._id,
      projectName: project.name,
      predictionType: 'success',
      successProbability: prediction.successProbability,
      riskScore: prediction.riskScore,
      recommendations: prediction.recommendations,
      factors: prediction.factors,
      confidence: prediction.confidence
    });

    res.status(200).json({
      success: true,
      data: predictionRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Analyze project risk
// @route   POST /api/ai/analyze-risk
// @access  Private
exports.analyzeRisk = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Analyze risk
    const riskAnalysis = analyzeProjectRisk(project);

    // Save prediction to database
    const predictionRecord = await Prediction.create({
      projectId: project._id,
      projectName: project.name,
      predictionType: 'risk',
      riskScore: riskAnalysis.riskScore,
      recommendations: riskAnalysis.recommendations,
      factors: riskAnalysis.factors,
      confidence: riskAnalysis.confidence
    });

    res.status(200).json({
      success: true,
      data: predictionRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all AI insights
// @route   GET /api/ai/insights
// @access  Private
exports.getInsights = async (req, res, next) => {
  try {
    const projects = await Project.find();
    const insights = [];

    for (let project of projects) {
      const prediction = predictProjectSuccess(project);
      const riskAnalysis = analyzeProjectRisk(project);

      insights.push({
        projectId: project._id,
        projectName: project.name,
        department: project.department,
        status: project.status,
        successProbability: prediction.successProbability,
        riskScore: riskAnalysis.riskScore,
        recommendations: generateRecommendations(project, prediction, riskAnalysis),
        healthStatus: getHealthStatus(prediction.successProbability, riskAnalysis.riskScore)
      });
    }

    res.status(200).json({
      success: true,
      count: insights.length,
      data: insights
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get AI predictions for a specific project
// @route   GET /api/ai/predictions/:projectId
// @access  Private
exports.getProjectPredictions = async (req, res, next) => {
  try {
    const predictions = await Prediction.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get portfolio-wide AI insights
// @route   GET /api/ai/portfolio-insights
// @access  Private
exports.getPortfolioInsights = async (req, res, next) => {
  try {
    const projects = await Project.find();
    
    let totalSuccessProbability = 0;
    let totalRiskScore = 0;
    let highRiskProjects = [];
    let highSuccessProjects = [];

    projects.forEach(project => {
      const prediction = predictProjectSuccess(project);
      const riskAnalysis = analyzeProjectRisk(project);

      totalSuccessProbability += prediction.successProbability;
      totalRiskScore += riskAnalysis.riskScore;

      if (riskAnalysis.riskScore > 70) {
        highRiskProjects.push({
          name: project.name,
          riskScore: riskAnalysis.riskScore,
          reasons: riskAnalysis.recommendations
        });
      }

      if (prediction.successProbability > 80) {
        highSuccessProjects.push({
          name: project.name,
          successProbability: prediction.successProbability
        });
      }
    });

    const avgSuccessProbability = projects.length > 0 
      ? totalSuccessProbability / projects.length 
      : 0;
    const avgRiskScore = projects.length > 0 
      ? totalRiskScore / projects.length 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        portfolioHealth: {
          averageSuccessProbability: avgSuccessProbability.toFixed(2),
          averageRiskScore: avgRiskScore.toFixed(2),
          totalProjects: projects.length,
          healthStatus: getPortfolioHealth(avgSuccessProbability, avgRiskScore)
        },
        highRiskProjects,
        highSuccessProjects,
        recommendations: generatePortfolioRecommendations(projects, avgSuccessProbability, avgRiskScore)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions
function getHealthStatus(successProbability, riskScore) {
  if (successProbability > 75 && riskScore < 30) {
    return 'Excellent';
  } else if (successProbability > 60 && riskScore < 50) {
    return 'Good';
  } else if (successProbability > 45 && riskScore < 70) {
    return 'Fair';
  } else {
    return 'Poor';
  }
}

function getPortfolioHealth(avgSuccess, avgRisk) {
  if (avgSuccess > 70 && avgRisk < 40) {
    return 'Strong';
  } else if (avgSuccess > 55 && avgRisk < 60) {
    return 'Moderate';
  } else {
    return 'Weak';
  }
}

function generatePortfolioRecommendations(projects, avgSuccess, avgRisk) {
  const recommendations = [];

  if (avgRisk > 60) {
    recommendations.push('Portfolio risk is high. Consider re-evaluating project priorities and resource allocation.');
  }

  if (avgSuccess < 50) {
    recommendations.push('Overall project success probability is low. Focus on improving project management practices.');
  }

  const overBudgetProjects = projects.filter(p => p.spent > p.budget).length;
  if (overBudgetProjects > projects.length * 0.3) {
    recommendations.push(`${overBudgetProjects} projects are over budget. Implement stricter budget controls.`);
  }

  const delayedProjects = projects.filter(p => {
    const now = new Date();
    const end = new Date(p.endDate);
    return now > end && p.status !== 'Completed';
  }).length;

  if (delayedProjects > 0) {
    recommendations.push(`${delayedProjects} projects are past their end date. Review project timelines and resources.`);
  }

  return recommendations;
}
