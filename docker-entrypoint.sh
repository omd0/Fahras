#!/bin/sh
set -e

cd /app/api

php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan migrate --force 2>/dev/null || true

php-fpm -D

exec caddy run --config /app/Caddyfile
