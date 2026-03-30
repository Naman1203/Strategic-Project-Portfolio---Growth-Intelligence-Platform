import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProjects, getFinancials, createFinancial } from '../../services/apiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export function FinancialsPage() {
  const [projects, setProjects] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fields match Financial.js model exactly
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    category: '',
    amount: '',
    date: '',
    type: 'expense',
    description: '',
    invoiceNumber: '',
    status: 'pending',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, financialsRes] = await Promise.all([
        getProjects(),
        getFinancials(),
      ]);

      // ✅ Backend returns { success: true, data: [...] }
      const projectsData = projectsRes?.data || (Array.isArray(projectsRes) ? projectsRes : []);
      const financialsData = financialsRes?.data || (Array.isArray(financialsRes) ? financialsRes : []);

      setProjects(projectsData);
      setFinancials(financialsData);

      // ✅ Use correct field names: amount, type (not revenue/cost/roi)
      const revenueRecords = financialsData.filter(f => f.type === 'revenue');
      const expenseRecords = financialsData.filter(f => f.type === 'expense');
      const totalRevenue = revenueRecords.reduce((sum, f) => sum + (f.amount || 0), 0);
      const totalCost = expenseRecords.reduce((sum, f) => sum + (f.amount || 0), 0);
      const totalProfit = totalRevenue - totalCost;
      const roi = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;

      setSummary({
        totalRevenue,
        totalCost,
        totalProfit,
        roi,
        projectCount: new Set(financialsData.map(f => f.projectId?.toString())).size,
        totalTransactions: financialsData.length,
      });
    } catch (err) {
      toast.error('Failed to load financial data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    if (name === 'projectId') {
      const project = projects.find(p => (p._id || p.id) === value);
      setFormData({ ...formData, projectId: value, projectName: project?.name || '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: '',
      projectName: '',
      category: '',
      amount: '',
      date: '',
      type: 'expense',
      description: '',
      invoiceNumber: '',
      status: 'pending',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createFinancial({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success('Financial record added successfully');
      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Error saving record: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Chart data built from real financial records
  const projectChartData = projects.map(project => {
    const pid = (project._id || project.id)?.toString();
    const projFinancials = financials.filter(f => f.projectId?.toString() === pid);
    const revenue = projFinancials.filter(f => f.type === 'revenue').reduce((s, f) => s + (f.amount || 0), 0);
    const cost = projFinancials.filter(f => f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);
    return {
      name: project.name?.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      fullName: project.name,
      revenue,
      cost,
      profit: revenue - cost,
      budget: project.budget || 0,
      spent: project.spent || 0,
    };
  }).filter(d => d.revenue > 0 || d.cost > 0 || d.budget > 0);

  const budgetData = projects.map(project => ({
    name: project.name?.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    budget: project.budget || 0,
    actual: project.spent || 0,
    variance: (project.budget || 0) - (project.spent || 0),
  }));

  // Department summary
  const deptMap = {};
  projects.forEach(project => {
    const dept = project.department || 'Unknown';
    const pid = (project._id || project.id)?.toString();
    const projFinancials = financials.filter(f => f.projectId?.toString() === pid);
    const revenue = projFinancials.filter(f => f.type === 'revenue').reduce((s, f) => s + (f.amount || 0), 0);
    const cost = projFinancials.filter(f => f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);
    if (!deptMap[dept]) deptMap[dept] = { department: dept, revenue: 0, cost: 0, profit: 0, projectCount: 0 };
    deptMap[dept].revenue += revenue;
    deptMap[dept].cost += cost;
    deptMap[dept].profit += (revenue - cost);
    deptMap[dept].projectCount++;
  });
  const deptData = Object.values(deptMap);

  // Recent transactions
  const recentTransactions = [...financials]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600 mt-2">Revenue, costs, and profitability insights</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Record
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                ${(summary.totalRevenue / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-600 mt-1">From {summary.projectCount} projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                ${(summary.totalCost / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-600 mt-1">{summary.totalTransactions} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${(summary.totalProfit / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-600 mt-1">Revenue minus expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                {summary.roi.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Return on investment</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses by Project</CardTitle>
            <CardDescription>Financial performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {projectChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">No financial records yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="cost" fill="#f59e0b" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual Spent</CardTitle>
            <CardDescription>Cost management analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {budgetData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">No projects yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="actual" fill="#ef4444" name="Actual Spent" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Summary */}
      {deptData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Financial Summary</CardTitle>
            <CardDescription>Revenue and profit by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial records</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No financial records yet</p>
              <p className="text-sm mt-1">Click "Add Record" to add your first transaction</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Project</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((record) => (
                    <tr key={record._id || record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{record.projectName}</td>
                      <td className="py-3 px-4">{record.category}</td>
                      <td className="py-3 px-4">
                        <Badge variant={record.type === 'revenue' ? 'default' : 'secondary'}>
                          {record.type}
                        </Badge>
                      </td>
                      <td className={`py-3 px-4 font-medium ${record.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.type === 'revenue' ? '+' : '-'}${(record.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.date ? new Date(record.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          record.status === 'paid' ? 'default' :
                          record.status === 'approved' ? 'secondary' :
                          record.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Financial Record Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Financial Record</DialogTitle>
            <DialogDescription>Record a new revenue or expense transaction</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              {/* ✅ projectId required by model */}
              <Label>Project</Label>
              <Select value={formData.projectId} onValueChange={(v) => handleSelectChange('projectId', v)}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p._id || p.id} value={p._id || p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* ✅ type enum: expense / revenue */}
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {/* ✅ category enum from model */}
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salaries">Salaries</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* ✅ amount field (not revenue/cost) */}
                <Label htmlFor="amount">Amount ($)</Label>
                <Input id="amount" name="amount" type="number" min="0" value={formData.amount} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                {/* ✅ date field */}
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* ✅ status enum: pending/approved/rejected/paid */}
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice # (optional)</Label>
                <Input id="invoiceNumber" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} placeholder="e.g. INV-001" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief description" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={submitting || !formData.projectId || !formData.category}>
                {submitting ? 'Saving...' : 'Add Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
