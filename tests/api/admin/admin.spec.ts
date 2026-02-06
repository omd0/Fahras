import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Admin API Tests - Unauthenticated Access', () => {
  test('GET /api/admin/users - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/admin/users`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/admin/users - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/admin/users`, {
      data: {
        email: 'test@fahras.edu',
        full_name: 'Test User',
        role: 'student'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('PUT /api/admin/users/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.put(`${API_BASE}/admin/users/999`, {
      data: {
        full_name: 'Updated Name'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('DELETE /api/admin/users/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/admin/users/999`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/admin/users/[id]/toggle-status - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/admin/users/999/toggle-status`);
    
    expect(response.status()).toBe(401);
  });
});

test.describe('Roles API Tests - Unauthenticated Access', () => {
  test('GET /api/roles - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/roles`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/roles - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/roles`, {
      data: {
        name: 'Test Role',
        permissions: []
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('PUT /api/roles/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.put(`${API_BASE}/roles/999`, {
      data: {
        name: 'Updated Role'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('DELETE /api/roles/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/roles/999`);
    
    expect(response.status()).toBe(401);
  });
});

test.describe('Permissions API Tests', () => {
  test('GET /api/permissions - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/permissions`);
    
    expect(response.status()).toBe(401);
  });
});
