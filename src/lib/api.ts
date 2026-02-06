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
  MilestoneTemplate,
  MilestoneTemplateData,
  ProjectMilestone,
  ProjectActivity,
  ProjectFlag,
  ProjectFollower,
  TimelineData,
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
  my_projects?: boolean;
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
    const res = await fetchJson<{ data: User[] } | User[]>(`${API_BASE}/users`);
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

  markAllNotificationsRead: async (): Promise<void> => {
    await fetchJson(`${API_BASE}/notifications/read-all`, { method: 'PUT' });
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await fetchJson(`${API_BASE}/notifications/${notificationId}`, { method: 'DELETE' });
  },

  deleteAllNotifications: async (): Promise<void> => {
    await fetchJson(`${API_BASE}/notifications`, { method: 'DELETE' });
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    return fetchJson(`${API_BASE}/notifications/unread-count`);
  },

  // Milestone Template endpoints
  getMilestoneTemplates: async (params?: {
    program_id?: number;
    department_id?: number;
    is_default?: boolean;
  }): Promise<{ templates: MilestoneTemplate[] }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const url = query
      ? `${API_BASE}/milestone-templates?${query}`
      : `${API_BASE}/milestone-templates`;
    return fetchJson(url);
  },

  createMilestoneTemplate: async (
    data: MilestoneTemplateData,
  ): Promise<{ message: string; template: MilestoneTemplate }> => {
    return fetchJson(`${API_BASE}/milestone-templates`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMilestoneTemplate: async (
    templateId: number,
    data: Partial<MilestoneTemplateData>,
  ): Promise<{ message: string; template: MilestoneTemplate }> => {
    return fetchJson(`${API_BASE}/milestone-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMilestoneTemplate: async (templateId: number): Promise<{ message: string }> => {
    return fetchJson(`${API_BASE}/milestone-templates/${templateId}`, { method: 'DELETE' });
  },

  reorderTemplateItems: async (
    templateId: number,
    itemIds: number[],
  ): Promise<{ message: string }> => {
    return fetchJson(`${API_BASE}/milestone-templates/${templateId}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ item_ids: itemIds }),
    });
  },

  // Roles & Permissions (RBAC)
  getRoles: async (): Promise<any[]> => {
    const res = await fetchJson<{ data: any[] } | any[]>(`${API_BASE}/roles`);
    return Array.isArray(res) ? res : (res as { data: any[] }).data || [];
  },

  createRole: async (data: {
    name: string;
    description?: string;
    permissions?: Array<{ permission_id: number; scope: string }>;
  }): Promise<any> => {
    return fetchJson(`${API_BASE}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRole: async (
    roleId: number,
    data: {
      name?: string;
      description?: string;
      permissions?: Array<{ permission_id: number; scope: string }>;
    },
  ): Promise<any> => {
    return fetchJson(`${API_BASE}/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRole: async (roleId: number): Promise<any> => {
    return fetchJson(`${API_BASE}/roles/${roleId}`, { method: 'DELETE' });
  },

  getPermissions: async (): Promise<any[]> => {
    const res = await fetchJson<{ data: any[] } | any[]>(`${API_BASE}/permissions`);
    return Array.isArray(res) ? res : (res as { data: any[] }).data || [];
  },

  updateUserRoles: async (userId: number, roleIds: number[]): Promise<any> => {
    return fetchJson(`${API_BASE}/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role_ids: roleIds }),
    });
  },

  getAdminUsers: async (): Promise<User[]> => {
    const res = await fetchJson<{ data: User[] } | User[]>(`${API_BASE}/admin/users`);
    return Array.isArray(res) ? res : (res as { data: User[] }).data || [];
  },

  // Project Milestone endpoints
  getProjectMilestones: async (projectId: number): Promise<{ milestones: ProjectMilestone[] }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/milestones`);
  },

  createMilestone: async (
    projectId: number,
    data: { title: string; description?: string; due_date?: string; dependencies?: number[]; order?: number },
  ): Promise<{ message: string; milestone: ProjectMilestone }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMilestone: async (
    milestoneId: number,
    data: Partial<ProjectMilestone>,
  ): Promise<{ message: string; milestone: ProjectMilestone }> => {
    return fetchJson(`${API_BASE}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMilestone: async (milestoneId: number): Promise<{ message: string }> => {
    return fetchJson(`${API_BASE}/milestones/${milestoneId}`, { method: 'DELETE' });
  },

  startMilestone: async (milestoneId: number): Promise<{ message: string; milestone: ProjectMilestone }> => {
    return fetchJson(`${API_BASE}/milestones/${milestoneId}/start`, { method: 'POST' });
  },

  completeMilestone: async (
    milestoneId: number,
    completionNotes?: string,
  ): Promise<{ message: string; milestone: ProjectMilestone }> => {
    return fetchJson(`${API_BASE}/milestones/${milestoneId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completion_notes: completionNotes }),
    });
  },

  getMilestoneTimeline: async (projectId: number): Promise<TimelineData> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/milestones/timeline`);
  },

  // Project Activity endpoints
  getProjectActivities: async (
    projectId: number,
    params?: { activity_type?: string; from_date?: string; to_date?: string; per_page?: number; page?: number },
  ): Promise<{
    activities: ProjectActivity[];
    pagination: { current_page: number; per_page: number; total: number; last_page: number };
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchJson(`${API_BASE}/projects/${projectId}/activities${query ? `?${query}` : ''}`);
  },

  // Project Follow endpoints
  followProject: async (
    projectId: number,
    notificationPreferences?: Record<string, boolean>,
  ): Promise<{ message: string; follower: ProjectFollower }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ notification_preferences: notificationPreferences }),
    });
  },

  unfollowProject: async (projectId: number): Promise<{ message: string }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/follow`, { method: 'DELETE' });
  },

  getProjectFollowers: async (projectId: number): Promise<{ followers: ProjectFollower[] }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/followers`);
  },

  // Project Flag endpoints
  createProjectFlag: async (
    projectId: number,
    data: { flag_type: ProjectFlag['flag_type']; severity: ProjectFlag['severity']; message: string; is_confidential?: boolean },
  ): Promise<{ message: string; flag: ProjectFlag }> => {
    return fetchJson(`${API_BASE}/projects/${projectId}/flags`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resolveFlag: async (
    flagId: number,
    resolutionNotes?: string,
  ): Promise<{ message: string; flag: ProjectFlag }> => {
    return fetchJson(`${API_BASE}/flags/${flagId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolution_notes: resolutionNotes }),
    });
  },

  getProjectFlags: async (
    projectId: number,
    params?: { resolved?: boolean; severity?: ProjectFlag['severity']; flag_type?: ProjectFlag['flag_type'] },
  ): Promise<{ flags: ProjectFlag[] }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchJson(`${API_BASE}/projects/${projectId}/flags${query ? `?${query}` : ''}`);
  },
};
