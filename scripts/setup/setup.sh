#!/bin/bash

echo "🚀 Setting up Fahras - Graduation Project Archiving System"
echo "=========================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed (support both old and new syntax)
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Determine which compose command to use
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

echo "✅ Docker and Docker Compose are available (using: $COMPOSE_CMD)"

# Create environment files if they don't exist
if [ ! -f "api/.env" ]; then
    echo "📝 Creating Laravel .env file..."
    cp api/env.example api/.env
    echo "✅ Laravel .env file created"
fi

if [ ! -f "web/.env" ]; then
    echo "📝 Creating React .env file..."
    cp web/env.example web/.env
    echo "✅ React .env file created"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
$COMPOSE_CMD up -d db redis minio

# Wait for database and MinIO to be ready
echo "⏳ Waiting for database and storage services to be ready..."
sleep 15

# Build and start all services
echo "🔨 Building and starting all services..."
$COMPOSE_CMD up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Install Laravel dependencies and setup
echo "📦 Installing Laravel dependencies..."
$COMPOSE_CMD exec -T php composer install --no-interaction

echo "🔑 Generating Laravel application key..."
$COMPOSE_CMD exec -T php php artisan key:generate --force

echo "🗄️ Running database migrations..."
$COMPOSE_CMD exec -T php php artisan migrate --force

echo "🌱 Seeding database with initial data..."
$COMPOSE_CMD exec -T php php artisan db:seed --force

# Install React dependencies
echo "📦 Installing React dependencies..."
$COMPOSE_CMD exec -T node npm install --silent

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost/api"
echo "   - Database: localhost:5433"
echo "   - MinIO Console: http://localhost:9001"
echo ""
echo "2. To restart services: $COMPOSE_CMD up -d"
echo "3. To stop services: $COMPOSE_CMD down"
echo "4. To view logs: $COMPOSE_CMD logs -f"
echo ""
echo "🔑 Default login credentials:"
echo "   Admin: admin@fahras.edu / password"
echo "   Faculty: sarah.johnson@fahras.edu / password"
echo "   Student: ahmed.almansouri@student.fahras.edu / password"
echo ""
echo "☁️ MinIO Storage:"
echo "   Console: http://localhost:9001"
echo "   Username: minioadmin"
echo "   Password: minioadmin123"
echo "   Bucket: fahras-files (auto-created)"
echo ""
echo "Happy coding! 🚀"
