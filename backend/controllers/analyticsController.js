const Project = require('../models/Project');
const Employee = require('../models/Employee');
const Financial = require('../models/Financial');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    // Get all data
    const projects = await Project.find();
    const employees = await Employee.find();
    const financials = await Financial.find();

    // Calculate metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const totalEmployees = employees.length;

    // Budget metrics
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Financial metrics
    const totalRevenue = financials
      .filter(f => f.type === 'revenue')
      .reduce((sum, f) => sum + f.amount, 0);
    const totalExpenses = financials
      .filter(f => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Risk distribution
    const riskDistribution = {
      Low: projects.filter(p => p.riskLevel === 'Low').length,
      Medium: projects.filter(p => p.riskLevel === 'Medium').length,
      High: projects.filter(p => p.riskLevel === 'High').length,
      Critical: projects.filter(p => p.riskLevel === 'Critical').length
    };

    // Department distribution
    const departmentProjects = {};
    projects.forEach(p => {
      departmentProjects[p.department] = (departmentProjects[p.department] || 0) + 1;
    });

    // Status distribution
    const statusDistribution = {
      Planning: projects.filter(p => p.status === 'Planning').length,
      Active: projects.filter(p => p.status === 'Active').length,
      'On Hold': projects.filter(p => p.status === 'On Hold').length,
      Completed: projects.filter(p => p.status === 'Completed').length,
      Cancelled: projects.filter(p => p.status === 'Cancelled').length
    };

    // Average completion
    const avgCompletion = totalProjects > 0
      ? projects.reduce((sum, p) => sum + p.completion, 0) / totalProjects
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalEmployees,
          totalBudget,
          totalSpent,
          budgetUtilization: budgetUtilization.toFixed(2),
          avgCompletion: avgCompletion.toFixed(2)
        },
        financial: {
          totalRevenue,
          totalExpenses,
          netProfit,
          roi: totalExpenses > 0 ? ((netProfit / totalExpenses) * 100).toFixed(2) : 0
        },
        distributions: {
          risk: riskDistribution,
          department: departmentProjects,
          status: statusDistribution
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get project analytics
// @route   GET /api/analytics/projects
// @access  Private
exports.getProjectAnalytics = async (req, res, next) => {
  try {
    const projects = await Project.find().populate('assignedEmployees');

    const analytics = projects.map(project => {
      const daysTotal = Math.ceil(
        (new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
      );
      const daysElapsed = Math.ceil(
        (new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
      );
      const timeProgress = Math.min((daysElapsed / daysTotal) * 100, 100);
      const budgetUtilization = (project.spent / project.budget) * 100;

      return {
        id: project._id,
        name: project.name,
        department: project.department,
        status: project.status,
        completion: project.completion,
        timeProgress: timeProgress.toFixed(2),
        budgetUtilization: budgetUtilization.toFixed(2),
        riskLevel: project.riskLevel,
        teamSize: project.teamSize,
        budget: project.budget,
        spent: project.spent,
        variance: project.budget - project.spent,
        health: getProjectHealth(project.completion, timeProgress, budgetUtilization)
      };
    });

    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get employee analytics
// @route   GET /api/analytics/employees
// @access  Private
exports.getEmployeeAnalytics = async (req, res, next) => {
  try {
    const employees = await Employee.find().populate('assignedProjects');

    // Department distribution
    const departmentCounts = {};
    const departmentSalaries = {};
    
    employees.forEach(emp => {
      departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
      departmentSalaries[emp.department] = (departmentSalaries[emp.department] || 0) + emp.salary;
    });

    // Availability
    const availabilityStats = {
      Available: employees.filter(e => e.availability === 'Available').length,
      Busy: employees.filter(e => e.availability === 'Busy').length,
      'On Leave': employees.filter(e => e.availability === 'On Leave').length
    };

    // Skills analysis
    const skillsCount = {};
    employees.forEach(emp => {
      emp.skills.forEach(skill => {
        skillsCount[skill] = (skillsCount[skill] || 0) + 1;
      });
    });

    // Top skills
    const topSkills = Object.entries(skillsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Workload distribution
    const workloadDistribution = employees.map(emp => ({
      name: emp.name,
      projectCount: emp.assignedProjects.length,
      department: emp.department,
      availability: emp.availability
    }));

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: employees.length,
        departmentDistribution: departmentCounts,
        departmentSalaries,
        availabilityStats,
        topSkills,
        workloadDistribution,
        totalSalary: employees.reduce((sum, e) => sum + e.salary, 0)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get financial analytics
// @route   GET /api/analytics/financials
// @access  Private
exports.getFinancialAnalytics = async (req, res, next) => {
  try {
    const financials = await Financial.find().populate('projectId');
    const projects = await Project.find();

    // Monthly trends
    const monthlyData = {};
    financials.forEach(record => {
      const month = new Date(record.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0 };
      }
      if (record.type === 'revenue') {
        monthlyData[month].revenue += record.amount;
      } else {
        monthlyData[month].expenses += record.amount;
      }
    });

    // Category breakdown
    const categoryBreakdown = {};
    financials.forEach(record => {
      if (!categoryBreakdown[record.category]) {
        categoryBreakdown[record.category] = { revenue: 0, expenses: 0 };
      }
      if (record.type === 'revenue') {
        categoryBreakdown[record.category].revenue += record.amount;
      } else {
        categoryBreakdown[record.category].expenses += record.amount;
      }
    });

    // Project ROI
    const projectROI = projects.map(project => {
      const projectFinancials = financials.filter(
        f => f.projectId && f.projectId._id.toString() === project._id.toString()
      );
      const revenue = projectFinancials
        .filter(f => f.type === 'revenue')
        .reduce((sum, f) => sum + f.amount, 0);
      const expenses = projectFinancials
        .filter(f => f.type === 'expense')
        .reduce((sum, f) => sum + f.amount, 0);
      const roi = expenses > 0 ? ((revenue - expenses) / expenses) * 100 : 0;

      return {
        projectName: project.name,
        revenue,
        expenses,
        profit: revenue - expenses,
        roi: roi.toFixed(2)
      };
    });

    res.status(200).json({
      success: true,
      data: {
        monthlyTrends: monthlyData,
        categoryBreakdown,
        projectROI: projectROI.sort((a, b) => b.roi - a.roi)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to determine project health
function getProjectHealth(completion, timeProgress, budgetUtilization) {
  const completionGap = timeProgress - completion;
  const budgetGap = budgetUtilization - completion;

  if (completionGap > 20 || budgetGap > 20) {
    return 'At Risk';
  } else if (completionGap > 10 || budgetGap > 10) {
    return 'Needs Attention';
  } else {
    return 'On Track';
  }
}
