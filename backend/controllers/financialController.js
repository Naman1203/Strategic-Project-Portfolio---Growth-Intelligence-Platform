const Financial = require('../models/Financial');
const Project = require('../models/Project');

// @desc    Get all financial records
// @route   GET /api/financials
// @access  Private
exports.getFinancials = async (req, res, next) => {
  try {
    const financials = await Financial.find()
      .populate('projectId', 'name department budget')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: financials.length,
      data: financials
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single financial record
// @route   GET /api/financials/:id
// @access  Private
exports.getFinancial = async (req, res, next) => {
  try {
    const financial = await Financial.findById(req.params.id)
      .populate('projectId', 'name department budget')
      .populate('createdBy', 'name email');

    if (!financial) {
      return res.status(404).json({
        success: false,
        message: 'Financial record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: financial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new financial record
// @route   POST /api/financials
// @access  Private
exports.createFinancial = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Verify project exists
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Add project name
    req.body.projectName = project.name;

    const financial = await Financial.create(req.body);

    // Update project spent if it's an expense
    if (req.body.type === 'expense') {
      project.spent = (project.spent || 0) + req.body.amount;
      await project.save();
    }

    res.status(201).json({
      success: true,
      data: financial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update financial record
// @route   PUT /api/financials/:id
// @access  Private
exports.updateFinancial = async (req, res, next) => {
  try {
    let financial = await Financial.findById(req.params.id);

    if (!financial) {
      return res.status(404).json({
        success: false,
        message: 'Financial record not found'
      });
    }

    // If amount or type is being changed, update project spent
    if (req.body.amount || req.body.type) {
      const project = await Project.findById(financial.projectId);
      
      // Revert old amount
      if (financial.type === 'expense') {
        project.spent -= financial.amount;
      }

      // Apply new amount
      const newType = req.body.type || financial.type;
      const newAmount = req.body.amount || financial.amount;
      
      if (newType === 'expense') {
        project.spent += newAmount;
      }

      await project.save();
    }

    financial = await Financial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: financial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete financial record
// @route   DELETE /api/financials/:id
// @access  Private
exports.deleteFinancial = async (req, res, next) => {
  try {
    const financial = await Financial.findById(req.params.id);

    if (!financial) {
      return res.status(404).json({
        success: false,
        message: 'Financial record not found'
      });
    }

    // Update project spent
    if (financial.type === 'expense') {
      const project = await Project.findById(financial.projectId);
      if (project) {
        project.spent -= financial.amount;
        await project.save();
      }
    }

    await financial.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get financials by project
// @route   GET /api/financials/project/:projectId
// @access  Private
exports.getFinancialsByProject = async (req, res, next) => {
  try {
    const financials = await Financial.find({ projectId: req.params.projectId })
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: financials.length,
      data: financials
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get financial summary
// @route   GET /api/financials/summary
// @access  Private
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const financials = await Financial.find();

    const summary = {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      byCategory: {},
      byProject: {}
    };

    financials.forEach(record => {
      if (record.type === 'revenue') {
        summary.totalRevenue += record.amount;
      } else {
        summary.totalExpenses += record.amount;
      }

      // By category
      if (!summary.byCategory[record.category]) {
        summary.byCategory[record.category] = 0;
      }
      summary.byCategory[record.category] += record.amount;

      // By project
      if (!summary.byProject[record.projectName]) {
        summary.byProject[record.projectName] = { revenue: 0, expenses: 0 };
      }
      if (record.type === 'revenue') {
        summary.byProject[record.projectName].revenue += record.amount;
      } else {
        summary.byProject[record.projectName].expenses += record.amount;
      }
    });

    summary.netProfit = summary.totalRevenue - summary.totalExpenses;

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
