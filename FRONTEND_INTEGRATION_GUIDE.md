# Frontend Integration Guide

This guide shows you how to integrate the MongoDB backend with your existing React frontend.

## Step 1: Install Axios (HTTP Client)

In your frontend project root:

```bash
npm install axios
```

## Step 2: Create API Service Layer

Create a new file `/src/services/api.js`:

```javascript
import axios from 'axios';

// Base URL for API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data)
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  assignEmployee: (projectId, employeeId) => 
    api.put(`/projects/${projectId}/assign/${employeeId}`),
  removeEmployee: (projectId, employeeId) => 
    api.put(`/projects/${projectId}/remove/${employeeId}`)
};

// Employees API
export const employeesAPI = {
  getAll: () => api.get('/employees'),
  getOne: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getAvailable: () => api.get('/employees/available'),
  getByDepartment: (department) => api.get(`/employees/department/${department}`)
};

// Financials API
export const financialsAPI = {
  getAll: () => api.get('/financials'),
  getOne: (id) => api.get(`/financials/${id}`),
  create: (data) => api.post('/financials', data),
  update: (id, data) => api.put(`/financials/${id}`, data),
  delete: (id) => api.delete(`/financials/${id}`),
  getByProject: (projectId) => api.get(`/financials/project/${projectId}`),
  getSummary: () => api.get('/financials/summary')
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProjects: () => api.get('/analytics/projects'),
  getEmployees: () => api.get('/analytics/employees'),
  getFinancials: () => api.get('/analytics/financials')
};

// AI API
export const aiAPI = {
  predictSuccess: (projectId) => api.post('/ai/predict-success', { projectId }),
  analyzeRisk: (projectId) => api.post('/ai/analyze-risk', { projectId }),
  getInsights: () => api.get('/ai/insights'),
  getProjectPredictions: (projectId) => api.get(`/ai/predictions/${projectId}`),
  getPortfolioInsights: () => api.get('/ai/portfolio-insights')
};

export default api;
```

## Step 3: Update Authentication Pages

### Login Page Example:

Replace your login logic with:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authAPI } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your login form JSX with email, password inputs and submit button
    // Use handleSubmit on form submission
  );
}
```

### Register Page Example:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authAPI } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(formData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your register form JSX
  );
}
```

## Step 4: Update Projects Page

Replace localStorage with API calls:

```javascript
import { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const handleCreate = async (projectData) => {
    try {
      await projectsAPI.create(projectData);
      fetchProjects(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  // Update project
  const handleUpdate = async (id, projectData) => {
    try {
      await projectsAPI.update(id, projectData);
      fetchProjects(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        fetchProjects(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  return (
    // Your projects JSX
  );
}
```

## Step 5: Update Employees Page

```javascript
import { useState, useEffect } from 'react';
import { employeesAPI } from '../services/api';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (employeeData) => {
    try {
      await employeesAPI.create(employeeData);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to create employee:', err);
    }
  };

  const handleUpdate = async (id, employeeData) => {
    try {
      await employeesAPI.update(id, employeeData);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to update employee:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await employeesAPI.delete(id);
        fetchEmployees();
      } catch (err) {
        console.error('Failed to delete employee:', err);
      }
    }
  };

  return (
    // Your employees JSX
  );
}
```

## Step 6: Update Dashboard Analytics

```javascript
import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Display analytics data in charts */}
      {analytics && (
        <>
          <div>Total Projects: {analytics.overview.totalProjects}</div>
          <div>Active Projects: {analytics.overview.activeProjects}</div>
          <div>Total Budget: ${analytics.overview.totalBudget}</div>
          {/* Add your charts here using analytics data */}
        </>
      )}
    </div>
  );
}
```

## Step 7: Update AI Insights Page

```javascript
import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [portfolioInsights, setPortfolioInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [insightsRes, portfolioRes] = await Promise.all([
        aiAPI.getInsights(),
        aiAPI.getPortfolioInsights()
      ]);
      
      setInsights(insightsRes.data.data);
      setPortfolioInsights(portfolioRes.data.data);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const predictSuccess = async (projectId) => {
    try {
      const response = await aiAPI.predictSuccess(projectId);
      console.log('Success prediction:', response.data);
      fetchInsights(); // Refresh
    } catch (err) {
      console.error('Failed to predict success:', err);
    }
  };

  return (
    // Your AI insights JSX
  );
}
```

## Step 8: Environment Variables

Create `.env` in your frontend root:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Step 9: Protected Routes

Create a ProtectedRoute component:

```javascript
import { Navigate } from 'react-router';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
```

Use it in your routes:

```javascript
import { createBrowserRouter } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login
  },
  {
    path: '/register',
    Component: Register
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: '/projects',
    element: <ProtectedRoute><Projects /></ProtectedRoute>
  }
  // ... other protected routes
]);
```

## Step 10: Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm start`
3. Register a new user
4. Login with credentials
5. Test all CRUD operations
6. Check browser Network tab for API calls

## Common Issues & Solutions

### CORS Errors
- Ensure backend `.env` has correct `FRONTEND_URL`
- Backend should be running on port 5000
- Frontend should be running on port 3000

### 401 Unauthorized
- Check if token is being sent in Authorization header
- Verify token is saved in localStorage after login
- Check token expiration (default is 7 days)

### Network Errors
- Verify backend is running
- Check `REACT_APP_API_URL` in frontend `.env`
- Ensure MongoDB is connected

### Data Not Updating
- Make sure to call fetch functions after create/update/delete
- Check browser console for errors
- Verify API responses in Network tab

## Migration Checklist

- [ ] Install axios
- [ ] Create api.js service layer
- [ ] Update login page to use authAPI
- [ ] Update register page to use authAPI
- [ ] Replace localStorage calls in Projects with projectsAPI
- [ ] Replace localStorage calls in Employees with employeesAPI
- [ ] Replace localStorage calls in Financials with financialsAPI
- [ ] Update Dashboard to use analyticsAPI
- [ ] Update AI Insights to use aiAPI
- [ ] Add environment variables
- [ ] Implement protected routes
- [ ] Test all features
- [ ] Remove old localStorage code

## Next Steps

After successful integration:

1. **Add loading states** for better UX
2. **Add error handling** with toast notifications
3. **Implement data caching** for performance
4. **Add pagination** for large datasets
5. **Implement search and filters**
6. **Add real-time updates** with WebSockets (optional)
7. **Deploy backend** to production
8. **Update production environment variables**

## Production Deployment

### Backend
```bash
# Deploy to Heroku, Railway, or DigitalOcean
# Set all environment variables
# Use MongoDB Atlas for database
```

### Frontend
```bash
# Update .env with production API URL
REACT_APP_API_URL=https://your-backend.herokuapp.com/api

# Build and deploy
npm run build
# Deploy to Vercel, Netlify, etc.
```
