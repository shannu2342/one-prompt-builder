# Debug Admin Login - Step by Step

## Issue: Getting "Login Failed" Error

Follow these steps **in order** to debug and fix the admin login issue.

---

## Step 1: Check Backend Console

**Look at your backend terminal** where you ran `npm run dev`.

### ✅ What you SHOULD see:
```
✅ Default admin created: username=admin, password=admin123

╔═══════════════════════════════════════════════════════════╗
║   🚀 One-Prompt Builder API Server                       ║
║   Server running on port 5000                             ║
...
║   Admin API Endpoints:                                    ║
║   - POST /api/admin/login                                 ║
╚═══════════════════════════════════════════════════════════╝
```

### ❌ If you DON'T see "✅ Default admin created":
**The admin user was NOT created!**

**FIX:** Restart the backend server:
1. Press `Ctrl+C` in the backend terminal
2. Run: `cd one-prompt-builder-v2/backend`
3. Run: `npm run dev`
4. Wait for the server to start
5. Look for the "✅ Default admin created" message

---

## Step 2: Test Backend is Running

Open a **new PowerShell terminal** and run:

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health"
```

### ✅ Expected Output:
```
StatusCode        : 200
StatusDescription : OK
Content           : {"success":true,"message":"Server is running",...}
```

### ❌ If you get an error:
- Backend is NOT running
- Start it: `cd one-prompt-builder-v2/backend && npm run dev`

---

## Step 3: Test Admin Login API Directly

In PowerShell, run this command:

```powershell
$body = '{"username":"admin","password":"admin123"}'
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
$response.Content
```

### ✅ Expected Output (Success):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "1",
    "username": "admin",
    "email": "admin@builder.com"
  }
}
```

### ❌ Possible Errors:

#### Error 1: "Invalid credentials"
```json
{"error":"Invalid credentials"}
```
**Cause:** Admin user doesn't exist  
**Fix:** Restart backend server (see Step 1)

#### Error 2: "Cannot connect"
```
Invoke-WebRequest : Unable to connect to the remote server
```
**Cause:** Backend not running  
**Fix:** Start backend server

#### Error 3: "Username and password required"
```json
{"error":"Username and password required"}
```
**Cause:** Request body not formatted correctly  
**Fix:** Copy the exact command from Step 3

---

## Step 4: Check Browser Console

1. Open http://localhost:3000/admin/login in your browser
2. Press `F12` to open DevTools
3. Go to the **Console** tab
4. Try to login with admin / admin123
5. Look for errors

### Common Errors:

#### Error 1: Network Error / CORS
```
Access to XMLHttpRequest at 'http://localhost:5000/api/admin/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Fix:** Check CORS settings in `backend/src/server.ts`

#### Error 2: 404 Not Found
```
POST http://localhost:5000/api/admin/login 404 (Not Found)
```
**Fix:** Admin routes not registered. Check `backend/src/server.ts` has:
```typescript
import adminRoutes from './routes/admin';
app.use('/api/admin', adminRoutes);
```

#### Error 3: 401 Unauthorized
```
POST http://localhost:5000/api/admin/login 401 (Unauthorized)
```
**Fix:** Wrong credentials OR admin not created. Restart backend.

---

## Step 5: Check Network Tab

In browser DevTools:
1. Go to **Network** tab
2. Try to login
3. Click on the `login` request
4. Check the **Response** tab

### What to look for:

**Request URL:** Should be `http://localhost:5000/api/admin/login`  
**Request Method:** Should be `POST`  
**Status Code:** Should be `200` or `201`

**Request Payload:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "...",
  "admin": {...}
}
```

---

## Step 6: Verify TypeScript Compilation

The backend uses TypeScript. Make sure it's compiling correctly:

```bash
cd one-prompt-builder-v2/backend
npm run build
```

### ✅ Should complete without errors

### ❌ If you see TypeScript errors:
- Fix the errors shown
- Restart the server

---

## Step 7: Check Frontend API URL

Open `frontend/src/app/admin/login/page.tsx` and verify line ~30:

```typescript
const response = await axios.post('http://localhost:5000/api/admin/login', credentials)
```

Make sure it says `http://localhost:5000` (not 3000 or any other port).

---

## Step 8: Clear Browser Storage

Sometimes old data causes issues:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear storage**
4. Click **Clear site data**
5. Refresh the page
6. Try login again

---

## Step 9: Test Password Hashing

Run the test script:

```bash
cd one-prompt-builder-v2/backend
node test-admin.js
```

### ✅ Expected Output:
```
Testing admin password hashing...

Original password: admin123
Hashed password: $2a$10$...
Password validation: ✅ PASS
Wrong password test: ✅ PASS (correctly rejected)

--- Admin Login Test ---
If you see "✅ Default admin created" in your backend console,
the admin user exists and you should be able to login with:
Username: admin
Password: admin123
```

---

## Step 10: Manual Debug

Add console.log to `backend/src/routes/admin.ts` at line 10:

```typescript
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('=== ADMIN LOGIN ATTEMPT ===');
    console.log('Username:', username);
    console.log('Password received:', password ? 'YES' : 'NO');
    
    const admin = storage.findAdminByUsername(username);
    console.log('Admin found:', admin ? 'YES' : 'NO');
    
    if (!admin) {
      console.log('ERROR: Admin not found!');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, admin.password);
    console.log('Password valid:', validPassword ? 'YES' : 'NO');
    
    // ... rest of code
```

Restart backend and try login. Check what the console logs show.

---

## Quick Checklist

Run through this checklist:

- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Frontend server is running (`npm run dev` in frontend folder)
- [ ] Backend console shows "✅ Default admin created"
- [ ] Backend is on port 5000 (check console output)
- [ ] Frontend is on port 3000 (check console output)
- [ ] Health endpoint works: http://localhost:5000/health
- [ ] Admin login API works (test with PowerShell command from Step 3)
- [ ] No CORS errors in browser console
- [ ] No 404 errors in browser console
- [ ] Using exact credentials: username=admin, password=admin123

---

## Still Not Working?

### Last Resort: Fresh Start

1. **Stop both servers** (Ctrl+C in both terminals)

2. **Rebuild backend:**
```bash
cd one-prompt-builder-v2/backend
rm -rf node_modules
npm install
npm run dev
```

3. **Rebuild frontend:**
```bash
cd one-prompt-builder-v2/frontend
rm -rf node_modules
rm -rf .next
npm install
npm run dev
```

4. **Try login again**

---

## Get Help

If still not working, provide these details:

1. **Backend console output** (copy the entire startup message)
2. **Browser console errors** (screenshot or copy text)
3. **Network tab response** (what does the login request return?)
4. **PowerShell test result** (output from Step 3)

This will help identify the exact issue!

---

## Common Solutions Summary

| Symptom | Solution |
|---------|----------|
| "Login failed" toast | Restart backend server |
| No "Default admin created" message | Restart backend server |
| Network error | Start backend server |
| CORS error | Check server.ts CORS config |
| 404 error | Check admin routes are registered |
| 401 error | Admin not created, restart backend |
| Blank page | Check frontend is running on port 3000 |

---

**Most Common Fix: Just restart the backend server!**

```bash
# In backend terminal:
Ctrl+C
npm run dev
```

Look for: `✅ Default admin created: username=admin, password=admin123`
