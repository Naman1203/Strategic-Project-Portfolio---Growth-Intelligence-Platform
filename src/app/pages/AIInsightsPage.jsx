import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Users, Lightbulb, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getProjects, getEmployees, getFinancials } from '../../services/apiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

export function AIInsightsPage() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [projectPredictions, setProjectPredictions] = useState([]);
  const [growthForecast, setGrowthForecast] = useState(null);
  const [resourceInsights, setResourceInsights] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, employeesRes, financialsRes] = await Promise.all([
        getProjects(),
        getEmployees(),
        getFinancials(),
      ]);

      const projectsData = projectsRes?.data || (Array.isArray(projectsRes) ? projectsRes : []);
      const employeesData = employeesRes?.data || (Array.isArray(employeesRes) ? employeesRes : []);
      const financialsData = financialsRes?.data || (Array.isArray(financialsRes) ? financialsRes : []);

      setProjects(projectsData);
      setEmployees(employeesData);
      setFinancials(financialsData);

      // ---------- Compute insights from real data ----------
      computeInsights(projectsData, employeesData, financialsData);
      computeProjectPredictions(projectsData, financialsData);
      computeGrowthForecast(financialsData);
      computeResourceInsights(projectsData, employeesData);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const computeInsights = (projectsData, employeesData, financialsData) => {
    const totalProjects = projectsData.length;
    const atRiskProjects = projectsData.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical' || p.status === 'On Hold').length;
    const completedProjects = projectsData.filter(p => p.status === 'Completed').length;

    const revenueTotal = financialsData.filter(f => f.type === 'revenue').reduce((s, f) => s + (f.amount || 0), 0);
    const expenseTotal = financialsData.filter(f => f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);
    const roi = expenseTotal > 0 ? ((revenueTotal - expenseTotal) / expenseTotal * 100) : 0;

    const availableEmployees = employeesData.filter(e => e.availability === 'Available').length;
    const utilization = employeesData.length > 0
      ? Math.round(((employeesData.length - availableEmployees) / employeesData.length) * 100)
      : 0;

    setInsights({
      overview: { totalProjects, atRiskProjects, completedProjects, activeProjects: totalProjects - completedProjects },
      financial: { totalRevenue: revenueTotal, totalExpenses: expenseTotal, roi: Math.round(roi * 10) / 10 },
      workforce: { totalEmployees: employeesData.length, available: availableEmployees, utilization },
    });
  };

  const computeProjectPredictions = (projectsData, financialsData) => {
    const now = new Date();
    const predictions = projectsData.map(project => {
      const pid = (project._id || project.id)?.toString();
      const projFinancials = financialsData.filter(f => f.projectId?.toString() === pid);
      const revenue = projFinancials.filter(f => f.type === 'revenue').reduce((s, f) => s + (f.amount || 0), 0);
      const expenses = projFinancials.filter(f => f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);

      // Time progress
      const start = project.startDate ? new Date(project.startDate) : now;
      const end = project.endDate ? new Date(project.endDate) : now;
      const totalDuration = end - start;
      const elapsed = now - start;
      const timeProgress = totalDuration > 0 ? Math.max(0, Math.min(1, elapsed / totalDuration)) : 0;
      const workProgress = (project.completion || 0) / 100;
      const progressLag = timeProgress - workProgress;

      // Budget utilization
      const budgetUsed = project.budget > 0 ? (project.spent || 0) / project.budget : 0;
      const budgetOverrun = budgetUsed > 1;

      // Success score (simple weighted formula)
      let successScore = 50;
      successScore += workProgress * 30;
      successScore -= progressLag * 20;
      successScore -= budgetOverrun ? 15 : 0;
      successScore += project.riskLevel === 'Low' ? 10 : project.riskLevel === 'High' || project.riskLevel === 'Critical' ? -15 : 0;
      successScore = Math.max(0, Math.min(100, successScore));

      // Risk score
      let riskScore = 20;
      riskScore += Math.max(0, progressLag) * 40;
      riskScore += budgetOverrun ? 20 : 0;
      riskScore += project.riskLevel === 'High' ? 15 : project.riskLevel === 'Critical' ? 25 : 0;
      riskScore = Math.max(0, Math.min(100, riskScore));

      const recommendations = [];
      if (progressLag > 0.2) recommendations.push('Significantly behind schedule — review milestones');
      if (budgetOverrun) recommendations.push('Budget overrun detected — implement cost controls');
      if (project.riskLevel === 'High' || project.riskLevel === 'Critical') recommendations.push('High risk project — needs immediate attention');
      if (workProgress > 0.8 && !budgetOverrun) recommendations.push('Strong performance — on track for success');
      if (recommendations.length === 0) recommendations.push('Project is progressing normally — maintain current approach');

      return {
        project,
        successProbability: Math.round(successScore),
        riskScore: Math.round(riskScore),
        riskLevel: riskScore > 60 ? 'High' : riskScore > 35 ? 'Medium' : 'Low',
        progressLag: Math.round(progressLag * 100),
        budgetUtilization: Math.round(budgetUsed * 100),
        recommendations,
        revenue,
        expenses,
      };
    });
    setProjectPredictions(predictions);
  };

  const computeGrowthForecast = (financialsData) => {
    const revenueByMonth = {};
    financialsData.filter(f => f.type === 'revenue').forEach(f => {
      const date = f.date ? new Date(f.date) : new Date(f.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + (f.amount || 0);
    });

    const months = Object.keys(revenueByMonth).sort();
    const revenues = months.map(m => revenueByMonth[m]);
    const currentRevenue = revenues[revenues.length - 1] || 0;
    const previousRevenue = revenues[revenues.length - 2] || currentRevenue;
    const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0;

    // Simple linear forecast
    const n = revenues.length;
    const sumX = revenues.reduce((_, __, i) => _ + i, 0);
    const sumY = revenues.reduce((a, b) => a + b, 0);
    const sumXY = revenues.reduce((acc, y, i) => acc + i * y, 0);
    const sumX2 = revenues.reduce((acc, _, i) => acc + i * i, 0);
    const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
    const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

    const forecast = [];
    for (let i = 1; i <= 4; i++) {
      const futureRevenue = Math.max(0, slope * (n + i - 1) + intercept);
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      forecast.push({
        month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: Math.round(futureRevenue),
      });
    }

    setGrowthForecast({
      growthRate: Math.round(growthRate * 10) / 10,
      trend: slope > 100 ? 'growing' : slope < -100 ? 'declining' : 'stable',
      forecast,
      historicalData: months.slice(-6).map((m, i) => ({ month: m, revenue: revenueByMonth[m] })),
    });
  };

  const computeResourceInsights = (projectsData, employeesData) => {
    const available = employeesData.filter(e => e.availability === 'Available').length;
    const busy = employeesData.filter(e => e.availability === 'Busy').length;
    const onLeave = employeesData.filter(e => e.availability === 'On Leave').length;
    const utilization = employeesData.length > 0 ? Math.round((busy / employeesData.length) * 100) : 0;

    const recommendations = [];
    if (utilization > 90) recommendations.push({ type: 'warning', message: 'Team is over 90% utilized — risk of burnout', action: 'Consider hiring or redistributing workload' });
    if (available > employeesData.length * 0.4) recommendations.push({ type: 'opportunity', message: `${available} employees available for new projects`, action: 'Assign to upcoming or high-priority projects' });

    const highRiskProjects = projectsData.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical');
    if (highRiskProjects.length > 0) {
      recommendations.push({ type: 'urgent', message: `${highRiskProjects.length} high-risk project(s) need attention`, action: 'Assign senior resources to: ' + highRiskProjects.map(p => p.name).join(', ') });
    }

    if (recommendations.length === 0) recommendations.push({ type: 'info', message: 'Resource allocation looks healthy', action: 'Continue monitoring utilization rates' });

    setResourceInsights({ summary: { totalEmployees: employeesData.length, available, busy, onLeave, utilization }, recommendations });
  };

  const getSuccessColor = (p) => p >= 70 ? 'default' : p >= 40 ? 'secondary' : 'destructive';
  const getRiskColor = (level) => level === 'High' ? 'destructive' : level === 'Medium' ? 'default' : 'secondary';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Brain className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Intelligence & Insights</h1>
          <p className="text-gray-600 mt-1">Data-driven predictions and analytics from your real project data</p>
        </div>
      </div>

      {/* Summary Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <Target size={16} /> Portfolio Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {insights.overview.totalProjects > 0
                  ? Math.round(((insights.overview.totalProjects - insights.overview.atRiskProjects) / insights.overview.totalProjects) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {insights.overview.totalProjects - insights.overview.atRiskProjects} of {insights.overview.totalProjects} projects on track
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
                <TrendingUp size={16} /> Growth Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {growthForecast?.growthRate > 0 ? '+' : ''}{growthForecast?.growthRate ?? 0}%
              </div>
              <p className="text-sm text-green-700 mt-1 capitalize">Trend: {growthForecast?.trend ?? 'stable'}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                <Users size={16} /> Resource Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{insights.workforce.utilization}%</div>
              <p className="text-sm text-purple-700 mt-1">{insights.workforce.totalEmployees} total employees</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="success" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="success">Success Prediction</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="growth">Growth Forecast</TabsTrigger>
          <TabsTrigger value="optimization">Resource Optimization</TabsTrigger>
        </TabsList>

        {/* Success Prediction */}
        <TabsContent value="success" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-blue-600" size={20} /> Project Success Predictions
              </CardTitle>
              <CardDescription>Success probability based on schedule, budget, and risk data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {projectPredictions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No projects to analyze yet</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectPredictions.map(p => ({
                      name: p.project.name?.length > 18 ? p.project.name.substring(0, 18) + '...' : p.project.name,
                      probability: p.successProbability,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Legend />
                      <Bar dataKey="probability" fill="#3b82f6" name="Success Probability (%)" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    {projectPredictions.map(({ project, successProbability, recommendations, budgetUtilization, progressLag }) => (
                      <div key={project._id || project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.department} • {project.status}</p>
                          </div>
                          <Badge variant={getSuccessColor(successProbability)} className="text-lg px-3 py-1">
                            {successProbability}%
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Success Probability</span>
                            <span>{successProbability}%</span>
                          </div>
                          <Progress value={successProbability} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div><span className="text-gray-600">Completion: </span><span className="font-medium">{project.completion || 0}%</span></div>
                          <div><span className="text-gray-600">Budget Used: </span><span className={`font-medium ${budgetUtilization > 100 ? 'text-red-600' : 'text-green-600'}`}>{budgetUtilization}%</span></div>
                          <div><span className="text-gray-600">Risk Level: </span><Badge variant={getRiskColor(project.riskLevel)} className="text-xs">{project.riskLevel || 'Low'}</Badge></div>
                          <div><span className="text-gray-600">Schedule Lag: </span><span className={`font-medium ${progressLag > 20 ? 'text-red-600' : 'text-green-600'}`}>{progressLag > 0 ? '+' : ''}{progressLag}%</span></div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-blue-800 mb-1">AI Recommendations:</p>
                          {recommendations.map((r, i) => (
                            <p key={i} className="text-xs text-blue-700">• {r}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis */}
        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={20} /> Project Risk Analysis
              </CardTitle>
              <CardDescription>Risk scores and recommendations for all projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectPredictions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No projects to analyze yet</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectPredictions.map(p => ({
                      name: p.project.name?.length > 18 ? p.project.name.substring(0, 18) + '...' : p.project.name,
                      riskScore: p.riskScore,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(v) => `${v}/100`} />
                      <Legend />
                      <Bar dataKey="riskScore" fill="#ef4444" name="Risk Score" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Project</th>
                          <th className="text-left py-3 px-4">Risk Score</th>
                          <th className="text-left py-3 px-4">Risk Level</th>
                          <th className="text-left py-3 px-4">Budget Used</th>
                          <th className="text-left py-3 px-4">Completion</th>
                          <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectPredictions.sort((a, b) => b.riskScore - a.riskScore).map(({ project, riskScore, riskLevel, budgetUtilization }) => (
                          <tr key={project._id || project.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{project.name}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Progress value={riskScore} className="w-20 h-2" />
                                <span className="text-sm">{riskScore}/100</span>
                              </div>
                            </td>
                            <td className="py-3 px-4"><Badge variant={getRiskColor(riskLevel)}>{riskLevel}</Badge></td>
                            <td className="py-3 px-4">
                              <span className={budgetUtilization > 100 ? 'text-red-600 font-medium' : ''}>{budgetUtilization}%</span>
                            </td>
                            <td className="py-3 px-4">{project.completion || 0}%</td>
                            <td className="py-3 px-4"><Badge variant="secondary">{project.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Forecast */}
        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-green-600" size={20} /> Revenue Growth Forecast
              </CardTitle>
              <CardDescription>Projected revenue for next 4 months based on historical trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!growthForecast || growthForecast.forecast.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Not enough financial data to forecast yet. Add revenue records first.</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-600">{growthForecast.growthRate > 0 ? '+' : ''}{growthForecast.growthRate}%</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Trend</p>
                      <p className="text-2xl font-bold text-blue-600 capitalize">{growthForecast.trend}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Next Month</p>
                      <p className="text-2xl font-bold text-purple-600">${((growthForecast.forecast[0]?.revenue || 0) / 1000).toFixed(1)}K</p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthForecast.forecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v) => `$${(v / 1000).toFixed(1)}K`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Forecasted Revenue" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="text-green-600 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Growth Trend Analysis</h3>
                        <p className="text-gray-700 mb-2">
                          Based on your financial records, the portfolio shows a{' '}
                          <span className="font-bold capitalize">{growthForecast.trend}</span> trend
                          with <span className="font-bold">{growthForecast.growthRate > 0 ? '+' : ''}{growthForecast.growthRate}%</span> month-over-month growth.
                        </p>
                        {growthForecast.trend === 'growing' && <p className="text-sm text-green-800">✓ Strong upward momentum — consider scaling resources to maintain trajectory</p>}
                        {growthForecast.trend === 'stable' && <p className="text-sm text-blue-800">• Revenue maintaining consistent levels — opportunities exist for strategic expansion</p>}
                        {growthForecast.trend === 'declining' && <p className="text-sm text-orange-800">⚠ Revenue showing downward trend — review project portfolio and resource allocation</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resource Optimization */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-purple-600" size={20} /> Resource Optimization
              </CardTitle>
              <CardDescription>AI-driven suggestions for optimal resource allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {resourceInsights && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-700 mb-1">Total Employees</p>
                      <p className="text-2xl font-bold text-purple-900">{resourceInsights.summary.totalEmployees}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 mb-1">Available</p>
                      <p className="text-2xl font-bold text-green-900">{resourceInsights.summary.available}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 mb-1">Busy</p>
                      <p className="text-2xl font-bold text-blue-900">{resourceInsights.summary.busy}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-700 mb-1">Utilization</p>
                      <p className="text-2xl font-bold text-orange-900">{resourceInsights.summary.utilization}%</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">AI Recommendations</h3>
                    <div className="space-y-3">
                      {resourceInsights.recommendations.map((rec, idx) => {
                        const styles = {
                          urgent: { bg: 'bg-red-50 border-red-200', text: 'text-red-900', icon: 'text-red-600' },
                          warning: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-900', icon: 'text-orange-600' },
                          opportunity: { bg: 'bg-green-50 border-green-200', text: 'text-green-900', icon: 'text-green-600' },
                          info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' },
                        };
                        const s = styles[rec.type] || styles.info;
                        return (
                          <div key={idx} className={`p-4 rounded-lg border ${s.bg}`}>
                            <div className="flex items-start gap-3">
                              {rec.type === 'urgent' || rec.type === 'warning'
                                ? <AlertTriangle className={s.icon} size={20} />
                                : rec.type === 'opportunity'
                                ? <Lightbulb className={s.icon} size={20} />
                                : <CheckCircle className={s.icon} size={20} />
                              }
                              <div>
                                <Badge variant={rec.type === 'urgent' ? 'destructive' : 'secondary'} className="mb-2">
                                  {rec.type.toUpperCase()}
                                </Badge>
                                <p className={`font-medium mb-1 ${s.text}`}>{rec.message}</p>
                                <p className="text-sm text-gray-700"><span className="font-semibold">Action:</span> {rec.action}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
