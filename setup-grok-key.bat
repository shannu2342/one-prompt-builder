@echo off
echo Setting up Grok API Key...
cd backend
echo GROK_API_KEY=your-grok-api-key-here >> .env
echo.
echo Grok API Key has been added to backend/.env
echo.
echo Please replace 'your-grok-api-key-here' with your actual Grok API key
echo.
echo Please restart the backend server for changes to take effect:
echo   1. Stop the current backend server (Ctrl+C)
echo   2. Run: cd backend
echo   3. Run: npm run dev
echo.
pause
