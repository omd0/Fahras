# API 404 Debug Guide

## Current Issue
API endpoints at `https://app.saudiflux.org/api/*` are returning 404 errors.

## Configuration Changes Made

### 1. Nginx Production Config (`nginx.production.conf`)
- ✅ Added explicit `/api` location block
- ✅ Fixed PHP-FPM connection (127.0.0.1:9000 for same-container setup)
- ✅ Added proper static file handling
- ✅ Added fastcgi_split_path_info for proper route handling

### 2. API Service (`web/src/services/api.ts`)
- ✅ Enhanced error logging with detailed information
- ✅ Added automatic API URL detection
- ✅ Tries `api.saudiflux.org` subdomain first, falls back to same origin

## Debugging Steps

### Step 1: Verify PHP-FPM is Running
```bash
# Inside the production container
ps aux | grep php-fpm
netstat -tlnp | grep 9000
```

### Step 2: Test PHP-FPM Connection
```bash
# Test if PHP-FPM responds
curl http://127.0.0.1:9000
# Or test with a simple PHP file
echo "<?php phpinfo(); ?>" > /var/www/html/public/test.php
curl http://localhost/test.php
```

### Step 3: Check Laravel Routes
```bash
# Inside Laravel container
php artisan route:list | grep api
# Clear route cache if needed
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

### Step 4: Test API Endpoint Directly
```bash
# Test the API endpoint
curl -v https://app.saudiflux.org/api/test
curl -v -H "Accept: application/json" https://app.saudiflux.org/api/projects
```

### Step 5: Check Nginx Error Logs
```bash
# Check nginx error logs
tail -f /var/log/nginx/error.log
# Or in Docker
docker logs <container-name> 2>&1 | grep -i error
```

### Step 6: Verify Laravel is Accessible
```bash
# Test Laravel's index.php directly
curl -v https://app.saudiflux.org/index.php
```

## Common Issues and Solutions

### Issue 1: PHP-FPM Not Running
**Solution:** Ensure PHP-FPM starts before Nginx in docker-entrypoint.sh (already configured)

### Issue 2: Route Cache Issues
**Solution:** Clear Laravel caches:
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan optimize:clear
```

### Issue 3: Cloudflare Caching 404s
**Solution:** 
- Clear Cloudflare cache
- Add Cloudflare page rule to bypass cache for `/api/*`
- Set cache level to "Bypass" for API routes

### Issue 4: Database Connection Issues
**Solution:** Check database connection in Laravel:
```bash
php artisan tinker
DB::connection()->getPdo();
```

### Issue 5: File Permissions
**Solution:** Ensure proper permissions:
```bash
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache
```

## Testing After Deployment

1. **Test API Health Endpoint:**
   ```bash
   curl https://app.saudiflux.org/api/test
   # Should return: {"message":"API is working"}
   ```

2. **Test Projects Endpoint:**
   ```bash
   curl -H "Accept: application/json" https://app.saudiflux.org/api/projects
   ```

3. **Check Browser Console:**
   - Open https://app.saudiflux.org
   - Open Developer Tools (F12)
   - Check Console for "API Base URL" log
   - Check Network tab for API requests

## Next Steps

1. **Redeploy with updated nginx.production.conf**
2. **Verify PHP-FPM is running** in the container
3. **Clear Laravel caches** after deployment
4. **Check Cloudflare settings** - ensure `/api/*` routes are not cached
5. **Monitor logs** for any errors

## Additional Notes

- The production setup uses a single container with both Nginx and PHP-FPM
- PHP-FPM should be listening on 127.0.0.1:9000
- Laravel routes are defined in `api/routes/api.php`
- All API routes are prefixed with `/api` by Laravel's route service provider

