#!/bin/bash
set -e

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

# Set SERVER_NAME to bind to the correct port (CranL provides PORT env var)
# Bind to 0.0.0.0 explicitly to support IPv4 networks (CranL/AWS)
export SERVER_NAME="0.0.0.0:${PORT:-8080}"
echo "Starting FrankenPHP on port ${PORT:-8080} (SERVER_NAME=$SERVER_NAME)..."

exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=${PORT:-8080}
