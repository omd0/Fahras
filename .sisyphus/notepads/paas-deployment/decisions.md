# Architectural Decisions: PaaS Deployment

## [2026-01-31] Key Decisions

### 1. Two-Service Architecture
**Decision**: Deploy as two separate services (frontend + backend)  
**Alternatives Considered**: Single container with both apps  
**Rationale**: 
- Nixpacks designed for single-app-type detection
- Independent scaling (frontend static, backend dynamic)
- Faster cold starts (smaller containers)
- Frontend can use free static tier on many PaaS platforms
**Trade-offs**: CORS configuration needed (acceptable, standard pattern)

### 2. PHP-FPM + Caddy (Not artisan serve)
**Decision**: Use PHP-FPM with Caddy web server  
**Alternatives Considered**: `php artisan serve`  
**Rationale**: 
- `artisan serve` is single-threaded, not production-grade
- PHP-FPM handles concurrent requests
- Caddy provides production features (gzip, security headers, logging)
**Implementation**: Start PHP-FPM in background, Caddy as foreground process

### 3. Runtime Config Caching (Not Build-Time)
**Decision**: Run `config:cache`, `route:cache` in startup script  
**Alternatives Considered**: Cache during Nixpacks build phase  
**Rationale**: 
- Environment variables are injected at runtime by PaaS
- Build-time caching would bake wrong/missing values
- Laravel requires env vars to be available when caching
**Implementation**: `deploy-entrypoint.sh` runs caching before starting services

### 4. Predis Over phpredis
**Decision**: Use `predis/predis` (pure PHP) for Redis client  
**Alternatives Considered**: `phpredis` (C extension)  
**Rationale**: 
- `predis` already installed in composer.json
- `phpredis` C extension may not be available in Nixpacks
- Simpler deployment (no extension compilation)
**Configuration**: `REDIS_CLIENT=predis` in env template

### 5. Alibaba OSS Virtual-Hosted Style
**Decision**: `AWS_USE_PATH_STYLE_ENDPOINT=false`  
**Alternatives Considered**: Path-style (like MinIO)  
**Rationale**: 
- Alibaba OSS requires virtual-hosted style
- URL format: `https://bucket.oss-region.aliyuncs.com/key`
- Path-style would fail with Alibaba OSS
**Documentation**: Clearly marked as [REQUIRED] in env template

### 6. Queue Sync Mode (Not Redis Queue)
**Decision**: `QUEUE_CONNECTION=sync` by default  
**Alternatives Considered**: Redis queue with separate worker  
**Rationale**: 
- Simpler deployment (no additional worker service)
- AI analysis runs inline (slower but functional)
- Can be changed to `redis` later if queue worker is added
**Trade-off**: Slower API responses for queued jobs (acceptable for MVP)

### 7. Avatar Storage Migration
**Decision**: Fix avatar uploads to use configurable disk  
**Alternatives Considered**: Leave as-is, document as known limitation  
**Rationale**: 
- Ephemeral PaaS filesystems lose local files on redeploy
- Simple 3-line fix (replace `disk('public')` with `disk()`)
- Prevents user frustration (avatar loss)
**Implementation**: Task 6 (optional but recommended)

### 8. Stderr Logging
**Decision**: `LOG_CHANNEL=stderr` for production  
**Alternatives Considered**: File-based logging (`stack`, `daily`)  
**Rationale**: 
- Ephemeral filesystems lose log files
- PaaS platforms aggregate stdout/stderr logs
- Standard pattern for containerized apps
**Benefit**: Logs available in platform dashboard automatically
