# Draft: PaaS Deployment Reconfiguration

## Requirements (confirmed)
- Deploy to **Cranl.com** PaaS platform (MENA/Saudi Arabia region available)
- **Two separate apps**: Frontend static site + Backend PHP API
- No database in deployment → Cranl managed PostgreSQL add-on
- No Redis in deployment → Cranl managed Redis add-on
- File storage: **Alibaba Cloud OSS** (S3-compatible)
- Setup **Nixpacks configuration** for both apps
- No CI/CD pipeline (Cranl has auto-deploy on push)

## Cranl.com Platform Details
- PaaS platform, Railway-like
- GitHub deploy + auto-deploy on push
- Managed databases: PostgreSQL, MySQL, Redis, MongoDB, MariaDB
- Regions: USA, Europe, Asia, **MENA (Saudi Arabia)** - requires Pro plan+
- Pricing: Basic $4.99/mo (2 projects, 3 apps), Pro $9.99/mo (10 projects, 20 apps)
- Features: DDoS protection, free SSL, CDN, GitHub integration
- No public docs found yet (new platform)
- Nixpacks assumed (Railway-like behavior)

## Alibaba Cloud OSS Configuration
- **Bucket**: `fahras`
- **Region**: SAU (Riyadh) → `me-central-1`
- **Availability Domain**: `me-central-1-ad1`
- **Endpoint**: `https://oss-me-central-1.aliyuncs.com`
- **Block Public Access**: Enabled (files served via signed URLs)
- S3-compatible → works with Laravel's existing Flysystem S3 driver
- No extra packages needed (`league/flysystem-aws-s3-v3` already installed)

## Authentication Analysis (CRITICAL FOR TWO-APP TOPOLOGY)
- **AUTH TYPE**: Bearer token-based (NOT cookie-based)
- Tokens stored in localStorage via Zustand persist
- Frontend injects `Authorization: Bearer {token}` via Axios interceptor
- **IMPLICATION**: Frontend and Backend CAN be on separate domains ✅
- No cookie sharing needed between apps

## CORS Configuration (Needs Update)
- Current: wildcard `*` with `supports_credentials: true` (invalid per spec)
- Needs: specific allowed origins for production frontend domain
- Update via `CORS_ALLOWED_ORIGINS` env var or `config/cors.php`

## Technical Decisions (confirmed)
- Two-app deployment topology (Gemini recommended, user agreed)
- Alibaba OSS via S3 driver (no new packages needed)
- Cranl managed PostgreSQL and Redis add-ons
- Nixpacks for both apps
- Frontend: React static build served by Nixpacks Node/static provider
- Backend: PHP Laravel detected via composer.json

## Research Findings
- Frontend API URL configurable via `VITE_API_URL` env var (already supports separate domain)
- Laravel already has S3 driver, just needs OSS endpoint configuration
- PHP extensions needed: pgsql, pdo_pgsql, redis, zip, intl, mbstring, gd, bcmath
- Production entrypoint already handles: config:cache, route:cache, view:cache, migrate
- Vite build output: `./build` directory

## Scope Boundaries
- INCLUDE: Nixpacks config for frontend and backend
- INCLUDE: Environment variable templates for Cranl
- INCLUDE: CORS configuration update
- INCLUDE: Alibaba OSS storage configuration
- INCLUDE: Production entrypoint scripts
- EXCLUDE: CI/CD pipeline setup
- EXCLUDE: Domain/DNS configuration
- EXCLUDE: Actual infrastructure provisioning
- EXCLUDE: Forgejo integration
