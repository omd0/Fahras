#!/bin/sh

# Start PHP-FPM
php-fpm -D

# Wait for PHP-FPM to start
sleep 2

# Run Laravel optimizations
cd /var/www/html
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Nginx
nginx -g 'daemon off;'
