# Production Deployment Guide

Complete guide for deploying your full-stack application to production.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup (MongoDB Atlas)](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Security

- [ ] Change `JWT_SECRET` to a secure random string (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Remove any console.log statements with sensitive data
- [ ] Enable HTTPS only
- [ ] Set specific CORS origins (not `*`)
- [ ] Add rate limiting
- [ ] Implement request validation
- [ ] Review error messages (don't expose internals)

### Code Quality

- [ ] All features tested
- [ ] No critical bugs
- [ ] Code cleaned up
- [ ] Dependencies updated
- [ ] Remove unused packages
- [ ] Comments added for complex logic

### Configuration

- [ ] Environment variables documented
- [ ] Database indexes created
- [ ] Seed data ready (if needed)
- [ ] Backup strategy planned

---

## Database Setup (MongoDB Atlas)

### Step 1: Create Account & Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free tier available)
3. Create new cluster (M0 Sandbox - FREE)
4. Choose cloud provider and region (closest to your users)
5. Name your cluster: `project-portfolio-prod`

### Step 2: Database Access

1. Click **Database Access** → **Add New Database User**
2. Authentication Method: **Password**
3. Username: `produser` (or your choice)
4. Password: Click **Autogenerate Secure Password** → **COPY IT**
5. Database User Privileges: **Atlas Admin**
6. Click **Add User**

### Step 3: Network Access

1. Click **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - *For production, restrict to your server IPs*
3. Click **Confirm**

### Step 4: Get Connection String

1. Click **Database** → **Connect**
2. Choose **Connect your application**
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy connection string:
```
mongodb+srv://produser:<password>@project-portfolio-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Replace `<password>` with your actual password
6. Add database name:
```
mongodb+srv://produser:YOUR_PASSWORD@project-portfolio-prod.xxxxx.mongodb.net/project-portfolio?retryWrites=true&w=majority
```

### Step 5: Create Indexes (Optional but Recommended)

Connect using MongoDB Compass or mongosh:

```javascript
// Projects collection
db.projects.createIndex({ department: 1, status: 1 });
db.projects.createIndex({ createdBy: 1 });
db.projects.createIndex({ startDate: -1 });

// Employees collection
db.employees.createIndex({ email: 1 }, { unique: true });
db.employees.createIndex({ department: 1 });

// Financials collection
db.financials.createIndex({ projectId: 1 });
db.financials.createIndex({ date: -1 });

// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

**Why Railway?**
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Environment variables management
- ✅ Easy setup
- ✅ Built-in logging

**Steps:**

1. **Prepare your code**
```bash
cd backend

# Make sure package.json has start script
# "start": "node server.js"
```

2. **Create account**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

3. **Create new project**
   - Click **New Project**
   - Choose **Deploy from GitHub repo**
   - Select your repository
   - Railway auto-detects Node.js

4. **Set environment variables**
   - Click your project → **Variables**
   - Add:
```env
MONGODB_URI=mongodb+srv://produser:PASSWORD@cluster.mongodb.net/project-portfolio?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-production-key-32-chars-minimum
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
PORT=5000
```

5. **Deploy**
   - Railway automatically deploys
   - Get your backend URL: `https://your-app.up.railway.app`

6. **Test**
```bash
curl https://your-app.up.railway.app/api/health
```

---

### Option 2: Heroku

**Steps:**

1. **Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from heroku.com

# Verify
heroku --version
```

2. **Login**
```bash
heroku login
```

3. **Create app**
```bash
cd backend
heroku create your-app-name
```

4. **Set environment variables**
```bash
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set JWT_EXPIRE="7d"
heroku config:set NODE_ENV="production"
heroku config:set FRONTEND_URL="https://your-frontend.vercel.app"
```

5. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

6. **Open app**
```bash
heroku open
```

7. **View logs**
```bash
heroku logs --tail
```

---

### Option 3: DigitalOcean (More Control)

**Steps:**

1. **Create Droplet**
   - Go to DigitalOcean
   - Create → Droplets
   - Choose: Ubuntu 22.04 LTS
   - Plan: Basic ($6/month)
   - Choose datacenter region

2. **SSH into server**
```bash
ssh root@your-server-ip
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install MongoDB (optional, use Atlas instead)**

5. **Clone repository**
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend
```

6. **Install dependencies**
```bash
npm install --production
```

7. **Create .env file**
```bash
nano .env
# Paste your environment variables
```

8. **Install PM2 (process manager)**
```bash
sudo npm install -g pm2
```

9. **Start application**
```bash
pm2 start server.js --name "project-portfolio-api"
pm2 save
pm2 startup
```

10. **Setup Nginx (reverse proxy)**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

11. **Setup SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended for React)

**Why Vercel?**
- ✅ Free for personal projects
- ✅ Automatic deployments from GitHub
- ✅ CDN and edge network
- ✅ Zero configuration
- ✅ Perfect for React/Next.js

**Steps:**

1. **Prepare frontend**
```bash
cd frontend

# Create .env.production
echo "REACT_APP_API_URL=https://your-backend.railway.app/api" > .env.production
```

2. **Create account**
   - Go to [Vercel.com](https://vercel.com)
   - Sign up with GitHub

3. **Import project**
   - Click **New Project**
   - Import your GitHub repository
   - Vercel auto-detects React

4. **Configure build settings**
   - Framework Preset: **Create React App**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Root Directory: `frontend` (if in subdirectory)

5. **Add environment variables**
   - Go to project settings → **Environment Variables**
   - Add:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

6. **Deploy**
   - Click **Deploy**
   - Get your URL: `https://your-app.vercel.app`

7. **Custom domain (optional)**
   - Settings → Domains
   - Add your custom domain
   - Follow DNS configuration steps

---

### Option 2: Netlify

**Steps:**

1. **Create account** at [Netlify.com](https://netlify.com)

2. **Prepare build**
```bash
cd frontend

# Build locally first to test
npm run build
```

3. **Deploy via drag & drop**
   - Drag `build` folder to Netlify
   - Or connect GitHub for automatic deploys

4. **Configure environment variables**
   - Site settings → Environment variables
   - Add `REACT_APP_API_URL`

5. **Setup redirects** (for React Router)
   
   Create `public/_redirects`:
```
/*    /index.html   200
```

---

## Post-Deployment

### 1. Test All Endpoints

```bash
# Health check
curl https://your-backend.com/api/health

# Login
curl -X POST https://your-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get projects (with token)
curl https://your-backend.com/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Seed Production Data (if needed)

```bash
# If using Railway
railway run npm run seed

# If using Heroku
heroku run npm run seed

# If using DigitalOcean
ssh into server
cd your-repo/backend
npm run seed
```

### 3. Update Frontend API URL

Make sure frontend `.env.production` has correct backend URL:
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### 4. Test Frontend

1. Open your frontend URL
2. Try to register/login
3. Test all CRUD operations
4. Check all pages work
5. Test on mobile devices

### 5. Setup Custom Domains (Optional)

**Backend:**
```bash
# Railway
railway domain

# Heroku
heroku domains:add api.yourdomain.com
```

**Frontend:**
- Add custom domain in Vercel/Netlify dashboard
- Update DNS records at your domain registrar

---

## Monitoring & Maintenance

### 1. Application Monitoring

**Free Options:**
- **Railway/Heroku Logs**: Built-in logging
- **Sentry**: Error tracking ([sentry.io](https://sentry.io))
- **LogRocket**: Session replay
- **New Relic**: Performance monitoring

**Install Sentry:**
```bash
npm install @sentry/node

# In server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### 2. Database Monitoring

**MongoDB Atlas Dashboard:**
- Monitor connections
- Query performance
- Storage usage
- Set up alerts

### 3. Uptime Monitoring

**Free Services:**
- **UptimeRobot**: Checks every 5 minutes
- **Pingdom**: Website monitoring
- **StatusCake**: Uptime & performance

### 4. Backup Strategy

**MongoDB Atlas:**
- Automatic backups enabled (free tier: last 2 days)
- Manual snapshots available
- Point-in-time recovery (paid tiers)

**Manual Backup:**
```bash
mongodump --uri="mongodb+srv://..." --out=./backup
```

### 5. Security Updates

**Regular Maintenance:**
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

### 6. Performance Optimization

**Enable Compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

**Add Caching Headers:**
```javascript
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

**Database Indexes:**
- Monitor slow queries in Atlas
- Add indexes for frequently queried fields

### 7. Log Rotation

**PM2 (DigitalOcean):**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Troubleshooting

### Issue: CORS Errors

**Solution:**
```javascript
// backend/server.js
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'https://www.yourdomain.com'
  ],
  credentials: true
}));
```

### Issue: 502 Bad Gateway

**Causes:**
- Backend not running
- Wrong PORT configuration
- Database connection failed

**Check:**
```bash
# Railway
railway logs

# Heroku
heroku logs --tail
```

### Issue: MongoDB Connection Timeout

**Solutions:**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check network access settings

### Issue: Environment Variables Not Working

**Check:**
- Variables are set in deployment platform
- Frontend variables start with `REACT_APP_`
- Backend uses `process.env.VARIABLE_NAME`

---

## Scaling Considerations

### When to Scale

- **Users**: > 1000 concurrent users
- **Database**: > 500MB data
- **Response Time**: > 2 seconds average

### Horizontal Scaling

**Backend:**
- Add more server instances
- Use load balancer
- Implement Redis for sessions

**Database:**
- MongoDB Atlas auto-scales
- Enable sharding for large datasets
- Use read replicas

### Optimization

1. **Implement Caching**
```javascript
const Redis = require('redis');
const client = Redis.createClient();

// Cache frequently accessed data
```

2. **Add CDN**
- Cloudflare (free tier available)
- AWS CloudFront
- Vercel Edge Network

3. **Optimize Database Queries**
- Use projections (select only needed fields)
- Add indexes
- Use aggregation pipeline

4. **Implement Pagination**
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const projects = await Project.find()
  .limit(limit)
  .skip(skip)
  .sort({ createdAt: -1 });
```

---

## Cost Estimation

### Free Tier (0 users - 1000 users)

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Sandbox | $0 |
| Railway/Heroku | Hobby | $0 |
| Vercel | Free | $0 |
| **Total** | | **$0/month** |

### Small Scale (1000 - 10000 users)

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M2 | $9/month |
| Railway | Developer | $10/month |
| Vercel | Pro | $20/month |
| **Total** | | **$39/month** |

### Medium Scale (10000 - 100000 users)

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M10 | $57/month |
| DigitalOcean | 2 GB RAM | $18/month |
| CDN | Cloudflare Free | $0 |
| **Total** | | **$75/month** |

---

## Deployment Checklist

### Pre-Deploy
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database indexes created
- [ ] Security settings configured
- [ ] Error handling implemented

### Deploy
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set
- [ ] Custom domains configured (optional)

### Post-Deploy
- [ ] All endpoints tested
- [ ] Frontend connects to backend
- [ ] Authentication working
- [ ] CRUD operations working
- [ ] Analytics displaying correctly
- [ ] AI predictions working
- [ ] Mobile responsive
- [ ] Error handling works

### Monitoring
- [ ] Uptime monitoring setup
- [ ] Error tracking configured
- [ ] Database monitoring active
- [ ] Backup strategy implemented
- [ ] Alerts configured

---

## Next Steps After Deployment

1. **Add Users**: Register real users or import data
2. **Monitor Performance**: Watch for slow queries or errors
3. **Gather Feedback**: Get user input on features
4. **Iterate**: Add new features based on feedback
5. **Scale**: Upgrade services as needed

---

## Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Heroku Docs**: https://devcenter.heroku.com/
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials

---

**Congratulations! Your application is now live in production! 🎉**

Remember to:
- Monitor regularly
- Update dependencies
- Back up database
- Respond to user feedback
- Scale as needed

Good luck with your project! 🚀
