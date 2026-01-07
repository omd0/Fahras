#!/bin/bash

# Fahras Production Deployment Script
# Usage: ./deploy.sh

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

echo "🚀 Fahras Production Deployment"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Check if production environment file exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        print_warning "Please edit .env.production with your production settings before continuing."
        exit 1
    else
        print_error ".env.example not found. Cannot create production environment file."
        exit 1
    fi
fi

# Backup existing data if services are running
if $COMPOSE_CMD ps | grep -q "Up"; then
    print_status "Backing up existing data..."
    $COMPOSE_CMD exec -T db pg_dump -U fahras fahras > backup_$(date +%Y%m%d_%H%M%S).sql
    print_success "Database backup created"
fi

# Stop existing services
print_status "Stopping existing services..."
$COMPOSE_CMD down

# Pull latest images
print_status "Pulling latest images..."
$COMPOSE_CMD pull

# Build production images
print_status "Building production images..."
$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# Start services with production configuration
print_status "Starting services with production configuration..."
$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
$COMPOSE_CMD exec -T php php artisan migrate --force

# Clear and cache configuration
print_status "Optimizing Laravel for production..."
$COMPOSE_CMD exec -T php php artisan config:cache
$COMPOSE_CMD exec -T php php artisan route:cache
$COMPOSE_CMD exec -T php php artisan view:cache
$COMPOSE_CMD exec -T php php artisan optimize

# Build React for production
print_status "Building React for production..."
$COMPOSE_CMD exec -T node npm run build

# Check service health
print_status "Checking service health..."
if $COMPOSE_CMD ps | grep -q "Up"; then
    print_success "All services are running!"
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Service Information:"
    $COMPOSE_CMD ps
    echo ""
    echo "🌐 Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  API: http://localhost/api"
    echo ""
    echo "📊 To monitor logs: $COMPOSE_CMD logs -f"
    echo "🛑 To stop services: $COMPOSE_CMD down"
    
else
    print_error "Some services failed to start. Check logs with: $COMPOSE_CMD logs"
    exit 1
fi
