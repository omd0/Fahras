#!/bin/bash
set -e

echo "=== Fahras API Startup ==="
echo "PHP: $(php -v | head -1)"
echo "PWD: $(pwd)"
echo "PORT: ${PORT:-8080}"
echo "APP_KEY: ${APP_KEY:+set}${APP_KEY:-NOT SET}"
echo "DB_HOST: ${DB_HOST:-not set}"
echo "==========================="

mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache resources/views public
chmod -R 775 storage bootstrap/cache resources/views

if [ -L "public/storage" ] || [ -d "public/storage" ]; then
    rm -rf public/storage
fi

php artisan storage:link --force 2>/dev/null || true
php artisan config:cache
php artisan route:cache
php artisan event:cache

exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=${PORT:-8080}
