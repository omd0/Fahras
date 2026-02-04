'use client';

import type { User, LoginCredentials, RegisterData } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token
      : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error: any = new Error(data.message || `HTTP ${res.status}`);
    error.response = { status: res.status, data };
    throw error;
  }

  return res.json();
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    return fetchJson(`${API_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    return fetchJson(`${API_BASE}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: async (): Promise<void> => {
    try {
      await fetchJson(`${API_BASE}/logout`, { method: 'POST' });
    } catch {
      /* empty */
    }
  },

  logoutAll: async (): Promise<void> => {
    await fetchJson(`${API_BASE}/logout-all`, { method: 'POST' });
  },

  refreshToken: async (): Promise<{ token: string }> => {
    return fetchJson(`${API_BASE}/refresh`, { method: 'POST' });
  },

  getUser: async (): Promise<{ user: User }> => {
    return fetchJson(`${API_BASE}/user`);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return fetchJson(`${API_BASE}/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> => {
    return fetchJson(`${API_BASE}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> => {
    return fetchJson(`${API_BASE}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  sendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    return fetchJson(`${API_BASE}/email/send-verification`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyEmail: async (
    email: string,
    otp: string,
  ): Promise<{ message: string; user: User; token?: string }> => {
    return fetchJson(`${API_BASE}/email/verify`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  verifyMagicLink: async (
    token: string,
  ): Promise<{ message: string; user: User; token: string }> => {
    return fetchJson(`${API_BASE}/email/verify-magic/${token}`);
  },
};

export const apiService = {
  getProject: async (slug: string): Promise<any> => {
    return fetchJson(`${API_BASE}/projects/${slug}`);
  },

  syncGuestBookmarks: async (projectIds: number[]): Promise<any> => {
    return fetchJson(`${API_BASE}/bookmarks/sync`, {
      method: 'POST',
      body: JSON.stringify({ project_ids: projectIds }),
    });
  },
};
