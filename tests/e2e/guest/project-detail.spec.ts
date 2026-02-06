import { test, expect } from '@playwright/test';

test.describe('Guest — Project Detail (8.3)', () => {
  test('should view public project details', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForSelector('[role="main"], main', { timeout: 10000 });
    
    const firstProject = page.locator('[data-testid*="project"], .project-card, article').first();
    
    if (await firstProject.isVisible({ timeout: 5000 })) {
      await firstProject.click();
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/pr\/[a-z0-9-]+/);
      
      await page.waitForSelector('h1, [role="heading"]', { timeout: 10000 });
      
      await page.screenshot({ path: 'test-results/project-detail.png' });
    } else {
      test.skip();
    }
  });
});
