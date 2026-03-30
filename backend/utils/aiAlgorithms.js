// AI Algorithms for Project Analysis and Predictions

// Predict project success based on multiple factors
function predictProjectSuccess(project) {
  const factors = calculateProjectFactors(project);
  
  // Weighted scoring system
  const weights = {
    budgetUtilization: 0.25,
    timeProgress: 0.20,
    completionRate: 0.30,
    teamSize: 0.10,
    riskLevel: 0.15
  };

  // Calculate weighted success probability
  let successScore = 0;
  
  // Budget utilization (inverse - lower is better)
  const budgetScore = Math.max(0, 100 - Math.abs(factors.budgetUtilization - factors.timeProgress));
  successScore += budgetScore * weights.budgetUtilization;

  // Time progress alignment
  const timeScore = Math.max(0, 100 - Math.abs(factors.timeProgress - factors.completionRate));
  successScore += timeScore * weights.timeProgress;

  // Completion rate (higher is better)
  successScore += factors.completionRate * weights.completionRate;

  // Team size adequacy (5-15 is optimal)
  const teamScore = factors.teamSize >= 5 && factors.teamSize <= 15 ? 100 : 
                    factors.teamSize < 5 ? factors.teamSize * 20 : 
                    Math.max(0, 100 - (factors.teamSize - 15) * 5);
  successScore += teamScore * weights.teamSize;

  // Risk level (inverse)
  const riskScores = { Low: 100, Medium: 70, High: 40, Critical: 10 };
  const riskScore = riskScores[factors.riskLevel] || 50;
  successScore += riskScore * weights.riskLevel;

  // Calculate confidence based on data completeness
  const confidence = calculateConfidence(project);

  // Generate recommendations
  const recommendations = generateSuccessRecommendations(factors, successScore);

  return {
    successProbability: Math.min(100, Math.max(0, successScore)),
    riskScore: 100 - successScore,
    confidence,
    factors,
    recommendations
  };
}

// Analyze project risk
function analyzeProjectRisk(project) {
  const factors = calculateProjectFactors(project);
  
  let riskScore = 0;
  const riskFactors = [];

  // Budget overrun risk
  if (factors.budgetUtilization > 90) {
    riskScore += 30;
    riskFactors.push('Budget utilization is critically high');
  } else if (factors.budgetUtilization > 75) {
    riskScore += 20;
    riskFactors.push('Budget utilization is high');
  }

  // Schedule delay risk
  const scheduleVariance = factors.timeProgress - factors.completionRate;
  if (scheduleVariance > 20) {
    riskScore += 25;
    riskFactors.push('Project is significantly behind schedule');
  } else if (scheduleVariance > 10) {
    riskScore += 15;
    riskFactors.push('Project is behind schedule');
  }

  // Risk level factor
  const riskLevelScores = { Low: 5, Medium: 15, High: 25, Critical: 35 };
  const baseRisk = riskLevelScores[factors.riskLevel] || 15;
  riskScore += baseRisk;
  
  if (factors.riskLevel === 'High' || factors.riskLevel === 'Critical') {
    riskFactors.push(`Project has ${factors.riskLevel.toLowerCase()} inherent risk`);
  }

  // Team size risk
  if (factors.teamSize < 3) {
    riskScore += 15;
    riskFactors.push('Team size is too small');
  } else if (factors.teamSize > 20) {
    riskScore += 10;
    riskFactors.push('Team size may be too large for effective coordination');
  }

  // Status-based risk
  if (project.status === 'On Hold') {
    riskScore += 20;
    riskFactors.push('Project is currently on hold');
  }

  // Calculate confidence
  const confidence = calculateConfidence(project);

  // Generate recommendations
  const recommendations = generateRiskRecommendations(riskFactors, factors);

  return {
    riskScore: Math.min(100, riskScore),
    riskFactors,
    confidence,
    factors,
    recommendations
  };
}

// Calculate project factors
function calculateProjectFactors(project) {
  // Budget utilization
  const budgetUtilization = project.budget > 0 
    ? (project.spent / project.budget) * 100 
    : 0;

  // Time progress
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const now = new Date();
  
  const totalDuration = endDate - startDate;
  const elapsed = now - startDate;
  const timeProgress = totalDuration > 0 
    ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
    : 0;

  // Completion rate
  const completionRate = project.completion || 0;

  // Team size
  const teamSize = project.teamSize || 0;

  // Risk level
  const riskLevel = project.riskLevel || 'Medium';

  return {
    budgetUtilization: Math.round(budgetUtilization),
    timeProgress: Math.round(timeProgress),
    completionRate: Math.round(completionRate),
    teamSize,
    riskLevel
  };
}

// Calculate confidence in predictions
function calculateConfidence(project) {
  let confidence = 100;

  // Reduce confidence if data is incomplete or extreme
  if (!project.budget || project.budget === 0) confidence -= 15;
  if (!project.spent) confidence -= 10;
  if (!project.teamSize || project.teamSize === 0) confidence -= 10;
  if (!project.completion) confidence -= 5;
  
  // Reduce confidence for very new or very old projects
  const projectAge = (new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24);
  if (projectAge < 7) confidence -= 20; // Less than a week old
  
  return Math.max(50, confidence); // Minimum 50% confidence
}

// Generate success recommendations
function generateSuccessRecommendations(factors, successScore) {
  const recommendations = [];

  if (successScore < 50) {
    recommendations.push('Project requires immediate attention and intervention');
  }

  if (factors.budgetUtilization > factors.timeProgress + 15) {
    recommendations.push('Budget is being consumed faster than progress - review spending');
  }

  if (factors.completionRate < factors.timeProgress - 15) {
    recommendations.push('Project is behind schedule - consider additional resources or timeline adjustment');
  }

  if (factors.teamSize < 5) {
    recommendations.push('Consider expanding the team for better coverage and risk mitigation');
  }

  if (factors.teamSize > 15) {
    recommendations.push('Large team size may lead to coordination challenges - ensure clear communication');
  }

  if (factors.riskLevel === 'High' || factors.riskLevel === 'Critical') {
    recommendations.push('Implement additional risk mitigation strategies');
  }

  if (recommendations.length === 0) {
    recommendations.push('Project is performing well - maintain current approach');
  }

  return recommendations;
}

// Generate risk recommendations
function generateRiskRecommendations(riskFactors, factors) {
  const recommendations = [];

  if (factors.budgetUtilization > 90) {
    recommendations.push('Implement strict budget controls and review all expenditures');
  } else if (factors.budgetUtilization > 75) {
    recommendations.push('Monitor budget closely and plan for potential overruns');
  }

  if (factors.timeProgress > factors.completionRate + 15) {
    recommendations.push('Accelerate development or adjust timeline expectations');
    recommendations.push('Consider adding resources or reducing scope');
  }

  if (factors.teamSize < 3) {
    recommendations.push('Increase team size to reduce dependency risk');
  }

  if (factors.riskLevel === 'Critical') {
    recommendations.push('Conduct immediate risk assessment and mitigation planning');
  } else if (factors.riskLevel === 'High') {
    recommendations.push('Review and update risk mitigation strategies');
  }

  if (riskFactors.length > 3) {
    recommendations.push('Multiple risk factors identified - consider comprehensive project review');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring project metrics regularly');
  }

  return recommendations;
}

// Generate combined recommendations
function generateRecommendations(project, prediction, riskAnalysis) {
  const recommendations = [];

  // Combine unique recommendations from both analyses
  const allRecs = [
    ...prediction.recommendations,
    ...riskAnalysis.recommendations
  ];

  // Remove duplicates
  const uniqueRecs = [...new Set(allRecs)];

  // Prioritize by severity
  if (riskAnalysis.riskScore > 70) {
    recommendations.push({
      priority: 'High',
      message: 'Immediate action required - project at high risk'
    });
  } else if (prediction.successProbability < 50) {
    recommendations.push({
      priority: 'High',
      message: 'Project success probability is low - review strategy'
    });
  } else if (riskAnalysis.riskScore > 50 || prediction.successProbability < 70) {
    recommendations.push({
      priority: 'Medium',
      message: 'Monitor project closely and address identified issues'
    });
  } else {
    recommendations.push({
      priority: 'Low',
      message: 'Project is on track - continue current approach'
    });
  }

  // Add specific recommendations
  uniqueRecs.forEach(rec => {
    recommendations.push({
      priority: 'Normal',
      message: rec
    });
  });

  return recommendations;
}

module.exports = {
  predictProjectSuccess,
  analyzeProjectRisk,
  generateRecommendations,
  calculateProjectFactors,
  calculateConfidence
};
