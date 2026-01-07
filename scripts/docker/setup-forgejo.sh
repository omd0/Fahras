#!/bin/bash
# Forgejo Setup Script
# Phase 1 & 2: Environment & Infrastructure Setup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FORGEJO_DIR="$PROJECT_ROOT/forgejo"

echo "🚀 Setting up Forgejo Self-Hosted Git Platform"
echo "================================================"

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

# Create forgejo directory structure
echo "📁 Creating directory structure..."
mkdir -p "$FORGEJO_DIR/data"{/db,/app,/repos,/runner,/runner-cache}
chmod -R 755 "$FORGEJO_DIR/data"

# Copy environment file if it doesn't exist
if [ ! -f "$FORGEJO_DIR/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp "$FORGEJO_DIR/.env.example" "$FORGEJO_DIR/.env"
    
    # Generate secure secrets
    echo "🔐 Generating secure secrets..."
    SECRET_KEY=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 24)
    
    # Update .env file with generated secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/forgejo_secure_password_change_me/$DB_PASSWORD/g" "$FORGEJO_DIR/.env"
        sed -i '' "s/generate_a_random_secret_key_here/$SECRET_KEY/g" "$FORGEJO_DIR/.env"
    else
        # Linux
        sed -i "s/forgejo_secure_password_change_me/$DB_PASSWORD/g" "$FORGEJO_DIR/.env"
        sed -i "s/generate_a_random_secret_key_here/$SECRET_KEY/g" "$FORGEJO_DIR/.env"
    fi
    
    echo "✅ Environment file created with generated secrets"
    echo "⚠️  Please review and update $FORGEJO_DIR/.env before starting Forgejo"
else
    echo "✅ Environment file already exists"
fi

# Create nginx configuration if it doesn't exist
if [ ! -f "$FORGEJO_DIR/nginx-forgejo.conf" ]; then
    echo "📝 Creating nginx configuration..."
    # The file should already exist, but check anyway
    if [ -f "$PROJECT_ROOT/forgejo/nginx-forgejo.conf" ]; then
        echo "✅ Nginx configuration exists"
    else
        echo "⚠️  Nginx configuration not found. Please create it manually."
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update $FORGEJO_DIR/.env"
echo "2. Start Forgejo: docker-compose -f docker-compose.forgejo.yml up -d"
echo "3. Access Forgejo at http://localhost:3000"
echo "4. Complete the initial setup wizard"
echo "5. Register Act Runner (see forgejo/README.md)"
echo ""

