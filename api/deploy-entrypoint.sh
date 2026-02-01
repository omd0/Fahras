#!/bin/bash
set -e

mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache resources/views
chmod -R 775 storage bootstrap/cache

php artisan storage:link --force 2>/dev/null || true
php artisan config:cache
php artisan route:cache
php artisan view:cache 2>/dev/null || true
php artisan event:cache
php artisan migrate --force 2>/dev/null || echo "Migration skipped or already up to date"

exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=${PORT:-8080}
