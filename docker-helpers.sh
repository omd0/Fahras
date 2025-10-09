#!/bin/bash
# Docker Compose Helper Scripts for Fahras Project

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_msg() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_success() {
    echo -e "${BLUE}[SUCCESS]${NC} $1"
}

# Check if docker compose is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
}

# Start all services
start() {
    print_msg "Starting all services..."
    docker compose up -d
    print_success "All services started!"
}

# Stop all services
stop() {
    print_msg "Stopping all services..."
    docker compose down
    print_success "All services stopped!"
}

# Restart all services
restart() {
    print_msg "Restarting all services..."
    docker compose restart
    print_success "All services restarted!"
}

# View logs
logs() {
    if [ -z "$1" ]; then
        print_msg "Showing logs for all services..."
        docker compose logs -f
    else
        print_msg "Showing logs for $1..."
        docker compose logs -f "$1"
    fi
}

# Run Laravel migrations
migrate() {
    print_msg "Running database migrations..."
    docker compose exec php php artisan migrate --force
    print_success "Migrations completed!"
}

# Run migrations with fresh database
migrate_fresh() {
    print_warning "This will drop all tables and re-run migrations!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_msg "Running fresh migrations..."
        docker compose exec php php artisan migrate:fresh --force
        print_success "Fresh migrations completed!"
    else
        print_msg "Cancelled."
    fi
}

# Run database seeders
seed() {
    print_msg "Running database seeders..."
    docker compose exec php php artisan db:seed --force
    print_success "Seeders completed!"
}

# Refresh database (migrate fresh + seed)
refresh_db() {
    print_warning "This will drop all tables, re-run migrations and seeders!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_msg "Refreshing database..."
        docker compose exec php php artisan migrate:fresh --seed --force
        print_success "Database refreshed!"
    else
        print_msg "Cancelled."
    fi
}

# Clear Laravel caches
clear_cache() {
    print_msg "Clearing all Laravel caches..."
    docker compose exec php php artisan config:clear
    docker compose exec php php artisan cache:clear
    docker compose exec php php artisan route:clear
    docker compose exec php php artisan view:clear
    print_success "All caches cleared!"
}

# Run composer install
composer_install() {
    print_msg "Running composer install..."
    docker compose exec php composer install --no-interaction --prefer-dist --optimize-autoloader
    print_success "Composer install completed!"
}

# Check service health
health() {
    print_msg "Checking service health..."
    docker compose ps
}

# Shell into PHP container
shell() {
    print_msg "Opening shell in PHP container..."
    docker compose exec php /bin/sh
}

# Shell into specific container
shell_into() {
    if [ -z "$1" ]; then
        print_error "Please specify a service name (php, db, redis, node, minio)"
        exit 1
    fi
    print_msg "Opening shell in $1 container..."
    docker compose exec "$1" /bin/sh
}

# Clean up everything (including volumes)
clean() {
    print_warning "This will remove all containers, volumes, and data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_msg "Cleaning up..."
        docker compose down -v
        print_success "Cleanup completed!"
    else
        print_msg "Cancelled."
    fi
}

# Rebuild services
rebuild() {
    print_msg "Rebuilding services..."
    docker compose build --no-cache
    print_success "Rebuild completed!"
}

# Reset and restart everything
reset() {
    print_warning "This will stop services, rebuild, and start fresh!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_msg "Resetting..."
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        print_success "Reset completed!"
    else
        print_msg "Cancelled."
    fi
}

# Show help
help() {
    echo "Docker Compose Helper Script for Fahras"
    echo ""
    echo "Usage: ./docker-helpers.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start           - Start all services"
    echo "  stop            - Stop all services"
    echo "  restart         - Restart all services"
    echo "  logs [service]  - View logs (all services or specific service)"
    echo "  migrate         - Run database migrations"
    echo "  migrate:fresh   - Drop all tables and re-run migrations"
    echo "  seed            - Run database seeders"
    echo "  db:refresh      - Refresh database (fresh + seed)"
    echo "  cache:clear     - Clear all Laravel caches"
    echo "  composer        - Run composer install"
    echo "  health          - Check service health status"
    echo "  shell           - Open shell in PHP container"
    echo "  shell:into [service] - Open shell in specific container"
    echo "  clean           - Remove all containers and volumes"
    echo "  rebuild         - Rebuild all services"
    echo "  reset           - Stop, rebuild, and restart everything"
    echo "  help            - Show this help message"
    echo ""
}

# Main script logic
check_docker

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$2"
        ;;
    migrate)
        migrate
        ;;
    migrate:fresh)
        migrate_fresh
        ;;
    seed)
        seed
        ;;
    db:refresh)
        refresh_db
        ;;
    cache:clear)
        clear_cache
        ;;
    composer)
        composer_install
        ;;
    health)
        health
        ;;
    shell)
        shell
        ;;
    shell:into)
        shell_into "$2"
        ;;
    clean)
        clean
        ;;
    rebuild)
        rebuild
        ;;
    reset)
        reset
        ;;
    help|*)
        help
        ;;
esac

