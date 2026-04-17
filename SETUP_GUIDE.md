# 🚀 AR Fashion Advisor - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Frontend Setup](#frontend-setup)
5. [Backend Setup](#backend-setup)
6. [Testing the Application](#testing-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js & npm**
   - Version: 18.x or higher
   - Download: https://nodejs.org/
   - Verify installation:
     \`\`\`bash
     node --version  # Should show v18.x.x or higher
     npm --version   # Should show 9.x.x or higher
     \`\`\`

2. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

3. **MongoDB**
   - **Option A (Recommended): MongoDB Atlas (Cloud - FREE)**
     - Sign up at: https://www.mongodb.com/cloud/atlas
     - Create FREE M0 cluster
     - Get connection string
   
   - **Option B: Local Installation**
     - Download: https://www.mongodb.com/try/download/community
     - Install and run: `mongod`

4. **PostgreSQL** (Optional for MVP)
   - **Option A (Recommended): Neon.tech (Cloud - FREE)**
     - Sign up at: https://neon.tech
     - Create database
     - Get connection string
   
   - **Option B: Local Installation**
     - Download: https://www.postgresql.org/download/
     - Install and run

5. **Redis** (Optional - can skip initially)
   - **Option A: Upstash (Cloud - FREE)**
     - Sign up at: https://upstash.com
   
   - **Option B: Local (using Docker)**
     \`\`\`bash
     docker run -d -p 6379:6379 --name redis redis:alpine
     \`\`\`

6. **Code Editor**
   - VS Code (Recommended): https://code.visualstudio.com/
   - With extensions: ES7+ React/Redux, Tailwind CSS IntelliSense, ESLint

---

## Initial Setup

### Step 1: Get the Project Files

\`\`\`bash
# If you have the project on GitHub
git clone https://github.com/yourusername/ar-fashion-advisor.git
cd ar-fashion-advisor

# OR if you have the zip file
unzip ar-fashion-advisor.zip
cd ar-fashion-advisor
\`\`\`

### Step 2: Verify Project Structure

\`\`\`bash
ls
# You should see:
# frontend/  backend/  ml-service/  docs/  README.md
\`\`\`

---

## Database Configuration

### MongoDB Atlas Setup (Recommended)

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Click "Try Free"
   - Sign up with your student email

2. **Create Cluster**
   - Choose FREE M0 tier
   - Select cloud provider: AWS
   - Region: Choose closest to you
   - Cluster name: arfashion-cluster
   - Click "Create"

3. **Create Database User**
   - Security → Database Access
   - Add New Database User
   - Authentication: Password
   - Username: `arfashion`
   - Password: Generate secure password (save it!)
   - User Privileges: Read and write to any database
   - Add User

4. **Configure Network Access**
   - Security → Network Access
   - Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://arfashion:YOUR_PASSWORD@cluster.mongodb.net/arfashion?retryWrites=true&w=majority`

### PostgreSQL Neon Setup (Recommended)

1. **Create Account**
   - Go to: https://neon.tech
   - Sign in with GitHub (use student account)

2. **Create Project**
   - Click "New Project"
   - Name: ar-fashion-products
   - Region: Choose closest
   - Create

3. **Get Connection String**
   - Dashboard → Connection Details
   - Copy the connection string
   - Example: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`

### Redis Upstash Setup (Optional)

1. **Create Account**
   - Go to: https://upstash.com
   - Sign up with GitHub

2. **Create Database**
   - Click "Create Database"
   - Name: arfashion-cache
   - Type: Regional
   - Region: Choose closest
   - Create

3. **Get Connection URL**
   - Copy Redis URL from dashboard
   - Example: `redis://default:password@region.upstash.io:6379`

---

## Frontend Setup

### Step 1: Install Dependencies

\`\`\`bash
cd frontend
npm install
\`\`\`

This will install all packages listed in `package.json`. It may take 2-3 minutes.

### Step 2: Configure Environment

\`\`\`bash
# Create .env file from template
cp .env.example .env

# Edit .env file
nano .env  # or use VS Code: code .env
\`\`\`

Update `.env` with these values:
\`\`\`env
VITE_API_URL=http://localhost:8080/api
VITE_CLOUDINARY_CLOUD_NAME=demo  # Use 'demo' for testing
VITE_ENV=development
\`\`\`

### Step 3: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
\`\`\`

✅ Frontend is now running at **http://localhost:3000**

Keep this terminal open!

---

## Backend Setup

### Step 1: Install Dependencies

Open a NEW terminal window:

\`\`\`bash
cd backend
npm install
\`\`\`

### Step 2: Configure Environment

\`\`\`bash
cp .env.example .env
code .env  # or nano .env
\`\`\`

Update `.env` with your actual database URLs:

\`\`\`env
NODE_ENV=development
PORT=8080

# MongoDB - Use your Atlas connection string
MONGODB_URI=mongodb+srv://arfashion:YOUR_PASSWORD@cluster.mongodb.net/arfashion

# PostgreSQL - Use your Neon connection string (or skip if not using yet)
POSTGRESQL_URI=postgresql://user:password@ep-xxx.neon.tech/neondb

# Redis - Use Upstash URL (or skip if not using yet)
REDIS_URL=redis://default:password@region.upstash.io:6379

# JWT Secret - Generate a random string
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Frontend URL
FRONTEND_URL=http://localhost:3000

# AWS S3 or Cloudinary (can skip initially)
# CLOUDINARY_CLOUD_NAME=your-name
# CLOUDINARY_API_KEY=your-key
# CLOUDINARY_API_SECRET=your-secret
\`\`\`

**Generate JWT Secret:**
\`\`\`bash
# On Mac/Linux
openssl rand -base64 32

# Or use any random 32+ character string
\`\`\`

### Step 3: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
🚀 Server running on port 8080 in development mode
✅ MongoDB Connected: cluster.mongodb.net
📊 Health check: http://localhost:8080/health
🔗 API base URL: http://localhost:8080/api
\`\`\`

✅ Backend is now running at **http://localhost:8080**

---

## Testing the Application

### 1. Test Backend Health

Open browser: http://localhost:8080/health

You should see:
\`\`\`json
{
  "status": "OK",
  "timestamp": "2026-02-08T...",
  "uptime": 5.123
}
\`\`\`

### 2. Test Frontend

Open browser: http://localhost:3000

You should see the landing page with:
- Header: "AR Fashion Advisor"
- Get Started button
- Feature cards

### 3. Test Full Stack

1. Click "Get Started" → Should redirect to signup page
2. Fill signup form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
3. Click "Create Account"

**Expected:** 
- If backend is connected: Redirects to profile setup
- If backend is down: Shows error message

---

## Next Steps

### 1. Create Sample Components

Now that setup is complete, you can start creating components:

\`\`\`bash
cd frontend/src/pages
\`\`\`

Create a simple Home page for testing:
\`\`\`jsx
// frontend/src/pages/Home.jsx
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">AR Fashion Advisor</h1>
        <p className="text-2xl mb-8">Find Your Perfect Style</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Get Started
        </button>
      </div>
    </div>
  );
}
\`\`\`

### 2. Create Backend Routes

Create a test endpoint:
\`\`\`javascript
// backend/src/routes/index.js
import express from 'express';
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

export default router;
\`\`\`

Test: http://localhost:8080/api/test

---

## Troubleshooting

### Frontend Won't Start

**Error: "Cannot find module"**
\`\`\`bash
cd frontend
rm -rf node_modules package-lock.json
npm install
\`\`\`

**Error: "Port 3000 already in use"**
\`\`\`bash
# Kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
\`\`\`

### Backend Won't Start

**Error: "MongoDB connection failed"**
- Check your MongoDB URI in `.env`
- Verify network access in MongoDB Atlas (allow 0.0.0.0/0)
- Check username and password

**Error: "Port 8080 already in use"**
\`\`\`bash
# Change port in backend/.env
PORT=8081
\`\`\`

### Database Connection Issues

**MongoDB Atlas**
1. Check username/password
2. Verify IP whitelist (should be 0.0.0.0/0)
3. Ensure cluster is running (not paused)

**PostgreSQL**
1. Verify connection string
2. Check database exists
3. Test connection:
   \`\`\`bash
   psql "postgresql://user:pass@host/db"
   \`\`\`

### Can't Access Localhost

- Try `http://127.0.0.1:3000` instead of `localhost`
- Check if firewall is blocking ports
- Verify servers are actually running (check terminal output)

---

## Getting Help

1. **Check Logs**
   - Frontend: Look at browser console (F12 → Console)
   - Backend: Look at terminal where `npm run dev` is running

2. **Common Issues Document**
   - See `docs/COMMON_ISSUES.md`

3. **Ask for Help**
   - Create GitHub Issue
   - Ask on project Discord/Slack
   - Email: support@example.com

---

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB Atlas account created and cluster running
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend `.env` configured
- [ ] Backend `.env` configured with database URLs
- [ ] Frontend running on http://localhost:3000
- [ ] Backend running on http://localhost:8080
- [ ] Health check passes at http://localhost:8080/health
- [ ] Can see landing page at http://localhost:3000

---

**If all checkboxes are ✅, you're ready to start development! 🎉**

Next: Follow the development roadmap in `docs/DEVELOPMENT_ROADMAP.md`
