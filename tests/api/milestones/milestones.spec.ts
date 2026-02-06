import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Milestone Templates API Tests - Unauthenticated Access', () => {
  test('GET /api/milestone-templates - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/milestone-templates`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/milestone-templates - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/milestone-templates`, {
      data: {
        name: 'Test Template',
        description: 'Test Description'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('PUT /api/milestone-templates/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.put(`${API_BASE}/milestone-templates/999`, {
      data: {
        name: 'Updated Template'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('DELETE /api/milestone-templates/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/milestone-templates/999`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/milestone-templates/[id]/reorder - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/milestone-templates/999/reorder`, {
      data: {
        order: 1
      }
    });
    
    expect(response.status()).toBe(401);
  });
});

test.describe('Milestones API Tests - Unauthenticated Access', () => {
  test('PUT /api/milestones/[id] - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.put(`${API_BASE}/milestones/999`, {
      data: {
        title: 'Updated Milestone'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/milestones/[id]/start - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/milestones/999/start`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/milestones/[id]/complete - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/milestones/999/complete`);
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/milestones/[id]/reopen - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/milestones/999/reopen`);
    
    expect(response.status()).toBe(401);
  });

  test('PUT /api/milestones/[id]/due-date - should return 401 for unauthenticated request', async ({ request }) => {
    const response = await request.put(`${API_BASE}/milestones/999/due-date`, {
      data: {
        due_date: '2026-12-31'
      }
    });
    
    expect(response.status()).toBe(401);
  });
});
