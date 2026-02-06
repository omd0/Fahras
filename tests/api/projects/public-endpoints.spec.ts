import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Public API Endpoints (No Auth Required)', () => {
  test('GET /api/departments - should return list of departments', async ({ request }) => {
    const response = await request.get(`${API_BASE}/departments`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body) || Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/faculties - should return list of faculties', async ({ request }) => {
    const response = await request.get(`${API_BASE}/faculties`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body) || Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/programs - should return list of programs', async ({ request }) => {
    const response = await request.get(`${API_BASE}/programs`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body) || Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/projects - should return public projects', async ({ request }) => {
    const response = await request.get(`${API_BASE}/projects`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    if (body.data.length > 0) {
      const project = body.data[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('title');
      expect(project).toHaveProperty('slug');
    }
  });

  test('GET /api/projects with search query', async ({ request }) => {
    const response = await request.get(`${API_BASE}/projects?search=test`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/projects with pagination', async ({ request }) => {
    const response = await request.get(`${API_BASE}/projects?page=1&per_page=5`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('current_page');
    expect(body).toHaveProperty('per_page');
    expect(body).toHaveProperty('total');
    
    expect(body.current_page).toBe(1);
    expect(body.per_page).toBe(5);
  });
});
