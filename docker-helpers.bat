@echo off
REM Docker Compose Helper Scripts for Fahras Project (Windows)

setlocal enabledelayedexpansion

REM Check if docker is available
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH
    exit /b 1
)

REM Get command from first argument
set "COMMAND=%~1"

if "%COMMAND%"=="" goto help
if "%COMMAND%"=="help" goto help
if "%COMMAND%"=="start" goto start
if "%COMMAND%"=="stop" goto stop
if "%COMMAND%"=="restart" goto restart
if "%COMMAND%"=="logs" goto logs
if "%COMMAND%"=="migrate" goto migrate
if "%COMMAND%"=="migrate:fresh" goto migrate_fresh
if "%COMMAND%"=="seed" goto seed
if "%COMMAND%"=="db:refresh" goto db_refresh
if "%COMMAND%"=="cache:clear" goto cache_clear
if "%COMMAND%"=="composer" goto composer_install
if "%COMMAND%"=="health" goto health
if "%COMMAND%"=="shell" goto shell
if "%COMMAND%"=="shell:into" goto shell_into
if "%COMMAND%"=="clean" goto clean
if "%COMMAND%"=="rebuild" goto rebuild
if "%COMMAND%"=="reset" goto reset

goto help

:start
echo [INFO] Starting all services...
docker compose up -d
echo [SUCCESS] All services started!
exit /b 0

:stop
echo [INFO] Stopping all services...
docker compose down
echo [SUCCESS] All services stopped!
exit /b 0

:restart
echo [INFO] Restarting all services...
docker compose restart
echo [SUCCESS] All services restarted!
exit /b 0

:logs
if "%~2"=="" (
    echo [INFO] Showing logs for all services...
    docker compose logs -f
) else (
    echo [INFO] Showing logs for %~2...
    docker compose logs -f %~2
)
exit /b 0

:migrate
echo [INFO] Running database migrations...
docker compose exec php php artisan migrate --force
echo [SUCCESS] Migrations completed!
exit /b 0

:migrate_fresh
echo [WARNING] This will drop all tables and re-run migrations!
set /p CONFIRM="Are you sure? (y/N): "
if /i "!CONFIRM!"=="y" (
    echo [INFO] Running fresh migrations...
    docker compose exec php php artisan migrate:fresh --force
    echo [SUCCESS] Fresh migrations completed!
) else (
    echo [INFO] Cancelled.
)
exit /b 0

:seed
echo [INFO] Running database seeders...
docker compose exec php php artisan db:seed --force
echo [SUCCESS] Seeders completed!
exit /b 0

:db_refresh
echo [WARNING] This will drop all tables, re-run migrations and seeders!
set /p CONFIRM="Are you sure? (y/N): "
if /i "!CONFIRM!"=="y" (
    echo [INFO] Refreshing database...
    docker compose exec php php artisan migrate:fresh --seed --force
    echo [SUCCESS] Database refreshed!
) else (
    echo [INFO] Cancelled.
)
exit /b 0

:cache_clear
echo [INFO] Clearing all Laravel caches...
docker compose exec php php artisan config:clear
docker compose exec php php artisan cache:clear
docker compose exec php php artisan route:clear
docker compose exec php php artisan view:clear
echo [SUCCESS] All caches cleared!
exit /b 0

:composer_install
echo [INFO] Running composer install...
docker compose exec php composer install --no-interaction --prefer-dist --optimize-autoloader
echo [SUCCESS] Composer install completed!
exit /b 0

:health
echo [INFO] Checking service health...
docker compose ps
exit /b 0

:shell
echo [INFO] Opening shell in PHP container...
docker compose exec php /bin/sh
exit /b 0

:shell_into
if "%~2"=="" (
    echo [ERROR] Please specify a service name (php, db, redis, node, minio^)
    exit /b 1
)
echo [INFO] Opening shell in %~2 container...
docker compose exec %~2 /bin/sh
exit /b 0

:clean
echo [WARNING] This will remove all containers, volumes, and data!
set /p CONFIRM="Are you sure? (y/N): "
if /i "!CONFIRM!"=="y" (
    echo [INFO] Cleaning up...
    docker compose down -v
    echo [SUCCESS] Cleanup completed!
) else (
    echo [INFO] Cancelled.
)
exit /b 0

:rebuild
echo [INFO] Rebuilding services...
docker compose build --no-cache
echo [SUCCESS] Rebuild completed!
exit /b 0

:reset
echo [WARNING] This will stop services, rebuild, and start fresh!
set /p CONFIRM="Are you sure? (y/N): "
if /i "!CONFIRM!"=="y" (
    echo [INFO] Resetting...
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    echo [SUCCESS] Reset completed!
) else (
    echo [INFO] Cancelled.
)
exit /b 0

:help
echo Docker Compose Helper Script for Fahras (Windows)
echo.
echo Usage: docker-helpers.bat [command]
echo.
echo Commands:
echo   start           - Start all services
echo   stop            - Stop all services
echo   restart         - Restart all services
echo   logs [service]  - View logs (all services or specific service)
echo   migrate         - Run database migrations
echo   migrate:fresh   - Drop all tables and re-run migrations
echo   seed            - Run database seeders
echo   db:refresh      - Refresh database (fresh + seed)
echo   cache:clear     - Clear all Laravel caches
echo   composer        - Run composer install
echo   health          - Check service health status
echo   shell           - Open shell in PHP container
echo   shell:into [service] - Open shell in specific container
echo   clean           - Remove all containers and volumes
echo   rebuild         - Rebuild all services
echo   reset           - Stop, rebuild, and restart everything
echo   help            - Show this help message
echo.
exit /b 0

