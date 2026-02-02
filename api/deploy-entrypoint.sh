#!/bin/bash
set -e

mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache resources/views public
chmod -R 775 storage bootstrap/cache resources/views

if [ ! -d "public" ]; then
    mkdir public
fi

if [ -L "public/storage" ] || [ -d "public/storage" ]; then
    rm -rf public/storage
fi

php artisan storage:link --force 2>/dev/null || echo "Storage link failed, continuing..."
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan migrate --force 2>/dev/null || echo "Migration skipped or already up to date"

exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=${PORT:-8080}
