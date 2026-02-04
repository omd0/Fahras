'use client';

import type {
  User,
  LoginCredentials,
  RegisterData,
  Project,
  Comment,
  Rating,
  ProjectFile,
  Department,
  Program,
  SavedSearch,
  CreateSavedSearchData,
  CreateProjectData,
} from '@/types';

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

export interface GetProjectsParams {
  page?: number;
  per_page?: number;
  status?: string;
  program_id?: number;
  department_id?: number;
  academic_year?: string;
  semester?: string;
  search?: string;
  is_public?: boolean;
  sort_by?: string;
  sort_order?: string;
  created_by_user_id?: number;
}

export const apiService = {
  getProjects: async (params?: GetProjectsParams): Promise<{ data: Project[] } | Project[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const url = query ? `${API_BASE}/projects?${query}` : `${API_BASE}/projects`;
    return fetchJson(url);
  },

  getProject: async (slug: string): Promise<any> => {
    return fetchJson(`${API_BASE}/projects/${slug}`);
  },

  syncGuestBookmarks: async (projectIds: number[]): Promise<any> => {
    return fetchJson(`${API_BASE}/bookmarks/sync`, {
      method: 'POST',
      body: JSON.stringify({ project_ids: projectIds }),
    });
  },

  getPrograms: async (): Promise<Program[]> => {
    const res = await fetchJson<{ data: Program[] } | Program[]>(`${API_BASE}/programs`);
    return Array.isArray(res) ? res : (res as { data: Program[] }).data || [];
  },

  getDepartments: async (): Promise<Department[]> => {
    const res = await fetchJson<{ data: Department[] } | Department[]>(`${API_BASE}/departments`);
    return Array.isArray(res) ? res : (res as { data: Department[] }).data || [];
  },

  getBookmarkedProjects: async (): Promise<{ data: Project[] }> => {
    return fetchJson(`${API_BASE}/bookmarks`);
  },

  isProjectBookmarked: async (projectId: number): Promise<{ is_bookmarked: boolean }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/bookmark`);
  },

  bookmarkProject: async (projectId: number): Promise<any> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/bookmark`, { method: 'POST' });
  },

  unbookmarkProject: async (projectId: number): Promise<any> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/bookmark`, { method: 'POST' });
  },

  getSavedSearches: async (): Promise<{ data: SavedSearch[] }> => {
    return fetchJson(`${API_BASE}/saved-searches`);
  },

  createSavedSearch: async (data: CreateSavedSearchData): Promise<any> => {
    return fetchJson(`${API_BASE}/saved-searches`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSavedSearch: async (id: number, data: CreateSavedSearchData): Promise<any> => {
    return fetchJson(`${API_BASE}/saved-searches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSavedSearch: async (id: number): Promise<any> => {
    return fetchJson(`${API_BASE}/saved-searches/${id}`, { method: 'DELETE' });
  },

  setSavedSearchAsDefault: async (id: number): Promise<any> => {
    return fetchJson(`${API_BASE}/saved-searches/${id}/default`, { method: 'POST' });
  },

  recordSavedSearchUsage: async (id: number): Promise<any> => {
    return fetchJson(`${API_BASE}/saved-searches/${id}/usage`, { method: 'POST' });
  },

  getComments: async (projectId: number): Promise<{ comments: Comment[] }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/comments`);
  },

  addComment: async (projectId: number, content: string, parentId?: number): Promise<{ comment: Comment }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    });
  },

  getRatings: async (projectId: number): Promise<{ ratings: Rating[]; average_rating: number | null; total_ratings: number }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/ratings`);
  },

  rateProject: async (projectId: number, rating: number, review?: string): Promise<{ rating: Rating }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  },

  getProjectFiles: async (projectId: number): Promise<{ files: ProjectFile[] }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/files`);
  },

  downloadFile: async (fileId: number): Promise<Blob> => {
    const token =
      typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token
        : null;

    const headers: Record<string, string> = {
      Accept: 'application/octet-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE}/files/${fileId}/download`, { headers });
    if (!res.ok) {
      const error: any = new Error(`Download failed: HTTP ${res.status}`);
      error.response = { status: res.status, data: {} };
      throw error;
    }
    return res.blob();
  },

  deleteProject: async (projectId: number): Promise<any> => {
    return fetchJson(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' });
  },

  updateProject: async (projectId: number, data: Partial<Project> | CreateProjectData): Promise<any> => {
    return fetchJson(`${API_BASE}/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  createProject: async (data: CreateProjectData): Promise<any> => {
    return fetchJson(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  uploadFile: async (projectId: number, file: File, isPublic: boolean = true): Promise<any> => {
    const token =
      typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token
        : null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_public', String(isPublic));

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE}/projects/${projectId}/files`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error: any = new Error(errorData.message || `Upload failed: HTTP ${res.status}`);
      error.response = { status: res.status, data: errorData };
      throw error;
    }

    return res.json();
  },

  getUsers: async (): Promise<User[]> => {
    const res = await fetchJson<{ data: User[] } | User[]>(`${API_BASE}/admin/users`);
    return Array.isArray(res) ? res : (res as { data: User[] }).data || [];
  },

  applyTemplateToProject: async (
    templateId: number,
    projectId: number,
    startDate: string,
    preserveCustom: boolean,
  ): Promise<any> => {
    return fetchJson(`${API_BASE}/milestone-templates/${templateId}/apply`, {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        start_date: startDate,
        preserve_custom: preserveCustom,
      }),
    });
  },

  updateProfile: async (data: {
    full_name?: string;
    email?: string;
  }): Promise<{ user: User; message: string }> => {
    return fetchJson(`${API_BASE}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadAvatar: async (file: File): Promise<{ user: User; avatar_url: string; message: string }> => {
    const token =
      typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token
        : null;

    const formData = new FormData();
    formData.append('avatar', file);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error: any = new Error(errorData.message || `Upload failed: HTTP ${res.status}`);
      error.response = { status: res.status, data: errorData };
      throw error;
    }

    return res.json();
  },

  deleteAvatar: async (): Promise<{ user: User; message: string }> => {
    return fetchJson(`${API_BASE}/profile/avatar`, { method: 'DELETE' });
  },

  // Dashboard / My Projects
  getMyProjects: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    academic_year?: string;
    semester?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ data: Project[]; current_page: number; last_page: number; total: number; per_page: number }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    searchParams.set('my_projects', 'true');
    const query = searchParams.toString();
    return fetchJson(`${API_BASE}/projects?${query}`);
  },

  // Notifications
  getNotifications: async (params?: {
    type?: string;
    is_read?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<{
    notifications: Array<{
      id: number;
      type: string;
      title: string;
      message: string;
      is_read: boolean;
      created_at: string;
      project?: Project;
    }>;
    unread_count: number;
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const url = query ? `${API_BASE}/notifications?${query}` : `${API_BASE}/notifications`;
    return fetchJson(url);
  },

  markNotificationRead: async (notificationId: number): Promise<void> => {
    await fetchJson(`${API_BASE}/notifications/${notificationId}/read`, { method: 'PUT' });
  },
};
