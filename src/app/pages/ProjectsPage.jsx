import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getEmployees,
  assignEmployee,
  removeEmployee,
} from '../../services/apiService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Form fields now match the Mongoose model exactly
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    budget: '',
    spent: '',           // ✅ was actualCost
    startDate: '',
    endDate: '',
    status: 'Planning',  // ✅ valid enum: Planning/Active/On Hold/Completed/Cancelled
    riskLevel: 'Low',
    completion: 0,       // ✅ was completionPercentage
    teamSize: '',
    manager: '',         // ✅ required field that was missing
    description: '',
  });

  useEffect(() => {
    loadProjects();
    loadEmployees();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      // ✅ Backend returns { success: true, data: [...] }
      const data = res?.data || (Array.isArray(res) ? res : []);
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      const data = res?.data || (Array.isArray(res) ? res : []);
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      department: '',
      budget: '',
      spent: '',
      startDate: '',
      endDate: '',
      status: 'Planning',
      riskLevel: 'Low',
      completion: 0,
      teamSize: '',
      manager: '',
      description: '',
    });
    setEditingProject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // ✅ Send correct field names to backend
    const projectData = {
      name: formData.name,
      department: formData.department,
      budget: parseFloat(formData.budget),
      spent: parseFloat(formData.spent) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      riskLevel: formData.riskLevel,
      completion: parseInt(formData.completion) || 0,
      teamSize: parseInt(formData.teamSize) || 0,
      manager: formData.manager,
      description: formData.description || '',
    };

    try {
      if (editingProject) {
        await updateProject(editingProject._id || editingProject.id, projectData);
        toast.success('Project updated successfully');
      } else {
        await createProject(projectData);
        toast.success('Project created successfully');
      }
      await loadProjects();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Error saving project: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      department: project.department || '',
      budget: project.budget || '',
      spent: project.spent || '',
      startDate: project.startDate?.substring(0, 10) || '',
      endDate: project.endDate?.substring(0, 10) || '',
      status: project.status || 'Planning',
      riskLevel: project.riskLevel || 'Low',
      completion: project.completion || 0,
      teamSize: project.teamSize || '',
      manager: project.manager || '',
      description: project.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        toast.success('Project deleted successfully');
        await loadProjects();
      } catch (err) {
        toast.error('Error deleting project: ' + err.message);
      }
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsDetailDialogOpen(true);
  };

  const handleAssignEmployees = (project) => {
    setSelectedProject(project);
    setIsAssignDialogOpen(true);
  };

  const handleToggleAssignment = async (employeeId) => {
    try {
      const projectId = selectedProject._id || selectedProject.id;
      // ✅ Backend uses assignedEmployees field
      const isAssigned = (selectedProject.assignedEmployees || []).some(
        e => (e._id || e.id || e) === employeeId
      );

      if (isAssigned) {
        await removeEmployee(projectId, employeeId);
        toast.success('Employee removed from project');
      } else {
        await assignEmployee(projectId, employeeId);
        toast.success('Employee assigned to project');
      }

      await loadProjects();
      const res = await getProjects();
      const data = res?.data || (Array.isArray(res) ? res : []);
      const updated = data.find(p => (p._id || p.id) === projectId);
      if (updated) setSelectedProject(updated);

    } catch (err) {
      toast.error('Error updating assignment: ' + err.message);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': case 'Critical': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Active': return 'secondary';
      case 'On Hold': case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Portfolio</h1>
          <p className="text-gray-600 mt-2">Manage and track all projects</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus size={18} className="mr-2" />
          New Project
        </Button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm mt-1">Click "New Project" to add your first one</p>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectId = project._id || project.id;
          const teamMembers = project.assignedEmployees || [];

          return (
            <Card key={projectId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1">{project.department}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(projectId)}>
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium">{project.completion}%</span>
                  </div>
                  <Progress value={project.completion} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Budget</p>
                    <p className="font-medium">${(project.budget / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Spent</p>
                    <p className="font-medium">${((project.spent || 0) / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                  <Badge variant={getRiskColor(project.riskLevel)}>Risk: {project.riskLevel}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <UsersIcon size={16} className="text-gray-600" />
                  <span className="text-gray-600">{teamMembers.length} / {project.teamSize} team members</span>
                </div>

                {project.manager && (
                  <div className="text-sm">
                    <span className="text-gray-600">Manager: </span>
                    <span className="font-medium">{project.manager}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(project)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleAssignEmployees(project)}>
                    <UsersIcon size={14} className="mr-1" />
                    Assign Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            <DialogDescription>
              {editingProject ? 'Update project details' : 'Add a new project to your portfolio'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                {/* ✅ Correct department enums from model */}
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(v) => handleSelectChange('department', v)}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ✅ Manager field added (required by model) */}
            <div className="space-y-2">
              <Label htmlFor="manager">Project Manager</Label>
              <Input id="manager" name="manager" value={formData.manager} onChange={handleInputChange} placeholder="e.g. John Smith" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief project description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input id="budget" name="budget" type="number" value={formData.budget} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                {/* ✅ was actualCost, now spent */}
                <Label htmlFor="spent">Amount Spent ($)</Label>
                <Input id="spent" name="spent" type="number" value={formData.spent} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* ✅ Correct status enums from model */}
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {/* ✅ Correct riskLevel enums from model */}
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select value={formData.riskLevel} onValueChange={(v) => handleSelectChange('riskLevel', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* ✅ was completionPercentage, now completion */}
                <Label htmlFor="completion">Completion %</Label>
                <Input id="completion" name="completion" type="number" min="0" max="100" value={formData.completion} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Input id="teamSize" name="teamSize" type="number" min="0" value={formData.teamSize} onChange={handleInputChange} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog */}
      {selectedProject && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProject.name}</DialogTitle>
              <DialogDescription>Project Details</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-600">Department</p><p className="font-medium">{selectedProject.department}</p></div>
                <div><p className="text-sm text-gray-600">Manager</p><p className="font-medium">{selectedProject.manager}</p></div>
                <div><p className="text-sm text-gray-600">Duration</p><p className="font-medium">{selectedProject.startDate?.substring(0, 10)} → {selectedProject.endDate?.substring(0, 10)}</p></div>
                <div><p className="text-sm text-gray-600">Budget</p><p className="font-medium">${(selectedProject.budget / 1000).toFixed(0)}K</p></div>
                <div><p className="text-sm text-gray-600">Spent</p><p className="font-medium">${((selectedProject.spent || 0) / 1000).toFixed(0)}K</p></div>
                <div><p className="text-sm text-gray-600">Status</p><Badge variant={getStatusColor(selectedProject.status)}>{selectedProject.status}</Badge></div>
                <div><p className="text-sm text-gray-600">Risk Level</p><Badge variant={getRiskColor(selectedProject.riskLevel)}>{selectedProject.riskLevel}</Badge></div>
              </div>
              {selectedProject.description && (
                <div><p className="text-sm text-gray-600">Description</p><p className="mt-1">{selectedProject.description}</p></div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-2">Completion</p>
                <Progress value={selectedProject.completion} />
                <p className="text-sm mt-1 text-right">{selectedProject.completion}%</p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Team Members ({(selectedProject.assignedEmployees || []).length})</h3>
                {(selectedProject.assignedEmployees || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No team members assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(selectedProject.assignedEmployees || []).map((emp) => (
                      <div key={emp._id || emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-sm text-gray-600">{emp.department} — {emp.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Employees Dialog */}
      {selectedProject && (
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Team Members</DialogTitle>
              <DialogDescription>Manage team for {selectedProject.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {employees.map((employee) => {
                const empId = employee._id || employee.id;
                const isAssigned = (selectedProject.assignedEmployees || []).some(
                  e => (e._id || e.id || e)?.toString() === empId?.toString()
                );
                return (
                  <div key={empId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.department} — {employee.email}</p>
                    </div>
                    <Button variant={isAssigned ? 'destructive' : 'default'} size="sm" onClick={() => handleToggleAssignment(empId)}>
                      {isAssigned ? 'Remove' : 'Assign'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
