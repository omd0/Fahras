FROM dunglas/frankenphp:1-php8.3

RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    redis \
    pcntl \
    bcmath \
    intl

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY api/composer.json api/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

COPY api/ .

RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache resources/views \
    && chmod -R 775 storage bootstrap/cache \
    && php artisan package:discover --ansi || true

COPY db-init/run.sh /run.sh
RUN chmod +x /run.sh

ENTRYPOINT ["/run.sh"]
