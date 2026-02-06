import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Auth API Tests', () => {
  test('POST /api/login - successful login with valid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/login`, {
      data: {
        email: 'ahmed.almansouri@student.fahras.edu',
        password: 'password'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('email', 'ahmed.almansouri@student.fahras.edu');
  });

  test('POST /api/login - fail with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/login`, {
      data: {
        email: 'ahmed.almansouri@student.fahras.edu',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('POST /api/login - fail with non-existent user', async ({ request }) => {
    const response = await request.post(`${API_BASE}/login`, {
      data: {
        email: 'nonexistent@fahras.edu',
        password: 'password'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('POST /api/register - successful registration', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post(`${API_BASE}/register`, {
      data: {
        email: `testuser${timestamp}@student.fahras.edu`,
        password: 'password123',
        full_name: `Test User ${timestamp}`,
        role: 'student'
      }
    });

    expect([200, 201]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body.user.email).toBe(`testuser${timestamp}@student.fahras.edu`);
  });

  test('POST /api/register - fail with duplicate email', async ({ request }) => {
    const response = await request.post(`${API_BASE}/register`, {
      data: {
        email: 'ahmed.almansouri@student.fahras.edu',
        password: 'password123',
        full_name: 'Duplicate User',
        role: 'student'
      }
    });

    expect([400, 409, 422]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('GET /api/user - fail when unauthenticated', async ({ request }) => {
    const response = await request.get(`${API_BASE}/user`);
    
    expect(response.status()).toBe(401);
  });

  test('GET /api/user - success when authenticated', async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/login`, {
      data: {
        email: 'ahmed.almansouri@student.fahras.edu',
        password: 'password'
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    const token = loginBody.token || loginBody.access_token;

    const userResponse = await request.get(`${API_BASE}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(userResponse.status()).toBe(200);
    const userBody = await userResponse.json();
    expect(userBody).toHaveProperty('email');
    expect(userBody.email).toBe('ahmed.almansouri@student.fahras.edu');
  });
});
