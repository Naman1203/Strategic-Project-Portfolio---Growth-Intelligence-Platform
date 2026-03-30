# Quick Start Guide - MongoDB Backend Setup

This is a step-by-step guide to get your MongoDB backend up and running in **15 minutes**.

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed (check: `node --version`)
- ✅ MongoDB installed OR MongoDB Atlas account
- ✅ Terminal/Command Prompt access

---

## Option A: Local MongoDB (Fastest for Development)

### Step 1: Install MongoDB

**macOS (with Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB runs automatically as a service

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# The default .env is already configured for local MongoDB
# You can start the server immediately!
```

### Step 3: Start Backend Server

```bash
# Start in development mode
npm run dev
```

You should see:
```
MongoDB Connected: localhost:27017
Server running in development mode on port 5000
```

### Step 4: Seed Sample Data (Optional but Recommended)

```bash
# In a new terminal, from backend folder
npm run seed
```

You should see:
```
Data Imported Successfully!

Login Credentials:
Admin: admin@example.com / admin123
Manager: john@example.com / password123
User: jane@example.com / password123
```

### Step 5: Test the API

Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

✅ **Done! Your backend is running!**

---

## Option B: MongoDB Atlas (Cloud - No Local Install)

### Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free (credit card NOT required)
3. Choose **FREE** tier (M0 Sandbox)
4. Select cloud provider and region (any will work)
5. Create cluster (takes 3-5 minutes)

### Step 2: Configure Database Access

1. In Atlas dashboard, click **Database Access** (left menu)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `adminuser` (or any name you want)
5. Password: Click **Autogenerate Secure Password** and **COPY IT**
6. User Privileges: **Atlas Admin**
7. Click **Add User**

### Step 3: Configure Network Access

1. Click **Network Access** (left menu)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
4. Confirm

### Step 4: Get Connection String

1. Click **Database** (left menu)
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
```
mongodb+srv://adminuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 5: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file
# Replace MONGODB_URI with your Atlas connection string
# Replace <password> with your actual database password
```

Your `.env` should look like:
```env
MONGODB_URI=mongodb+srv://adminuser:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/project-portfolio?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Step 6: Start Backend

```bash
npm run dev
```

You should see:
```
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
Server running in development mode on port 5000
```

### Step 7: Seed Sample Data

```bash
npm run seed
```

✅ **Done! Your cloud backend is running!**

---

## Testing Your Backend

### Test 1: Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running"
}
```

### Test 2: Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }
}
```

### Test 3: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Copy the token** from the response!

### Test 4: Get Projects (Authenticated)

```bash
# Replace YOUR_TOKEN_HERE with the token from login
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

---

## Using Postman (Recommended for Testing)

1. Download Postman: https://www.postman.com/downloads/
2. Create new collection: "Project Portfolio API"
3. Add requests:

**Login Request:**
- Method: POST
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
- Click **Send**
- Copy the `token` from response

**Get Projects Request:**
- Method: GET
- URL: `http://localhost:5000/api/projects`
- Headers: 
  - Key: `Authorization`
  - Value: `Bearer YOUR_TOKEN_HERE`
- Click **Send**

---

## Next Steps

### 1. Integrate with Frontend

Follow the **FRONTEND_INTEGRATION_GUIDE.md** to connect your React app.

### 2. Customize

- Change `JWT_SECRET` in `.env` to a random string
- Adjust `JWT_EXPIRE` as needed
- Update `FRONTEND_URL` if your frontend runs on a different port

### 3. Explore API

All endpoints are documented in `/backend/README.md`

---

## Troubleshooting

### "MongoDB connection failed"

**Local MongoDB:**
```bash
# macOS
brew services restart mongodb-community

# Linux
sudo systemctl restart mongodb

# Windows - restart MongoDB service from Services app
```

**MongoDB Atlas:**
- Check your connection string
- Verify password is correct (no special characters that need encoding)
- Ensure IP address is whitelisted

### "Port 5000 already in use"

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env to 5001
```

### "Module not found"

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### CORS errors when testing from frontend

Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly:
```env
FRONTEND_URL=http://localhost:3000
```

---

## Production Deployment (When Ready)

### Backend Options:
- **Heroku** (easiest): https://www.heroku.com/
- **Railway** (modern): https://railway.app/
- **DigitalOcean** (droplets): https://www.digitalocean.com/
- **AWS EC2** (most control): https://aws.amazon.com/ec2/

### Database:
- Use **MongoDB Atlas** (it's free and cloud-based)

### Steps:
1. Deploy backend to hosting platform
2. Set environment variables on hosting platform
3. Update frontend `REACT_APP_API_URL` to your deployed backend URL
4. Deploy frontend to Vercel/Netlify

---

## Support & Resources

- **Backend Code**: `/backend/` folder
- **API Documentation**: `/backend/README.md`
- **Frontend Integration**: `/FRONTEND_INTEGRATION_GUIDE.md`
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express.js Docs**: https://expressjs.com/
- **Mongoose Docs**: https://mongoosejs.com/

---

## Summary Checklist

- [ ] Node.js installed
- [ ] MongoDB running (local or Atlas)
- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Backend server running (`npm run dev`)
- [ ] Sample data seeded (`npm run seed`)
- [ ] API health check working
- [ ] Login working in Postman
- [ ] Get projects working with token
- [ ] Ready to integrate with frontend!

**Congratulations! Your MongoDB backend is ready! 🎉**

Now proceed to **FRONTEND_INTEGRATION_GUIDE.md** to connect your React application.
