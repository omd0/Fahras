import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Tags & Search API Tests', () => {
  test('GET /api/tags - should return list of tags', async ({ request }) => {
    const response = await request.get(`${API_BASE}/tags`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body) || Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/search-queries - should return 401 or 405 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/search-queries`);
    
    expect([401, 405]).toContain(response.status());
  });

  test('GET /api/saved-searches - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/saved-searches`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/saved-searches - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/saved-searches`, {
      data: {
        name: 'Test Search',
        query: 'test'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('GET /api/saved-searches/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/saved-searches/999`);
    
    expect(response.status()).toBe(401);
  });

  test('DELETE /api/saved-searches/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/saved-searches/999`);
    
    expect(response.status()).toBe(401);
  });
});
