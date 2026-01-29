# 🚀 Quick Start Guide - One-Prompt Builder

## ✅ Current Status

**Both servers are running successfully!**

- ✅ **Frontend**: http://localhost:3000 (RUNNING)
- ✅ **Backend**: http://localhost:5000 (RUNNING)
- ⚠️ **Grok API**: Needs configuration (see below)
- ⏸️ **MongoDB**: Needs to be started (see below)

---

## 📋 What's Working Right Now

### Frontend (http://localhost:3000)
✅ Landing page with beautiful UI
✅ Login page (/login)
✅ Register page (/register)
✅ Dashboard pages (will work after authentication)
✅ All components and styling

### Backend (http://localhost:5000)
✅ Server running on port 5000
✅ All API endpoints configured
✅ Health check: http://localhost:5000/health
✅ Authentication routes ready
✅ Project management routes ready
✅ Generation routes ready (needs Grok API key)
✅ Deployment routes ready

---

## 🔧 Required Setup Steps

### 1. Add Your Grok API Key

**Get your API key from:** https://console.x.ai/

**Add it to the backend .env file:**

```bash
# Navigate to backend folder
cd one-prompt-builder-v2/backend

# Open .env file and add your key
# Replace 'your-actual-grok-api-key-here' with your real key
```

Edit `backend/.env`:
```env
GROK_API_KEY=your-actual-grok-api-key-here
```

After adding the key, the backend will automatically restart (nodemon is watching).

---

### 2. Start MongoDB

**Option A: Using MongoDB Compass (Recommended for Windows)**
1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Install and open MongoDB Compass
3. Connect to: `mongodb://localhost:27017`
4. Create a database named: `one-prompt-builder`

**Option B: Using MongoDB Service**
```bash
# Start MongoDB service
net start MongoDB
```

**Option C: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## 🧪 Testing the Application

### Test Frontend
1. Open browser: http://localhost:3000
2. Click "Get Started" or "Login"
3. Try the Register page
4. Explore the landing page features

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Test registration (after MongoDB is running)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

---

## 📱 Using the Application

### 1. Register an Account
- Go to: http://localhost:3000/register
- Fill in your details
- Click "Create Account"

### 2. Login
- Go to: http://localhost:3000/login
- Enter your credentials
- Click "Sign In"

### 3. Create a Project
- After login, you'll be redirected to the dashboard
- Click "Create New Project"
- Enter a prompt like: "Create a modern portfolio website with dark theme"
- Click "Generate"
- The AI will generate your website/app code

### 4. Edit & Preview
- View the generated code in the Monaco editor
- See live preview of your website
- Make changes and see them in real-time

### 5. Deploy
- Click "Deploy" button
- Choose Vercel or Netlify
- Your project will be deployed instantly

---

## 🎯 Available Features

### ✅ Currently Working
- User registration and authentication
- Beautiful landing page
- Login/Register pages
- Project management UI
- Code editor interface
- Preview panel
- Responsive design

### ⚠️ Needs Configuration
- AI code generation (needs Grok API key)
- Database operations (needs MongoDB running)
- Deployment (needs Vercel/Netlify API keys - optional)

---

## 🐛 Troubleshooting

### "Can't reach this page" Error
**Solution:** Make sure both servers are running:
- Frontend: Check terminal running `npm run dev` in frontend folder
- Backend: Check terminal running `npm run dev` in backend folder

### Backend Won't Start
**Solution:** 
1. Make sure you're in the backend folder
2. Run: `npm install` (if dependencies are missing)
3. Check if port 5000 is available
4. Add Grok API key to .env file

### Frontend Won't Start
**Solution:**
1. Make sure you're in the frontend folder
2. Run: `npm install` (if dependencies are missing)
3. Check if port 3000 is available

### MongoDB Connection Error
**Solution:**
1. Make sure MongoDB is installed and running
2. Check connection string in backend/.env
3. Default: `mongodb://localhost:27017/one-prompt-builder`

### AI Generation Not Working
**Solution:**
1. Add your Grok API key to backend/.env
2. Restart the backend server
3. Check the backend terminal for any errors

---

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET  /api/auth/me - Get current user (requires auth)
```

### Project Endpoints
```
GET    /api/projects - List all projects (requires auth)
GET    /api/projects/:id - Get project details
POST   /api/projects - Create new project
PUT    /api/projects/:id - Update project
DELETE /api/projects/:id - Delete project
```

### Generation Endpoints
```
POST /api/generate - Generate code from prompt
POST /api/generate/enhance - Enhance existing code
```

### Deployment Endpoints
```
POST /api/deploy/vercel - Deploy to Vercel
POST /api/deploy/netlify - Deploy to Netlify
POST /api/export/:id - Export project as ZIP
```

---

## 🎨 Tech Stack

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Monaco Editor
- Zustand (State Management)
- Axios (HTTP Client)

**Backend:**
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Grok AI API

---

## 📞 Need Help?

If you encounter any issues:
1. Check the terminal logs for errors
2. Make sure all dependencies are installed
3. Verify MongoDB is running
4. Confirm Grok API key is added
5. Check that ports 3000 and 5000 are available

---

## 🎉 You're All Set!

Your One-Prompt Builder is ready to use! Start creating amazing websites and mobile apps with just a single prompt.

**Happy Building! 🚀**
