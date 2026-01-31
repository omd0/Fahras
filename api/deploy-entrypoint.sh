#!/bin/bash
set -e

echo "=== Fahras API - Production Startup ==="

# Create required Laravel storage directories
mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Generate storage link
php artisan storage:link --force 2>/dev/null || true

# Cache configuration (env vars are now available at runtime)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run database migrations
echo "Running migrations..."
php artisan migrate --force 2>/dev/null || echo "Migration skipped or already up to date"

# Start PHP-FPM in background
php-fpm -D

echo "=== Starting Caddy ==="
# Serve API via Caddy + PHP-FPM
caddy run --config /app/Caddyfile --adapter caddyfile
