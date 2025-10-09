# Fahras Scripts Documentation

This document describes all the scripts and commands available in the Fahras project for development, deployment, and maintenance.

## 📋 Available Scripts

### Setup Scripts

#### `setup.sh` / `setup.bat`
**Purpose**: Initial project setup and environment configuration

**Usage**:
```bash
# Linux/Mac
./setup.sh

# Windows
setup.bat
```

**What it does**:
- Checks for Docker and Docker Compose installation
- Creates environment files from examples
- Starts database and Redis services
- Builds and starts all containers
- Installs Laravel dependencies
- Generates application key
- Runs database migrations
- Seeds database with initial data
- Installs React dependencies

### Development Scripts

#### `dev.sh` / `dev.bat`
**Purpose**: Development environment management

**Usage**:
```bash
# Linux/Mac
./dev.sh [command] [options]

# Windows
dev.bat [command] [options]
```

**Available Commands**:
- `start` - Start all services
- `stop` - Stop all services  
- `restart` - Restart all services
- `status` - Show service status
- `logs [service]` - Show logs (optionally for specific service)
- `laravel <command>` - Run Laravel artisan command
- `composer <command>` - Run Composer command
- `npm <command>` - Run NPM command
- `reset-db` - Reset database (WARNING: destroys data)
- `help` - Show help message

**Examples**:
```bash
# Start services
./dev.sh start

# View logs
./dev.sh logs php

# Run Laravel commands
./dev.sh laravel migrate
./dev.sh laravel tinker

# Run Composer commands
./dev.sh composer install
./dev.sh composer update

# Run NPM commands
./dev.sh npm install
./dev.sh npm run build

# Reset database
./dev.sh reset-db
```

### Deployment Scripts

#### `deploy.sh` / `deploy.bat`
**Purpose**: Production deployment

**Usage**:
```bash
# Linux/Mac
./deploy.sh

# Windows
deploy.bat
```

**What it does**:
- Checks for production environment file
- Backs up existing database
- Stops existing services
- Pulls latest images
- Builds production images
- Starts services with production configuration
- Runs database migrations
- Optimizes Laravel for production
- Builds React for production
- Verifies service health

### Utility Scripts

#### `api/create_user.php`
**Purpose**: Create users via command line

**Usage**:
```bash
# Create a user with default values
docker-compose exec php php create_user.php

# Create a user with custom values
docker-compose exec php php create_user.php john@example.com "John Doe" secret123 admin
```

**Parameters**:
1. Email address
2. Full name
3. Password
4. Role (admin, faculty, student)

## 🛠️ Composer Scripts

The Laravel project includes custom Composer scripts:

### Available Commands:
```bash
# Setup Laravel (generate key, migrate, seed)
composer run setup

# Reset database (fresh migration + seeding)
composer run reset-db

# Standard Laravel commands
composer install
composer update
composer dump-autoload
```

## 🐳 Docker Commands

### Basic Operations:
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f php

# Execute commands in containers
docker-compose exec php php artisan migrate
docker-compose exec node npm install
```

### Development Commands:
```bash
# Rebuild containers
docker-compose up -d --build

# Restart specific service
docker-compose restart php

# Access container shell
docker-compose exec php bash
docker-compose exec node sh
```

## 📁 Script Files Overview

| File | Platform | Purpose |
|------|----------|---------|
| `setup.sh` | Linux/Mac | Initial project setup |
| `setup.bat` | Windows | Initial project setup |
| `dev.sh` | Linux/Mac | Development helper |
| `dev.bat` | Windows | Development helper |
| `deploy.sh` | Linux/Mac | Production deployment |
| `deploy.bat` | Windows | Production deployment |
| `docker-entrypoint.sh` | Linux/Mac | Container startup script |
| `api/create_user.php` | All | User creation utility |

## 🔧 Troubleshooting

### Common Issues:

1. **Docker Compose not found**
   - Ensure Docker Desktop is installed
   - Try using `docker compose` instead of `docker-compose`

2. **Services won't start**
   - Check if ports are already in use
   - Ensure Docker has enough resources allocated

3. **Database connection issues**
   - Wait for database to be ready (15-30 seconds)
   - Check if database container is running

4. **Permission issues (Linux/Mac)**
   - Make scripts executable: `chmod +x *.sh`
   - Ensure Docker daemon is running

### Getting Help:

```bash
# Show development helper help
./dev.sh help

# Check service status
./dev.sh status

# View service logs
./dev.sh logs
```

## 🚀 Quick Start

1. **Initial Setup**:
   ```bash
   # Linux/Mac
   ./setup.sh
   
   # Windows
   setup.bat
   ```

2. **Development**:
   ```bash
   # Start development environment
   ./dev.sh start
   
   # Access application
   # Frontend: http://localhost:3000
   # API: http://localhost/api
   ```

3. **Production Deployment**:
   ```bash
   # Deploy to production
   ./deploy.sh
   ```

## 📝 Notes

- All scripts include error handling and colored output
- Scripts automatically detect Docker Compose command (old vs new syntax)
- Windows batch files use `timeout` instead of `sleep`
- Production deployment requires `.env.production` file
- Database backups are created with timestamps
