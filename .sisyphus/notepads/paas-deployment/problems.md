# Unresolved Issues & Technical Debt

## [2026-01-31] Known Limitations

### 1. Cranl.com Documentation Gap
**Status**: UNRESOLVED  
**Issue**: Cranl.com is a new platform with no public documentation  
**Impact**: Deployment instructions based on assumptions (Railway-like behavior)  
**Workaround**: Deployment guide includes general PaaS patterns  
**Next Steps**: Update guide once Cranl docs are available  
**Risk**: Medium - standard PaaS patterns should work, but edge cases unknown

### 2. VITE_API_URL Build-Time Limitation
**Status**: BY DESIGN (not fixable)  
**Issue**: Frontend API URL is baked at build time, not runtime  
**Impact**: Changing API URL requires complete frontend rebuild/redeploy  
**Workaround**: None - this is Vite's architecture  
**Documentation**: Clearly documented in deployment guide and env template  
**Risk**: Low - acceptable trade-off for Vite's performance benefits

### 3. Queue Worker Not Configured
**Status**: DEFERRED  
**Issue**: `QUEUE_CONNECTION=sync` means AI analysis runs inline (slower)  
**Impact**: Slower API responses for queued jobs  
**Workaround**: Acceptable for MVP, can add Redis queue + worker later  
**Next Steps**: If performance becomes issue, add separate queue worker service  
**Risk**: Low - functional, just slower

### 4. No CI/CD Pipeline
**Status**: OUT OF SCOPE  
**Issue**: No automated testing/deployment pipeline  
**Impact**: Manual verification required before deploy  
**Workaround**: Cranl auto-deploys on git push (basic CI/CD)  
**Next Steps**: Could add GitHub Actions for testing before push  
**Risk**: Low - Cranl's auto-deploy is sufficient for now

### 5. No Database Seeding in Production
**Status**: BY DESIGN  
**Issue**: `deploy-entrypoint.sh` does NOT run `db:seed`  
**Impact**: Production database starts empty  
**Workaround**: Manual seeding via Cranl console if needed  
**Rationale**: Production should not auto-seed (data safety)  
**Risk**: None - correct behavior

### 6. Avatar Migration Not Automated
**Status**: MANUAL PROCESS  
**Issue**: Existing avatars on local disk not migrated to OSS  
**Impact**: Users who uploaded avatars before deployment will lose them  
**Workaround**: One-time manual migration script (not included)  
**Next Steps**: If needed, create migration script to copy from local to OSS  
**Risk**: Low - new deployment, likely no existing avatars

## Future Enhancements

### Performance Optimizations
- [ ] Add Redis queue worker service for async job processing
- [ ] Implement CDN for frontend static assets
- [ ] Add database read replicas for scaling
- [ ] Implement Laravel Octane for faster PHP performance

### Monitoring & Observability
- [ ] Add application performance monitoring (APM)
- [ ] Set up error tracking (Sentry, Bugsnag, etc.)
- [ ] Configure uptime monitoring
- [ ] Add custom metrics and dashboards

### Security Hardening
- [ ] Implement rate limiting on API endpoints
- [ ] Add WAF (Web Application Firewall) rules
- [ ] Set up automated security scanning
- [ ] Implement API key rotation strategy

### Developer Experience
- [ ] Add GitHub Actions for automated testing
- [ ] Create staging environment on Cranl
- [ ] Add database backup/restore scripts
- [ ] Document rollback procedures
