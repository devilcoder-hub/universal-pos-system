@echo off
setlocal enabledelayedexpansion

echo ======================================
echo Universal POS System - Setup Script
echo ======================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

echo [OK] Docker found

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo [OK] Docker Compose found
echo.

REM Create .env file if it doesn't exist
if not exist "backend\.env" (
    echo [INFO] Creating .env file...
    copy backend\.env.example backend\.env
    echo [OK] .env file created. Please update with your credentials.
)

echo.
echo [INFO] Building and starting containers...
docker-compose up --build -d

echo.
echo [OK] Setup complete!
echo [OK] Backend API: http://localhost:5000
echo [OK] Web Dashboard: http://localhost:3000
echo [OK] Database: localhost:5432
echo.
echo Default login:
echo   Username: admin
echo   Password: admin123
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop services:
echo   docker-compose down
echo.
pause
