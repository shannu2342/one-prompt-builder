# Quick Start Guide

## Prerequisites Check
Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ MongoDB installed and running
- ✅ Grok API key from xAI

## Step 1: Start MongoDB
Open a new terminal and run:
```bash
mongod
```
Leave this terminal running.

## Step 2: Configure Grok API Key
Edit `backend/.env` and add your Grok API key:
```env
GROK_API_KEY=your-actual-grok-api-key-here
```

## Step 3: Start Backend Server
Open a new terminal:
```bash
cd one-prompt-builder-v2/backend
npm run dev
```
Backend will start on: http://localhost:5000

## Step 4: Start Frontend Server
Open another new terminal:
```bash
cd one-prompt-builder-v2/frontend
npm run dev
```
Frontend will start on: http://localhost:3000

## Step 5: Access the Application
Open your browser and visit:
**http://localhost:3000**

## First Time Setup
1. Click "Get Started" or "Sign Up"
2. Create a new account
3. Login with your credentials
4. Click "New Project" to create your first AI-generated project!

## Example Prompts to Try

### Website Examples:
```
Create a modern portfolio website with dark theme, hero section, projects gallery, and contact form
```

```
Build an e-commerce landing page for artisanal tea brand with product showcase and newsletter signup
```

### Mobile App Examples:
```
Create a fitness tracking app with workout logging, progress charts, and user profile
```

```
Build a todo list app with categories, due dates, and priority levels
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Check if port 27017 is available

### Backend Won't Start
- Verify `.env` file exists in backend folder
- Check if port 5000 is available
- Run `npm install` in backend folder

### Frontend Won't Start
- Verify `.env.local` file exists in frontend folder
- Check if port 3000 is available
- Run `npm install` in frontend folder

### Grok API Errors
- Verify your Grok API key is correct in `backend/.env`
- Check your xAI account has API access
- Ensure you have API credits available

## Features to Test
- ✅ User Registration & Login
- ✅ Create New Project with AI Prompt
- ✅ Edit Generated Code in Monaco Editor
- ✅ Live Preview of Website
- ✅ Deploy to Vercel/Netlify
- ✅ Export Project as ZIP
- ✅ Version Control

## Need Help?
Check the following files:
- `README.md` - Project overview
- `SETUP.md` - Detailed setup instructions
- `PROJECT_SUMMARY.md` - Complete documentation
