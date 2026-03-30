const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignEmployee,
  removeEmployee
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.put('/:id/assign/:employeeId', protect, assignEmployee);
router.put('/:id/remove/:employeeId', protect, removeEmployee);

module.exports = router;
