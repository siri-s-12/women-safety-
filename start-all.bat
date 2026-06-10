@echo off
cls
echo.
echo =============================================
echo    SafeHer India - Starting Both Servers
echo =============================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two windows will open...
echo.
timeout /t 2 /nobreak
start "SafeHer Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 2 /nobreak
start "SafeHer Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo.
echo Both servers are starting...
echo Check the terminal windows for URLs
echo.

