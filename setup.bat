@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Fahras - Graduation Project Archiving System
echo ==========================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Docker Compose is not installed. Please install Docker Compose first.
        exit /b 1
    )
    set COMPOSE_CMD=docker-compose
) else (
    set COMPOSE_CMD=docker compose
)

echo ✅ Docker and Docker Compose are available (using: %COMPOSE_CMD%)

REM Create environment files if they don't exist
if not exist "api\.env" (
    echo 📝 Creating Laravel .env file...
    copy "api\env.example" "api\.env" >nul
    echo ✅ Laravel .env file created
)

if not exist "web\.env" (
    echo 📝 Creating React .env file...
    copy "web\env.example" "web\.env" >nul
    echo ✅ React .env file created
)

REM Start Docker services
echo 🐳 Starting Docker services...
%COMPOSE_CMD% up -d db redis

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 15 /nobreak >nul

REM Build and start all services
echo 🔨 Building and starting all services...
%COMPOSE_CMD% up -d --build

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Install Laravel dependencies and setup
echo 📦 Installing Laravel dependencies...
%COMPOSE_CMD% exec -T php composer install --no-interaction

echo 🔑 Generating Laravel application key...
%COMPOSE_CMD% exec -T php php artisan key:generate --force

echo 🗄️ Running database migrations...
%COMPOSE_CMD% exec -T php php artisan migrate --force

echo 🌱 Seeding database with initial data...
%COMPOSE_CMD% exec -T php php artisan db:seed --force

REM Install React dependencies
echo 📦 Installing React dependencies...
%COMPOSE_CMD% exec -T node npm install --silent

echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Access the application:
echo    - Frontend: http://localhost:3000
echo    - API: http://localhost/api
echo    - Database: localhost:5433
echo.
echo 2. To restart services: %COMPOSE_CMD% up -d
echo 3. To stop services: %COMPOSE_CMD% down
echo 4. To view logs: %COMPOSE_CMD% logs -f
echo.
echo 🔑 Default login credentials:
echo    Admin: admin@fahras.edu / password
echo    Faculty: sarah.johnson@fahras.edu / password
echo    Student: ahmed.almansouri@student.fahras.edu / password
echo.
echo Happy coding! 🚀

pause
