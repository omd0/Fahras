FROM dunglas/frankenphp:1-php8.3 AS base

RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    intl \
    gd \
    exif \
    redis \
    pcntl \
    bcmath \
    zip \
    opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

FROM base AS build

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

COPY . .

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/app/public bootstrap/cache resources/views \
    && chmod -R 775 storage bootstrap/cache \
    && php artisan package:discover --ansi

FROM base AS production

COPY --from=build /app /app

RUN chmod -R 775 storage bootstrap/cache \
    && rm -f /etc/caddy/Caddyfile /Caddyfile

EXPOSE 8080

ENTRYPOINT ["bash", "deploy-entrypoint.sh"]
