@echo off
echo ========================================
echo Starting Backend Server (Debug Mode)
echo ========================================
echo.
cd backend
echo Current directory: %CD%
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting server with ts-node...
call npx ts-node src/server.ts
echo.
echo If you see errors above, please report them.
pause
