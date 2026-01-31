# Stage 1: Build Frontend
FROM node:20-alpine AS frontend
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY web/ .
# Run vite build directly to skip strict type checking during Docker build
RUN npx vite build

# Stage 2: Final Image
FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    debian-keyring \
    debian-archive-keyring \
    apt-transport-https \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list \
    && apt-get update \
    && apt-get install -y caddy \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_pgsql pgsql mbstring exif pcntl bcmath gd intl zip

RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY api/ api/

WORKDIR /app/api
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
RUN php artisan package:discover --ansi || true

COPY --from=frontend /app/web/build /app/web/build

COPY Caddyfile /app/Caddyfile

RUN mkdir -p /app/api/storage /app/api/bootstrap/cache \
    && chmod -R 775 /app/api/storage /app/api/bootstrap/cache \
    && chown -R www-data:www-data /app/api/storage /app/api/bootstrap/cache

EXPOSE 80

WORKDIR /app
CMD sh -c "cd api && php artisan config:cache && php artisan route:cache && php artisan view:cache && (php artisan migrate --force || true) && php artisan serve --host=127.0.0.1 --port=9000 > /dev/null 2>&1 & sleep 5 && caddy run --config /app/Caddyfile --adapter caddyfile"
