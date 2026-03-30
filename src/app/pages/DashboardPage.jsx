import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, DollarSign, Briefcase, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProjects, getEmployees, getFinancials } from '../../services/apiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function DashboardPage() {
  const [insights, setInsights] = useState(null);
  const [deptPerformance, setDeptPerformance] = useState([]);
  const [growthForecast, setGrowthForecast] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data from your real backend API
      const [projectsRes, employeesRes, financialsRes] = await Promise.all([
        getProjects(),
        getEmployees(),
        getFinancials(),
      ]);

      // Safely unwrap arrays (handles both plain array and { data: [...] } responses)
      const projectsData = Array.isArray(projectsRes)
        ? projectsRes
        : projectsRes?.data || projectsRes?.projects || [];

      const employeesData = Array.isArray(employeesRes)
        ? employeesRes
        : employeesRes?.data || employeesRes?.employees || [];

      const financialsData = Array.isArray(financialsRes)
        ? financialsRes
        : financialsRes?.data || financialsRes?.financials || [];

      setProjects(projectsData);

      // ---------- Compute insights from real API data ----------

      // Overview
      const totalProjects = projectsData.length;
      const completedProjects = projectsData.filter(p => p.completionPercentage === 100).length;
      const atRiskProjects = projectsData.filter(p => p.riskLevel === 'High' || p.status === 'At Risk').length;
      const activeProjects = totalProjects - completedProjects;

      // Financial
      const totalRevenue = financialsData.reduce((sum, f) => sum + (f.revenue || 0), 0);
      const totalCost = financialsData.reduce((sum, f) => sum + (f.cost || 0), 0);
      const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

      // Workforce
      const avgProductivity = employeesData.length > 0
        ? employeesData.reduce((sum, e) => sum + (e.productivityScore || 0), 0) / employeesData.length
        : 0;
      const assignedCount = employeesData.filter(e => e.availability === 'Assigned').length;

      setInsights({
        overview: { totalProjects, completedProjects, atRiskProjects, activeProjects },
        financial: {
          totalRevenue,
          totalCost,
          overallROI: Math.round(overallROI * 10) / 10,
          profit: totalRevenue - totalCost,
        },
        workforce: {
          totalEmployees: employeesData.length,
          avgProductivity: Math.round(avgProductivity),
          utilization: employeesData.length > 0
            ? Math.round((assignedCount / employeesData.length) * 100)
            : 0,
        },
      });

      // ---------- Department Performance ----------
      const departments = [...new Set(projectsData.map(p => p.department).filter(Boolean))];
      const deptData = departments.map(dept => {
        const deptProjects = projectsData.filter(p => p.department === dept);
        const deptFinancials = financialsData.filter(f =>
          deptProjects.some(p => p.id === f.projectId)
        );
        const avgCompletion = deptProjects.length > 0
          ? deptProjects.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / deptProjects.length
          : 0;
        const deptRevenue = deptFinancials.reduce((sum, f) => sum + (f.revenue || 0), 0);
        const deptCost = deptFinancials.reduce((sum, f) => sum + (f.cost || 0), 0);
        const avgROI = deptFinancials.length > 0
          ? deptFinancials.reduce((sum, f) => sum + (f.roi || 0), 0) / deptFinancials.length
          : 0;
        const highRiskProjects = deptProjects.filter(p => p.riskLevel === 'High').length;

        return {
          department: dept,
          projectCount: deptProjects.length,
          avgCompletion: Math.round(avgCompletion),
          totalRevenue: deptRevenue,
          totalCost: deptCost,
          avgROI: Math.round(avgROI * 10) / 10,
          highRiskProjects,
          performance: avgROI > 50 ? 'Excellent' : avgROI > 30 ? 'Good' : 'Needs Improvement',
        };
      });
      setDeptPerformance(deptData);

      // ---------- Growth Forecast ----------
      const quarterlyData = {};
      financialsData.forEach(f => {
        const key = f.quarter || 'Unknown';
        if (!quarterlyData[key]) quarterlyData[key] = { revenue: 0, cost: 0 };
        quarterlyData[key].revenue += f.revenue || 0;
        quarterlyData[key].cost += f.cost || 0;
      });

      const quarters = Object.keys(quarterlyData).sort();
      const revenues = quarters.map(q => quarterlyData[q].revenue);
      const currentRevenue = revenues[revenues.length - 1] || 0;
      const previousRevenue = revenues[revenues.length - 2] || currentRevenue;
      const growthRate = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      // Simple linear forecast for next 4 quarters
      const n = revenues.length;
      const sumX = revenues.reduce((_, __, i) => _ + i, 0);
      const sumY = revenues.reduce((a, b) => a + b, 0);
      const sumXY = revenues.reduce((acc, y, i) => acc + i * y, 0);
      const sumX2 = revenues.reduce((acc, _, i) => acc + i * i, 0);
      const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
      const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

      const avgCostRatio = revenues.length > 0
        ? quarters.reduce((sum, q) => sum + quarterlyData[q].cost / (quarterlyData[q].revenue || 1), 0) / quarters.length
        : 0.7;

      const forecast = [];
      for (let i = 1; i <= 4; i++) {
        const futureRevenue = Math.max(0, slope * (n + i - 1) + intercept);
        const futureCost = futureRevenue * avgCostRatio;
        const futureROI = futureCost > 0 ? ((futureRevenue - futureCost) / futureCost) * 100 : 0;
        forecast.push({
          quarter: `Q${((quarters.length + i - 1) % 4) + 1} ${2026 + Math.floor((quarters.length + i - 1) / 4)}`,
          revenue: Math.round(futureRevenue),
          roi: Math.round(futureROI * 10) / 10,
        });
      }

      const nextQuarterRevenue = forecast[0]?.revenue || 0;
      const nextQuarterCost = nextQuarterRevenue * avgCostRatio;
      const nextQuarterROI = nextQuarterCost > 0
        ? ((nextQuarterRevenue - nextQuarterCost) / nextQuarterCost) * 100
        : 0;

      setGrowthForecast({
        nextQuarterRevenue,
        nextQuarterROI: Math.round(nextQuarterROI * 10) / 10,
        growthRate: Math.round(growthRate * 10) / 10,
        trend: slope > 0 ? 'growing' : slope < 0 ? 'declining' : 'stable',
        forecast,
      });

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <strong>Error loading dashboard:</strong> {error}
          <button
            onClick={loadDashboardData}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  // Chart data
  const statusData = [
    { name: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length, color: '#3b82f6' },
    { name: 'At Risk', value: projects.filter(p => p.status === 'At Risk').length, color: '#ef4444' },
    { name: 'Completed', value: projects.filter(p => p.completionPercentage === 100).length, color: '#10b981' },
  ];

  const riskData = [
    { name: 'Low', value: projects.filter(p => p.riskLevel === 'Low').length, color: '#10b981' },
    { name: 'Medium', value: projects.filter(p => p.riskLevel === 'Medium').length, color: '#f59e0b' },
    { name: 'High', value: projects.filter(p => p.riskLevel === 'High').length, color: '#ef4444' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            <Briefcase className="text-blue-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.overview.totalProjects}</div>
            <p className="text-xs text-gray-600 mt-1">{insights.overview.activeProjects} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="text-green-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(insights.financial.totalRevenue / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowUp size={12} />
              {growthForecast?.growthRate > 0 ? '+' : ''}{growthForecast?.growthRate}% growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average ROI</CardTitle>
            <TrendingUp className="text-purple-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.financial.overallROI}%</div>
            <p className="text-xs text-gray-600 mt-1">Portfolio-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">At Risk Projects</CardTitle>
            <AlertTriangle className="text-red-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.overview.atRiskProjects}</div>
            <p className="text-xs text-red-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Revenue and ROI by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalRevenue" fill="#3b82f6" name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="avgROI" fill="#10b981" name="ROI (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Forecast</CardTitle>
            <CardDescription>Projected revenue for next 4 quarters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthForecast?.forecast || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
                <Line type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} name="ROI (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current project statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
            <CardDescription>Project risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Analysis</CardTitle>
          <CardDescription>Detailed performance metrics by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Projects</th>
                  <th className="text-left py-3 px-4">Avg Completion</th>
                  <th className="text-left py-3 px-4">Revenue</th>
                  <th className="text-left py-3 px-4">ROI</th>
                  <th className="text-left py-3 px-4">High Risk</th>
                  <th className="text-left py-3 px-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {deptPerformance.map((dept) => (
                  <tr key={dept.department} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{dept.department}</td>
                    <td className="py-3 px-4">{dept.projectCount}</td>
                    <td className="py-3 px-4">{dept.avgCompletion}%</td>
                    <td className="py-3 px-4">${(dept.totalRevenue / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4">{dept.avgROI}%</td>
                    <td className="py-3 px-4">
                      {dept.highRiskProjects > 0 ? (
                        <Badge variant="destructive">{dept.highRiskProjects}</Badge>
                      ) : (
                        <Badge variant="secondary">0</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          dept.performance === 'Excellent'
                            ? 'default'
                            : dept.performance === 'Good'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {dept.performance}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Growth Insights */}
      {growthForecast && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Intelligence</CardTitle>
            <CardDescription>Projected growth predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Next Quarter Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(growthForecast.nextQuarterRevenue / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Projected ROI</p>
                <p className="text-2xl font-bold text-green-600">{growthForecast.nextQuarterROI}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Growth Trend</p>
                <p className="text-2xl font-bold text-purple-600 capitalize">{growthForecast.trend}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
