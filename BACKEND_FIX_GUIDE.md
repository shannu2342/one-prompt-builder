# Backend Server Fix Guide

## Issue
The backend server is not starting properly. This is likely due to a TypeScript compilation error or missing dependencies.

## Solution Steps

### Step 1: Check for Errors
1. Double-click `START_BACKEND_DEBUG.bat` in the `one-prompt-builder-v2` folder
2. This will show you the actual error message
3. Look for any error messages in red

### Step 2: Common Issues and Fixes

#### Issue A: TypeScript Compilation Error
If you see errors like "Cannot find module" or "Type error":

**Fix:**
```bash
cd one-prompt-builder-v2/backend
npm install
npx tsc --noEmit
```

This will show you the exact TypeScript errors.

#### Issue B: Missing Dependencies
If you see "Module not found":

**Fix:**
```bash
cd one-prompt-builder-v2/backend
npm install
```

#### Issue C: Port Already in Use
If you see "Port 5000 is already in use":

**Fix:**
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find any Node.js processes
3. End them
4. Try starting the server again

### Step 3: Manual Server Start

If the batch file doesn't work, start the server manually:

```bash
# Open PowerShell in the project folder
cd one-prompt-builder-v2/backend

# Install dependencies
npm install

# Start the server
npm run dev
```

### Step 4: Verify Server is Running

Once the server starts, you should see:
```
╔═══════════════════════════════════════════════════════════╗
║   🚀 One-Prompt Builder API Server                       ║
║   Server running on port 5000                             ║
╚═══════════════════════════════════════════════════════════╝
```

Test it by opening: http://localhost:5000/health

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

## Admin Login Credentials

Once both servers are running:

1. **Frontend**: http://localhost:3000
2. **Admin Panel**: http://localhost:3000/admin/login

**Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## Still Having Issues?

If the server still won't start, please check the PowerShell window that opened and look for error messages. Common errors include:

1. **TypeScript errors** - Check the route files for syntax errors
2. **Missing .env file** - Make sure `backend/.env` exists
3. **Port conflicts** - Make sure port 5000 is not in use
4. **Node.js version** - Make sure you have Node.js 18+ installed

## Quick Test

Run this command to test if the backend can start:

```bash
cd one-prompt-builder-v2/backend
node -e "console.log('Node.js is working'); require('dotenv').config(); console.log('dotenv loaded'); const express = require('express'); const app = express(); app.listen(5001, () => console.log('Test server on 5001'));"
```

If this works, the issue is in the TypeScript code.
