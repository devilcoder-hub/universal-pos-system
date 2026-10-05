@echo off
echo ======================================
echo Universal POS React Web - Start Script
echo ======================================
echo.

cd frontend\react

echo Installing dependencies...
call npm install

echo Starting React development server...
call npm start

pause
