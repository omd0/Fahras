import { Page } from '@playwright/test';

/**
 * Wait for a specific API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(response => {
    if (typeof urlPattern === 'string') {
      return response.url().includes(urlPattern);
    }
    return urlPattern.test(response.url());
  });
}

/**
 * Get all console messages of a specific type
 */
export async function getConsoleMessages(page: Page, type: 'log' | 'error' | 'warning' = 'log') {
  const messages: string[] = [];
  page.on(`console`, msg => {
    if (msg.type() === type) {
      messages.push(msg.text());
    }
  });
  return messages;
}

/**
 * Check if element is visible on page
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    return await page.isVisible(selector);
  } catch {
    return false;
  }
}
