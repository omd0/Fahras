e\@echo off
setlocal enabledelayedexpansion

REM Fahras Development Helper Script for Windows
REM Usage: dev.bat [command]

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

REM Function to check if services are running
:check_services
%COMPOSE_CMD% ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    exit /b 0
) else (
    exit /b 1
)

REM Function to start services
:start_services
echo [INFO] Starting Fahras services...
%COMPOSE_CMD% up -d --build
if %errorlevel% equ 0 (
    echo [SUCCESS] Services started!
) else (
    echo [ERROR] Failed to start services
    exit /b 1
)
goto :eof

REM Function to stop services
:stop_services
echo [INFO] Stopping Fahras services...
%COMPOSE_CMD% down
if %errorlevel% equ 0 (
    echo [SUCCESS] Services stopped!
) else (
    echo [ERROR] Failed to stop services
    exit /b 1
)
goto :eof

REM Function to restart services
:restart_services
echo [INFO] Restarting Fahras services...
%COMPOSE_CMD% restart
if %errorlevel% equ 0 (
    echo [SUCCESS] Services restarted!
) else (
    echo [ERROR] Failed to restart services
    exit /b 1
)
goto :eof

REM Function to show logs
:show_logs
if "%2"=="" (
    echo [INFO] Showing logs for all services...
    %COMPOSE_CMD% logs -f
) else (
    echo [INFO] Showing logs for %2...
    %COMPOSE_CMD% logs -f %2
)
goto :eof

REM Function to run Laravel commands
:run_laravel
call :check_services
if %errorlevel% neq 0 (
    echo [ERROR] Services are not running. Start them first with: dev.bat start
    exit /b 1
)

shift
echo [INFO] Running Laravel command: php artisan %*
%COMPOSE_CMD% exec php php artisan %*
goto :eof

REM Function to run Composer commands
:run_composer
call :check_services
if %errorlevel% neq 0 (
    echo [ERROR] Services are not running. Start them first with: dev.bat start
    exit /b 1
)

shift
echo [INFO] Running Composer command: composer %*
%COMPOSE_CMD% exec php composer %*
goto :eof

REM Function to run NPM commands
:run_npm
call :check_services
if %errorlevel% neq 0 (
    echo [ERROR] Services are not running. Start them first with: dev.bat start
    exit /b 1
)

shift
echo [INFO] Running NPM command: npm %*
%COMPOSE_CMD% exec node npm %*
goto :eof

REM Function to reset database
:reset_database
call :check_services
if %errorlevel% neq 0 (
    echo [ERROR] Services are not running. Start them first with: dev.bat start
    exit /b 1
)

echo [WARNING] This will reset the database and lose all data!
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    echo [INFO] Resetting database...
    %COMPOSE_CMD% exec php php artisan migrate:fresh --seed --force
    if %errorlevel% equ 0 (
        echo [SUCCESS] Database reset complete!
    ) else (
        echo [ERROR] Database reset failed
        exit /b 1
    )
) else (
    echo [INFO] Database reset cancelled.
)
goto :eof

REM Function to show status
:show_status
echo [INFO] Fahras Development Environment Status
echo ========================================

call :check_services
if %errorlevel% equ 0 (
    echo [SUCCESS] Services are running
    echo.
    %COMPOSE_CMD% ps
    echo.
    echo [INFO] Application URLs:
    echo   Frontend: http://localhost:3000
    echo   API: http://localhost/api
    echo   Database: localhost:5433
) else (
    echo [ERROR] Services are not running
    echo.
    echo [INFO] Run 'dev.bat start' to start services
)
goto :eof

REM Function to show help
:show_help
echo Fahras Development Helper Script
echo ===============================
echo.
echo Usage: dev.bat [command] [options]
echo.
echo Commands:
echo   start                 Start all services
echo   stop                  Stop all services
echo   restart               Restart all services
echo   status                Show service status
echo   logs [service]        Show logs (optionally for specific service)
echo   laravel ^<command^>     Run Laravel artisan command
echo   composer ^<command^>    Run Composer command
echo   npm ^<command^>         Run NPM command
echo   reset-db              Reset database (WARNING: destroys data)
echo   help                  Show this help message
echo.
echo Examples:
echo   dev.bat start
echo   dev.bat logs php
echo   dev.bat laravel migrate
echo   dev.bat composer install
echo   dev.bat npm install
goto :eof

REM Main script logic
if "%1"=="start" (
    call :start_services
) else if "%1"=="stop" (
    call :stop_services
) else if "%1"=="restart" (
    call :restart_services
) else if "%1"=="status" (
    call :show_status
) else if "%1"=="logs" (
    call :show_logs %*
) else if "%1"=="laravel" (
    call :run_laravel %*
) else if "%1"=="composer" (
    call :run_composer %*
) else if "%1"=="npm" (
    call :run_npm %*
) else if "%1"=="reset-db" (
    call :reset_database
) else if "%1"=="help" (
    call :show_help
) else if "%1"=="--help" (
    call :show_help
) else if "%1"=="-h" (
    call :show_help
) else if "%1"=="" (
    call :show_help
) else (
    echo [ERROR] Unknown command: %1
    echo.
    call :show_help
    exit /b 1
)
