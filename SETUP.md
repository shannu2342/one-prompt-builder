# Setup Guide - One-Prompt Site & App Builder

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **MongoDB** (local installation or MongoDB Atlas)
- **Grok API Key** from xAI (https://x.ai)
- **Git** (optional, for version control)

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all required packages including:
- express, mongoose, dotenv, cors
- bcryptjs, jsonwebtoken (authentication)
- axios (Grok API calls)
- archiver (ZIP exports)
- TypeScript and development tools

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- Next.js 14, React, TypeScript
- Tailwind CSS
- Monaco Editor (code editing)
- Axios, Zustand (state management)
- Lucide React (icons)

### 3. Configure Backend Environment

Create `backend/.env` file:

```bash
cd ../backend
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/one-prompt-builder

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Grok API
GROK_API_KEY=your-grok-api-key-here
GROK_API_URL=https://api.x.ai/v1

# Deployment (Optional)
VERCEL_TOKEN=your-vercel-token
NETLIFY_TOKEN=your-netlify-token

# CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Configure Frontend Environment

Create `frontend/.env.local` file:

```bash
cd ../frontend
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Start MongoDB

**Windows:**
```bash
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect successfully
```

### 6. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 One-Prompt Builder API Server
Server running on port 5000
```

### 7. Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

### 8. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health

## Getting Your Grok API Key

1. Visit https://x.ai
2. Sign up or log in to your account
3. Navigate to API section
4. Generate a new API key
5. Copy the key and paste it in `backend/.env`

## Testing the Setup

### Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test Frontend

1. Open http://localhost:3000
2. Click "Get Started" or "Register"
3. Create an account
4. Try generating a simple website with a prompt like:
   - "Create a simple landing page with a hero section and contact form"

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check if port 27017 is available
- Verify MONGODB_URI in `.env`

### Issue: Grok API Error

**Solution:**
- Verify your API key is correct in `.env`
- Check if you have API credits/quota
- Ensure GROK_API_URL is correct

### Issue: Port Already in Use

**Solution:**
```bash
# Backend (port 5000)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
# Change port in package.json or kill process on 3000
```

### Issue: TypeScript Errors

**Solution:**
- These are expected until dependencies are installed
- Run `npm install` in both backend and frontend directories
- Restart your IDE/editor

### Issue: CORS Errors

**Solution:**
- Ensure FRONTEND_URL in backend `.env` matches your frontend URL
- Check that backend is running before starting frontend

## Project Structure

```
one-prompt-builder-v2/
├── backend/                 # Express + TypeScript API
│   ├── src/
│   │   ├── config/         # Database & Grok config
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth & error handling
│   │   └── server.ts       # Entry point
│   └── package.json
├── frontend/               # Next.js 14 + TypeScript
│   ├── src/
│   │   ├── app/           # Pages & layouts
│   │   ├── components/    # React components
│   │   ├── lib/           # Utils & API client
│   │   └── hooks/         # Custom hooks
│   └── package.json
└── README.md
```

## Next Steps

1. ✅ Complete the setup above
2. 📝 Create your first project
3. 🎨 Customize the UI/UX
4. 🚀 Deploy to production
5. 📚 Read the full documentation

## Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel)

```bash
cd frontend
vercel
```

Or connect your GitHub repo to Vercel dashboard.

## Support

For issues and questions:
- Check TODO.md for known issues
- Review the code comments
- Open an issue on GitHub

## License

MIT License - feel free to use for personal or commercial projects.
