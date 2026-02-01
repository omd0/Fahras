#!/bin/bash
set -e

echo "=== Fahras API - Production Startup (Railpack) ==="

# Create required Laravel storage directories
mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Generate storage link
php artisan storage:link --force 2>/dev/null || true

# Cache configuration (env vars are now available at runtime)
php artisan config:cache
php artisan route:cache
php artisan view:cache 2>/dev/null || true
php artisan event:cache

# Run database migrations
echo "Running migrations..."
php artisan migrate --force 2>/dev/null || echo "Migration skipped or already up to date"

# Start PHP built-in server in background (used with Railpack custom start command)
echo "Starting PHP built-in server..."
php -S 0.0.0.0:9000 -t public public/index.php &

# Wait a moment for PHP to start
sleep 2

echo "=== Starting Caddy ==="
# Start Caddy (which will proxy to PHP)
exec caddy run --config /app/Caddyfile --adapter caddyfile
