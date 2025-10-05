#!/bin/bash

echo "🚀 Setting up Fahras - Graduation Project Archiving System"
echo "=========================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

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
docker compose up -d db redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install Laravel dependencies and setup
echo "📦 Installing Laravel dependencies..."
docker compose exec -T php composer install

echo "🔑 Generating Laravel application key..."
docker compose exec -T php php artisan key:generate

echo "🗄️ Running database migrations..."
docker compose exec -T php php artisan migrate

echo "🌱 Seeding database with initial data..."
docker compose exec -T php php artisan db:seed

# Install React dependencies
echo "📦 Installing React dependencies..."
docker compose exec -T node npm install

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the full development environment: docker compose up -d"
echo "2. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost/api"
echo "   - Database: localhost:5433"
echo ""
echo "🔑 Default login credentials:"
echo "   Admin: admin@fahras.edu / password"
echo "   Faculty: sarah.johnson@fahras.edu / password"
echo "   Student: ahmed.almansouri@student.fahras.edu / password"
echo ""
echo "Happy coding! 🚀"
