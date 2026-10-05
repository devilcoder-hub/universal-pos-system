@echo off
echo ======================================
echo Universal POS System - Complete Start
echo ======================================
echo.

echo Starting all services...
echo.

echo 1. Starting Backend API...
start "Universal POS Backend" cmd /k "cd backend && npm install && npm run dev"

echo 2. Starting React Dashboard...
start "Universal POS Web" cmd /k "cd frontend\react && npm install && npm start"

echo.
echo All services starting in separate windows...
echo.
echo Backend: http://localhost:5000
echo Dashboard: http://localhost:3000
echo.
pause
