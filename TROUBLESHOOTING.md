# Troubleshooting Admin Login Issue

## Problem: "Login Failed" Error

If you're getting a "Login failed" error when trying to login to the admin panel, follow these steps:

### Solution 1: Restart Backend Server

The default admin user is created when the backend server starts. If you started the backend before the admin code was added, you need to restart it.

**Steps:**
1. Stop the backend server (Ctrl+C in the backend terminal)
2. Start it again:
   ```bash
   cd one-prompt-builder-v2/backend
   npm run dev
   ```
3. Look for this message in the console:
   ```
   ✅ Default admin created: username=admin, password=admin123
   ```

### Solution 2: Check Backend is Running

Make sure the backend is running on port 5000:

**Test with PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health"
```

You should see: `{"success":true,"message":"Server is running",...}`

### Solution 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for error messages

Common errors:
- **Network Error**: Backend not running
- **401 Unauthorized**: Wrong credentials
- **500 Server Error**: Backend issue

### Solution 4: Manual Admin Creation

If the admin wasn't created automatically, you can create it manually:

1. Stop the backend server
2. Edit `backend/src/server.ts`
3. Make sure this code exists (it should already be there):

```typescript
// Create default admin user
async function createDefaultAdmin() {
  try {
    const existingAdmin = storage.findAdminByUsername('admin');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      storage.createAdmin({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@builder.com',
      });
      console.log('✅ Default admin created: username=admin, password=admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

createDefaultAdmin();
```

4. Restart the backend server

### Solution 5: Check CORS Settings

Make sure the backend allows requests from the frontend:

In `backend/src/server.ts`, verify:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

### Solution 6: Test Admin Login API Directly

Test the admin login endpoint with PowerShell:

```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

Expected response:
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

### Solution 7: Check Frontend API URL

In `frontend/src/app/admin/login/page.tsx`, verify the API URL:
```typescript
const response = await axios.post('http://localhost:5000/api/admin/login', credentials)
```

Make sure it matches your backend URL.

### Solution 8: Clear Browser Cache

1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage:
   - Local Storage
   - Session Storage
   - Cookies
4. Refresh the page
5. Try login again

## Quick Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 3000
- [ ] You see "✅ Default admin created" in backend console
- [ ] Health endpoint works: http://localhost:5000/health
- [ ] No CORS errors in browser console
- [ ] Using correct credentials: admin / admin123

## Still Not Working?

### Check Backend Logs

Look at the backend terminal for errors when you try to login. Common issues:

1. **"Admin not found"** - Admin wasn't created, restart backend
2. **"Invalid credentials"** - Wrong password, use: admin123
3. **"CORS error"** - Frontend URL not allowed
4. **"Cannot POST /api/admin/login"** - Route not registered

### Check Frontend Logs

Open browser console (F12) and look for:

1. **Network tab** - Check the request to `/api/admin/login`
   - Status should be 200 or 201
   - Response should have `success: true` and `token`
2. **Console tab** - Look for error messages
3. **Application tab** - Check if token is stored in localStorage

## Default Credentials

**Username:** admin  
**Password:** admin123  
**Email:** admin@builder.com

## Need More Help?

1. Check `FINAL_SUMMARY.md` for complete setup instructions
2. Check `FULL_REDESIGN_GUIDE.md` for implementation details
3. Review backend console logs for specific errors
4. Check browser DevTools console for frontend errors

## Common Fixes Summary

| Issue | Solution |
|-------|----------|
| Login failed | Restart backend server |
| Network error | Start backend server |
| CORS error | Check CORS settings in server.ts |
| 404 Not Found | Admin routes not registered |
| 401 Unauthorized | Wrong credentials or admin not created |
| Token not saved | Check localStorage in DevTools |

---

**Quick Fix Command:**
```bash
# Stop backend (Ctrl+C), then:
cd one-prompt-builder-v2/backend
npm run dev

# In another terminal:
cd one-prompt-builder-v2/frontend
npm run dev
```

Then try logging in at: http://localhost:3000/admin/login
