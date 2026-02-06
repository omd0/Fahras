import { Page } from '@playwright/test';
import { TEST_USERS } from './test-data';

export async function login(page: Page, role: 'admin' | 'faculty' | 'student' | 'reviewer') {
  const user = TEST_USERS[role];
  
  await page.goto('/login', { waitUntil: 'load' });
  
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  
  await page.waitForSelector('#email', { state: 'visible', timeout: 20000 });
  
  await page.waitForTimeout(2000);
  
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  
  await page.waitForTimeout(1000);
  
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();
  
  await page.waitForURL('/dashboard', { timeout: 40000 });
}
