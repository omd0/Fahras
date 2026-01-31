# Deployment Guide - Cranl.com PaaS

This guide covers deploying Fahras on [Cranl.com](https://cranl.com) Platform-as-a-Service (PaaS) using a **two-service architecture**: separate Backend API and Frontend services.

## Overview

Fahras deploys as two independent services on Cranl:

1. **Backend API Service** - Laravel 11 API with PostgreSQL and Redis
2. **Frontend Service** - React 19 static site served via Caddy

Both services use **Nixpacks** for automatic build detection and deployment. The platform auto-detects configuration from `nixpacks.toml` files in each service's root directory.

## Prerequisites

Before deploying to Cranl, ensure you have:

- **Cranl Account**: Sign up at [cranl.com](https://cranl.com)
- **Pro Plan**: Required for MENA region (Saudi Arabia) deployment
- **GitHub Repository**: Connect your Fahras repository to Cranl
- **Environment Variables**: Prepare production credentials (database, Redis, storage, etc.)

## Service 1 — Backend API

### Configuration

The backend API service is configured via `api/nixpacks.toml` and deploys automatically using Nixpacks.

**Service Settings:**
- **Name**: `fahras-api` (or your preferred name)
- **Root Directory**: `/api`
- **Region**: MENA (Saudi Arabia) - Available on Pro+ plans
- **Build System**: Nixpacks (auto-detected from `nixpacks.toml`)
- **Start Command**: `bash deploy-entrypoint.sh` (defined in nixpacks.toml)

### Required Add-ons

Add these managed services to your backend:

1. **PostgreSQL Database**
   - Version: PostgreSQL 16 or later
   - Connection string will be provided as `DATABASE_URL`
   - Extract credentials for `DB_*` environment variables

2. **Redis Cache**
   - Version: Redis 7 or later
   - Connection string will be provided as `REDIS_URL`
   - Extract credentials for `REDIS_*` environment variables

### Environment Variables

Create environment variables in Cranl dashboard using `.env.cranl.api.example` as reference:

**Required Variables:**
```env
# Application
APP_NAME="Fahras API"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://api.fahras.tvtc.gov.sa

# Frontend URL (for CORS)
FRONTEND_URL=https://fahras.tvtc.gov.sa

# Database (from PostgreSQL add-on)
DB_CONNECTION=pgsql
DB_HOST=your-postgres-host
DB_PORT=5432
DB_DATABASE=fahras
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password

# Redis (from Redis add-on)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Storage - Alibaba Cloud OSS (S3-compatible)
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-oss-access-key
AWS_SECRET_ACCESS_KEY=your-oss-secret-key
AWS_DEFAULT_REGION=me-central-1
AWS_BUCKET=fahras
AWS_ENDPOINT=https://oss-me-central-1.aliyuncs.com
AWS_URL=https://fahras.oss-me-central-1.aliyuncs.com
AWS_USE_PATH_STYLE_ENDPOINT=false

# Queue (sync mode for PaaS)
QUEUE_CONNECTION=sync

# Session & Cache
SESSION_DRIVER=redis
CACHE_DRIVER=redis
```

**Important Notes:**
- Generate `APP_KEY` locally: `php artisan key:generate --show`
- `FRONTEND_URL` must match your frontend service URL for CORS
- Database credentials come from PostgreSQL add-on connection string
- Redis credentials come from Redis add-on connection string
- Storage uses Alibaba Cloud OSS (bucket: `fahras`, region: `me-central-1`)

### Deployment Process

1. **Create Service**: In Cranl dashboard, create new service from GitHub repo
2. **Set Root Directory**: `/api`
3. **Select Region**: MENA (Saudi Arabia)
4. **Add PostgreSQL**: Attach PostgreSQL add-on
5. **Add Redis**: Attach Redis add-on
6. **Configure Environment**: Add all variables from `.env.cranl.api.example`
7. **Deploy**: Cranl will auto-detect Nixpacks and deploy

The deployment script (`api/deploy-entrypoint.sh`) automatically:
- Runs database migrations
- Optimizes Laravel caches
- Starts PHP-FPM and Caddy web server

## Service 2 — Frontend

### Configuration

The frontend service is configured via `web/nixpacks.toml` and serves a static React build.

**Service Settings:**
- **Name**: `fahras-web` (or your preferred name)
- **Root Directory**: `/web`
- **Region**: MENA (Saudi Arabia) - Available on Pro+ plans
- **Build System**: Nixpacks (auto-detected from `nixpacks.toml`)
- **Start Command**: `caddy run --config Caddyfile --adapter caddyfile` (defined in nixpacks.toml)

### Environment Variables

Create environment variables in Cranl dashboard using `.env.cranl.web.example` as reference:

**Required Variables:**
```env
# API URL - CRITICAL: Must be full backend URL
VITE_API_URL=https://api.fahras.tvtc.gov.sa

# Application Name
VITE_APP_NAME=Fahras
```

**CRITICAL NOTE:**
- `VITE_API_URL` **MUST** be the full URL of your backend service (e.g., `https://api.fahras.tvtc.gov.sa`)
- **DO NOT** use relative paths like `/api` - this will fail in production
- This value is **baked into the build at build time** - changing it requires redeploying the frontend

### Deployment Process

1. **Create Service**: In Cranl dashboard, create new service from GitHub repo
2. **Set Root Directory**: `/web`
3. **Select Region**: MENA (Saudi Arabia)
4. **Configure Environment**: Add `VITE_API_URL` pointing to backend service URL
5. **Deploy**: Cranl will auto-detect Nixpacks, build React app, and serve via Caddy

The build process:
- Installs dependencies via `npm ci`
- Builds production bundle via `npm run build`
- Serves static files via Caddy web server

## Post-Deployment Checklist

After both services are deployed, verify functionality:

### 1. API Health Check
```bash
# Check API is responding
curl https://api.fahras.tvtc.gov.sa/api/health

# Expected: 200 OK with JSON response
```

### 2. Frontend Load Test
```bash
# Check frontend loads
curl -I https://fahras.tvtc.gov.sa

# Expected: 200 OK
```

### 3. CORS Verification
```bash
# Test CORS headers from frontend domain
curl -H "Origin: https://fahras.tvtc.gov.sa" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.fahras.tvtc.gov.sa/api/login

# Expected: Access-Control-Allow-Origin header present
```

### 4. Database Connectivity
- Log into frontend and attempt login
- Create a test project
- Upload a test file

### 5. File Upload Test
- Upload a file to a project
- Verify file appears in Alibaba OSS bucket
- Download the file to confirm storage works

## Known Limitations

### 1. Avatar Uploads (Local Disk)

**Issue**: User avatar uploads currently use local disk storage (`storage/app/public/avatars`), which is **ephemeral** on PaaS platforms.

**Impact**:
- Avatars are lost on service redeploy or restart
- Not suitable for production use

**Workaround**:
- Avatars will need to be re-uploaded after redeploys
- Consider implementing cloud storage for avatars (see Task 6 in deployment plan)

**Future Fix**: Task 6 will migrate avatars to Alibaba Cloud OSS for persistent storage.

### 2. VITE_API_URL Build-Time Baking

**Issue**: The `VITE_API_URL` environment variable is baked into the frontend build at **build time**, not runtime.

**Impact**:
- Changing the API URL requires **redeploying the frontend service**
- Cannot dynamically switch API endpoints without rebuild

**Workaround**:
- Ensure `VITE_API_URL` is correct before deploying
- Plan frontend redeployment if backend URL changes

### 3. Queue Sync Mode

**Issue**: The queue system runs in `sync` mode (synchronous) instead of using background workers.

**Impact**:
- AI-powered search analysis runs synchronously during requests
- Slower response times for AI features
- No background job processing

**Workaround**:
- AI features still work but may take longer
- Consider upgrading to async queue with Redis workers if performance becomes an issue

**Why Sync Mode**: PaaS platforms typically don't support long-running background workers without additional configuration.

## Troubleshooting

### Build Failures

**Symptom**: Nixpacks build fails during deployment

**Solutions**:
1. Check build logs in Cranl dashboard
2. Verify `nixpacks.toml` exists in service root directory (`/api` or `/web`)
3. Ensure all required Nix packages are declared in `nixpacks.toml`
4. For backend: Verify Composer dependencies are compatible with PHP 8.3
5. For frontend: Check Node.js version compatibility (requires Node 20+)

### Database Connection Errors

**Symptom**: API returns 500 errors, logs show database connection failures

**Solutions**:
1. Verify PostgreSQL add-on is attached to backend service
2. Check `DB_*` environment variables match PostgreSQL connection string
3. Ensure database migrations ran successfully (check deployment logs)
4. Test database connectivity from Cranl dashboard terminal

### CORS Errors

**Symptom**: Frontend shows CORS errors in browser console when calling API

**Solutions**:
1. Verify `FRONTEND_URL` in backend matches exact frontend URL (including `https://`)
2. Check `config/cors.php` allows frontend origin
3. Ensure no trailing slashes in URLs
4. Clear browser cache and test in incognito mode

### File Upload Failures

**Symptom**: File uploads fail or return errors

**Solutions**:
1. Verify Alibaba OSS credentials are correct in backend environment
2. Check OSS bucket exists and is accessible from MENA region
3. Verify `AWS_ENDPOINT` points to correct OSS region (`me-central-1`)
4. Test OSS connectivity using Alibaba Cloud console
5. Check Laravel logs for detailed error messages

### Frontend Shows "API Error" or Blank Pages

**Symptom**: Frontend loads but shows API connection errors

**Solutions**:
1. Verify `VITE_API_URL` is set to **full backend URL** (not relative path)
2. Check backend service is running and accessible
3. Test API health endpoint directly: `curl https://api.fahras.tvtc.gov.sa/api/health`
4. Redeploy frontend if `VITE_API_URL` was changed after initial deployment
5. Check browser console for specific error messages

### Migrations Not Running

**Symptom**: Database tables missing, API returns errors about missing tables

**Solutions**:
1. Check deployment logs for migration errors
2. Manually run migrations via Cranl terminal: `php artisan migrate --force`
3. Verify database credentials are correct
4. Check PostgreSQL version is 16+ (required for some migrations)

### Redis Connection Failures

**Symptom**: Session errors, cache errors, or "Redis connection refused"

**Solutions**:
1. Verify Redis add-on is attached to backend service
2. Check `REDIS_*` environment variables match Redis connection string
3. Test Redis connectivity from Cranl dashboard terminal
4. Ensure Redis version is 7+ (required for some features)

## Additional Resources

- **Cranl Documentation**: [docs.cranl.com](https://docs.cranl.com)
- **Nixpacks Documentation**: [nixpacks.com/docs](https://nixpacks.com/docs)
- **Laravel Deployment**: [laravel.com/docs/deployment](https://laravel.com/docs/deployment)
- **Vite Production Build**: [vitejs.dev/guide/build](https://vitejs.dev/guide/build)
- **Alibaba Cloud OSS**: [alibabacloud.com/help/oss](https://www.alibabacloud.com/help/oss)

## Support

For deployment issues:
1. Check Cranl service logs in dashboard
2. Review this troubleshooting section
3. Consult Cranl support documentation
4. Contact Fahras development team

---

**Note**: This deployment guide is specific to Cranl.com PaaS. For other platforms (AWS, Azure, Google Cloud), refer to platform-specific documentation.
