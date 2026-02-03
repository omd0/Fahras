#!/bin/bash
set -e

echo "=== Fahras DB Init ==="
echo "PHP: $(php -v | head -1)"
echo "DB_HOST: ${DB_HOST:-NOT SET}"
echo "DB_DATABASE: ${DB_DATABASE:-NOT SET}"
echo "======================"

php artisan config:cache

echo "Running migrations..."
php artisan migrate --force
echo "Migrations complete."

if [ "${SEED}" = "true" ]; then
    echo "Running seeders..."
    php artisan db:seed --force
    echo "Seeding complete."
fi

echo "=== DB Init Done ==="
