# PaaS Deployment Reconfiguration for Cranl.com

## TL;DR

> **Quick Summary**: Reconfigure Fahras (Laravel 11 API + React 19 frontend) for deployment on Cranl.com PaaS as two separate services with Nixpacks, using Alibaba Cloud OSS for storage and Cranl managed PostgreSQL/Redis add-ons.
> 
> **Deliverables**:
> - `api/nixpacks.toml` — Backend Nixpacks configuration (PHP-FPM + Caddy)
> - `web/nixpacks.toml` — Frontend Nixpacks configuration (static build + Caddy SPA)
> - `web/Caddyfile` — Frontend static SPA file server
> - `api/deploy-entrypoint.sh` — Backend production startup script
> - `.env.cranl.api.example` — Backend environment variable template for Cranl
> - `.env.cranl.web.example` — Frontend environment variable template for Cranl
> - Fixed `api/config/app.php` — APP_KEY via env() instead of hardcoded
> - Fixed `api/config/cors.php` — Env-driven CORS origins instead of wildcard
> - Fixed `api/bootstrap/app.php` — TrustProxies middleware for PaaS
> - Updated `api/composer.json` — Declared PHP extension requirements
> 
> **Estimated Effort**: Medium (3-5 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (Prerequisites) → Task 2 (Backend Nixpacks) → Task 5 (Env Templates)

---

## Context

### Original Request
Refactor deployment to be PaaS-ready for Cranl.com. No database or Redis in the deployment container — use external managed services. Setup Nixpacks configuration. Gemini was consulted and recommended a two-app topology (frontend + backend as separate services).

### Interview Summary
**Key Discussions**:
- **PaaS Platform**: Cranl.com — a new Railway-like PaaS with MENA/Saudi Arabia region, managed DB/Redis, GitHub auto-deploy, Nixpacks support
- **Topology**: Two separate apps (frontend static site + backend PHP API) — Gemini strongly recommended this, user agreed
- **File Storage**: Alibaba Cloud OSS — Bucket `fahras`, Region SAU (Riyadh) `me-central-1`, S3-compatible via existing Flysystem driver
- **External Services**: Cranl managed PostgreSQL and Redis add-ons
- **CI/CD**: Not needed — Cranl auto-deploys from GitHub on push
- **Scope**: Nixpacks config, env templates, prerequisite fixes. No CI/CD, DNS, or infrastructure provisioning.

**Research Findings**:
- **Auth is Bearer token-based** (NOT cookie-based) — frontend and backend CAN be on separate domains without issues
- **CORS currently broken**: `allowed_origins: ['*']` with `supports_credentials: true` is invalid per CORS spec. Works today only because both are behind same Nginx proxy
- **APP_KEY hardcoded** in `api/config/app.php:125` — must be changed to `env('APP_KEY')` before deploying anywhere
- **No TrustProxies** middleware — on PaaS behind load balancers, `request()->ip()`, `url()`, and HTTPS detection will all break
- **Redis client mismatch**: Config defaults to `phpredis` (C extension) but `predis/predis` (pure PHP) is installed. Nixpacks may not have phpredis
- **Existing `nixpacks.toml.bak`** at project root — single-app config with anti-patterns (bundles both apps, uses `php artisan serve`, caches config at build time)
- **Alibaba OSS** is S3-compatible — works with existing `league/flysystem-aws-s3-v3`, requires `use_path_style_endpoint=false` (virtual-hosted style)
- **Vite build output**: `./build` directory (confirmed in `vite.config.ts:30`)
- **Avatar uploads**: Hardcoded to `Storage::disk('public')` (local disk) in `AuthController.php` — will break on ephemeral PaaS

### Metis Review
**Identified Gaps** (addressed):
- Hardcoded APP_KEY → Added as prerequisite fix (Task 1)
- CORS wildcard + credentials → Added as prerequisite fix (Task 1)
- No TrustProxies → Added as prerequisite fix (Task 1)
- Redis client mismatch → Env template sets `REDIS_CLIENT=predis` (Task 5)
- Config cache at build time → Moved to startup entrypoint only (Task 2)
- Avatar local disk → Flagged as known limitation, optional fix included (Task 6)
- Queue worker → Defaulted to `QUEUE_CONNECTION=sync` (Task 5)
- VITE_API_URL baked at build time → Documented as constraint (Task 5)

---

## Work Objectives

### Core Objective
Create Nixpacks deployment configurations for Fahras to deploy as two separate services on Cranl.com PaaS, fixing all prerequisite issues that would prevent successful deployment.

### Concrete Deliverables
- Backend Nixpacks config: `api/nixpacks.toml`
- Frontend Nixpacks config: `web/nixpacks.toml`
- Frontend Caddy SPA server: `web/Caddyfile`
- Backend startup script: `api/deploy-entrypoint.sh`
- Environment templates: `.env.cranl.api.example`, `.env.cranl.web.example`
- Fixed: `api/config/app.php` (env-based APP_KEY)
- Fixed: `api/config/cors.php` (env-driven CORS origins)
- Fixed: `api/bootstrap/app.php` (TrustProxies middleware)
- Updated: `api/composer.json` (PHP extension declarations)

### Definition of Done
- [x] `api/nixpacks.toml` exists and defines PHP 8.3 + extensions + Caddy + startup script
- [x] `web/nixpacks.toml` exists and defines Node + npm build + Caddy static serving
- [x] `web/Caddyfile` serves SPA with `try_files` fallback from `build/` directory
- [x] `api/deploy-entrypoint.sh` creates storage dirs, caches config, runs migrations
- [x] `api/config/app.php:125` uses `env('APP_KEY')` not hardcoded base64 string
- [x] `api/config/cors.php` uses `env('FRONTEND_URL')` for allowed origins
- [x] `api/bootstrap/app.php` includes TrustProxies configuration
- [x] `grep -r "base64:TFNy" api/config/` returns nothing
- [x] No references to `artisan serve` in any Nixpacks config or entrypoint
- [x] Environment templates document ALL required variables for Cranl deployment

### Must Have
- Nixpacks config for both services (frontend + backend)
- Env-driven configuration (no hardcoded secrets or URLs)
- CORS properly configured for separate-domain deployment
- Alibaba OSS configuration documented in env templates
- PHP-FPM + Caddy for backend (NOT `php artisan serve`)
- Config/route caching at STARTUP time (not build time)
- TrustProxies for PaaS load balancer compatibility

### Must NOT Have (Guardrails)
- **NO modifications** to `docker-compose.yml`, `.docker/` directory, or existing Dockerfiles (these are for local dev)
- **NO modifications** to the root `Caddyfile` or root `docker-entrypoint.sh` (these serve the existing single-app deploy path)
- **NO changes** to controller logic, route definitions, or API behavior
- **NO new composer packages** — `league/flysystem-aws-s3-v3` and `predis/predis` already present
- **NO `php artisan serve`** in production — it's single-threaded, not production-grade
- **NO `config:cache` or `route:cache` at BUILD time** — env vars aren't available during Nixpacks build phase
- **NO CI/CD pipeline** configuration (Cranl auto-deploys from GitHub)
- **NO DNS / custom domain** setup (out of scope)
- **NO database seeding** in production entrypoint
- **NO removal** of existing MinIO/S3 config — Alibaba OSS uses the same `s3` disk via env vars

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (vitest for frontend, phpunit for backend — but NOT used for this task)
- **User wants tests**: NO — this is deployment infrastructure, not feature development
- **QA approach**: Automated verification via shell commands and file content checks

### Verification Approach

Each TODO includes executable verification procedures. Since this is deployment config:

| Deliverable Type | Verification Method |
|------------------|-------------------|
| Config files (nixpacks.toml, Caddyfile) | File existence + content validation via grep |
| PHP config changes | grep for expected patterns, absence of bad patterns |
| Environment templates | File existence + all required keys present |
| Entrypoint scripts | File existence + executable permissions + correct commands |
| CORS fix | grep for env-driven origins, absence of wildcard |
| APP_KEY fix | grep for `env('APP_KEY')`, absence of hardcoded key |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Prerequisites (APP_KEY, CORS, TrustProxies, composer.json)
└── Task 3: Frontend Nixpacks (nixpacks.toml + Caddyfile) — no backend dependency

Wave 2 (After Wave 1):
├── Task 2: Backend Nixpacks (nixpacks.toml + entrypoint) — depends on composer.json from Task 1
├── Task 4: Cranl Deployment Guide — depends on all configs existing
└── Task 5: Environment Templates — depends on knowing all config vars from Tasks 1-3

Wave 3 (Optional):
└── Task 6: Avatar Storage Fix — optional, independent

Critical Path: Task 1 → Task 2 → Task 5
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 (Prerequisites) | None | 2, 4, 5 | 3 |
| 2 (Backend Nixpacks) | 1 | 4, 5 | 3 |
| 3 (Frontend Nixpacks) | None | 4, 5 | 1 |
| 4 (Deployment Guide) | 1, 2, 3 | None | 5 |
| 5 (Env Templates) | 1, 2, 3 | None | 4 |
| 6 (Avatar Fix) | None | None | Any (optional) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 3 | `delegate_task(category="quick", ...)` — both are config file changes |
| 2 | 2, 4, 5 | `delegate_task(category="unspecified-low", ...)` — config + documentation |
| 3 | 6 | `delegate_task(category="quick", ...)` — optional 3-line fix |

---

## TODOs

- [x] 1. Fix Prerequisites (Security & Compatibility Blockers)

  **What to do**:
  
  **1a. Fix hardcoded APP_KEY in `api/config/app.php`**:
  - Line 125: Replace `'key' => 'base64:TFNy6t3vG3tNUpBkg0S2kX/4IHYNZWsE8h40xvfL8k8='` with `'key' => env('APP_KEY')`
  - This is a committed secret and blocks env-based key rotation on Cranl
  
  **1b. Fix CORS configuration in `api/config/cors.php`**:
  - Replace `'allowed_origins' => ['*']` with env-driven origins:
    ```php
    'allowed_origins' => array_filter([
        env('FRONTEND_URL'),
        env('APP_URL'),
        'http://localhost:3000',
    ]),
    ```
  - This fixes the spec violation (`*` with `supports_credentials: true` is invalid)
  - Development still works via `localhost:3000` fallback
  
  **1c. Add TrustProxies middleware in `api/bootstrap/app.php`**:
  - Inside the `->withMiddleware()` callback, add:
    ```php
    $middleware->trustProxies(
        at: '*',
        headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR |
                 \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST |
                 \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT |
                 \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO |
                 \Illuminate\Http\Request::HEADER_X_FORWARDED_AWS_ELB
    );
    ```
  - This ensures `$request->ip()`, `url()`, `secure()`, and HTTPS detection work behind PaaS load balancers
  
  **1d. Declare PHP extensions in `api/composer.json`**:
  - Add to the `"require"` section (Nixpacks reads these to install extensions):
    ```json
    "ext-pdo_pgsql": "*",
    "ext-pgsql": "*",
    "ext-redis": "*",
    "ext-mbstring": "*",
    "ext-xml": "*",
    "ext-dom": "*",
    "ext-curl": "*",
    "ext-fileinfo": "*",
    "ext-tokenizer": "*",
    "ext-ctype": "*",
    "ext-bcmath": "*",
    "ext-intl": "*",
    "ext-gd": "*",
    "ext-exif": "*",
    "ext-pcntl": "*",
    "ext-zip": "*"
    ```

  **Must NOT do**:
  - Do NOT remove the existing `'key' => ...` line entirely — replace it with `env('APP_KEY')`
  - Do NOT change `supports_credentials` to `false` — Bearer token auth requires it
  - Do NOT remove `'http://localhost:3000'` from CORS — it's needed for local development
  - Do NOT add any new composer packages
  - Do NOT modify any controller files, routes, or other config files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small targeted edits across 4 config files, each change is a few lines
  - **Skills**: [`test-driven-development`]
    - `test-driven-development`: Not for tests — but the skill enforces careful verification-first thinking
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations needed in this task
    - `frontend-ui-ux`: No frontend changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 3)
  - **Blocks**: Tasks 2, 4, 5
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References**:
  - `api/config/app.php:125` — The hardcoded APP_KEY line that must be replaced with `env('APP_KEY')`
  - `api/config/cors.php:22` — The `'allowed_origins' => ['*']` that must become env-driven
  - `api/bootstrap/app.php:14-18` — The `->withMiddleware()` callback where TrustProxies must be added
  - `api/composer.json:7-17` — The `"require"` block where ext-* declarations must be added

  **API/Type References**:
  - `api/config/cors.php:32` — `supports_credentials` is `true` — DO NOT change this, it's needed for Bearer token auth
  - `api/config/database.php:23` — `'client' => env('REDIS_CLIENT', 'phpredis')` — Related context: predis is installed but default is phpredis

  **Documentation References**:
  - Laravel 11 TrustProxies: In Laravel 11+, TrustProxies is configured via `$middleware->trustProxies()` in `bootstrap/app.php`, NOT via a separate middleware class
  - CORS Spec: When `supports_credentials` is true, `Access-Control-Allow-Origin` MUST be a specific origin, not `*`

  **WHY Each Reference Matters**:
  - `app.php:125`: This is the EXACT line to change — a hardcoded encryption key that will break key rotation
  - `cors.php:22`: The wildcard origin will cause silent auth failures when frontend and backend are on different domains
  - `bootstrap/app.php:14-18`: This is WHERE to add the TrustProxies call — inside the existing middleware callback
  - `composer.json:7-17`: Nixpacks reads `ext-*` from here to determine which PHP extensions to install

  **Acceptance Criteria**:

  ```bash
  # 1a. APP_KEY is env-driven, not hardcoded
  grep -n "env('APP_KEY')" api/config/app.php
  # Assert: Returns line 125 (or nearby) with env('APP_KEY')
  
  grep -c "base64:TFNy" api/config/app.php
  # Assert: Returns 0 (hardcoded key removed)
  
  # 1b. CORS uses env-driven origins
  grep -c "'allowed_origins' => \['\*'\]" api/config/cors.php
  # Assert: Returns 0 (wildcard removed)
  
  grep "FRONTEND_URL" api/config/cors.php
  # Assert: Returns line with env('FRONTEND_URL')
  
  grep "localhost:3000" api/config/cors.php
  # Assert: Returns line (dev fallback preserved)
  
  # 1c. TrustProxies configured
  grep "trustProxies" api/bootstrap/app.php
  # Assert: Returns line with trustProxies configuration
  
  # 1d. PHP extensions declared
  grep "ext-pdo_pgsql" api/composer.json
  # Assert: Returns line in require block
  
  grep "ext-redis" api/composer.json
  # Assert: Returns line in require block
  
  grep "ext-intl" api/composer.json
  # Assert: Returns line in require block
  ```

  **Commit**: YES
  - Message: `fix(api): replace hardcoded secrets with env vars and add PaaS compatibility`
  - Files: `api/config/app.php`, `api/config/cors.php`, `api/bootstrap/app.php`, `api/composer.json`
  - Pre-commit: `grep -c "base64:TFNy" api/config/app.php` → must return 0

---

- [x] 2. Create Backend Nixpacks Configuration

  **What to do**:

  **2a. Create `api/nixpacks.toml`**:
  - Setup phase: Install PHP 8.3 with all required extensions, Caddy web server
  - Install phase: `composer install --no-dev --optimize-autoloader`
  - Build phase: NO config/route caching (env vars not available at build time)
  - Start phase: Execute `deploy-entrypoint.sh`
  
  Configuration structure:
  ```toml
  # Nixpacks Configuration for Fahras API (Laravel 11)
  # Deployed as separate backend service on Cranl.com PaaS

  [phases.setup]
  nixPkgs = [
      "php83",
      "php83Packages.composer",
      "php83Extensions.pdo_pgsql",
      "php83Extensions.pgsql",
      "php83Extensions.redis",
      "php83Extensions.mbstring",
      "php83Extensions.xml",
      "php83Extensions.dom",
      "php83Extensions.curl",
      "php83Extensions.fileinfo",
      "php83Extensions.tokenizer",
      "php83Extensions.ctype",
      "php83Extensions.openssl",
      "php83Extensions.bcmath",
      "php83Extensions.pcntl",
      "php83Extensions.intl",
      "php83Extensions.gd",
      "php83Extensions.exif",
      "php83Extensions.zip",
      "caddy"
  ]

  [phases.install]
  dependsOn = ["setup"]
  cmds = [
      "mkdir -p bootstrap/cache storage/framework/{cache,sessions,views} storage/logs storage/app/public",
      "chmod -R 775 storage bootstrap/cache",
      "composer install --no-dev --optimize-autoloader --no-interaction"
  ]

  [start]
  cmd = "bash deploy-entrypoint.sh"
  ```

  **2b. Create `api/deploy-entrypoint.sh`**:
  - Create storage directories (in case they don't exist on ephemeral filesystem)
  - Set permissions
  - Cache config, routes, views (NOW env vars are available)
  - Run database migrations (`--force` for non-interactive)
  - Start PHP-FPM in background
  - Start Caddy with inline config for API-only serving
  
  Script structure:
  ```bash
  #!/bin/bash
  set -e

  echo "=== Fahras API - Production Startup ==="

  # Create required Laravel storage directories
  mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache
  chmod -R 775 storage bootstrap/cache

  # Generate storage link
  php artisan storage:link --force 2>/dev/null || true

  # Cache configuration (env vars are now available at runtime)
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan event:cache

  # Run database migrations
  echo "Running migrations..."
  php artisan migrate --force 2>/dev/null || echo "Migration skipped or already up to date"

  # Start PHP-FPM in background
  php-fpm -D

  echo "=== Starting Caddy ==="
  # Serve API via Caddy + PHP-FPM
  caddy run --config /app/Caddyfile --adapter caddyfile
  ```

  **2c. Create `api/Caddyfile`** (API-only, no frontend):
  ```
  :{$PORT:8080} {
      root * /app/public

      php_fastcgi 127.0.0.1:9000

      encode gzip

      header {
          X-Frame-Options SAMEORIGIN
          X-XSS-Protection "1; mode=block"
          X-Content-Type-Options nosniff
          Referrer-Policy no-referrer-when-downgrade
          -Server
      }

      log {
          output stdout
          format console
      }
  }
  ```
  
  Note: This Caddyfile is INSIDE `api/` — it's separate from the root Caddyfile (which serves both apps). Caddy will handle both PHP-FPM proxying and static file serving for Laravel's `public/` directory.

  **Must NOT do**:
  - Do NOT run `config:cache` or `route:cache` in the install/build phase — env vars are NOT available at Nixpacks build time
  - Do NOT use `php artisan serve` — it's single-threaded and not production-grade
  - Do NOT include Node.js or frontend build steps — this is backend-only
  - Do NOT include `php artisan db:seed` in the entrypoint — production should not seed
  - Do NOT modify the root `Caddyfile` or root `docker-entrypoint.sh`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: File creation with specific content, not complex logic
  - **Skills**: []
    - No specialized skills needed — this is config file creation
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No frontend involved
    - `playwright`: No browser testing needed

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1 for composer.json extensions)
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: Task 1 (composer.json ext-* declarations must exist)

  **References** (CRITICAL):

  **Pattern References**:
  - `nixpacks.toml.bak:1-66` — Existing Nixpacks config for reference on nixPkgs syntax and PHP extensions. **WARNING**: Do NOT copy its anti-patterns: it bundles both apps, uses `artisan serve`, and caches config at build time
  - `docker-entrypoint.sh:1-15` — Existing production entrypoint pattern (config:cache, route:cache, migrate, php-fpm, caddy). Follow this pattern but add storage directory creation
  - `Caddyfile:1-26` — Existing root Caddyfile pattern for Caddy syntax. The new `api/Caddyfile` should serve ONLY the API (no frontend handle block)
  - `.docker/docker-entrypoint.sh` — Alternative entrypoint with more steps. Reference for startup command ordering

  **API/Type References**:
  - `api/composer.json:7-17` — Dependencies that need to be installed. Nixpacks runs `composer install` automatically when it detects composer.json
  - `api/config/database.php:8` — `'url' => env('DATABASE_URL')` — Cranl may provide DATABASE_URL; Laravel parses it automatically

  **Documentation References**:
  - Nixpacks PHP provider docs: Nixpacks detects PHP via `composer.json` and auto-installs. The `nixpacks.toml` override is for custom extensions and Caddy
  - Laravel deployment docs: `config:cache`, `route:cache`, `view:cache` must run AFTER env vars are set (i.e., at runtime on PaaS, not build time)

  **WHY Each Reference Matters**:
  - `nixpacks.toml.bak`: Shows the Nix package names for PHP 8.3 extensions (e.g., `php83Extensions.pdo_pgsql`) — copy these exact names
  - `docker-entrypoint.sh`: Proves the startup sequence works (config:cache → migrate → php-fpm → caddy)
  - `Caddyfile`: Shows Caddy syntax for `php_fastcgi` and `root * /app/...` — adapt for API-only serving
  - `composer.json`: Ensures `composer install --no-dev` won't miss production dependencies

  **Acceptance Criteria**:

  ```bash
  # 2a. nixpacks.toml exists with correct structure
  test -f api/nixpacks.toml
  # Assert: exit code 0
  
  grep "php83Extensions.pdo_pgsql" api/nixpacks.toml
  # Assert: Returns line (PostgreSQL extension declared)
  
  grep "caddy" api/nixpacks.toml
  # Assert: Returns line (Caddy declared)
  
  grep "artisan serve" api/nixpacks.toml
  # Assert: No output (artisan serve not used)
  
  grep "config:cache" api/nixpacks.toml
  # Assert: No output (config:cache NOT in build phase)
  
  # 2b. Entrypoint exists and is executable
  test -f api/deploy-entrypoint.sh
  # Assert: exit code 0
  
  test -x api/deploy-entrypoint.sh || head -1 api/deploy-entrypoint.sh | grep -q "bash"
  # Assert: exit code 0 (executable or has bash shebang)
  
  grep "config:cache" api/deploy-entrypoint.sh
  # Assert: Returns line (config:cache IS in startup script)
  
  grep "migrate --force" api/deploy-entrypoint.sh
  # Assert: Returns line (migrations run at startup)
  
  grep "php-fpm" api/deploy-entrypoint.sh
  # Assert: Returns line (PHP-FPM started)
  
  grep "caddy run" api/deploy-entrypoint.sh
  # Assert: Returns line (Caddy started as final process)
  
  # 2c. API Caddyfile exists
  test -f api/Caddyfile
  # Assert: exit code 0
  
  grep "php_fastcgi" api/Caddyfile
  # Assert: Returns line (PHP-FPM proxy configured)
  
  grep "PORT" api/Caddyfile
  # Assert: Returns line (port is env-driven)
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `feat(deploy): add Nixpacks configs for two-app PaaS deployment on Cranl`
  - Files: `api/nixpacks.toml`, `api/deploy-entrypoint.sh`, `api/Caddyfile`
  - Pre-commit: `grep -c "artisan serve" api/nixpacks.toml api/deploy-entrypoint.sh` → must return 0

---

- [x] 3. Create Frontend Nixpacks Configuration

  **What to do**:

  **3a. Create `web/nixpacks.toml`**:
  - Nixpacks detects Node.js via `package.json`
  - Install: `npm ci`
  - Build: `npm run build` (runs `tsc && vite build`, outputs to `build/`)
  - Start: Caddy serves static SPA from `build/` directory
  
  Configuration structure:
  ```toml
  # Nixpacks Configuration for Fahras Frontend (React 19 + Vite)
  # Deployed as separate static site service on Cranl.com PaaS

  [phases.setup]
  nixPkgs = ["caddy"]

  [phases.install]
  cmds = ["npm ci --prefer-offline --no-audit"]

  [phases.build]
  dependsOn = ["install"]
  cmds = ["npm run build"]

  [start]
  cmd = "caddy run --config Caddyfile --adapter caddyfile"
  ```

  **3b. Create `web/Caddyfile`** (SPA static file server):
  ```
  :{$PORT:3000} {
      root * /app/build

      # SPA fallback — all routes serve index.html
      try_files {path} /index.html
      file_server

      encode gzip

      header {
          X-Frame-Options SAMEORIGIN
          X-XSS-Protection "1; mode=block"
          X-Content-Type-Options nosniff
          Referrer-Policy no-referrer-when-downgrade
          -Server
          # Cache static assets aggressively
          Cache-Control "public, max-age=31536000, immutable" {
              path /assets/*
          }
      }

      log {
          output stdout
          format console
      }
  }
  ```

  **Must NOT do**:
  - Do NOT use `vite preview` for production — it's not a production server
  - Do NOT include PHP, Laravel, or API-related configuration
  - Do NOT hardcode `VITE_API_URL` in the Nixpacks config — it's set as build-time env var on Cranl
  - Do NOT use `npm start` (which runs Vite dev server) — use Caddy for static serving
  - Do NOT set the build output to `dist` — Vite is configured to output to `build/` (see `vite.config.ts:30`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Two small config files with well-defined content
  - **Skills**: []
    - No specialized skills needed
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No UI/UX work, just deployment config

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References**:
  - `web/vite.config.ts:29-30` — `outDir: 'build'` — Confirms build output directory is `build/`, NOT `dist/`. The Caddyfile MUST use `root * /app/build`
  - `web/package.json:53` — `"build": "tsc && vite build"` — The exact build command Nixpacks should run
  - `Caddyfile:12-24` — Existing root Caddyfile's frontend `handle` block with `try_files` and security headers. Adapt this pattern for standalone frontend Caddyfile
  - `nixpacks.toml.bak:52-53` — Shows `cd web && npx vite build` then `rm -rf web/node_modules`. In the two-app approach, Nixpacks handles build automatically, no need for cleanup

  **API/Type References**:
  - `web/.env` — `VITE_API_URL=/api` — Currently relative path. For two-app deployment, this MUST be set to the full backend URL (e.g., `https://fahras-api.cranl.com`) as a build-time env var on Cranl
  - `web/src/lib/api.ts:5-12` — API base URL resolution logic. Falls back to `{origin}/api` if `VITE_API_URL` is not set. For two-app deployment, `VITE_API_URL` MUST be explicitly set

  **Documentation References**:
  - Vite env docs: `VITE_*` environment variables are embedded at BUILD time, not runtime. The Cranl build environment must have `VITE_API_URL` set before `npm run build` runs
  - Caddy static site docs: `try_files {path} /index.html` enables SPA routing (all paths serve index.html, client-side router handles routing)

  **WHY Each Reference Matters**:
  - `vite.config.ts:30`: If Caddyfile uses `dist/` instead of `build/`, the frontend will show 404 for all routes
  - `package.json:53`: This is what `npm run build` actually executes — confirms TypeScript check + Vite build
  - Root `Caddyfile:12-24`: Proven pattern for security headers and SPA fallback routing — reuse in standalone config
  - `api.ts:5-12`: Shows WHY `VITE_API_URL` must be set — the fallback `{origin}/api` won't work when frontend and backend are on different domains

  **Acceptance Criteria**:

  ```bash
  # 3a. nixpacks.toml exists
  test -f web/nixpacks.toml
  # Assert: exit code 0
  
  grep "npm run build" web/nixpacks.toml
  # Assert: Returns line (build command specified)
  
  grep "caddy" web/nixpacks.toml
  # Assert: Returns line (Caddy for serving)
  
  grep -i "php\|laravel\|artisan" web/nixpacks.toml
  # Assert: No output (no backend references)
  
  # 3b. Caddyfile exists with correct root
  test -f web/Caddyfile
  # Assert: exit code 0
  
  grep "root \* /app/build" web/Caddyfile
  # Assert: Returns line (correct build directory, NOT dist)
  
  grep "try_files" web/Caddyfile
  # Assert: Returns line (SPA fallback configured)
  
  grep "PORT" web/Caddyfile
  # Assert: Returns line (port is env-driven)
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `feat(deploy): add Nixpacks configs for two-app PaaS deployment on Cranl`
  - Files: `web/nixpacks.toml`, `web/Caddyfile`
  - Pre-commit: `grep "root \* /app/build" web/Caddyfile` → must succeed

---

- [x] 4. Create Cranl Deployment Guide

  **What to do**:

  Create `DEPLOYMENT.md` at project root documenting how to deploy on Cranl.com:

  **Content Structure**:
  1. **Overview**: Two-service architecture (Frontend + Backend)
  2. **Prerequisites**: Cranl account (Pro plan for MENA region), GitHub repo connected
  3. **Service 1 — Backend API**:
     - Service type: Web Service
     - Root directory: `/api`
     - Nixpacks auto-detected via `nixpacks.toml`
     - Environment variables: Reference `.env.cranl.api.example`
     - Add-ons: PostgreSQL, Redis
     - Region: MENA (Saudi Arabia) recommended for latency
  4. **Service 2 — Frontend**:
     - Service type: Web Service (or Static Site if Cranl supports it)
     - Root directory: `/web`
     - Nixpacks auto-detected via `nixpacks.toml`
     - Environment variables: Reference `.env.cranl.web.example`
     - **CRITICAL**: `VITE_API_URL` must point to the backend service URL
     - Region: Same as backend, or use CDN
  5. **Post-Deployment Checklist**:
     - Verify API health: `curl https://{api-url}/api/test`
     - Verify frontend loads: `curl -s -o /dev/null -w "%{http_code}" https://{frontend-url}/explore`
     - Verify CORS: `curl -H "Origin: https://{frontend-url}" -I https://{api-url}/api/test`
     - Verify file upload: Test via frontend UI
  6. **Known Limitations**:
     - Avatar uploads use local disk (will reset on deploy) — see Task 6
     - `VITE_API_URL` is baked at build time — changing it requires a frontend redeploy
     - Queue runs in sync mode — AI analysis is slower but functional
  7. **Troubleshooting**: Common issues with PaaS deployments

  **Must NOT do**:
  - Do NOT include Cranl-specific dashboard screenshots or click-by-click UI instructions (platform may change)
  - Do NOT include any actual secrets, passwords, or API keys
  - Do NOT create separate guides for different PaaS platforms — focus on Cranl

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation creation task
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `memory`: No cross-session memory needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 5)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3 (needs to know final config filenames and structure)

  **References** (CRITICAL):

  **Pattern References**:
  - `README.md:1-300` — Existing project README with section structure, formatting conventions, and emoji usage. Follow same markdown style
  - `api/nixpacks.toml` (created in Task 2) — Reference for backend deployment config
  - `web/nixpacks.toml` (created in Task 3) — Reference for frontend deployment config

  **Documentation References**:
  - `.env.cranl.api.example` (created in Task 5) — All backend env vars documented
  - `.env.cranl.web.example` (created in Task 5) — All frontend env vars documented
  - `organization-config.yml` — Production URL hints: `https://fahras.tvtc.gov.sa`, `https://api.fahras.tvtc.gov.sa`

  **WHY Each Reference Matters**:
  - `README.md`: Ensures documentation style consistency across the project
  - Nixpacks configs: The guide must accurately reference the files that were just created
  - Env templates: The guide tells users to "copy and fill in" these templates

  **Acceptance Criteria**:

  ```bash
  # Guide exists
  test -f DEPLOYMENT.md
  # Assert: exit code 0
  
  # Contains both service sections
  grep -c "Backend\|Frontend" DEPLOYMENT.md
  # Assert: >= 4 (multiple mentions of both)
  
  # Contains environment variable references
  grep ".env.cranl" DEPLOYMENT.md
  # Assert: Returns lines referencing both env templates
  
  # Contains health check commands
  grep "curl" DEPLOYMENT.md
  # Assert: Returns verification commands
  
  # Does NOT contain actual secrets
  grep -i "password\|secret_key\|api_key" DEPLOYMENT.md | grep -v "example\|placeholder\|your_\|{" 
  # Assert: No output (no real secrets)
  ```

  **Commit**: YES (groups with Task 5)
  - Message: `docs: add Cranl PaaS deployment guide with two-service architecture`
  - Files: `DEPLOYMENT.md`

---

- [x] 5. Create Environment Variable Templates

  **What to do**:

  **5a. Create `.env.cranl.api.example`** (Backend environment template):
  ```env
  # ============================================================
  # Fahras API - Cranl.com PaaS Environment Variables
  # ============================================================
  # Copy this file and fill in your values on Cranl dashboard.
  # Variables marked [REQUIRED] must be set for the app to work.
  # Variables marked [AUTO] are typically provided by Cranl add-ons.
  # ============================================================

  # --- Laravel Core ---
  APP_NAME="Fahras API"
  APP_ENV=production
  APP_DEBUG=false
  APP_KEY=                        # [REQUIRED] Generate with: php artisan key:generate --show
  APP_URL=                        # [REQUIRED] Your backend URL, e.g., https://fahras-api.cranl.com
  APP_TIMEZONE=Asia/Riyadh

  # --- Frontend URL (CORS) ---
  FRONTEND_URL=                   # [REQUIRED] Your frontend URL, e.g., https://fahras.cranl.com

  # --- Database (PostgreSQL) ---
  # Cranl managed PostgreSQL add-on provides DATABASE_URL automatically.
  # If DATABASE_URL is set, individual DB_* vars are ignored.
  DATABASE_URL=                   # [AUTO] Provided by Cranl PostgreSQL add-on
  DB_CONNECTION=pgsql
  DB_HOST=                        # [AUTO] or set manually
  DB_PORT=5432
  DB_DATABASE=fahras
  DB_USERNAME=                    # [AUTO] or set manually
  DB_PASSWORD=                    # [AUTO] or set manually

  # --- Redis ---
  # Cranl managed Redis add-on provides REDIS_URL automatically.
  REDIS_URL=                      # [AUTO] Provided by Cranl Redis add-on
  REDIS_CLIENT=predis             # [REQUIRED] Must be 'predis' (phpredis may not be available)
  REDIS_HOST=                     # [AUTO] or set manually
  REDIS_PORT=6379
  REDIS_PASSWORD=                 # [AUTO] or set manually

  # --- Cache & Session ---
  CACHE_STORE=redis
  SESSION_DRIVER=redis
  QUEUE_CONNECTION=sync           # Use 'sync' for simplicity. Change to 'redis' if running queue worker.

  # --- Alibaba Cloud OSS (S3-compatible) ---
  FILESYSTEM_DISK=s3              # [REQUIRED]
  AWS_ACCESS_KEY_ID=              # [REQUIRED] Alibaba OSS Access Key ID
  AWS_SECRET_ACCESS_KEY=          # [REQUIRED] Alibaba OSS Access Key Secret
  AWS_DEFAULT_REGION=me-central-1 # Riyadh region
  AWS_BUCKET=fahras               # Your OSS bucket name
  AWS_ENDPOINT=https://oss-me-central-1.aliyuncs.com
  AWS_USE_PATH_STYLE_ENDPOINT=false  # [REQUIRED] Must be false for Alibaba OSS (virtual-hosted style)
  AWS_URL=https://fahras.oss-me-central-1.aliyuncs.com  # Public URL for the bucket

  # --- Sanctum ---
  SANCTUM_STATEFUL_DOMAINS=       # [REQUIRED] Comma-separated: your-frontend-domain.com,localhost:3000

  # --- Logging ---
  LOG_CHANNEL=stderr              # PaaS-friendly: logs to stdout/stderr for platform log aggregation
  LOG_LEVEL=warning               # production: warning or error

  # --- AI Features (Optional) ---
  # AI_PROVIDER=gemini
  # GEMINI_API_KEY=
  ```

  **5b. Create `.env.cranl.web.example`** (Frontend environment template):
  ```env
  # ============================================================
  # Fahras Frontend - Cranl.com PaaS Environment Variables
  # ============================================================
  # These are BUILD-TIME variables. They are embedded into the
  # JavaScript bundle during `npm run build`. Changing them
  # requires a new build/deployment.
  # ============================================================

  # --- API Connection ---
  VITE_API_URL=                   # [REQUIRED] Full URL to your backend API
                                  # Example: https://fahras-api.cranl.com
                                  # Do NOT include trailing slash
                                  # Do NOT use relative path (/api) — frontend is on different domain

  # --- App Settings ---
  VITE_APP_NAME=Fahras
  ```

  **Must NOT do**:
  - Do NOT include actual secrets, passwords, or API keys — only placeholders
  - Do NOT set `APP_DEBUG=true` — this is a production template
  - Do NOT set `AWS_USE_PATH_STYLE_ENDPOINT=true` — Alibaba OSS requires virtual-hosted style (false)
  - Do NOT set `REDIS_CLIENT=phpredis` — use `predis` for Nixpacks compatibility
  - Do NOT set `LOG_CHANNEL=stack` or `daily` — PaaS ephemeral filesystems lose log files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Creating two text files with documented environment variables
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - All skills: Not relevant for env file creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3 (needs to know all required variables)

  **References** (CRITICAL):

  **Pattern References**:
  - `api/config/database.php:1-37` — All database and Redis env var names used by Laravel (`DATABASE_URL`, `DB_HOST`, `REDIS_URL`, `REDIS_CLIENT`, etc.)
  - `api/config/filesystems.php:47-58` — All S3/storage env var names (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT`, etc.)
  - `api/config/app.php:125` — `env('APP_KEY')` (after Task 1 fix)
  - `api/config/cors.php` — `env('FRONTEND_URL')` (after Task 1 fix)
  - `web/.env` — Current frontend env vars (`VITE_API_URL`, `VITE_APP_NAME`)
  - `web/src/lib/api.ts:5-12` — Shows how `VITE_API_URL` is consumed and why it must be a full URL for two-app deployment

  **Documentation References**:
  - Alibaba OSS bucket details: Bucket `fahras`, Region `me-central-1`, Endpoint `https://oss-me-central-1.aliyuncs.com`
  - Cranl platform: Provides `DATABASE_URL` and `REDIS_URL` via managed add-ons

  **WHY Each Reference Matters**:
  - `database.php`: Contains the exact env var names Laravel reads — the template must match these exactly
  - `filesystems.php:55`: Shows `AWS_USE_PATH_STYLE_ENDPOINT` defaults to `false` — correct for Alibaba OSS but must be explicitly documented
  - `api.ts:5-12`: Proves `VITE_API_URL` must be a full URL (not `/api`) when frontend and backend are on different domains
  - Alibaba OSS details: Ensures endpoint, region, and bucket values are pre-filled correctly in the template

  **Acceptance Criteria**:

  ```bash
  # 5a. Backend env template exists
  test -f .env.cranl.api.example
  # Assert: exit code 0
  
  # Contains all critical variables
  grep "APP_KEY" .env.cranl.api.example
  # Assert: present
  
  grep "DATABASE_URL" .env.cranl.api.example
  # Assert: present
  
  grep "REDIS_CLIENT=predis" .env.cranl.api.example
  # Assert: present (predis, not phpredis)
  
  grep "AWS_USE_PATH_STYLE_ENDPOINT=false" .env.cranl.api.example
  # Assert: present (false for Alibaba OSS)
  
  grep "FRONTEND_URL" .env.cranl.api.example
  # Assert: present (for CORS)
  
  grep "oss-me-central-1" .env.cranl.api.example
  # Assert: present (Alibaba OSS Riyadh region)
  
  grep "FILESYSTEM_DISK=s3" .env.cranl.api.example
  # Assert: present (S3 driver for OSS)
  
  grep "LOG_CHANNEL=stderr" .env.cranl.api.example
  # Assert: present (PaaS-friendly logging)
  
  # 5b. Frontend env template exists
  test -f .env.cranl.web.example
  # Assert: exit code 0
  
  grep "VITE_API_URL" .env.cranl.web.example
  # Assert: present
  
  # No actual secrets in either template
  grep -E "^[A-Z_]+=.{8,}" .env.cranl.api.example | grep -v "#" | grep -v "example\|cranl\|fahras\|production\|pgsql\|predis\|redis\|sync\|s3\|false\|stderr\|warning\|Riyadh\|Asia"
  # Assert: No output (no filled-in secrets)
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `docs: add Cranl PaaS deployment guide with two-service architecture`
  - Files: `.env.cranl.api.example`, `.env.cranl.web.example`

---

- [x] 6. [OPTIONAL] Fix Avatar Storage to Use Configurable Disk

  **What to do**:
  
  In `api/app/Http/Controllers/AuthController.php`, avatar uploads are hardcoded to `Storage::disk('public')` (local filesystem). On ephemeral PaaS, avatars will be **lost on every deployment**.

  - Find all instances of `Storage::disk('public')` in `AuthController.php`
  - Replace with `Storage::disk(config('filesystems.default'))` or simply `Storage::disk()` (uses default disk from FILESYSTEM_DISK env var)
  - This way, when `FILESYSTEM_DISK=s3` is set, avatars go to Alibaba OSS automatically

  **Must NOT do**:
  - Do NOT change any other controllers or models
  - Do NOT change the upload path structure (keep `avatars/` prefix)
  - Do NOT modify File model storage logic (it already uses configurable disk correctly)
  - Do NOT change the response format or API behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Find-and-replace in a single file, ~3 lines changed
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - All skills: Simple string replacement

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent of all other tasks)
  - **Parallel Group**: Wave 3 (optional, can run anytime)
  - **Blocks**: None
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References**:
  - `api/app/Http/Controllers/AuthController.php:237-257` — Lines with `Storage::disk('public')` that need to be changed to `Storage::disk()`
  - `api/app/Http/Controllers/FileController.php` — Reference for how the File model correctly uses the default configurable disk (follow this pattern for avatars)

  **API/Type References**:
  - `api/config/filesystems.php:16` — `'default' => env('FILESYSTEM_DISK', 'local')` — Shows that `Storage::disk()` (no argument) uses the env-configured default

  **WHY Each Reference Matters**:
  - `AuthController.php:237-257`: These are the EXACT lines to change — `disk('public')` → `disk()`
  - `FileController.php`: Shows the correct pattern already used elsewhere in the codebase
  - `filesystems.php:16`: Proves that `Storage::disk()` respects `FILESYSTEM_DISK` env var

  **Acceptance Criteria**:

  ```bash
  # No more hardcoded 'public' disk for storage
  grep -n "Storage::disk('public')" api/app/Http/Controllers/AuthController.php
  # Assert: No output (all instances replaced)
  
  # Uses default disk instead
  grep -n "Storage::disk()" api/app/Http/Controllers/AuthController.php
  # Assert: Returns lines where disk() is called without argument
  ```

  **Commit**: YES
  - Message: `fix(api): use configurable storage disk for avatar uploads instead of local public disk`
  - Files: `api/app/Http/Controllers/AuthController.php`

---

## Commit Strategy

| After Task(s) | Message | Files | Verification |
|---------------|---------|-------|--------------|
| 1 | `fix(api): replace hardcoded secrets with env vars and add PaaS compatibility` | `api/config/app.php`, `api/config/cors.php`, `api/bootstrap/app.php`, `api/composer.json` | `grep -c "base64:TFNy" api/config/app.php` → 0 |
| 2+3 | `feat(deploy): add Nixpacks configs for two-app PaaS deployment on Cranl` | `api/nixpacks.toml`, `api/deploy-entrypoint.sh`, `api/Caddyfile`, `web/nixpacks.toml`, `web/Caddyfile` | `test -f api/nixpacks.toml && test -f web/nixpacks.toml` |
| 4+5 | `docs: add Cranl PaaS deployment guide with two-service architecture` | `DEPLOYMENT.md`, `.env.cranl.api.example`, `.env.cranl.web.example` | `test -f DEPLOYMENT.md` |
| 6 (optional) | `fix(api): use configurable storage disk for avatar uploads` | `api/app/Http/Controllers/AuthController.php` | `grep -c "disk('public')" api/app/Http/Controllers/AuthController.php` → 0 |

---

## Success Criteria

### Verification Commands
```bash
# All config files exist
test -f api/nixpacks.toml && test -f web/nixpacks.toml && test -f api/Caddyfile && test -f web/Caddyfile && test -f api/deploy-entrypoint.sh && echo "All deployment files exist"
# Expected: "All deployment files exist"

# All env templates exist
test -f .env.cranl.api.example && test -f .env.cranl.web.example && echo "All env templates exist"
# Expected: "All env templates exist"

# Deployment guide exists
test -f DEPLOYMENT.md && echo "Deployment guide exists"
# Expected: "Deployment guide exists"

# No hardcoded secrets
grep -r "base64:TFNy" api/config/
# Expected: No output

# No artisan serve in production configs
grep -r "artisan serve" api/nixpacks.toml api/deploy-entrypoint.sh 2>/dev/null
# Expected: No output

# CORS is env-driven
grep "FRONTEND_URL" api/config/cors.php
# Expected: Returns line with env('FRONTEND_URL')

# TrustProxies configured
grep "trustProxies" api/bootstrap/app.php
# Expected: Returns configuration line

# PHP extensions declared
grep -c "ext-" api/composer.json
# Expected: >= 15

# Frontend build directory correct
grep "root \* /app/build" web/Caddyfile
# Expected: Returns line (NOT dist)

# Redis client is predis
grep "REDIS_CLIENT=predis" .env.cranl.api.example
# Expected: Returns line

# Alibaba OSS configured correctly
grep "AWS_USE_PATH_STYLE_ENDPOINT=false" .env.cranl.api.example
# Expected: Returns line
```

### Final Checklist
- [x] All "Must Have" present (Nixpacks configs, CORS fix, APP_KEY fix, TrustProxies, env templates)
- [x] All "Must NOT Have" absent (no artisan serve, no hardcoded secrets, no config:cache at build time, no docker-compose changes)
- [x] All 6 deployment files created (api/nixpacks.toml, web/nixpacks.toml, api/Caddyfile, web/Caddyfile, api/deploy-entrypoint.sh, DEPLOYMENT.md)
- [x] All 2 env templates created (.env.cranl.api.example, .env.cranl.web.example)
- [x] All 3 prerequisite fixes applied (APP_KEY, CORS, TrustProxies)
- [x] composer.json has ext-* declarations for all required PHP extensions
