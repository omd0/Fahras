# ── Stage 1: Build frontend with Bun ─────────────────────────
FROM oven/bun:1-alpine AS frontend
WORKDIR /app
COPY web/package.json web/package-lock.json* web/bun.lock* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install
COPY web/ .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN bunx --bun vite build

# ── Stage 2: Production ──────────────────────────────────────
FROM php:8.3-fpm-alpine

# System deps + Caddy + PHP extensions (single layer)
RUN apk add --no-cache \
      caddy libpng libpq libzip icu-libs oniguruma libxml2 \
    && apk add --no-cache --virtual .build-deps \
      libpng-dev libpq-dev libzip-dev icu-dev oniguruma-dev libxml2-dev \
    && docker-php-ext-install pdo_pgsql pgsql mbstring exif pcntl bcmath gd intl zip \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── PHP deps (cached separately from source) ─────────────────
WORKDIR /app/api
COPY api/composer.json api/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction --prefer-dist

# ── Laravel source ────────────────────────────────────────────
COPY api/ .
RUN touch .env \
    && php artisan package:discover --ansi 2>/dev/null || true \
    && rm -f .env

# ── PHP runtime config ───────────────────────────────────────
RUN cp php-custom.ini /usr/local/etc/php/conf.d/custom.ini 2>/dev/null || true

# ── Storage directories ──────────────────────────────────────
RUN mkdir -p storage/framework/{cache,sessions,views} \
      storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# ── Built frontend ───────────────────────────────────────────
WORKDIR /app
COPY --from=frontend /app/build web/build/

# ── Caddy config + entrypoint ────────────────────────────────
COPY Caddyfile Caddyfile
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:${PORT:-3000}/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
