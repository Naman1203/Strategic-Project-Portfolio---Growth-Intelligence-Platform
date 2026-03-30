# Troubleshooting & FAQ

Common issues and solutions for your AI-Driven Project Portfolio Platform.

---

## Table of Contents

1. [Backend Issues](#backend-issues)
2. [Database Issues](#database-issues)
3. [Frontend Integration Issues](#frontend-integration-issues)
4. [Authentication Issues](#authentication-issues)
5. [API Issues](#api-issues)
6. [Deployment Issues](#deployment-issues)
7. [Performance Issues](#performance-issues)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## Backend Issues

### ❌ Error: "Cannot find module"

**Problem:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
cd backend
rm -rf node_modules
npm install
```

---

### ❌ Error: "Port 5000 already in use"

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution 1: Kill the process**
```bash
# Find process using port 5000
lsof -i :5000
# or on Windows
netstat -ano | findstr :5000

# Kill the process
kill -9 <PID>
# or on Windows
taskkill /PID <PID> /F
```

**Solution 2: Change port**
```bash
# In .env file
PORT=5001
```

---

### ❌ Error: "JWT secret not defined"

**Problem:**
```
Error: JWT_SECRET is not defined
```

**Solution:**
```bash
# Check .env file exists
ls -la backend/.env

# If not, create it
cp backend/.env.example backend/.env

# Edit and add JWT_SECRET
JWT_SECRET=your-secret-key-here
```

---

### ❌ Backend crashes on startup

**Problem:**
Server starts then crashes immediately

**Solution:**
```bash
# Check logs for errors
npm run dev

# Common causes:
# 1. Missing .env file
# 2. Wrong MongoDB connection string
# 3. Missing dependencies
# 4. Syntax errors in code
```

---

## Database Issues

### ❌ Error: "MongoDB connection failed"

**Problem:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution 1: Start MongoDB (Local)**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Solution 2: Check connection string**
```bash
# In .env file
MONGODB_URI=mongodb://localhost:27017/project-portfolio

# For Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

**Solution 3: Check MongoDB status**
```bash
# macOS
brew services list

# Linux
sudo systemctl status mongod

# Test connection
mongosh
```

---

### ❌ Error: "Authentication failed" (MongoDB Atlas)

**Problem:**
```
MongoServerError: Authentication failed
```

**Solutions:**

1. **Check password**
   - No special characters that need URL encoding
   - If password has special chars, encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`

2. **Check username**
   - Must match database user (not Atlas account)

3. **Verify database name**
```
mongodb+srv://user:pass@cluster.net/DATABASE_NAME_HERE?retryWrites=true
                                      ↑
                                  Add this!
```

---

### ❌ Error: "IP not whitelisted" (MongoDB Atlas)

**Problem:**
```
Error: connection refused
```

**Solution:**
1. Go to MongoDB Atlas
2. Network Access → IP Access List
3. Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
4. Wait 2-3 minutes for changes to propagate

---

### ❌ Seed data not importing

**Problem:**
```bash
npm run seed
# No data appears in database
```

**Solution:**
```bash
# Check if script ran successfully
npm run seed

# You should see:
# Data Destroyed...
# Users Created...
# Projects Created...
# Data Imported Successfully!

# If errors occur, check:
# 1. MongoDB is running
# 2. Connection string is correct
# 3. No network issues
```

---

## Frontend Integration Issues

### ❌ Error: "Network Error" when calling API

**Problem:**
```
AxiosError: Network Error
```

**Solutions:**

1. **Check backend is running**
```bash
curl http://localhost:5000/api/health
```

2. **Check API URL**
```javascript
// In frontend .env or api.js
const API_URL = 'http://localhost:5000/api';  // Must match backend
```

3. **Check CORS settings**
```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:3000',  // Must match frontend URL
  credentials: true
}));
```

---

### ❌ CORS Error

**Problem:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**

**Backend (server.js):**
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

**Check FRONTEND_URL in backend .env:**
```env
FRONTEND_URL=http://localhost:3000
```

---

### ❌ Data not updating in frontend

**Problem:**
User creates/updates data but UI doesn't reflect changes

**Solution:**

1. **Call fetch function after mutations**
```javascript
const handleCreate = async (data) => {
  await projectsAPI.create(data);
  await fetchProjects();  // ← Add this
};
```

2. **Check API response**
```javascript
const response = await projectsAPI.create(data);
console.log('Response:', response.data);
```

3. **Check browser console for errors**
```
F12 → Console tab
```

---

## Authentication Issues

### ❌ Error: "Not authorized to access this route"

**Problem:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Solutions:**

1. **Check token exists**
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);
```

2. **Check token format in headers**
```javascript
// Should be:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// NOT:
Authorization: eyJhbGciOiJIUzI1NiIs...  // Missing "Bearer "
```

3. **Check token expiration**
```javascript
// Token expires after JWT_EXPIRE time (default 7 days)
// Login again to get new token
```

---

### ❌ Login works but protected routes fail

**Problem:**
Login succeeds but subsequent API calls fail with 401

**Solution:**

1. **Verify token is saved**
```javascript
// After login
localStorage.setItem('token', response.data.token);
console.log('Saved token:', localStorage.getItem('token'));
```

2. **Check Axios interceptor**
```javascript
// In api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

3. **Clear old tokens**
```javascript
localStorage.removeItem('token');
// Login again
```

---

### ❌ Password not matching

**Problem:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Solutions:**

1. **Check password format**
   - Minimum 6 characters required
   - Case sensitive

2. **Use seeded credentials**
```
Email: admin@example.com
Password: admin123
```

3. **Register new user**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

---

## API Issues

### ❌ Error: 404 Not Found

**Problem:**
```
GET /api/project → 404 Not Found
```

**Solution:**
```bash
# Check endpoint spelling
# Should be plural:
GET /api/projects  ✓
GET /api/project   ✗

# Common correct endpoints:
/api/projects
/api/employees
/api/financials
/api/analytics/dashboard
/api/ai/insights
```

---

### ❌ Error: 500 Internal Server Error

**Problem:**
```json
{
  "success": false,
  "error": "Server Error"
}
```

**Solution:**

1. **Check backend logs**
```bash
# Development
npm run dev
# Check terminal output

# Production (Railway)
railway logs

# Production (Heroku)
heroku logs --tail
```

2. **Common causes:**
   - Database connection lost
   - Missing required fields
   - Invalid ObjectId format
   - Unhandled errors in controllers

3. **Test with simple request**
```bash
curl http://localhost:5000/api/health
```

---

### ❌ Empty response or undefined data

**Problem:**
```javascript
const projects = response.data.data;
// projects is undefined
```

**Solution:**

1. **Check response structure**
```javascript
console.log('Full response:', response);
console.log('Response data:', response.data);

// API returns:
{
  success: true,
  data: [...]
}

// Access as:
response.data.data
```

2. **Handle loading/error states**
```javascript
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

---

## Deployment Issues

### ❌ Vercel deployment fails

**Problem:**
```
Error: Build failed
```

**Solutions:**

1. **Check build command**
```json
// package.json
{
  "scripts": {
    "build": "react-scripts build"
  }
}
```

2. **Check environment variables**
   - Go to Vercel → Project Settings → Environment Variables
   - Add `REACT_APP_API_URL`

3. **Check for errors in code**
   - Build locally first: `npm run build`
   - Fix any warnings/errors

---

### ❌ Railway/Heroku deployment fails

**Problem:**
Backend won't start in production

**Solutions:**

1. **Check start script**
```json
// package.json
{
  "scripts": {
    "start": "node server.js"  // Must use 'node', not 'nodemon'
  }
}
```

2. **Check environment variables**
```bash
# Railway
railway variables

# Heroku
heroku config
```

3. **Check logs**
```bash
# Railway
railway logs

# Heroku
heroku logs --tail
```

---

### ❌ Frontend works locally but not in production

**Problem:**
Deployed frontend can't connect to backend

**Solution:**

1. **Check API URL**
```javascript
// Should use production backend URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// In production .env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

2. **Check CORS in backend**
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app'  // Add production URL
  ]
}));
```

3. **Check HTTPS/HTTP matching**
   - Both should use HTTPS in production
   - Mixed content errors if frontend (HTTPS) calls backend (HTTP)

---

## Performance Issues

### ❌ Slow API responses

**Problem:**
API takes > 2 seconds to respond

**Solutions:**

1. **Add database indexes**
```javascript
// In MongoDB
db.projects.createIndex({ department: 1, status: 1 });
```

2. **Use projection (select specific fields)**
```javascript
// Instead of:
const projects = await Project.find();

// Use:
const projects = await Project.find()
  .select('name department budget status')
  .lean();  // Returns plain JS objects (faster)
```

3. **Implement pagination**
```javascript
const page = parseInt(req.query.page) || 1;
const limit = 20;
const skip = (page - 1) * limit;

const projects = await Project.find()
  .limit(limit)
  .skip(skip);
```

4. **Add caching**
```javascript
// Cache frequently accessed data
const cache = new Map();

const getCached = (key, fetchFn, ttl = 300000) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < ttl) {
    return cached.data;
  }
  const data = fetchFn();
  cache.set(key, { data, time: Date.now() });
  return data;
};
```

---

### ❌ Memory leaks

**Problem:**
Server crashes after running for a while

**Solutions:**

1. **Close database connections properly**
```javascript
// Use connection pooling (Mongoose does this by default)
```

2. **Clear intervals/timeouts**
```javascript
// In frontend
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 30000);
  
  return () => clearInterval(interval);  // Clean up!
}, []);
```

3. **Monitor memory**
```bash
# Check server memory usage
top -pid <process-id>

# Or use PM2
pm2 monit
```

---

## Frequently Asked Questions

### Q: Do I need to use TypeScript?

**A:** No! The current implementation uses pure JavaScript. TypeScript is optional and can be added later if needed.

---

### Q: Can I use PostgreSQL instead of MongoDB?

**A:** Yes, but you'll need to:
1. Change Mongoose to a PostgreSQL ORM (like Sequelize or Prisma)
2. Update all models to use SQL schemas
3. Rewrite queries to use SQL syntax

MongoDB is recommended because the backend is already built for it.

---

### Q: How do I add more users?

**A:** Three ways:

1. **Registration endpoint**
```bash
POST /api/auth/register
```

2. **Directly in MongoDB**
```bash
mongosh
use project-portfolio
db.users.insertOne({
  name: "New User",
  email: "user@example.com",
  password: "hashed_password",
  role: "user"
})
```

3. **Update seed script**
```javascript
// backend/utils/seedData.js
// Add more users to the users array
```

---

### Q: How do I change JWT expiration time?

**A:** Update `.env`:
```env
JWT_EXPIRE=30d  # 30 days
JWT_EXPIRE=12h  # 12 hours
JWT_EXPIRE=7d   # 7 days (default)
```

---

### Q: How do I add new fields to models?

**A:** 

1. **Update Mongoose model**
```javascript
// backend/models/Project.js
const projectSchema = new mongoose.Schema({
  // ... existing fields ...
  customField: {
    type: String,
    default: ''
  }
});
```

2. **No migration needed** - MongoDB is schemaless
3. **New documents** will have the field
4. **Existing documents** won't break (field will be undefined)

---

### Q: Can I add file uploads?

**A:** Yes! Use `multer`:

```bash
npm install multer
```

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/projects/:id/upload', upload.single('file'), (req, res) => {
  // req.file contains file info
  // Save file path to database
});
```

---

### Q: How do I implement real-time updates?

**A:** Use WebSockets:

```bash
npm install socket.io
```

```javascript
// server.js
const socketIO = require('socket.io');
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('projectUpdate', (data) => {
    io.emit('projectUpdated', data);
  });
});
```

---

### Q: How do I reset my database?

**A:**

```bash
# Delete all data
npm run seed -- -d

# Add fresh sample data
npm run seed
```

Or manually:
```bash
mongosh
use project-portfolio
db.dropDatabase()
```

---

### Q: How do I backup my database?

**A:**

**MongoDB Atlas:** Automatic backups included

**Manual backup:**
```bash
mongodump --uri="mongodb+srv://..." --out=./backup-2024-01-15

# Restore
mongorestore --uri="mongodb+srv://..." ./backup-2024-01-15
```

---

### Q: Can I use this in production?

**A:** Yes! But ensure:
- ✅ Strong JWT_SECRET
- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ MongoDB Atlas (not local)
- ✅ Regular backups
- ✅ Monitoring setup
- ✅ Error tracking
- ✅ Rate limiting added

---

### Q: How do I add rate limiting?

**A:**

```bash
npm install express-rate-limit
```

```javascript
// server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

### Q: How do I add email notifications?

**A:**

```bash
npm install nodemailer
```

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html
  });
};
```

---

### Q: How do I add tests?

**A:**

```bash
npm install --save-dev jest supertest
```

```javascript
// __tests__/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });
});
```

---

## Still Having Issues?

### Debug Checklist

- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] Environment variables are set
- [ ] No syntax errors in code
- [ ] Dependencies installed (`npm install`)
- [ ] Correct API endpoints used
- [ ] CORS configured properly
- [ ] Token included in requests
- [ ] Browser console checked for errors
- [ ] Backend logs checked for errors

### Get Help

1. **Check documentation**
   - QUICK_START_GUIDE.md
   - FRONTEND_INTEGRATION_GUIDE.md
   - API_TESTING_EXAMPLES.md

2. **Check logs**
   ```bash
   # Development
   npm run dev  # Watch terminal output
   
   # Browser
   F12 → Console tab
   F12 → Network tab
   ```

3. **Test with simple requests**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Test endpoints with Postman
   ```

4. **Search error message**
   - Google the exact error
   - Check Stack Overflow
   - Check MongoDB documentation

---

**Remember:** Most issues are configuration-related. Double-check environment variables, connection strings, and URLs!

**Good luck! 🚀**
