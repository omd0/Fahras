# Learnings: PaaS Deployment Reconfiguration

## [2026-01-31] Successful Patterns

### Two-App Topology
- **Decision**: Deploy frontend and backend as separate services on Cranl.com
- **Rationale**: Gemini recommended this approach - Nixpacks is designed for single-app-type detection per directory
- **Benefits**: Independent scaling, faster cold starts, frontend can use free static tier
- **Trade-off**: Requires CORS configuration (but already standard pattern)

### Nixpacks Configuration
- **Pattern**: Create `nixpacks.toml` in each service root (`/api` and `/web`)
- **Backend**: PHP 8.3 + 16 extensions + Caddy + composer install
- **Frontend**: Node + npm build + Caddy static serving
- **Critical**: Config caching MUST happen at runtime (startup script), NOT build time (env vars not available)

### Laravel Production Startup Sequence
```bash
1. Create storage directories (ephemeral filesystem)
2. Set permissions (775 for storage/bootstrap)
3. Generate storage link
4. Cache config/routes/views/events (NOW env vars available)
5. Run migrations (--force for non-interactive)
6. Start PHP-FPM in background (-D flag)
7. Start Caddy as foreground process
```

### Alibaba Cloud OSS Configuration
- **S3-compatible**: Use existing `league/flysystem-aws-s3-v3` driver
- **Critical setting**: `AWS_USE_PATH_STYLE_ENDPOINT=false` (virtual-hosted style, NOT path-style like MinIO)
- **Endpoint**: `https://oss-me-central-1.aliyuncs.com` (Riyadh region)
- **Bucket**: `fahras`

### Redis Client for Nixpacks
- **Use**: `predis` (pure PHP)
- **Avoid**: `phpredis` (C extension may not be available in Nixpacks)
- **Config**: Set `REDIS_CLIENT=predis` in env template

### PaaS-Friendly Logging
- **Use**: `LOG_CHANNEL=stderr` (logs to stdout/stderr)
- **Avoid**: `stack` or `daily` (ephemeral filesystems lose log files)
- **Benefit**: Platform log aggregation works automatically

### VITE_API_URL Constraint
- **Critical**: Build-time variable (embedded in JavaScript bundle)
- **Implication**: Changing it requires complete frontend rebuild/redeploy
- **Solution**: Document clearly in deployment guide and env template

## Conventions Followed

### File Naming
- Backend Nixpacks: `api/nixpacks.toml`
- Frontend Nixpacks: `web/nixpacks.toml`
- Backend Caddyfile: `api/Caddyfile` (separate from root Caddyfile)
- Frontend Caddyfile: `web/Caddyfile`
- Entrypoint: `api/deploy-entrypoint.sh`
- Env templates: `.env.cranl.api.example`, `.env.cranl.web.example`

### Commit Strategy
- Task 1: Prerequisites fix (security blockers)
- Tasks 2+3: Nixpacks configs grouped (both apps)
- Tasks 4+5: Documentation grouped (guide + env templates)
- Task 6: Avatar storage fix (separate, optional)

### Verification Pattern
- File existence checks
- Content validation via grep
- No hardcoded secrets verification
- No anti-patterns (artisan serve, build-time caching)

## Anti-Patterns Avoided

### From nixpacks.toml.bak
- ❌ Bundling both apps in single container
- ❌ Using `php artisan serve` (single-threaded, not production-grade)
- ❌ Running `config:cache` at build time (env vars not available)
- ✅ Used it ONLY for PHP extension package names reference

### Security
- ❌ Hardcoded APP_KEY in config files
- ❌ CORS wildcard `*` with `supports_credentials: true` (spec violation)
- ✅ All secrets via environment variables
- ✅ CORS uses specific origins from env

### Storage
- ❌ Hardcoded `Storage::disk('public')` for avatars (ephemeral filesystem)
- ✅ Use `Storage::disk()` to respect `FILESYSTEM_DISK` env var
