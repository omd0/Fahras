#!/bin/bash

log() { echo "[fahras] $(date '+%H:%M:%S') $1" >&2; }

log "=== Fahras API Starting ==="
log "PHP: $(php -v 2>&1 | head -1)"
log "PORT: ${PORT:-80}"
log "APP_ENV: ${APP_ENV:-not set}"
log "DB_HOST: ${DB_HOST:-not set}"
log "REDIS_HOST: ${REDIS_HOST:-not set}"

if [ -z "$APP_KEY" ]; then
  log "FATAL: APP_KEY is not set. Generate with: php artisan key:generate --show"
  exit 1
fi

mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

if [ -L "public/storage" ] || [ -d "public/storage" ]; then
  rm -rf public/storage
fi
php artisan storage:link --force 2>&1 | while read line; do log "$line"; done || true

if [ "$RAILPACK_SKIP_MIGRATIONS" != "true" ]; then
  log "Running migrations..."
  if php artisan migrate --force 2>&1 | while read line; do log "migrate: $line"; done; then
    log "Migrations completed"
  else
    log "WARNING: Migrations failed (DB may not be ready). Container will start anyway."
  fi
fi

log "Caching config..."
php artisan optimize:clear 2>&1 | while read line; do log "$line"; done || true
php artisan optimize 2>&1 | while read line; do log "$line"; done || true

log "Starting FrankenPHP on port ${PORT:-80}..."
exec docker-php-entrypoint --config /Caddyfile --adapter caddyfile 2>&1
