#!/bin/bash
set -e

echo "=== Fahras API Startup ==="
echo "PHP: $(php -v | head -1)"
echo "PORT: ${PORT:-80}"
echo "APP_ENV: ${APP_ENV:-not set}"
echo "APP_KEY: ${APP_KEY:+set}${APP_KEY:-NOT SET}"
echo "DB_HOST: ${DB_HOST:-not set}"
echo "==========================="

mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache resources/views
chmod -R 775 storage bootstrap/cache

php artisan optimize:clear 2>/dev/null || true
php artisan storage:link --force 2>/dev/null || true
php artisan optimize 2>/dev/null || true
php artisan migrate --force 2>/dev/null || echo "Migration skipped"

exec docker-php-entrypoint --config /Caddyfile --adapter caddyfile 2>&1
