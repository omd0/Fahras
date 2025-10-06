#!/bin/sh

# Exit on any error
set -e

# Start PHP-FPM in background
echo "Starting PHP-FPM..."
php-fpm -D

# Wait for PHP-FPM to start
sleep 3

# Change to Laravel directory
cd /var/www/html

# Wait for database to be ready
echo "Waiting for database connection..."
until php artisan tinker --execute="DB::connection()->getPdo();" > /dev/null 2>&1; do
    echo "Database not ready, waiting..."
    sleep 2
done

echo "Database is ready!"

# Run Laravel optimizations only in production
if [ "$APP_ENV" = "production" ]; then
    echo "Running Laravel optimizations..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan optimize
else
    echo "Development mode - skipping optimizations"
fi

# Start Nginx
echo "Starting Nginx..."
nginx -g 'daemon off;'
