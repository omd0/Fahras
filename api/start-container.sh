#!/bin/bash
set -e

echo "=== Fahras API Startup ==="
echo "PHP: $(php -v | head -1)"
echo "PORT: ${PORT:-80}"
echo "APP_KEY: ${APP_KEY:+set}${APP_KEY:-NOT SET}"
echo "DB_HOST: ${DB_HOST:-not set}"
echo "==========================="

# Ensure storage directories exist
mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache resources/views public
chmod -R 775 storage bootstrap/cache resources/views

# Storage link
if [ -L "public/storage" ] || [ -d "public/storage" ]; then
    rm -rf public/storage
fi
php artisan storage:link --force 2>/dev/null || true

# Run migrations (can be disabled with RAILPACK_SKIP_MIGRATIONS=true)
if [ "$RAILPACK_SKIP_MIGRATIONS" != "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force 2>/dev/null || true
fi

# Cache optimization
php artisan config:cache
php artisan route:cache
php artisan event:cache

# Start Laravel Octane with FrankenPHP
exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=${PORT:-80}
