import { Page } from '@playwright/test';
import { TEST_USERS } from './test-data';

export async function login(page: Page, role: 'admin' | 'faculty' | 'student' | 'reviewer') {
  const user = TEST_USERS[role];
  await page.goto('/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}
