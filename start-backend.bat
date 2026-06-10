@echo off
cls
echo.
echo ===================================
echo    SafeHer India - Backend Server
echo ===================================
echo.
cd /d "%~dp0backend"
echo Starting backend on port 5000...
echo Press Ctrl+C to stop the server
echo.
npm run dev
pause

