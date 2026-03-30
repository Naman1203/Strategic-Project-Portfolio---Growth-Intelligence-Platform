// AI Service - Machine Learning algorithms for predictions and insights

import { getProjects, getEmployees, getAssignments, getFinancials } from './dataService';

// Normalize data to 0-1 range
const normalize = (value, min, max) => {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
};

// Calculate mean
const mean = (arr) => {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

// Calculate standard deviation
const standardDeviation = (arr) => {
  const avg = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

// Linear regression for growth forecasting
const linearRegression = (xValues, yValues) => {
  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
  const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

// Project Success Prediction
// Based on budget, team size, duration, complexity, and current progress
export const predictProjectSuccess = (project) => {
  const projects = getProjects();
  
  // Calculate project duration in months
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const durationMonths = (end - start) / (1000 * 60 * 60 * 24 * 30);
  
  // Normalize features
  const budgets = projects.map(p => p.budget);
  const teamSizes = projects.map(p => p.teamSize);
  const complexities = projects.map(p => p.complexity);
  
  const normalizedBudget = normalize(project.budget, Math.min(...budgets), Math.max(...budgets));
  const normalizedTeamSize = normalize(project.teamSize, Math.min(...teamSizes), Math.max(...teamSizes));
  const normalizedComplexity = normalize(project.complexity, 1, 10);
  const normalizedDuration = normalize(durationMonths, 1, 24);
  const normalizedProgress = project.completionPercentage / 100;
  
  // Budget efficiency (staying within budget is positive)
  const budgetEfficiency = project.actualCost <= project.budget ? 1 : 
    Math.max(0, 1 - (project.actualCost - project.budget) / project.budget);
  
  // Calculate success score with weighted factors
  const weights = {
    progress: 0.30,
    budgetEfficiency: 0.25,
    teamSize: 0.15,
    complexity: -0.15, // Negative weight (high complexity reduces success)
    duration: -0.10, // Negative weight (long duration may reduce success)
    budget: 0.05,
  };
  
  const successScore = 
    weights.progress * normalizedProgress +
    weights.budgetEfficiency * budgetEfficiency +
    weights.teamSize * normalizedTeamSize +
    weights.complexity * normalizedComplexity +
    weights.duration * normalizedDuration +
    weights.budget * normalizedBudget;
  
  // Convert to percentage (0-100)
  const successProbability = Math.max(0, Math.min(100, successScore * 100));
  
  // Determine confidence level
  let confidence = 'Medium';
  if (normalizedProgress > 0.7) confidence = 'High';
  else if (normalizedProgress < 0.3) confidence = 'Low';
  
  // Generate insights
  const insights = [];
  if (project.actualCost > project.budget) {
    insights.push('Over budget - monitor costs closely');
  }
  if (project.complexity > 7 && project.teamSize < 8) {
    insights.push('High complexity with small team - consider more resources');
  }
  if (normalizedProgress > 0.8 && budgetEfficiency > 0.8) {
    insights.push('Strong performance - on track for success');
  }
  if (durationMonths > 18) {
    insights.push('Long duration project - ensure sustained momentum');
  }
  
  return {
    successProbability: Math.round(successProbability),
    confidence,
    insights,
    factors: {
      progress: Math.round(normalizedProgress * 100),
      budgetEfficiency: Math.round(budgetEfficiency * 100),
      teamAdequacy: Math.round(normalizedTeamSize * 100),
      complexityImpact: Math.round((1 - normalizedComplexity) * 100),
    }
  };
};

// Risk Prediction
// Identifies projects with high probability of delay or failure
export const predictProjectRisk = (project) => {
  const projects = getProjects();
  
  // Calculate time elapsed vs progress
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const now = new Date();
  
  const totalDuration = end - start;
  const elapsed = now - start;
  const timeProgress = Math.max(0, Math.min(1, elapsed / totalDuration));
  const workProgress = project.completionPercentage / 100;
  
  // Risk factors
  const progressLag = timeProgress - workProgress; // Positive means behind schedule
  const budgetOverrun = (project.actualCost - project.budget) / project.budget;
  const complexityRisk = project.complexity / 10;
  
  // Get team assigned to project
  const assignments = getAssignments();
  const projectAssignments = assignments.filter(a => a.projectId === project.id);
  const teamCount = projectAssignments.length;
  const resourceRisk = teamCount < (project.teamSize * 0.7) ? 0.5 : 0; // Understaffed
  
  // Calculate risk score
  const riskFactors = {
    scheduleRisk: Math.max(0, progressLag) * 0.35,
    budgetRisk: Math.max(0, budgetOverrun) * 0.30,
    complexityRisk: complexityRisk * 0.20,
    resourceRisk: resourceRisk * 0.15,
  };
  
  const totalRisk = Object.values(riskFactors).reduce((sum, val) => sum + val, 0);
  const riskScore = Math.min(100, totalRisk * 100);
  
  // Determine risk level
  let riskLevel = 'Low';
  if (riskScore > 60) riskLevel = 'High';
  else if (riskScore > 35) riskLevel = 'Medium';
  
  // Generate recommendations
  const recommendations = [];
  if (progressLag > 0.2) {
    recommendations.push('Significantly behind schedule - review timeline and milestones');
  }
  if (budgetOverrun > 0.1) {
    recommendations.push('Budget overrun detected - implement cost controls');
  }
  if (resourceRisk > 0) {
    recommendations.push('Team understaffed - assign additional resources');
  }
  if (complexityRisk > 0.7 && progressLag > 0) {
    recommendations.push('High complexity project falling behind - consider breaking into smaller phases');
  }
  if (riskScore < 25) {
    recommendations.push('Project is on track - maintain current approach');
  }
  
  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    recommendations,
    factors: {
      scheduleRisk: Math.round(riskFactors.scheduleRisk * 100),
      budgetRisk: Math.round(riskFactors.budgetRisk * 100),
      complexityRisk: Math.round(riskFactors.complexityRisk * 100),
      resourceRisk: Math.round(riskFactors.resourceRisk * 100),
    },
    metrics: {
      progressLag: Math.round(progressLag * 100),
      budgetOverrun: Math.round(budgetOverrun * 100),
    }
  };
};

// Growth Forecasting
// Predicts future revenue and ROI based on historical data
export const forecastGrowth = () => {
  const financials = getFinancials();
  const projects = getProjects();
  
  if (financials.length === 0) {
    return {
      nextQuarterRevenue: 0,
      nextQuarterROI: 0,
      growthRate: 0,
      trend: 'stable',
      forecast: []
    };
  }
  
  // Aggregate by quarter
  const quarterlyData = {};
  financials.forEach(f => {
    if (!quarterlyData[f.quarter]) {
      quarterlyData[f.quarter] = { revenue: 0, cost: 0, count: 0 };
    }
    quarterlyData[f.quarter].revenue += f.revenue;
    quarterlyData[f.quarter].cost += f.cost;
    quarterlyData[f.quarter].count++;
  });
  
  // Sort quarters
  const quarters = Object.keys(quarterlyData).sort();
  const revenues = quarters.map(q => quarterlyData[q].revenue);
  const costs = quarters.map(q => quarterlyData[q].cost);
  
  // Linear regression for revenue
  const xValues = revenues.map((_, i) => i);
  const { slope: revenueSlope, intercept: revenueIntercept } = linearRegression(xValues, revenues);
  
  // Forecast next quarter
  const nextX = revenues.length;
  const forecastedRevenue = revenueSlope * nextX + revenueIntercept;
  
  // Calculate average cost ratio
  const avgCostRatio = mean(costs.map((c, i) => c / revenues[i]));
  const forecastedCost = forecastedRevenue * avgCostRatio;
  const forecastedROI = ((forecastedRevenue - forecastedCost) / forecastedCost) * 100;
  
  // Calculate growth rate
  const currentRevenue = revenues[revenues.length - 1];
  const previousRevenue = revenues[revenues.length - 2] || currentRevenue;
  const growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  
  // Determine trend
  let trend = 'stable';
  if (revenueSlope > currentRevenue * 0.05) trend = 'growing';
  else if (revenueSlope < -currentRevenue * 0.05) trend = 'declining';
  
  // Generate forecast for next 4 quarters
  const forecast = [];
  for (let i = 1; i <= 4; i++) {
    const futureX = revenues.length + i - 1;
    const futureRevenue = revenueSlope * futureX + revenueIntercept;
    const futureCost = futureRevenue * avgCostRatio;
    const futureROI = ((futureRevenue - futureCost) / futureCost) * 100;
    
    forecast.push({
      quarter: `Q${((quarters.length + i - 1) % 4) + 1} ${2026 + Math.floor((quarters.length + i - 1) / 4)}`,
      revenue: Math.round(futureRevenue),
      cost: Math.round(futureCost),
      roi: Math.round(futureROI * 10) / 10,
    });
  }
  
  return {
    nextQuarterRevenue: Math.round(forecastedRevenue),
    nextQuarterROI: Math.round(forecastedROI * 10) / 10,
    growthRate: Math.round(growthRate * 10) / 10,
    trend,
    forecast,
    currentQuarter: {
      revenue: Math.round(currentRevenue),
      avgROI: Math.round(mean(financials.map(f => f.roi)) * 10) / 10,
    }
  };
};

// Resource Optimization
// Suggests optimal resource allocation
export const optimizeResourceAllocation = () => {
  const projects = getProjects();
  const employees = getEmployees();
  const assignments = getAssignments();
  
  const recommendations = [];
  
  // Find understaffed high-priority projects
  projects.forEach(project => {
    const projectEmployees = assignments.filter(a => a.projectId === project.id);
    const staffingRatio = projectEmployees.length / project.teamSize;
    
    if (staffingRatio < 0.7 && (project.status === 'At Risk' || project.riskLevel === 'High')) {
      recommendations.push({
        type: 'urgent',
        project: project.name,
        message: `Critical: ${project.name} is understaffed (${projectEmployees.length}/${project.teamSize}) and at risk`,
        action: 'Assign additional resources immediately'
      });
    } else if (staffingRatio < 0.8) {
      recommendations.push({
        type: 'warning',
        project: project.name,
        message: `${project.name} needs more resources (${projectEmployees.length}/${project.teamSize})`,
        action: 'Consider assigning available employees'
      });
    }
  });
  
  // Find available high-performing employees
  const availableEmployees = employees.filter(e => e.availability === 'Available');
  if (availableEmployees.length > 0) {
    const highPerformers = availableEmployees.filter(e => e.productivityScore > 85);
    if (highPerformers.length > 0) {
      recommendations.push({
        type: 'opportunity',
        message: `${highPerformers.length} high-performing employee(s) available`,
        action: 'Assign to critical projects for maximum impact',
        employees: highPerformers.map(e => e.name)
      });
    }
  }
  
  // Calculate department utilization
  const departments = [...new Set(projects.map(p => p.department))];
  departments.forEach(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptProjects = projects.filter(p => p.department === dept);
    const assignedCount = deptEmployees.filter(e => e.availability === 'Assigned').length;
    const utilizationRate = (assignedCount / deptEmployees.length) * 100;
    
    if (utilizationRate > 90) {
      recommendations.push({
        type: 'warning',
        department: dept,
        message: `${dept} department is at ${Math.round(utilizationRate)}% capacity`,
        action: 'Consider hiring or reallocating resources'
      });
    } else if (utilizationRate < 50) {
      recommendations.push({
        type: 'info',
        department: dept,
        message: `${dept} department has ${100 - Math.round(utilizationRate)}% available capacity`,
        action: 'Opportunity to take on new projects'
      });
    }
  });
  
  return {
    recommendations,
    summary: {
      totalEmployees: employees.length,
      assigned: employees.filter(e => e.availability === 'Assigned').length,
      available: employees.filter(e => e.availability === 'Available').length,
      utilizationRate: Math.round((employees.filter(e => e.availability === 'Assigned').length / employees.length) * 100)
    }
  };
};

// Department Performance Analysis
export const analyzeDepartmentPerformance = () => {
  const projects = getProjects();
  const financials = getFinancials();
  
  const departments = [...new Set(projects.map(p => p.department))];
  
  const analysis = departments.map(dept => {
    const deptProjects = projects.filter(p => p.department === dept);
    const deptFinancials = financials.filter(f => 
      deptProjects.some(p => p.id === f.projectId)
    );
    
    const avgCompletion = mean(deptProjects.map(p => p.completionPercentage));
    const totalRevenue = deptFinancials.reduce((sum, f) => sum + f.revenue, 0);
    const totalCost = deptFinancials.reduce((sum, f) => sum + f.cost, 0);
    const avgROI = deptFinancials.length > 0 ? mean(deptFinancials.map(f => f.roi)) : 0;
    
    const highRiskCount = deptProjects.filter(p => p.riskLevel === 'High').length;
    const onTrackCount = deptProjects.filter(p => p.status === 'In Progress' && p.completionPercentage >= 50).length;
    
    return {
      department: dept,
      projectCount: deptProjects.length,
      avgCompletion: Math.round(avgCompletion),
      totalRevenue,
      totalCost,
      avgROI: Math.round(avgROI * 10) / 10,
      highRiskProjects: highRiskCount,
      onTrackProjects: onTrackCount,
      performance: avgROI > 50 ? 'Excellent' : avgROI > 30 ? 'Good' : 'Needs Improvement'
    };
  });
  
  return analysis;
};

// Generate comprehensive insights
export const generateInsights = () => {
  const projects = getProjects();
  const employees = getEmployees();
  const financials = getFinancials();
  
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.completionPercentage === 100).length;
  const atRiskProjects = projects.filter(p => p.riskLevel === 'High' || p.status === 'At Risk').length;
  
  const totalRevenue = financials.reduce((sum, f) => sum + f.revenue, 0);
  const totalCost = financials.reduce((sum, f) => sum + f.cost, 0);
  const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  
  const avgProductivity = mean(employees.map(e => e.productivityScore));
  
  return {
    overview: {
      totalProjects,
      completedProjects,
      atRiskProjects,
      activeProjects: totalProjects - completedProjects,
    },
    financial: {
      totalRevenue,
      totalCost,
      overallROI: Math.round(overallROI * 10) / 10,
      profit: totalRevenue - totalCost,
    },
    workforce: {
      totalEmployees: employees.length,
      avgProductivity: Math.round(avgProductivity),
      utilization: Math.round((employees.filter(e => e.availability === 'Assigned').length / employees.length) * 100),
    }
  };
};