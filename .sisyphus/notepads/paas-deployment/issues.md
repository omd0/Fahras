# Issues & Gotchas: PaaS Deployment

## [2026-01-31] Issues Encountered & Resolved

### 1. Hardcoded APP_KEY Security Risk
**Issue**: `api/config/app.php:125` had hardcoded encryption key committed to repo  
**Impact**: Blocks env-based key rotation, security vulnerability  
**Resolution**: Replaced with `env('APP_KEY')`  
**Verification**: `grep -c "base64:TFNy" api/config/app.php` returns 0  
**Lesson**: Always audit config files for hardcoded secrets before deployment

### 2. CORS Spec Violation
**Issue**: `allowed_origins: ['*']` with `supports_credentials: true`  
**Impact**: Invalid per CORS spec, will cause silent auth failures on separate domains  
**Why It Worked Before**: Both apps behind same Nginx proxy (same origin)  
**Resolution**: Changed to env-driven array with `FRONTEND_URL`, `APP_URL`, `localhost:3000`  
**Lesson**: CORS wildcards incompatible with credentials - must use specific origins

### 3. Missing TrustProxies Middleware
**Issue**: No proxy trust configuration for PaaS load balancers  
**Impact**: `$request->ip()`, `url()`, `secure()`, HTTPS detection all broken  
**Resolution**: Added `$middleware->trustProxies()` in `bootstrap/app.php`  
**Laravel 11 Pattern**: Configured via middleware callback, NOT separate class  
**Lesson**: PaaS apps always behind load balancers - trust proxies is mandatory

### 4. PHP Extensions Not Declared
**Issue**: Nixpacks wouldn't know which PHP extensions to install  
**Impact**: Missing extensions would cause runtime errors  
**Resolution**: Added 16 `ext-*` declarations to `composer.json` require block  
**Lesson**: Nixpacks reads composer.json to determine PHP extensions

### 5. Config Caching at Wrong Time
**Issue**: `nixpacks.toml.bak` cached config during build phase  
**Impact**: Env vars not available at build time - caches wrong/missing values  
**Resolution**: Moved all caching to `deploy-entrypoint.sh` (runtime)  
**Lesson**: PaaS injects env vars at runtime, not build time

### 6. Avatar Storage on Ephemeral Disk
**Issue**: `Storage::disk('public')` hardcoded for avatar uploads  
**Impact**: Avatars lost on every redeploy (ephemeral filesystem)  
**Resolution**: Changed to `Storage::disk()` (respects `FILESYSTEM_DISK` env)  
**Lesson**: Never hardcode storage disks - always use configurable default

### 7. VITE_API_URL Build-Time Constraint
**Issue**: Frontend env vars embedded at build time, not runtime  
**Impact**: Changing API URL requires complete frontend rebuild  
**Resolution**: Documented clearly in deployment guide and env template  
**Workaround**: None - this is Vite's design  
**Lesson**: Build-time vs runtime env vars - critical distinction for frontend

### 8. Redis Client Mismatch
**Issue**: Config defaults to `phpredis` but `predis` is installed  
**Impact**: Nixpacks may not have phpredis C extension  
**Resolution**: Set `REDIS_CLIENT=predis` in env template  
**Lesson**: Check installed packages vs config defaults

## Gotchas to Watch For

### Cranl.com Platform
- **New platform**: No public docs yet (as of 2026-01-31)
- **MENA region**: Requires Pro plan or higher
- **Monorepo support**: Assumed based on Railway-like behavior (needs confirmation)
- **Managed add-ons**: DATABASE_URL and REDIS_URL auto-injected (standard pattern)

### Alibaba OSS
- **Virtual-hosted style**: MUST use `AWS_USE_PATH_STYLE_ENDPOINT=false`
- **Endpoint format**: `https://oss-{region}.aliyuncs.com` (NOT `s3.{region}.aliyuncs.com`)
- **Public access**: Block Public Access enabled - files served via signed URLs

### Vite Build
- **Output directory**: `build/` NOT `dist/` (confirmed in `vite.config.ts:30`)
- **Caddyfile must match**: `root * /app/build` (critical for SPA routing)
- **Build-time env vars**: All `VITE_*` variables baked into bundle

### Laravel on PaaS
- **Storage directories**: Must create at startup (ephemeral filesystem)
- **Permissions**: 775 for storage and bootstrap/cache
- **Migrations**: Use `--force` flag (non-interactive)
- **Storage link**: Run `storage:link --force` at startup
