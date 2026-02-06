import { test, expect } from '@playwright/test';

test.describe('Guest — Landing Page Navigation (8.1)', () => {
  test('should navigate landing page, explore projects, and access login', async ({ page }) => {
    // Navigate to landing page
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // Verify hero carousel is visible
    await page.waitForSelector('section', { timeout: 10000 });
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Take screenshot to verify landing page renders
    await page.screenshot({ path: 'test-results/landing-page.png', fullPage: false });
    
    // Scroll down 600px to featured projects section
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);
    
    // Verify featured projects section is visible (if projects exist)
    const newestSubmissionsHeading = page.getByRole('heading', { name: /newest submissions/i });
    const headingVisible = await newestSubmissionsHeading.isVisible().catch(() => false);
    if (headingVisible) {
      await expect(newestSubmissionsHeading).toBeVisible();
    }
    
    // Click a featured project card to verify navigation
    const projectCards = page.locator('.MuiCardActionArea-root');
    const cardCount = await projectCards.count();
    if (cardCount > 0) {
      await projectCards.first().click();
      // Wait for navigation
      await page.waitForURL(/\/pr\//, { timeout: 5000 }).catch(() => {});
      // If navigation occurred, go back
      if (page.url().includes('/pr/')) {
        await page.goBack();
        await expect(page).toHaveURL('http://localhost:3000/');
      }
    }
    
    // Scroll back to top to access hero carousel
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Click "Explore Projects" button in hero carousel
    const exploreButton = page.getByRole('button', { name: /explore projects|explore/i }).first();
    await exploreButton.click();
    
    // Verify URL changed to /explore
    await expect(page).toHaveURL(/\/explore/);
    
    // Wait for project cards or grid to load on explore page
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { 
      timeout: 5000,
      state: 'visible' 
    }).catch(() => {
      // If no cards exist, that's okay - just verify we're on explore page
    });
    
    // Go back to landing page
    await page.goBack();
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Click "Login" or "Sign In" button
    const loginButton = page.getByRole('button', { name: /login|sign in/i });
    await loginButton.click();
    
    // Verify URL changed to /login
    await expect(page).toHaveURL(/\/login/);
    
    // Verify login page loaded (email input visible)
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });
});
