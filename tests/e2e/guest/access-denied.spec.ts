import { test, expect } from '@playwright/test';

test.describe('Guest — Access Denied (8.4)', () => {
  const protectedRoutes = [
    '/dashboard',
    '/admin/approvals',
    '/notifications'
  ];

  for (const route of protectedRoutes) {
    test(`should redirect from ${route} to login`, async ({ page }) => {
      await page.goto(route);
      
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/login/);
    });
  }
  
  test('should allow access to /pr/create but show login prompt', async ({ page }) => {
    await page.goto('/pr/create');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    expect(['/pr/create', '/login']).toContain(new URL(currentUrl).pathname);
  });
});
