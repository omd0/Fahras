#!/bin/bash

# Fahras Development Helper Script
# Usage: ./dev.sh [command]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine which compose command to use
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if services are running
check_services() {
    if $COMPOSE_CMD ps | grep -q "Up"; then
        return 0
    else
        return 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting Fahras services..."
    $COMPOSE_CMD up -d --build
    print_success "Services started!"
}

# Function to stop services
stop_services() {
    print_status "Stopping Fahras services..."
    $COMPOSE_CMD down
    print_success "Services stopped!"
}

# Function to restart services
restart_services() {
    print_status "Restarting Fahras services..."
    $COMPOSE_CMD restart
    print_success "Services restarted!"
}

# Function to show logs
show_logs() {
    if [ -n "$2" ]; then
        print_status "Showing logs for $2..."
        $COMPOSE_CMD logs -f "$2"
    else
        print_status "Showing logs for all services..."
        $COMPOSE_CMD logs -f
    fi
}

# Function to run Laravel commands
run_laravel() {
    if ! check_services; then
        print_error "Services are not running. Start them first with: ./dev.sh start"
        exit 1
    fi
    
    shift # Remove 'laravel' from arguments
    print_status "Running Laravel command: php artisan $*"
    $COMPOSE_CMD exec php php artisan "$@"
}

# Function to run Composer commands
run_composer() {
    if ! check_services; then
        print_error "Services are not running. Start them first with: ./dev.sh start"
        exit 1
    fi
    
    shift # Remove 'composer' from arguments
    print_status "Running Composer command: composer $*"
    $COMPOSE_CMD exec php composer "$@"
}

# Function to run NPM commands
run_npm() {
    if ! check_services; then
        print_error "Services are not running. Start them first with: ./dev.sh start"
        exit 1
    fi
    
    shift # Remove 'npm' from arguments
    print_status "Running NPM command: npm $*"
    $COMPOSE_CMD exec node npm "$@"
}

# Function to reset database
reset_database() {
    if ! check_services; then
        print_error "Services are not running. Start them first with: ./dev.sh start"
        exit 1
    fi
    
    print_warning "This will reset the database and lose all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        $COMPOSE_CMD exec php php artisan migrate:fresh --seed --force
        print_success "Database reset complete!"
    else
        print_status "Database reset cancelled."
    fi
}

# Function to show status
show_status() {
    print_status "Fahras Development Environment Status"
    echo "========================================"
    
    if check_services; then
        print_success "Services are running"
        echo ""
        $COMPOSE_CMD ps
        echo ""
        print_status "Application URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  API: http://localhost/api"
        echo "  Database: localhost:5433"
    else
        print_error "Services are not running"
        echo ""
        print_status "Run './dev.sh start' to start services"
    fi
}

# Function to show help
show_help() {
    echo "Fahras Development Helper Script"
    echo "==============================="
    echo ""
    echo "Usage: ./dev.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start                 Start all services"
    echo "  stop                  Stop all services"
    echo "  restart               Restart all services"
    echo "  status                Show service status"
    echo "  logs [service]        Show logs (optionally for specific service)"
    echo "  laravel <command>     Run Laravel artisan command"
    echo "  composer <command>    Run Composer command"
    echo "  npm <command>         Run NPM command"
    echo "  reset-db              Reset database (WARNING: destroys data)"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start"
    echo "  ./dev.sh logs php"
    echo "  ./dev.sh laravel migrate"
    echo "  ./dev.sh composer install"
    echo "  ./dev.sh npm install"
}

# Main script logic
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    laravel)
        run_laravel "$@"
        ;;
    composer)
        run_composer "$@"
        ;;
    npm)
        run_npm "$@"
        ;;
    reset-db)
        reset_database
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
