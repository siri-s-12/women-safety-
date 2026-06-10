@echo off
cls
echo.
echo ===================================
echo   SafeHer India - Frontend Server
echo ===================================
echo.
cd /d "%~dp0frontend"
echo Starting frontend dev server...
echo Port 5173 or next available port
echo Press Ctrl+C to stop the server
echo.
npm run dev
pause

