# API Testing Examples

Complete collection of API requests with examples for testing your backend.

## Base URL

```
http://localhost:5000/api
```

---

## Authentication Endpoints

### 1. Register User

**POST** `/auth/register`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "department": "Engineering"
}
```

Response (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123def456...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "department": "Engineering"
  }
}
```

### 2. Login User

**POST** `/auth/login`

Request:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123def456...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "department": "Management"
  }
}
```

### 3. Get Current User

**GET** `/auth/me`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "65abc123def456...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "department": "Management"
  }
}
```

---

## Project Endpoints

### 1. Get All Projects

**GET** `/projects`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65abc123...",
      "name": "E-Commerce Platform Redesign",
      "department": "Engineering",
      "budget": 250000,
      "spent": 180000,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "status": "Active",
      "manager": "John Manager",
      "riskLevel": "Medium",
      "completion": 65,
      "teamSize": 8,
      "assignedEmployees": [...]
    }
  ]
}
```

### 2. Get Single Project

**GET** `/projects/:id`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "E-Commerce Platform Redesign",
    "department": "Engineering",
    "budget": 250000,
    "spent": 180000,
    "completion": 65,
    "assignedEmployees": [
      {
        "_id": "65def456...",
        "name": "Alice Johnson",
        "email": "alice@company.com",
        "role": "Senior Developer"
      }
    ]
  }
}
```

### 3. Create Project

**POST** `/projects`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Request:
```json
{
  "name": "New AI Platform",
  "department": "Engineering",
  "budget": 500000,
  "spent": 0,
  "startDate": "2024-06-01",
  "endDate": "2025-06-01",
  "status": "Planning",
  "manager": "Tech Lead",
  "riskLevel": "High",
  "completion": 0,
  "description": "Building AI-powered analytics platform",
  "teamSize": 10
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "_id": "65xyz789...",
    "name": "New AI Platform",
    "department": "Engineering",
    "budget": 500000,
    "status": "Planning",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Project

**PUT** `/projects/:id`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Request:
```json
{
  "completion": 75,
  "spent": 200000,
  "status": "Active"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "E-Commerce Platform Redesign",
    "completion": 75,
    "spent": 200000,
    "status": "Active",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 5. Delete Project

**DELETE** `/projects/:id`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "data": {}
}
```

### 6. Assign Employee to Project

**PUT** `/projects/:projectId/assign/:employeeId`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "E-Commerce Platform Redesign",
    "assignedEmployees": ["65def456...", "65ghi789..."],
    "teamSize": 2
  }
}
```

---

## Employee Endpoints

### 1. Get All Employees

**GET** `/employees`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65def456...",
      "name": "Alice Johnson",
      "email": "alice@company.com",
      "department": "Engineering",
      "role": "Senior Developer",
      "skills": ["JavaScript", "React", "Node.js"],
      "salary": 120000,
      "availability": "Available",
      "assignedProjects": [...]
    }
  ]
}
```

### 2. Create Employee

**POST** `/employees`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Request:
```json
{
  "name": "Sarah Wilson",
  "email": "sarah@company.com",
  "department": "Marketing",
  "role": "Marketing Specialist",
  "skills": ["SEO", "Content Marketing", "Social Media"],
  "salary": 80000,
  "hireDate": "2024-01-15",
  "availability": "Available"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "_id": "65new789...",
    "name": "Sarah Wilson",
    "email": "sarah@company.com",
    "department": "Marketing",
    "role": "Marketing Specialist",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Get Available Employees

**GET** `/employees/available`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65def456...",
      "name": "Alice Johnson",
      "availability": "Available",
      "skills": ["JavaScript", "React", "Node.js"]
    }
  ]
}
```

---

## Financial Endpoints

### 1. Get All Financial Records

**GET** `/financials`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "65fin123...",
      "projectId": "65abc123...",
      "projectName": "E-Commerce Platform Redesign",
      "category": "Salaries",
      "amount": 120000,
      "date": "2024-01-15T00:00:00.000Z",
      "type": "expense",
      "description": "Team salaries Q1",
      "status": "paid"
    }
  ]
}
```

### 2. Create Financial Record

**POST** `/financials`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Request:
```json
{
  "projectId": "65abc123...",
  "category": "Software",
  "amount": 5000,
  "date": "2024-01-15",
  "type": "expense",
  "description": "Development tools licenses",
  "status": "pending"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "_id": "65fin789...",
    "projectId": "65abc123...",
    "projectName": "E-Commerce Platform Redesign",
    "category": "Software",
    "amount": 5000,
    "type": "expense",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Get Financial Summary

**GET** `/financials/summary`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "data": {
    "totalRevenue": 300000,
    "totalExpenses": 450000,
    "netProfit": -150000,
    "byCategory": {
      "Salaries": 300000,
      "Software": 50000,
      "Equipment": 45000,
      "Marketing": 55000
    },
    "byProject": {
      "E-Commerce Platform Redesign": {
        "revenue": 0,
        "expenses": 180000
      }
    }
  }
}
```

---

## Analytics Endpoints

### 1. Get Dashboard Analytics

**GET** `/analytics/dashboard`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProjects": 5,
      "activeProjects": 3,
      "completedProjects": 1,
      "totalEmployees": 5,
      "totalBudget": 1000000,
      "totalSpent": 610000,
      "budgetUtilization": "61.00",
      "avgCompletion": "63.00"
    },
    "financial": {
      "totalRevenue": 300000,
      "totalExpenses": 450000,
      "netProfit": -150000,
      "roi": "-33.33"
    },
    "distributions": {
      "risk": {
        "Low": 3,
        "Medium": 1,
        "High": 1,
        "Critical": 0
      },
      "department": {
        "Engineering": 2,
        "Marketing": 1,
        "IT": 1,
        "Product": 1
      },
      "status": {
        "Planning": 1,
        "Active": 3,
        "Completed": 1,
        "On Hold": 0,
        "Cancelled": 0
      }
    }
  }
}
```

### 2. Get Project Analytics

**GET** `/analytics/projects`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "65abc123...",
      "name": "E-Commerce Platform Redesign",
      "completion": 65,
      "timeProgress": "75.00",
      "budgetUtilization": "72.00",
      "health": "Needs Attention",
      "variance": 70000
    }
  ]
}
```

---

## AI Endpoints

### 1. Predict Project Success

**POST** `/ai/predict-success`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Request:
```json
{
  "projectId": "65abc123..."
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "65pred123...",
    "projectId": "65abc123...",
    "projectName": "E-Commerce Platform Redesign",
    "predictionType": "success",
    "successProbability": 72.5,
    "riskScore": 27.5,
    "confidence": 85,
    "factors": {
      "budgetUtilization": 72,
      "timeProgress": 75,
      "completionRate": 65,
      "teamSize": 8,
      "riskLevel": "Medium"
    },
    "recommendations": [
      "Project is behind schedule - consider additional resources",
      "Budget utilization is appropriate for current progress"
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Analyze Project Risk

**POST** `/ai/analyze-risk`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Request:
```json
{
  "projectId": "65abc123..."
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "65risk123...",
    "projectId": "65abc123...",
    "projectName": "E-Commerce Platform Redesign",
    "predictionType": "risk",
    "riskScore": 45,
    "confidence": 85,
    "recommendations": [
      "Monitor budget closely",
      "Project is behind schedule",
      "Review and update risk mitigation strategies"
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Get All AI Insights

**GET** `/ai/insights`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "projectId": "65abc123...",
      "projectName": "E-Commerce Platform Redesign",
      "department": "Engineering",
      "status": "Active",
      "successProbability": 72.5,
      "riskScore": 45,
      "healthStatus": "Good",
      "recommendations": [
        {
          "priority": "Medium",
          "message": "Monitor project closely"
        }
      ]
    }
  ]
}
```

### 4. Get Portfolio Insights

**GET** `/ai/portfolio-insights`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Response (200):
```json
{
  "success": true,
  "data": {
    "portfolioHealth": {
      "averageSuccessProbability": "68.50",
      "averageRiskScore": "38.20",
      "totalProjects": 5,
      "healthStatus": "Moderate"
    },
    "highRiskProjects": [
      {
        "name": "Data Analytics Infrastructure",
        "riskScore": 65,
        "reasons": [...]
      }
    ],
    "highSuccessProjects": [
      {
        "name": "Mobile App Development",
        "successProbability": 85
      }
    ],
    "recommendations": [
      "Continue monitoring project metrics regularly"
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server Error"
}
```

---

## Postman Collection

Import this JSON to get all requests in Postman:

```json
{
  "info": {
    "name": "Project Portfolio API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin123\"\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN_HERE"
    }
  ]
}
```

---

## cURL Examples

### Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Get Projects:
```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Project:
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project","department":"Engineering","budget":100000,"startDate":"2024-01-01","endDate":"2024-12-31","manager":"Manager Name","riskLevel":"Low"}'
```

---

## Testing Workflow

1. **Register/Login** → Get token
2. **Create Project** → Get project ID
3. **Create Employee** → Get employee ID
4. **Assign Employee to Project**
5. **Create Financial Record** for project
6. **Get Dashboard Analytics**
7. **Predict Success** for project
8. **Get AI Insights**

---

**Happy Testing! 🚀**
