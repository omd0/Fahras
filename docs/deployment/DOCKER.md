# Docker Setup & Management Guide

## Overview

Fahras uses Docker Compose to orchestrate a multi-container development environment with automatic initialization, health checks, and robust dependency management. This guide covers everything you need to know about the Docker setup.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network                          │
│                                                               │
│  ┌─────────────┐                                            │
│  │   Nginx     │ ← Entry point (port 80)                    │
│  │  (Web Server)│                                            │
│  └──────┬──────┘                                            │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐     ┌─────────────────────┐               │
│  │  PHP-FPM    │────→│  Laravel Init       │               │
│  │  (Laravel)  │     │  (Auto Setup)       │ ← Runs once   │
│  └──────┬──────┘     └─────────────────────┘               │
│         │                                                     │
│         ├──────────┬──────────┬─────────────┬─────────┐    │
│         ▼          ▼          ▼             ▼         ▼     │
│    ┌────────┐ ┌────────┐ ┌────────┐   ┌────────┐ ┌──────┐ │
│    │PostgreSQL│Redis    │ MinIO   │   │  Node  │ │MinIO │ │
│    │  (DB)   ││(Cache) ││(Storage)│   │(React) ││ Init │ │
│    └────┬───┘ └───┬────┘ └───┬────┘   └───┬────┘ └──────┘ │
│         │         │          │            │                 │
│         ▼         ▼          ▼            ▼                 │
│    [pg_data] [redis_data] [minio_data] [node_modules]      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Services

### 1. **Nginx** (Web Server)
- **Port**: 80 (HTTP)
- **Purpose**: Reverse proxy and static file server
- **Configuration**: `nginx.conf`
- **Features**:
  - Routes API requests to PHP-FPM
  - Serves React frontend in production
  - Handles file uploads (up to 100MB)
  - CORS headers configured

### 2. **PHP-FPM** (Laravel Backend)
- **Port**: 9000 (internal)
- **Purpose**: Laravel API application
- **Resources**: 2 CPU cores, 1GB RAM
- **Features**:
  - Laravel 11 with Sanctum authentication
  - Automatic migrations on startup
  - Health checks enabled
  - UTF-8 encoding for Arabic support

### 3. **PostgreSQL** (Database)
- **Port**: 5433 (external), 5432 (internal)
- **Purpose**: Primary data storage
- **Resources**: 1 CPU core, 512MB RAM
- **Credentials**:
  - Database: `fahras`
  - Username: `fahras`
  - Password: `fahras_password`
- **Features**:
  - Persistent data with named volume
  - Health checks configured
  - Automatic schema initialization

### 4. **Redis** (Cache)
- **Port**: 6379
- **Purpose**: Session storage and caching
- **Resources**: 0.5 CPU cores, 512MB RAM
- **Features**:
  - Persistent data storage
  - Health checks enabled
  - Automatic reconnection

### 5. **MinIO** (Object Storage)
- **Port**: 9000 (API), 9001 (Console)
- **Purpose**: S3-compatible file storage
- **Credentials**:
  - Username: `minioadmin`
  - Password: `minioadmin123`
- **Features**:
  - Automatic bucket creation (`fahras-files`)
  - Web console for file management
  - S3 API compatibility
  - Persistent storage

### 6. **Node** (React Frontend)
- **Port**: 3000
- **Purpose**: React development server
- **Resources**: 2 CPU cores, 2GB RAM
- **Features**:
  - Hot module replacement (HMR)
  - Fast refresh enabled
  - Isolated node_modules volume
  - Automatic dependency installation

### 7. **Laravel Init** (Setup Service)
- **Purpose**: One-time initialization
- **Runs**:
  - Database migrations
  - Database seeding
  - Storage permission setup
  - Cache clearing
- **Dependency**: Waits for DB and Redis to be healthy
- **Behavior**: Runs once and exits

### 8. **MinIO Init** (Storage Setup)
- **Purpose**: Initialize MinIO storage
- **Runs**:
  - Creates `fahras-files` bucket
  - Sets bucket permissions
- **Dependency**: Waits for MinIO to be healthy
- **Behavior**: Runs once and exits

## Setup Instructions

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose V2
- At least 4GB RAM available for Docker
- Ports available: 80, 3000, 5433, 6379, 9000, 9001

### Quick Start

**1. Clone the repository**
```bash
git clone <repository-url>
cd Fahras
```

**2. Start all services**

**Windows:**
```cmd
docker-helpers.bat start
```

**Linux/Mac:**
```bash
chmod +x docker-helpers.sh
./docker-helpers.sh start
```

**Or using Docker Compose directly:**
```bash
docker compose up -d
```

**3. Wait for initialization**
The first startup takes 2-3 minutes as it:
- Downloads Docker images
- Installs dependencies
- Runs database migrations
- Seeds initial data

**4. Access the application**
- **Frontend**: http://localhost:3000
- **API**: http://localhost/api
- **MinIO Console**: http://localhost:9001
- **Database**: localhost:5433

### Manual Setup

If helper scripts don't work or you prefer manual control:

**1. Create environment files**
```bash
# Backend environment
cp api/env.example api/.env

# Frontend environment
cp web/env.example web/.env
```

**2. Start core services**
```bash
docker compose up -d db redis minio
```

**3. Wait for services to be healthy**
```bash
docker compose ps
```

**4. Start application services**
```bash
docker compose up -d
```

**5. Check status**
```bash
docker compose ps
docker compose logs -f
```

## Key Features

### 1. **Automatic Database Initialization**
The `laravel-init` service automatically:
- Runs database migrations
- Seeds the database with test data
- Sets up storage permissions
- Clears Laravel caches

This prevents common errors like "relation 'personal_access_tokens' does not exist"

### 2. **Health Checks**
All services have proper health checks:

**PostgreSQL:**
```bash
pg_isready -U fahras -d fahras
```

**Redis:**
```bash
redis-cli ping
```

**MinIO:**
```bash
curl -f http://localhost:9000/minio/health/live
```

**PHP-FPM:**
```bash
php-fpm -t
```

**Nginx:**
```bash
nginx -t
```

**Node:**
```bash
curl -f http://localhost:3000
```

### 3. **Service Dependencies**
Services wait for their dependencies to be fully healthy:

```yaml
depends_on:
  db:
    condition: service_healthy      # Waits for DB to be ready
  redis:
    condition: service_healthy      # Waits for Redis to be ready
  laravel-init:
    condition: service_completed_successfully  # Waits for migrations
```

### 4. **Resource Limits**
Each service has CPU and memory limits to prevent resource exhaustion:

| Service | CPU Limit | Memory Limit |
|---------|-----------|--------------|
| PHP-FPM | 2 cores | 1GB |
| PostgreSQL | 1 core | 512MB |
| Redis | 0.5 cores | 512MB |
| Node | 2 cores | 2GB |
| MinIO | 1 core | 512MB |

### 5. **Log Management**
All services have log rotation configured:
- **Maximum file size**: 10MB
- **Maximum files**: 3
- **Driver**: json-file

This prevents disk space issues from large log files.

### 6. **Restart Policies**
Services use `restart: unless-stopped` for automatic recovery from:
- Container crashes
- Out of memory errors
- Network issues
- Temporary failures

### 7. **Volume Management**

**Persistent Volumes:**
- `postgres_data` - Database storage
- `redis_data` - Redis persistence
- `minio_data` - File storage
- `php_storage` - Laravel storage directory
- `node_modules` - Node dependencies (performance optimization)

**Bind Mounts:**
- `./api` → `/var/www/html` (Laravel code)
- `./web` → `/app` (React code)
- `./nginx.conf` → `/etc/nginx/conf.d/default.conf` (Nginx config)

### 8. **Environment Variables**
All configuration is customizable via environment variables:

```env
# Database
DB_DATABASE=fahras
DB_USERNAME=fahras
DB_PASSWORD=fahras_password
DB_PORT=5433

# Redis
REDIS_PORT=6379

# MinIO
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123

# Application
NODE_PORT=3000
```

## Helper Scripts

### Windows: `docker-helpers.bat`
### Linux/Mac: `docker-helpers.sh`

#### Basic Commands

**Start all services:**
```bash
./docker-helpers.sh start
```

**Stop all services:**
```bash
./docker-helpers.sh stop
```

**Restart all services:**
```bash
./docker-helpers.sh restart
```

**View logs:**
```bash
# All services
./docker-helpers.sh logs

# Specific service
./docker-helpers.sh logs php
./docker-helpers.sh logs db
./docker-helpers.sh logs node
```

**Check service health:**
```bash
./docker-helpers.sh health
```

#### Database Commands

**Run migrations:**
```bash
./docker-helpers.sh migrate
```

**Fresh migration (drops all tables):**
```bash
./docker-helpers.sh migrate:fresh
```

**Seed database:**
```bash
./docker-helpers.sh seed
```

**Refresh database (fresh + seed):**
```bash
./docker-helpers.sh db:refresh
```

#### Laravel Commands

**Clear all caches:**
```bash
./docker-helpers.sh cache:clear
```

**Run Composer install:**
```bash
./docker-helpers.sh composer
```

**Run artisan command:**
```bash
docker compose exec php php artisan <command>
```

#### Container Access

**Open shell in PHP container:**
```bash
./docker-helpers.sh shell
```

**Open shell in specific container:**
```bash
./docker-helpers.sh shell:into db
./docker-helpers.sh shell:into node
./docker-helpers.sh shell:into minio
```

#### Maintenance Commands

**Rebuild all services:**
```bash
./docker-helpers.sh rebuild
```

**Clean up (removes containers and volumes):**
```bash
./docker-helpers.sh clean
```

**Complete reset (stop, clean, rebuild, start):**
```bash
./docker-helpers.sh reset
```

#### Available Commands Summary

| Command | Description |
|---------|-------------|
| `start` | Start all services |
| `stop` | Stop all services |
| `restart` | Restart all services |
| `logs [service]` | View logs (optional: specific service) |
| `migrate` | Run database migrations |
| `migrate:fresh` | Drop all tables and re-run migrations |
| `seed` | Run database seeders |
| `db:refresh` | Fresh migrations + seed |
| `cache:clear` | Clear all Laravel caches |
| `composer` | Run composer install |
| `health` | Check service health status |
| `shell` | Open shell in PHP container |
| `shell:into [service]` | Open shell in specific container |
| `clean` | Remove all containers and volumes |
| `rebuild` | Rebuild all services |
| `reset` | Stop, rebuild, and restart everything |
| `help` | Show help message |

## Common Docker Commands

### View running containers
```bash
docker compose ps
```

### View all containers (including stopped)
```bash
docker compose ps -a
```

### View container resource usage
```bash
docker stats
```

### View container logs
```bash
# All services
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs php
docker compose logs db
```

### Execute commands in containers
```bash
# PHP/Laravel
docker compose exec php php artisan migrate
docker compose exec php php artisan tinker
docker compose exec php composer install

# Database
docker compose exec db psql -U fahras -d fahras

# Node/React
docker compose exec node npm install
docker compose exec node npm run build
```

### Start/Stop specific services
```bash
# Start specific service
docker compose up -d php

# Stop specific service
docker compose stop php

# Restart specific service
docker compose restart php
```

### Rebuild services
```bash
# Rebuild all
docker compose up -d --build

# Rebuild specific service
docker compose up -d --build php
```

### Clean up
```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v

# Remove unused Docker resources
docker system prune -a
```

## Troubleshooting

### 1. Services Won't Start

**Check Docker is running:**
```bash
docker ps
```

**Check service status:**
```bash
docker compose ps
```

**View logs for failing service:**
```bash
docker compose logs [service-name]
```

**Check available disk space:**
```bash
df -h
docker system df
```

### 2. Database Connection Errors

**Check database is healthy:**
```bash
docker compose ps db
```

**Manually run migrations:**
```bash
docker compose exec php php artisan migrate --force
```

**Check database credentials:**
```bash
# Verify .env file
cat api/.env | grep DB_

# Test connection
docker compose exec db psql -U fahras -d fahras -c "SELECT 1"
```

**View database logs:**
```bash
docker compose logs db
```

### 3. Port Already in Use

**Check what's using the port:**
```bash
# Linux/Mac
lsof -i :3000
lsof -i :80

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :80
```

**Change ports using environment variables:**
Create `.env` file in project root:
```env
NODE_PORT=3001
DB_PORT=5434
MINIO_PORT=9002
MINIO_CONSOLE_PORT=9003
```

### 4. MinIO Not Accessible

**Check MinIO is running:**
```bash
docker compose ps minio
```

**Access MinIO console:**
- URL: http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin123`

**Check bucket was created:**
```bash
docker compose logs minio-init
```

**Verify MinIO health:**
```bash
curl http://localhost:9000/minio/health/live
```

### 5. Node/React Won't Start

**Clear npm cache:**
```bash
docker compose exec node npm cache clean --force
docker compose restart node
```

**Remove node_modules and reinstall:**
```bash
docker compose exec node rm -rf node_modules package-lock.json
docker compose exec node npm install
```

**Check for port conflicts:**
```bash
# Port 3000 should be free
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows
```

**View Node logs:**
```bash
docker compose logs node
```

### 6. Out of Memory Errors

**Increase Docker memory limits:**
- Docker Desktop → Settings → Resources → Memory
- Recommended: 4GB minimum, 8GB optimal

**Check current memory usage:**
```bash
docker stats
```

**Adjust service limits in docker-compose.yml:**
```yaml
deploy:
  resources:
    limits:
      memory: 2G  # Increase as needed
```

### 7. Permission Errors

**Fix storage permissions (Linux/Mac):**
```bash
sudo chown -R $USER:$USER ./api/storage ./api/bootstrap/cache
```

**Fix permissions in container:**
```bash
docker compose exec php chmod -R 775 storage bootstrap/cache
docker compose exec php chown -R www-data:www-data storage bootstrap/cache
```

### 8. Laravel Init Failed

**Check init logs:**
```bash
docker compose logs laravel-init
```

**Manually run initialization:**
```bash
docker compose exec php php artisan migrate --force
docker compose exec php php artisan db:seed --force
docker compose exec php php artisan storage:link
```

### 9. Slow Performance

**Check resource usage:**
```bash
docker stats
```

**Increase Docker resources:**
- Docker Desktop → Settings → Resources
- Increase CPU and Memory allocation

**Use named volumes (already configured):**
Named volumes are faster than bind mounts for node_modules

**Clean up unused resources:**
```bash
docker system prune -a
docker volume prune
```

### 10. Container Keeps Restarting

**Check logs for error:**
```bash
docker compose logs [service-name]
```

**Check health status:**
```bash
docker compose ps
```

**Disable restart policy temporarily:**
Edit `docker-compose.yml` and change:
```yaml
restart: unless-stopped
```
to:
```yaml
restart: "no"
```

### 11. Database Migration Errors

**Reset database:**
```bash
docker compose exec php php artisan migrate:fresh --seed --force
```

**Check migration status:**
```bash
docker compose exec php php artisan migrate:status
```

**Rollback migrations:**
```bash
docker compose exec php php artisan migrate:rollback
```

## Performance Tips

### 1. Docker Desktop Settings
- **Memory**: Allocate at least 4GB, 8GB optimal
- **CPU**: Allocate at least 2 cores, 4 cores optimal
- **Disk**: Ensure sufficient disk space (10GB+)

### 2. Volume Performance
- Use named volumes for better performance (already configured)
- Avoid bind mounts for node_modules (using volume)
- Clean unused volumes regularly

### 3. Build Cache
```bash
# Use build cache
docker compose build --build-arg BUILDKIT_INLINE_CACHE=1

# Clear build cache if needed
docker builder prune
```

### 4. Monitor Resources
```bash
# Real-time monitoring
docker stats

# Check disk usage
docker system df
```

### 5. Regular Maintenance
```bash
# Clean up weekly
docker system prune -a

# Remove unused volumes
docker volume prune
```

## Production Deployment

For production, use `Dockerfile.production` and `nginx.production.conf`:

**1. Build production images:**
```bash
docker compose -f docker-compose.prod.yml build
```

**2. Use environment-specific configuration:**
```bash
cp api/env.example api/.env.production
# Edit .env.production with production values
```

**3. Disable debug mode:**
```env
APP_ENV=production
APP_DEBUG=false
```

**4. Use managed services:**
- PostgreSQL: AWS RDS, DigitalOcean Database
- Redis: AWS ElastiCache, Redis Cloud
- Object Storage: AWS S3, DigitalOcean Spaces

**5. Enable HTTPS:**
- Use Let's Encrypt for SSL certificates
- Configure Nginx with SSL

## Security Considerations

### 1. Change Default Credentials
Update in production:
- Database password
- MinIO credentials
- Application key

### 2. Restrict Network Access
```yaml
networks:
  fahras-network:
    driver: bridge
    internal: true  # No external access
```

### 3. Use Secrets for Sensitive Data
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 4. Regular Updates
```bash
# Update base images
docker compose pull
docker compose up -d --build
```

### 5. Enable Firewall
Only expose necessary ports (80, 443)

## Useful Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose Reference**: https://docs.docker.com/compose/compose-file/
- **Laravel Sail**: https://laravel.com/docs/sail (inspiration for this setup)
- **MinIO Documentation**: https://min.io/docs/minio/linux/index.html

## Support

If you encounter issues not covered here:

1. **Check service logs**: `docker compose logs [service]`
2. **Verify Docker resources**: Settings → Resources
3. **Ensure ports are available**: 80, 3000, 5433, 6379, 9000, 9001
4. **Try clean restart**: `./docker-helpers.sh reset`
5. **Check Docker version**: `docker --version` (need 20.10+)
6. **Check Compose version**: `docker compose version` (need 2.0+)

## Summary

✅ **Automatic initialization** - No manual setup required  
✅ **Health checks** - Services wait for dependencies  
✅ **Resource limits** - Prevents memory/CPU exhaustion  
✅ **Log rotation** - Prevents disk space issues  
✅ **Restart policies** - Automatic recovery from failures  
✅ **Helper scripts** - Easy management commands  
✅ **Persistent data** - Named volumes for all data  
✅ **Development-ready** - Hot reload and fast refresh  
✅ **Production-ready** - Scalable and secure configuration  

The Docker setup is designed to "just work" out of the box while remaining flexible and production-ready.

