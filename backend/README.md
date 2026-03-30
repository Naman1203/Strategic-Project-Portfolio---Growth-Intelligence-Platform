# AI-Driven Strategic Project Portfolio Backend

Node.js + Express + MongoDB backend for the Project Portfolio Management Platform.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update the values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/project-portfolio
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```
3. Use connection string: `mongodb://localhost:27017/project-portfolio`

### Option 2: MongoDB Atlas (Cloud)

1. Create free account at: https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Add your IP address to whitelist
4. Create database user with password
5. Get connection string from "Connect" button
6. Update `MONGODB_URI` in `.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-portfolio?retryWrites=true&w=majority
   ```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/updatedetails` - Update user details (Protected)
- `PUT /api/auth/updatepassword` - Update password (Protected)

### Projects
- `GET /api/projects` - Get all projects (Protected)
- `GET /api/projects/:id` - Get single project (Protected)
- `POST /api/projects` - Create project (Protected)
- `PUT /api/projects/:id` - Update project (Protected)
- `DELETE /api/projects/:id` - Delete project (Protected)
- `PUT /api/projects/:id/assign/:employeeId` - Assign employee (Protected)
- `PUT /api/projects/:id/remove/:employeeId` - Remove employee (Protected)

### Employees
- `GET /api/employees` - Get all employees (Protected)
- `GET /api/employees/:id` - Get single employee (Protected)
- `POST /api/employees` - Create employee (Protected)
- `PUT /api/employees/:id` - Update employee (Protected)
- `DELETE /api/employees/:id` - Delete employee (Protected)
- `GET /api/employees/available` - Get available employees (Protected)
- `GET /api/employees/department/:department` - Get employees by department (Protected)

### Financials
- `GET /api/financials` - Get all financial records (Protected)
- `GET /api/financials/:id` - Get single record (Protected)
- `POST /api/financials` - Create record (Protected)
- `PUT /api/financials/:id` - Update record (Protected)
- `DELETE /api/financials/:id` - Delete record (Protected)
- `GET /api/financials/project/:projectId` - Get financials by project (Protected)
- `GET /api/financials/summary` - Get financial summary (Protected)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics (Protected)
- `GET /api/analytics/projects` - Get project analytics (Protected)
- `GET /api/analytics/employees` - Get employee analytics (Protected)
- `GET /api/analytics/financials` - Get financial analytics (Protected)

### AI Insights
- `POST /api/ai/predict-success` - Predict project success (Protected)
- `POST /api/ai/analyze-risk` - Analyze project risk (Protected)
- `GET /api/ai/insights` - Get all AI insights (Protected)
- `GET /api/ai/predictions/:projectId` - Get predictions for project (Protected)
- `GET /api/ai/portfolio-insights` - Get portfolio-wide insights (Protected)

### Health Check
- `GET /api/health` - Check API status (Public)

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To get a token:
1. Register or login via `/api/auth/register` or `/api/auth/login`
2. Use the returned `token` in subsequent requests

## Testing with Postman or cURL

### Register User:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Project (with token):
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "New Project",
    "department": "Engineering",
    "budget": 100000,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "manager": "John Doe",
    "riskLevel": "Low"
  }'
```

## Database Models

### User
- name, email, password (hashed), role, department

### Project
- name, department, budget, spent, startDate, endDate, status, manager, riskLevel, completion, description, teamSize, assignedEmployees

### Employee
- name, email, department, role, skills, assignedProjects, salary, hireDate, availability

### Financial
- projectId, projectName, category, amount, date, type, description, status

### Prediction
- projectId, projectName, predictionType, successProbability, riskScore, recommendations, factors, confidence

## Seed Data (Optional)

To populate the database with sample data, create a seed script in `/backend/utils/seedData.js` and run:

```bash
npm run seed
```

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── projectController.js  # Project CRUD
│   ├── employeeController.js # Employee CRUD
│   ├── financialController.js# Financial CRUD
│   ├── analyticsController.js# Analytics logic
│   └── aiController.js       # AI predictions
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Project.js           # Project schema
│   ├── Employee.js          # Employee schema
│   ├── Financial.js         # Financial schema
│   └── Prediction.js        # Prediction schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── projects.js          # Project routes
│   ├── employees.js         # Employee routes
│   ├── financials.js        # Financial routes
│   ├── analytics.js         # Analytics routes
│   └── ai.js                # AI routes
├── utils/
│   └── aiAlgorithms.js      # AI prediction algorithms
├── .env.example             # Example environment variables
├── package.json             # Dependencies
└── server.js                # Entry point
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, verify IP whitelist and credentials

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Issues
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that frontend is running on the specified URL

## Connecting Frontend

Update your frontend API calls to use:
```javascript
const API_URL = 'http://localhost:5000/api';

// Example: Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Example: Get projects (with token)
const response = await fetch(`${API_URL}/projects`, {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Production Deployment

1. **Deploy Backend:**
   - Heroku, Railway, DigitalOcean, AWS, etc.
   - Set environment variables in hosting platform
   - Use MongoDB Atlas for database

2. **Update Frontend:**
   - Change `API_URL` to your deployed backend URL
   - Deploy frontend separately (Vercel, Netlify, etc.)

3. **Security:**
   - Use strong `JWT_SECRET`
   - Enable HTTPS
   - Set proper CORS origins
   - Add rate limiting
   - Implement input validation

## Support

For issues or questions:
- Check MongoDB connection
- Verify environment variables
- Review server logs
- Test endpoints with Postman
