import { test, expect } from '@playwright/test';

test('debug login', async ({ page }) => {
  await page.goto('/login');
  await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
  
  await page.fill('#email', 'ahmed.almansouri@student.fahras.edu');
  await page.fill('#password', 'password');
  
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(5000);
  
  const url = page.url();
  const content = await page.content();
  const alertText = await page.locator('[role="alert"]').textContent().catch(() => 'no alert');
  
  console.log('URL after submit:', url);
  console.log('Alert text:', alertText);
  
  await page.screenshot({ path: 'test-results/debug-login.png', fullPage: true });
  
  if (url.includes('login')) {
    const bodyText = await page.locator('body').innerText();
    console.log('Page text (truncated):', bodyText.substring(0, 500));
  }
});
