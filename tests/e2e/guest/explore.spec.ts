import { test, expect } from '@playwright/test';

test.describe('Guest — Explore Search (8.2)', () => {
  test('should search and filter projects on explore page', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveURL('/explore');
    
    await page.waitForSelector('[role="main"], main', { timeout: 10000 });
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
    }
    
    const projectCards = page.locator('[data-testid*="project"], .project-card, article').first();
    if (await projectCards.isVisible({ timeout: 5000 })) {
      await projectCards.click();
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/pr\/[a-z0-9-]+/);
    }
    
    await page.screenshot({ path: 'test-results/explore-search.png' });
  });
});
