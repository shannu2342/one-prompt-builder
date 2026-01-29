@echo off
echo ========================================
echo  Starting One-Prompt Builder Servers
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  Servers Starting...
echo ========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Wait for both servers to start, then:
echo 1. Open http://localhost:3000/admin/login
echo 2. Login with: admin / admin123
echo.
echo Press any key to exit this window...
pause >nul
