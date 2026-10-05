@echo off
echo ======================================
echo Universal POS Backend - Start Script
echo ======================================
echo.

cd backend

echo Installing dependencies...
call npm install

echo Starting backend server...
call npm run dev

pause
