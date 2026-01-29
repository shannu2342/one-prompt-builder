# 🚀 HOW TO START - Simple Instructions

## ⚡ EASIEST WAY (Recommended)

### Step 1: Right-click on this file
```
START.ps1
```

### Step 2: Select "Run with PowerShell"

That's it! The script will:
- ✅ Check if Node.js is installed
- ✅ Install dependencies if needed
- ✅ Start both servers automatically
- ✅ Open two terminal windows

### Step 3: Wait 15 seconds

Look for these messages:
- Backend window: `✅ Default admin created: username=admin, password=admin123`
- Frontend window: `✓ Ready`

### Step 4: Open your browser

Go to: **http://localhost:3000/admin/login**

Login with:
- Username: `admin`
- Password: `admin123`

---

## 🔧 IF POWERSHELL SCRIPT DOESN'T WORK

### Method 1: Use Command Prompt

1. Open Command Prompt (cmd)
2. Navigate to project:
   ```
   cd C:\Users\Shanmukha\Desktop\one-prompt-builder-v2
   ```
3. Run:
   ```
   START-SERVERS.bat
   ```

### Method 2: Manual Start

**Open TWO Command Prompt windows:**

**Window 1 (Backend):**
```
cd C:\Users\Shanmukha\Desktop\one-prompt-builder-v2\backend
npm install
npm run dev
```

**Window 2 (Frontend):**
```
cd C:\Users\Shanmukha\Desktop\one-prompt-builder-v2\frontend
npm install
npm run dev
```

---

## ❓ TROUBLESHOOTING

### Problem: "npm: command not found"

**Solution:** Install Node.js
1. Go to: https://nodejs.org/
2. Download LTS version
3. Install it
4. Restart your computer
5. Try again

### Problem: "Port 5000 already in use"

**Solution:** Kill the process
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it (replace 1234 with actual PID)
taskkill /PID 1234 /F
```

### Problem: "Cannot find module"

**Solution:** Install dependencies
```
cd backend
npm install

cd ../frontend
npm install
```

### Problem: PowerShell script blocked

**Solution:** Allow script execution
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try running START.ps1 again.

---

## ✅ HOW TO VERIFY IT'S WORKING

### Check 1: Backend Running

Open browser: http://localhost:5000/health

You should see:
```json
{"success":true,"message":"Server is running"}
```

### Check 2: Frontend Running

Open browser: http://localhost:3000

You should see the landing page.

### Check 3: Admin Login Works

Open browser: http://localhost:3000/admin/login

Enter:
- Username: admin
- Password: admin123

You should be redirected to the admin dashboard!

---

## 📞 STILL NOT WORKING?

### Share this information:

1. **What happens when you run START.ps1?**
   - Does it open windows?
   - What error messages do you see?

2. **Do you have Node.js installed?**
   - Open Command Prompt
   - Type: `node --version`
   - What does it say?

3. **What do you see in the terminal windows?**
   - Copy the error messages
   - Share them

---

## 🎯 QUICK REFERENCE

**Admin Login:**
- URL: http://localhost:3000/admin/login
- Username: admin
- Password: admin123

**Backend:** http://localhost:5000
**Frontend:** http://localhost:3000

**To Stop Servers:**
- Close the terminal windows
- Or press Ctrl+C in each window

---

## 📝 SUMMARY

1. **Right-click START.ps1** → Run with PowerShell
2. **Wait 15 seconds** for servers to start
3. **Open browser** → http://localhost:3000/admin/login
4. **Login** with admin / admin123
5. **Done!** ✅

---

**If you're still having issues, the problem is likely:**
- Node.js not installed
- Ports 3000 or 5000 already in use
- Dependencies not installed

**Run START.ps1 and it will check and fix these automatically!**
