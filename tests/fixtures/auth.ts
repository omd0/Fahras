import { Page } from '@playwright/test';
import { TEST_USERS } from './test-data';

export async function login(page: Page, role: 'admin' | 'faculty' | 'student' | 'reviewer') {
  const user = TEST_USERS[role];
  
  await page.goto('/login');
  
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();
  
  await page.waitForURL('/dashboard');
}
