@echo off
echo ======================================
echo Universal POS Flutter - Start Script
echo ======================================
echo.

cd frontend\flutter

echo Installing dependencies...
call flutter pub get

echo Running Flutter app...
call flutter run

pause
