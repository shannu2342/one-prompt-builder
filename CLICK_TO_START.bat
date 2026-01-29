@echo off
title One-Prompt Builder - Starting Servers
color 0A

echo.
echo ========================================
echo  One-Prompt Builder - Starting Servers
echo ========================================
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

echo Current directory: %CD%
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

REM Check and install backend dependencies
echo Checking backend dependencies...
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies already installed
)
echo.

REM Check and install frontend dependencies
echo Checking frontend dependencies...
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already installed
)
echo.

echo ========================================
echo  Starting Servers...
echo ========================================
echo.

REM Start backend server in new window
echo Starting Backend Server (Port 5000)...
start "Backend Server - One-Prompt Builder" cmd /k "cd /d "%~dp0backend" && color 0B && echo Backend Server Starting... && npm run dev"

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start frontend server in new window
echo Starting Frontend Server (Port 3000)...
start "Frontend Server - One-Prompt Builder" cmd /k "cd /d "%~dp0frontend" && color 0E && echo Frontend Server Starting... && npm run dev"

echo.
echo ========================================
echo  Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Admin Login:
echo   URL:      http://localhost:3000/admin/login
echo   Username: admin
echo   Password: admin123
echo.
echo Wait 10-15 seconds for servers to fully start,
echo then open http://localhost:3000/admin/login in your browser
echo.
echo Look for "Default admin created" message in the Backend window
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
