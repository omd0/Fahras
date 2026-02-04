'use client';

/**
 * API Service - Stub for Next.js migration
 * TODO: Full migration from web/src/lib/api.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const apiService = {
  getProject: async (slug: string): Promise<any> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
    const response = await fetch(`${baseUrl}/projects/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },
};

export const authApi = {
  login: async (_credentials: { email: string; password: string }): Promise<any> => {
    throw new Error('Not implemented - use Next.js auth');
  },
  register: async (_data: any): Promise<any> => {
    throw new Error('Not implemented - use Next.js auth');
  },
};
