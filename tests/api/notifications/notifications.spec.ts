import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Notifications API Tests - Unauthenticated Access', () => {
  test('GET /api/notifications - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/notifications`);
    
    expect(response.status()).toBe(401);
  });

  test('GET /api/notifications/unread-count - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/notifications/unread-count`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/notifications/[id]/read - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/notifications/999/read`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/notifications/mark-all-read - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/notifications/mark-all-read`);
    
    expect(response.status()).toBe(401);
  });

  test('DELETE /api/notifications/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/notifications/999`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/notifications/delete-all - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/notifications/delete-all`);
    
    expect(response.status()).toBe(401);
  });
});
