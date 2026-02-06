import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Bookmarks API Tests - Unauthenticated Access', () => {
  test('GET /api/bookmarks - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/bookmarks`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/bookmarks - should return 401 or 405 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/bookmarks`, {
      data: {
        project_id: 1
      }
    });
    
    expect([401, 405]).toContain(response.status());
  });

  test('POST /api/bookmarks/sync - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/bookmarks/sync`, {
      data: {
        bookmarks: []
      }
    });
    
    expect(response.status()).toBe(401);
  });
});
