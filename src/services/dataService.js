// Data Service - Managing all application data with localStorage persistence

// Initialize default data

const STORAGE_KEYS = {
  PROJECTS: 'portfolio_projects',
  EMPLOYEES: 'portfolio_employees',
  ASSIGNMENTS: 'portfolio_assignments',
  FINANCIALS: 'portfolio_financials',
  USER: 'portfolio_user',
};

// Sample initial data
const initialProjects = [
  {
    id: '1',
    name: 'Enterprise CRM System',
    department: 'Technology',
    budget: 500000,
    actualCost: 420000,
    startDate: '2025-01-15',
    endDate: '2026-06-30',
    status: 'In Progress',
    riskLevel: 'Medium',
    completionPercentage: 65,
    teamSize: 12,
    complexity: 8,
  },
  {
    id: '2',
    name: 'Marketing Campaign Q2',
    department: 'Marketing',
    budget: 150000,
    actualCost: 145000,
    startDate: '2025-04-01',
    endDate: '2026-06-30',
    status: 'In Progress',
    riskLevel: 'Low',
    completionPercentage: 80,
    teamSize: 5,
    complexity: 4,
  },
  {
    id: '3',
    name: 'Supply Chain Optimization',
    department: 'Operations',
    budget: 750000,
    actualCost: 820000,
    startDate: '2024-09-01',
    endDate: '2026-03-31',
    status: 'At Risk',
    riskLevel: 'High',
    completionPercentage: 45,
    teamSize: 18,
    complexity: 9,
  },
  {
    id: '4',
    name: 'Mobile App Development',
    department: 'Technology',
    budget: 300000,
    actualCost: 280000,
    startDate: '2025-02-01',
    endDate: '2026-08-31',
    status: 'In Progress',
    riskLevel: 'Medium',
    completionPercentage: 55,
    teamSize: 8,
    complexity: 7,
  },
  {
    id: '5',
    name: 'Data Analytics Platform',
    department: 'Technology',
    budget: 600000,
    actualCost: 550000,
    startDate: '2024-11-01',
    endDate: '2026-05-31',
    status: 'In Progress',
    riskLevel: 'Low',
    completionPercentage: 70,
    teamSize: 10,
    complexity: 8,
  },
];

const initialEmployees = [
  {
    id: 'E001',
    name: 'Sarah Johnson',
    department: 'Technology',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    productivityScore: 92,
    experienceLevel: 'Senior',
    availability: 'Available',
  },
  {
    id: 'E002',
    name: 'Michael Chen',
    department: 'Technology',
    skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
    productivityScore: 88,
    experienceLevel: 'Senior',
    availability: 'Assigned',
  },
  {
    id: 'E003',
    name: 'Emily Rodriguez',
    department: 'Marketing',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    productivityScore: 85,
    experienceLevel: 'Mid-Level',
    availability: 'Assigned',
  },
  {
    id: 'E004',
    name: 'David Kim',
    department: 'Operations',
    skills: ['Supply Chain', 'Logistics', 'Data Analysis', 'Process Optimization'],
    productivityScore: 90,
    experienceLevel: 'Senior',
    availability: 'Assigned',
  },
  {
    id: 'E005',
    name: 'Jessica Taylor',
    department: 'Technology',
    skills: ['UI/UX Design', 'Figma', 'React', 'CSS'],
    productivityScore: 87,
    experienceLevel: 'Mid-Level',
    availability: 'Available',
  },
  {
    id: 'E006',
    name: 'Robert Martinez',
    department: 'Technology',
    skills: ['DevOps', 'Kubernetes', 'CI/CD', 'AWS'],
    productivityScore: 91,
    experienceLevel: 'Senior',
    availability: 'Assigned',
  },
  {
    id: 'E007',
    name: 'Amanda Wilson',
    department: 'Marketing',
    skills: ['Brand Strategy', 'Social Media', 'Campaign Management'],
    productivityScore: 83,
    experienceLevel: 'Mid-Level',
    availability: 'Available',
  },
  {
    id: 'E008',
    name: 'James Brown',
    department: 'Operations',
    skills: ['Project Management', 'Agile', 'Risk Management'],
    productivityScore: 89,
    experienceLevel: 'Senior',
    availability: 'Assigned',
  },
];

const initialAssignments = [
  { projectId: '1', employeeId: 'E002' },
  { projectId: '1', employeeId: 'E006' },
  { projectId: '2', employeeId: 'E003' },
  { projectId: '3', employeeId: 'E004' },
  { projectId: '3', employeeId: 'E008' },
  { projectId: '4', employeeId: 'E002' },
  { projectId: '5', employeeId: 'E006' },
];

const initialFinancials = [
  { projectId: '1', revenue: 650000, cost: 420000, roi: 54.8, quarter: 'Q1 2026' },
  { projectId: '2', revenue: 280000, cost: 145000, roi: 93.1, quarter: 'Q2 2026' },
  { projectId: '3', revenue: 900000, cost: 820000, roi: 9.8, quarter: 'Q1 2026' },
  { projectId: '4', revenue: 450000, cost: 280000, roi: 60.7, quarter: 'Q2 2026' },
  { projectId: '5', revenue: 800000, cost: 550000, roi: 45.5, quarter: 'Q2 2026' },
];

// Initialize data if not exists
export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(initialEmployees));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FINANCIALS)) {
    localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(initialFinancials));
  }
};

// Project CRUD operations
export const getProjects = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const getProjectById = (id) => {
  const projects = getProjects();
  return projects.find(p => p.id === id);
};

export const createProject = (project) => {
  const projects = getProjects();
  const newProject = {
    ...project,
    id: Date.now().toString(),
  };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return newProject;
};

export const updateProject = (id, updates) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return projects[index];
  }
  return null;
};

export const deleteProject = (id) => {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  
  // Also remove assignments
  const assignments = getAssignments();
  const filteredAssignments = assignments.filter(a => a.projectId !== id);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filteredAssignments));
  
  // Remove financials
  const financials = getFinancials();
  const filteredFinancials = financials.filter(f => f.projectId !== id);
  localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(filteredFinancials));
};

// Employee CRUD operations
export const getEmployees = () => {
  const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  return data ? JSON.parse(data) : [];
};

export const getEmployeeById = (id) => {
  const employees = getEmployees();
  return employees.find(e => e.id === id);
};

export const createEmployee = (employee) => {
  const employees = getEmployees();
  const newEmployee = {
    ...employee,
    id: 'E' + String(employees.length + 1).padStart(3, '0'),
  };
  employees.push(newEmployee);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  return newEmployee;
};

export const updateEmployee = (id, updates) => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    return employees[index];
  }
  return null;
};

export const deleteEmployee = (id) => {
  const employees = getEmployees();
  const filtered = employees.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));
  
  // Remove assignments
  const assignments = getAssignments();
  const filteredAssignments = assignments.filter(a => a.employeeId !== id);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filteredAssignments));
};

// Assignment operations
export const getAssignments = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return data ? JSON.parse(data) : [];
};

export const assignEmployeeToProject = (projectId, employeeId) => {
  const assignments = getAssignments();
  const exists = assignments.find(a => a.projectId === projectId && a.employeeId === employeeId);
  if (!exists) {
    assignments.push({ projectId, employeeId });
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    
    // Update employee availability
    const employee = getEmployeeById(employeeId);
    if (employee) {
      updateEmployee(employeeId, { availability: 'Assigned' });
    }
  }
};

export const removeEmployeeFromProject = (projectId, employeeId) => {
  const assignments = getAssignments();
  const filtered = assignments.filter(a => !(a.projectId === projectId && a.employeeId === employeeId));
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filtered));
  
  // Check if employee has other assignments
  const hasOtherAssignments = filtered.some(a => a.employeeId === employeeId);
  if (!hasOtherAssignments) {
    updateEmployee(employeeId, { availability: 'Available' });
  }
};

export const getProjectEmployees = (projectId) => {
  const assignments = getAssignments();
  const employees = getEmployees();
  const projectAssignments = assignments.filter(a => a.projectId === projectId);
  return projectAssignments.map(a => employees.find(e => e.id === a.employeeId)).filter(Boolean);
};

export const getEmployeeProjects = (employeeId) => {
  const assignments = getAssignments();
  const projects = getProjects();
  const employeeAssignments = assignments.filter(a => a.employeeId === employeeId);
  return employeeAssignments.map(a => projects.find(p => p.id === a.projectId)).filter(Boolean);
};

// Financial operations
export const getFinancials = () => {
  const data = localStorage.getItem(STORAGE_KEYS.FINANCIALS);
  return data ? JSON.parse(data) : [];
};

export const getFinancialsByProjectId = (projectId) => {
  const financials = getFinancials();
  return financials.filter(f => f.projectId === projectId);
};

export const createFinancial = (financial) => {
  const financials = getFinancials();
  financials.push(financial);
  localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(financials));
  return financial;
};

export const updateFinancial = (projectId, quarter, updates) => {
  const financials = getFinancials();
  const index = financials.findIndex(f => f.projectId === projectId && f.quarter === quarter);
  if (index !== -1) {
    financials[index] = { ...financials[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(financials));
    return financials[index];
  }
  return null;
};

// Authentication
export const getCurrentUser = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const login = (email, password) => {
  // Mock authentication - in production, this would validate against a backend
  const user = {
    id: '1',
    email,
    name: email.split('@')[0],
    role: 'admin',
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const register = (email, password, name) => {
  const user = {
    id: Date.now().toString(),
    email,
    name,
    role: 'user',
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

