import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../services/apiService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fields match Employee.js model exactly
  const [formData, setFormData] = useState({
    name: '',
    email: '',           // ✅ required in model
    department: '',
    role: '',            // ✅ required in model
    skills: '',          // stored as comma string, converted to array on submit
    salary: '',          // ✅ required in model
    hireDate: '',        // ✅ required in model
    availability: 'Available',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await getEmployees();
      // ✅ Backend returns { success: true, data: [...] }
      const data = res?.data || (Array.isArray(res) ? res : []);
      setEmployees(data);
    } catch (err) {
      toast.error('Failed to load employees: ' + err.message);
    } finally {
      setLoading(false);
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
      email: '',
      department: '',
      role: '',
      skills: '',
      salary: '',
      hireDate: '',
      availability: 'Available',
      phoneNumber: '',
      address: '',
    });
    setEditingEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // ✅ Convert skills string to array, match model field names
    const employeeData = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      role: formData.role,
      skills: formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      salary: parseFloat(formData.salary),
      hireDate: formData.hireDate,
      availability: formData.availability,
      phoneNumber: formData.phoneNumber || '',
      address: formData.address || '',
    };

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee._id || editingEmployee.id, employeeData);
        toast.success('Employee updated successfully');
      } else {
        await createEmployee(employeeData);
        toast.success('Employee added successfully');
      }
      await loadEmployees();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Error saving employee: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      department: employee.department || '',
      role: employee.role || '',
      skills: Array.isArray(employee.skills) ? employee.skills.join(', ') : '',
      salary: employee.salary || '',
      hireDate: employee.hireDate?.substring(0, 10) || '',
      availability: employee.availability || 'Available',
      phoneNumber: employee.phoneNumber || '',
      address: employee.address || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        toast.success('Employee deleted successfully');
        await loadEmployees();
      } catch (err) {
        toast.error('Error deleting employee: ' + err.message);
      }
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setIsDetailDialogOpen(true);
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'default';
      case 'Busy': return 'destructive';
      case 'On Leave': return 'secondary';
      default: return 'secondary';
    }
  };

  // Statistics
  const stats = {
    total: employees.length,
    available: employees.filter(e => e.availability === 'Available').length,
    busy: employees.filter(e => e.availability === 'Busy').length,
    onLeave: employees.filter(e => e.availability === 'On Leave').length,
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee & Resource Management</h1>
          <p className="text-gray-600 mt-2">Manage workforce and track assignments</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus size={18} className="mr-2" />
          New Employee
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Busy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.busy}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>Complete list of workforce with details</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No employees yet</p>
              <p className="text-sm mt-1">Click "New Employee" to add your first one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Department</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Skills</th>
                    <th className="text-left py-3 px-4">Salary</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => {
                    const empId = employee._id || employee.id;
                    return (
                      <tr key={empId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewDetails(employee)}
                            className="font-medium hover:text-blue-600"
                          >
                            {employee.name}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{employee.email}</td>
                        <td className="py-3 px-4">{employee.department}</td>
                        <td className="py-3 px-4">{employee.role}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap max-w-48">
                            {(employee.skills || []).slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                            {(employee.skills || []).length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{employee.skills.length - 3}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">${(employee.salary || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getAvailabilityColor(employee.availability)}>
                            {employee.availability}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(empId)}>
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? 'Update employee information' : 'Add a new employee to your workforce'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                {/* ✅ email — required by model */}
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                {/* ✅ role — required by model */}
                <Label htmlFor="role">Role / Job Title</Label>
                <Input id="role" name="role" value={formData.role} onChange={handleInputChange} placeholder="e.g. Frontend Developer" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. JavaScript, React, Node.js" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* ✅ salary — required by model */}
                <Label htmlFor="salary">Salary ($)</Label>
                <Input id="salary" name="salary" type="number" min="0" value={formData.salary} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                {/* ✅ hireDate — required by model */}
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input id="hireDate" name="hireDate" type="date" value={formData.hireDate} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* ✅ Correct availability enums: Available / Busy / On Leave */}
                <Label htmlFor="availability">Availability</Label>
                <Select value={formData.availability} onValueChange={(v) => handleSelectChange('availability', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="e.g. +91 98765 43210" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="e.g. 123 Main St, City" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employee Details Dialog */}
      {selectedEmployee && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEmployee.name}</DialogTitle>
              <DialogDescription>Employee Profile & Project Assignments</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-600">Email</p><p className="font-medium">{selectedEmployee.email}</p></div>
                <div><p className="text-sm text-gray-600">Department</p><p className="font-medium">{selectedEmployee.department}</p></div>
                <div><p className="text-sm text-gray-600">Role</p><p className="font-medium">{selectedEmployee.role}</p></div>
                <div><p className="text-sm text-gray-600">Salary</p><p className="font-medium">${(selectedEmployee.salary || 0).toLocaleString()}</p></div>
                <div><p className="text-sm text-gray-600">Hire Date</p><p className="font-medium">{selectedEmployee.hireDate?.substring(0, 10)}</p></div>
                <div><p className="text-sm text-gray-600">Phone</p><p className="font-medium">{selectedEmployee.phoneNumber || '—'}</p></div>
              </div>

              {selectedEmployee.address && (
                <div><p className="text-sm text-gray-600">Address</p><p className="font-medium">{selectedEmployee.address}</p></div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Skills</h3>
                <div className="flex gap-2 flex-wrap">
                  {(selectedEmployee.skills || []).length > 0
                    ? selectedEmployee.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))
                    : <p className="text-sm text-gray-500">No skills listed</p>
                  }
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase size={18} />
                  Assigned Projects ({(selectedEmployee.assignedProjects || []).length})
                </h3>
                {(selectedEmployee.assignedProjects || []).length > 0 ? (
                  <div className="space-y-2">
                    {(selectedEmployee.assignedProjects || []).map((project) => (
                      <div key={project._id || project.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{project.name || 'Project'}</p>
                        {project.department && (
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{project.department}</Badge>
                            {project.status && <Badge>{project.status}</Badge>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No projects assigned</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Availability Status</h3>
                <Badge variant={getAvailabilityColor(selectedEmployee.availability)} className="text-base px-4 py-2">
                  {selectedEmployee.availability}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
