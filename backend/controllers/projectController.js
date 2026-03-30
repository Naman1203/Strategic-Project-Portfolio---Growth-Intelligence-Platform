const Project = require('../models/Project');
const Employee = require('../models/Employee');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('assignedEmployees', 'name email department')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedEmployees', 'name email department role skills')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Remove project from assigned employees
    await Employee.updateMany(
      { assignedProjects: project._id },
      { $pull: { assignedProjects: project._id } }
    );

    await project.deleteOne();

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

// @desc    Assign employee to project
// @route   PUT /api/projects/:id/assign/:employeeId
// @access  Private
exports.assignEmployee = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    const employee = await Employee.findById(req.params.employeeId);

    if (!project || !employee) {
      return res.status(404).json({
        success: false,
        message: 'Project or Employee not found'
      });
    }

    // Add employee to project
    if (!project.assignedEmployees.includes(employee._id)) {
      project.assignedEmployees.push(employee._id);
      project.teamSize = project.assignedEmployees.length;
      await project.save();
    }

    // Add project to employee
    if (!employee.assignedProjects.includes(project._id)) {
      employee.assignedProjects.push(project._id);
      await employee.save();
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove employee from project
// @route   PUT /api/projects/:id/remove/:employeeId
// @access  Private
exports.removeEmployee = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    const employee = await Employee.findById(req.params.employeeId);

    if (!project || !employee) {
      return res.status(404).json({
        success: false,
        message: 'Project or Employee not found'
      });
    }

    // Remove employee from project
    project.assignedEmployees = project.assignedEmployees.filter(
      emp => emp.toString() !== employee._id.toString()
    );
    project.teamSize = project.assignedEmployees.length;
    await project.save();

    // Remove project from employee
    employee.assignedProjects = employee.assignedProjects.filter(
      proj => proj.toString() !== project._id.toString()
    );
    await employee.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
