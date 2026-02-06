# Test Automation - Issues & Gotchas

## Known Issues

_Agents will append problems and gotchas here_

## Issue: E2E Tests Timing Out (2026-02-06)

### Problem
- All E2E tests timing out when trying to interact with pages
- Login helper times out waiting for dashboard redirect
- Form fields not found even with correct selectors

### Investigation
1. Dev server is running and responding (curl returns 200)
2. Existing guest/landing.spec.ts also fails with same timeout issues
3. Playwright config looks correct (baseURL, webServer, etc.)

### Possible Causes
1. App might be stuck in loading state
2. JavaScript errors preventing page from becoming interactive
3. Database might not be seeded with test users
4. NextAuth session handling might be broken

### Next Steps
- Check browser console for JS errors
- Verify test database is seeded
- Try running tests in debug mode with screenshots
- Consider using Playwright's trace viewer

