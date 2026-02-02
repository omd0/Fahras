#!/bin/bash
set -e
set -x

mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache resources/views public
chmod -R 775 storage bootstrap/cache resources/views

# Ensure the public directory exists before linking
if [ ! -d "public" ]; then
    mkdir public
fi

# Remove existing storage link if it's broken or a directory
if [ -L "public/storage" ] || [ -d "public/storage" ]; then
    rm -rf public/storage
fi

php artisan storage:link --force 2>/dev/null || echo "Storage link failed, continuing..."
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan migrate --force 2>/dev/null || echo "Migration skipped or already up to date"

echo "DEBUG: Overwriting /Caddyfile with custom config..."
cp Caddyfile.production /Caddyfile
cat /Caddyfile

echo "DEBUG: Starting FrankenPHP directly (bypassing Octane CLI)..."
# Using frankenphp directly ensures it respects our Caddyfile 100%
# without Octane command interfering with port binding.
exec frankenphp run --config /Caddyfile
