import { Page } from '@playwright/test';
import { TEST_USERS } from './test-data';

export async function login(page: Page, role: 'admin' | 'faculty' | 'student' | 'reviewer') {
  const user = TEST_USERS[role];
  await page.goto('/login');
  
  // Wait for login form to be ready
  await page.waitForSelector('#email', { timeout: 10000 });
  
  // Fill credentials
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 15000 });
}
