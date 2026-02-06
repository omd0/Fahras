import { test, expect } from '@playwright/test';
import { login } from '../../fixtures/auth';

test.describe('Student — Login (8.5)', () => {
  test('should login successfully as student', async ({ page }) => {
    await login(page, 'student');
    
    await expect(page).toHaveURL('/dashboard');
    
    await page.screenshot({ path: 'test-results/student-dashboard.png' });
  });
});
