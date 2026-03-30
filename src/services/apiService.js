const API_URL = "http://localhost:5000/api";

// Get token
const getToken = () => {
  return localStorage.getItem("token");
};

// Generic API function
const fetchAPI = async (
  endpoint,
  method = "GET",
  body = null
) => {

  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();

  if (token) {
    headers["Authorization"] =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method,
      headers,
      body: body
        ? JSON.stringify(body)
        : null,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "API Error"
    );
  }

  return data;
};

//
// AUTH
//
export const loginUser = (data) =>
  fetchAPI("/auth/login", "POST", data);

export const registerUser = (data) =>
  fetchAPI("/auth/register", "POST", data);

//
// PROJECTS
//
export const getProjects = () =>
  fetchAPI("/projects");

export const createProject = (data) =>
  fetchAPI("/projects", "POST", data);

export const updateProject = (id, data) =>
  fetchAPI(`/projects/${id}`, "PUT", data);

export const deleteProject = (id) =>
  fetchAPI(`/projects/${id}`, "DELETE");

//
// EMPLOYEES
//
export const getEmployees = () =>
  fetchAPI("/employees");

export const createEmployee = (data) =>
  fetchAPI("/employees", "POST", data);

export const updateEmployee = (id, data) =>
  fetchAPI(`/employees/${id}`, "PUT", data);

export const deleteEmployee = (id) =>
  fetchAPI(`/employees/${id}`, "DELETE");

//
// FINANCIALS
//
export const getFinancials = () =>
  fetchAPI("/financials");

export const createFinancial = (data) =>
  fetchAPI("/financials", "POST", data);

//
// ANALYTICS
//
export const getDashboardAnalytics = () =>
  fetchAPI("/analytics/dashboard");

//
// AI
//
export const predictProjectSuccess = (data) =>
  fetchAPI("/ai/predict-success", "POST", data);

//
// ASSIGNMENTS
//
export const assignEmployee = (projectId, employeeId) =>
  fetchAPI(`/projects/${projectId}/assign/${employeeId}`, "PUT");

export const removeEmployee = (projectId, employeeId) =>
  fetchAPI(`/projects/${projectId}/remove/${employeeId}`, "PUT");