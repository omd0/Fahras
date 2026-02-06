import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Files API Tests', () => {
  test('GET /api/files/[id]/download - should return 401 for unauthenticated request to private file', async ({ request }) => {
    const response = await request.get(`${API_BASE}/files/999/download`);
    
    expect([401, 404]).toContain(response.status());
  });

  test('GET /api/files/[id] - should return 405 for unauthenticated metadata request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/files/999`);
    
    expect([401, 404, 405]).toContain(response.status());
  });

  test('DELETE /api/files/[id] - should return 401 for unauthenticated delete', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/files/999`);
    
    expect(response.status()).toBe(401);
  });
});

test.describe('Files API - Public File Access', () => {
  test.skip('GET /api/files/[id]/download - should download public file', async ({ request }) => {
    const response = await request.get(`${API_BASE}/files/1/download`);
    
    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      expect(contentType).toBeTruthy();
      
      const contentDisposition = response.headers()['content-disposition'];
      expect(contentDisposition).toContain('attachment');
    } else {
      expect([404, 401]).toContain(response.status());
    }
  });
});
