@echo off
setlocal enabledelayedexpansion

REM Fahras Production Deployment Script for Windows
REM Usage: deploy.bat

echo 🚀 Fahras Production Deployment
echo ===============================

REM Check if we're in the right directory
if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found. Please run this script from the project root.
    exit /b 1
)

REM Determine which compose command to use
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Docker Compose is not installed.
        exit /b 1
    )
    set COMPOSE_CMD=docker-compose
) else (
    set COMPOSE_CMD=docker compose
)

REM Check if production environment file exists
if not exist ".env.production" (
    echo [WARNING] .env.production not found. Creating from example...
    if exist ".env.example" (
        copy ".env.example" ".env.production" >nul
        echo [WARNING] Please edit .env.production with your production settings before continuing.
        pause
        exit /b 1
    ) else (
        echo [ERROR] .env.example not found. Cannot create production environment file.
        exit /b 1
    )
)

REM Backup existing data if services are running
%COMPOSE_CMD% ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo [INFO] Backing up existing data...
    for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set datetime=%%a
    set backup_file=backup_%datetime:~0,8%_%datetime:~8,6%.sql
    %COMPOSE_CMD% exec -T db pg_dump -U fahras fahras > %backup_file%
    echo [SUCCESS] Database backup created: %backup_file%
)

REM Stop existing services
echo [INFO] Stopping existing services...
%COMPOSE_CMD% down

REM Pull latest images
echo [INFO] Pulling latest images...
%COMPOSE_CMD% pull

REM Build production images
echo [INFO] Building production images...
%COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

REM Start services with production configuration
echo [INFO] Starting services with production configuration...
%COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml up -d

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Run database migrations
echo [INFO] Running database migrations...
%COMPOSE_CMD% exec -T php php artisan migrate --force

REM Clear and cache configuration
echo [INFO] Optimizing Laravel for production...
%COMPOSE_CMD% exec -T php php artisan config:cache
%COMPOSE_CMD% exec -T php php artisan route:cache
%COMPOSE_CMD% exec -T php php artisan view:cache
%COMPOSE_CMD% exec -T php php artisan optimize

REM Build React for production
echo [INFO] Building React for production...
%COMPOSE_CMD% exec -T node npm run build

REM Check service health
echo [INFO] Checking service health...
%COMPOSE_CMD% ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] All services are running!
    
    echo.
    echo 🎉 Deployment completed successfully!
    echo.
    echo 📋 Service Information:
    %COMPOSE_CMD% ps
    echo.
    echo 🌐 Application URLs:
    echo   Frontend: http://localhost:3000
    echo   API: http://localhost/api
    echo.
    echo 📊 To monitor logs: %COMPOSE_CMD% logs -f
    echo 🛑 To stop services: %COMPOSE_CMD% down
    
) else (
    echo [ERROR] Some services failed to start. Check logs with: %COMPOSE_CMD% logs
    exit /b 1
)

pause
