# Production Deployment Guide

## Quick Reference: Critical Fixes Applied

This document provides a quick reference for the critical fixes applied to resolve API 404 errors and enable public/LAN access.

## Prerequisites Checklist

Before deploying to production, ensure:

- [ ] `api/public/index.php` exists
- [ ] `api/vendor/` directory exists with all dependencies
- [ ] Storage and bootstrap directories have correct permissions
- [ ] `nginx.production.conf` is configured for public access
- [ ] `docker-compose.yml` uses production config and environment variables
- [ ] Environment variables are set to production values

## Quick Fix Commands

### 1. Fix Missing Files and Dependencies

```bash
# Install Composer dependencies
docker exec -u root fahras-php sh -c "cd /var/www/html && mkdir -p vendor && chown -R www-data:www-data vendor"
docker exec -u www-data fahras-php sh -c "cd /var/www/html && composer install --no-dev --optimize-autoloader"

# Create required directories
docker exec -u root fahras-php sh -c "cd /var/www/html && \
  mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache && \
  chown -R www-data:www-data storage bootstrap/cache && \
  chmod -R 775 storage bootstrap/cache"

# Create public/index.php if missing
docker exec -u root fahras-php sh -c "cat > /var/www/html/public/index.php << 'EOF'
<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists(\$maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require \$maintenance;
}

require __DIR__.'/../vendor/autoload.php';

(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
EOF
"
```

### 2. Update Configuration for Production

**nginx.production.conf:**
- Must have `listen 0.0.0.0:80;` (not just `listen 80;`)
- Must have `listen [::]:80;` for IPv6 support

**docker-compose.yml:**
- Must use `nginx.production.conf` (not `nginx.conf`)
- Port binding: `0.0.0.0:80:80`
- Environment: `APP_ENV=production`, `APP_DEBUG=false`

### 3. Apply Changes

```bash
# Restart services to apply changes
docker compose down
docker compose up -d

# Or restart just nginx (faster)
docker compose restart nginx
```

## Verification

```bash
# 1. Check Laravel works
docker exec fahras-php php artisan --version

# 2. Test API
curl -H "Accept: application/json" http://localhost/api/test
# Expected: {"message":"API is working"}

# 3. Verify nginx config
docker exec fahras-nginx cat /etc/nginx/conf.d/default.conf | grep "listen"
# Expected: listen 0.0.0.0:80;

# 4. Check environment
docker exec fahras-php printenv | grep APP_ENV
# Expected: APP_ENV=production
```

## Cloudflare Tunnel Setup

**Single tunnel configuration (recommended):**

```yaml
tunnel: <your-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: app.saudiflux.org
    service: http://localhost:80
  - service: http_status:404
```

**Port:** `80` (handles both frontend and `/api/*` routes)

**Note:** No separate tunnel needed for API. It's accessible at `https://app.saudiflux.org/api/*` through the same tunnel.

## Common Issues

### API Returns 404

1. Check `public/index.php` exists
2. Check `vendor/` directory exists
3. Clear Laravel caches: `php artisan route:clear config:clear cache:clear`
4. Restart nginx: `docker compose restart nginx`

### Not Accessible from LAN/Public

1. Verify nginx listens on `0.0.0.0:80`
2. Check port binding is `0.0.0.0:80:80` in docker-compose.yml
3. Restart services: `docker compose down && docker compose up -d`

### Permission Errors

```bash
docker exec -u root fahras-php sh -c "cd /var/www/html && \
  chown -R www-data:www-data storage bootstrap/cache vendor && \
  chmod -R 775 storage bootstrap/cache"
```

## Environment Variables

Production environment variables in `docker-compose.yml`:

```yaml
environment:
  - APP_ENV=production
  - APP_DEBUG=false
  - APP_URL=https://app.saudiflux.org
```

## Files Modified

- `nginx.production.conf` - Updated for public/LAN access
- `docker-compose.yml` - Switched to production config and environment
- `api/public/index.php` - Created (was missing)
- `api/vendor/` - Installed via composer
- Storage/bootstrap directories - Created with proper permissions

## Related Documentation

- [DOCKER.md](./DOCKER.md) - Full Docker setup and troubleshooting guide
- [API_DEBUG_GUIDE.md](../API_DEBUG_GUIDE.md) - Detailed API debugging steps

