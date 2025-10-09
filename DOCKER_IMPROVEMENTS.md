# Docker Compose Improvements

## Overview

The `docker-compose.yml` has been significantly improved to prevent common startup errors and provide a more robust development environment.

## Key Improvements

### 1. **Automatic Database Initialization**
- Added `laravel-init` service that automatically:
  - Runs database migrations
  - Seeds the database
  - Sets up storage permissions
  - Clears Laravel caches
- This prevents the `relation "personal_access_tokens" does not exist` error

### 2. **Health Checks**
All services now have proper health checks:
- **PostgreSQL**: Checks database readiness before accepting connections
- **Redis**: Verifies Redis is responding to commands
- **MinIO**: Ensures storage service is healthy
- **PHP-FPM**: Validates PHP-FPM configuration
- **Nginx**: Tests Nginx configuration syntax
- **Node**: Checks if React dev server is responding

### 3. **Improved Service Dependencies**
Services now wait for their dependencies to be fully healthy:
```yaml
depends_on:
  db:
    condition: service_healthy  # Waits for DB to be ready
  redis:
    condition: service_healthy  # Waits for Redis to be ready
  laravel-init:
    condition: service_completed_successfully  # Waits for migrations
```

### 4. **Resource Limits**
Each service now has CPU and memory limits to prevent resource exhaustion:
- **PHP**: 2 CPU cores, 1GB RAM
- **PostgreSQL**: 1 CPU core, 512MB RAM
- **Redis**: 0.5 CPU cores, 512MB RAM
- **Node**: 2 CPU cores, 2GB RAM

### 5. **Logging Configuration**
All services have log rotation configured:
- Maximum file size: 10MB
- Maximum files: 3
- Prevents disk space issues from large log files

### 6. **Environment Variables**
All configuration is now customizable via environment variables with sensible defaults:
```bash
DB_DATABASE=${DB_DATABASE:-fahras}
DB_USERNAME=${DB_USERNAME:-fahras}
MINIO_PORT=${MINIO_PORT:-9000}
```

### 7. **Better Volume Management**
- Added `php_storage` volume for Laravel storage directory
- Added `redis_data` volume for Redis persistence
- Node modules isolated in separate volume for better performance

### 8. **Restart Policies**
Services use `restart: unless-stopped` for automatic recovery from failures

### 9. **Container Naming**
All containers now have explicit names (e.g., `fahras-php`, `fahras-db`) for easier management

### 10. **Extended Startup Times**
Health check `start_period` values increased to handle slow startups:
- PHP: 60 seconds
- Node: 90 seconds
- PostgreSQL: 40 seconds

## Usage

### Starting the Stack

**Option 1: Using Docker Compose directly**
```bash
docker compose up -d
```

**Option 2: Using helper scripts**

**Windows:**
```cmd
docker-helpers.bat start
```

**Linux/Mac:**
```bash
chmod +x docker-helpers.sh
./docker-helpers.sh start
```

### Common Operations

#### View Service Status
```bash
# Windows
docker-helpers.bat health

# Linux/Mac
./docker-helpers.sh health
```

#### View Logs
```bash
# All services
docker-helpers.bat logs

# Specific service
docker-helpers.bat logs php
docker-helpers.bat logs db
```

#### Run Migrations
```bash
docker-helpers.bat migrate
```

#### Refresh Database (Fresh + Seed)
```bash
docker-helpers.bat db:refresh
```

#### Clear Laravel Caches
```bash
docker-helpers.bat cache:clear
```

#### Open Shell in Container
```bash
# PHP container
docker-helpers.bat shell

# Specific container
docker-helpers.bat shell:into db
```

#### Stop Services
```bash
docker-helpers.bat stop
```

#### Restart Services
```bash
docker-helpers.bat restart
```

#### Clean Up Everything (Including Data)
```bash
docker-helpers.bat clean
```

#### Rebuild Services
```bash
docker-helpers.bat rebuild
```

## Troubleshooting

### Services Won't Start

1. **Check Docker is running:**
   ```bash
   docker ps
   ```

2. **Check service health:**
   ```bash
   docker compose ps
   ```

3. **View logs for failing service:**
   ```bash
   docker compose logs [service-name]
   ```

### Database Connection Errors

The `laravel-init` service should handle migrations automatically. If you still see errors:

1. **Check database is healthy:**
   ```bash
   docker compose ps db
   ```

2. **Manually run migrations:**
   ```bash
   docker compose exec php php artisan migrate --force
   ```

3. **Check database credentials:**
   - Verify `.env` file in `api/` directory
   - Ensure credentials match `docker-compose.yml`

### MinIO Not Accessible

1. **Check MinIO is running:**
   ```bash
   docker compose ps minio
   ```

2. **Access MinIO console:**
   - URL: http://localhost:9001
   - Username: minioadmin
   - Password: minioadmin123

3. **Check bucket was created:**
   ```bash
   docker compose logs minio-init
   ```

### Node/React Won't Start

1. **Clear npm cache and rebuild:**
   ```bash
   docker compose exec node npm cache clean --force
   docker compose restart node
   ```

2. **Check for port conflicts:**
   - Ensure port 3000 is not in use by another application

3. **View Node logs:**
   ```bash
   docker compose logs node
   ```

### Port Already in Use

If you get port conflict errors, you can customize ports:

Create a `.env` file in the project root:
```env
DB_PORT=5433
REDIS_PORT=6379
NODE_PORT=3000
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
```

### Out of Memory Errors

If services are killed due to OOM:

1. **Increase Docker memory limits:**
   - Docker Desktop → Settings → Resources → Memory
   - Recommended: 4GB minimum, 8GB optimal

2. **Adjust service limits in `docker-compose.yml`:**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 2G  # Increase as needed
   ```

### Permission Errors

If you encounter permission issues:

```bash
# Linux/Mac
sudo chown -R $USER:$USER ./api/storage ./api/bootstrap/cache

# Or use helper to fix in container
docker compose exec php chmod -R 775 storage bootstrap/cache
docker compose exec php chown -R www-data:www-data storage bootstrap/cache
```

## Performance Tips

1. **Use named volumes for better performance** (already configured)
2. **Allocate sufficient Docker resources** (Settings → Resources)
3. **Use build cache:** Rebuild only when needed
4. **Monitor resource usage:**
   ```bash
   docker stats
   ```

## Helper Script Commands

### Windows (`docker-helpers.bat`)
### Linux/Mac (`docker-helpers.sh`)

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

## What's Fixed

✅ **Database table not found errors** - Automatic migrations on startup  
✅ **Race conditions** - Services wait for dependencies to be healthy  
✅ **Out of memory crashes** - Resource limits configured  
✅ **Storage permission errors** - Automatic permission setup  
✅ **Service dependency issues** - Proper health checks and ordering  
✅ **Log disk space issues** - Log rotation configured  
✅ **Unpredictable startup order** - Explicit dependency chains  
✅ **MinIO bucket not created** - Automatic initialization  
✅ **Cache corruption** - Automatic cache clearing on init  
✅ **Port conflicts** - Environment variable configuration  

## Architecture

```
┌─────────────┐
│   Nginx     │ ← Entry point (port 80)
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  PHP-FPM    │────→│  Laravel    │
└──────┬──────┘     │   Init      │ ← Runs migrations/seeds
       │            └─────────────┘
       │
       ├──────────┬──────────┬─────────────┐
       ▼          ▼          ▼             ▼
  ┌────────┐ ┌────────┐ ┌────────┐   ┌────────┐
  │ PostgreSQL│ │ Redis  │ │ MinIO  │   │  Node  │
  │   (DB)    │ │(Cache) │ │(Files) │   │(React) │
  └────────┘ └────────┘ └────────┘   └────────┘
       │          │          │
       ▼          ▼          ▼
   [Volume]   [Volume]   [Volume]
```

## Next Steps

1. **First time setup:**
   ```bash
   docker-helpers.bat start
   ```

2. **Access services:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost/api
   - MinIO Console: http://localhost:9001

3. **Monitor startup:**
   ```bash
   docker-helpers.bat logs
   ```

4. **Verify health:**
   ```bash
   docker-helpers.bat health
   ```

## Support

If you encounter issues not covered here:

1. Check service logs: `docker-helpers.bat logs [service]`
2. Verify Docker has sufficient resources allocated
3. Ensure all ports (80, 3000, 5433, 6379, 9000, 9001) are available
4. Try clean restart: `docker-helpers.bat reset`

