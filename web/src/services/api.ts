import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginCredentials, RegisterData, User, Project, CreateProjectData, File, Program, Comment, Rating, Department, MilestoneTemplate, MilestoneTemplateItem, ProjectMilestone, ProjectActivity, ProjectFlag, ProjectFollower, TimelineData } from '../types';
import { MilestoneTemplateData } from '../types/milestones';

// Use environment variable to define API base URL
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  // Fallback only for development if env var is not set
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token and handle FormData
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth-storage');
      if (token) {
        try {
          const authData = JSON.parse(token);
          if (authData.state?.token) {
            config.headers.Authorization = `Bearer ${authData.state.token}`;
          }
        } catch (error) {
          console.error('Error parsing auth token:', error);
        }
      }
      
      // If the request data is FormData, remove Content-Type header
      // to let the browser set it automatically with the boundary
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log error details
        if (error.response) {
          console.error('API Error:', error.response.status, error.response.statusText, error.config?.url);
        } else if (error.request) {
          console.error('API Request Error (No Response):', error.message);
        } else {
          console.error('API Setup Error:', error.message);
        }

        if (error.response?.status === 401) {
          // Clear auth data on unauthorized
          localStorage.removeItem('auth-storage');
          
          // Only redirect to login if we're not already on a public page
          const publicPaths = ['/', '/explore', '/login', '/register'];
          const currentPath = window.location.pathname;
          
          // Check if we're on a project detail page (pattern: /projects/{id})
          const isProjectDetailPage = /^\/projects\/\d+$/.test(currentPath);
          
          if (!publicPaths.includes(currentPath) && !isProjectDetailPage) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse = await this.api.post('/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<{ user: User; token: string; message: string }> {
    const response: AxiosResponse = await this.api.post('/register', data);
    return response.data;
  }

  async logout(token: string): Promise<void> {
    await this.api.post('/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async getUser(): Promise<{ user: User }> {
    const response: AxiosResponse = await this.api.get('/user');
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    const response: AxiosResponse = await this.api.get('/users');
    return response.data;
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    const response: AxiosResponse = await this.api.post('/refresh', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Project endpoints
  async getProjects(params?: string | {
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
  }): Promise<{ data: Project[]; current_page: number; last_page: number; total: number; per_page: number; has_more_pages: boolean } | Project[]> {
    const url = typeof params === 'string' ? `/projects?${params}` : '/projects';
    const response: AxiosResponse = await this.api.get(url, typeof params === 'object' ? { params } : {});
    return response.data;
  }

  async getMyProjects(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    academic_year?: string;
    semester?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ data: Project[]; current_page: number; last_page: number; total: number; per_page: number; has_more_pages: boolean }> {
    const response: AxiosResponse = await this.api.get('/projects', { 
      params: { 
        ...params,
        my_projects: true // Flag to indicate we want only user's projects
      } 
    });
    return response.data;
  }

  async searchProjects(query: string, filters?: any): Promise<{
    projects: Project[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more_pages: boolean;
    };
    search_term: string;
  }> {
    const params = { q: query, ...filters };
    const response: AxiosResponse = await this.api.get('/projects/search/global', { params });
    return response.data;
  }

  async getProjectAnalytics(): Promise<{
    status_distribution: Record<string, number>;
    year_distribution: Array<{ academic_year: string; count: number }>;
    department_distribution: Array<{ department: string; count: number }>;
    recent_activity: number;
    monthly_trend: Array<{ month: string; count: number }>;
    total_projects: number;
  }> {
    const response: AxiosResponse = await this.api.get('/projects/analytics');
    return response.data;
  }

  async getProjectSuggestions(query: string): Promise<{ suggestions: Array<{ id: number; title: string; academic_year: string; semester: string }> }> {
    const response: AxiosResponse = await this.api.get('/projects/suggestions', { params: { q: query } });
    return response.data;
  }

  // Academic structure endpoints
  async getPrograms(): Promise<Program[]> {
    const response: AxiosResponse = await this.api.get('/programs');
    // Backend returns array directly
    return Array.isArray(response.data) ? response.data : [];
  }

  async getDepartments(): Promise<Department[]> {
    const response: AxiosResponse = await this.api.get('/departments');
    return response.data;
  }

  // Notification endpoints
  async getNotifications(params?: {
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
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more_pages: boolean;
    };
    unread_count: number;
  }> {
    const response: AxiosResponse = await this.api.get('/notifications', { params });
    return response.data;
  }

  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response: AxiosResponse = await this.api.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await this.api.put(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.api.put('/notifications/read-all');
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.api.delete(`/notifications/${notificationId}`);
  }

  async deleteAllNotifications(): Promise<void> {
    await this.api.delete('/notifications');
  }

  // Evaluation endpoints
  async getMyEvaluations(): Promise<{
    data: Array<{
      id: number;
      project_id: number;
      project_title: string;
      score: number | null;
      status: string;
      due_date: string;
      created_at: string;
    }>;
    current_page: number;
    last_page: number;
    total: number;
  }> {
    const response: AxiosResponse = await this.api.get('/my-evaluations');
    return response.data;
  }

  async getMyPendingApprovals(): Promise<{
    data: Array<{
      id: number;
      project_id: number;
      project_title: string;
      stage: string;
      decision: string;
      created_at: string;
    }>;
    current_page: number;
    last_page: number;
    total: number;
  }> {
    const response: AxiosResponse = await this.api.get('/pending-approvals');
    return response.data;
  }

  async submitEvaluation(evaluationId: number, data: {
    score: number;
    remarks: string;
    criteria_scores?: Record<string, number>;
  }): Promise<{ evaluation: any }> {
    const response: AxiosResponse = await this.api.post(`/evaluations/${evaluationId}/submit`, data);
    return response.data;
  }

  async updateApproval(approvalId: number, data: {
    decision: string;
    note: string;
  }): Promise<{ approval: any }> {
    const response: AxiosResponse = await this.api.put(`/approvals/${approvalId}`, data);
    return response.data;
  }

  async getProject(slugOrId: string | number): Promise<{ project: Project }> {
    const response: AxiosResponse = await this.api.get(`/projects/${slugOrId}`);
    return response.data;
  }

  async createProject(data: CreateProjectData): Promise<{ project: Project }> {
    const response: AxiosResponse = await this.api.post('/projects', data);
    return response.data;
  }

  async updateProject(slugOrId: string | number, data: Partial<CreateProjectData>): Promise<{ project: Project }> {
    const response: AxiosResponse = await this.api.put(`/projects/${slugOrId}`, data);
    return response.data;
  }

  async deleteProject(slugOrId: string | number): Promise<void> {
    await this.api.delete(`/projects/${slugOrId}`);
  }

  // File endpoints
  async uploadFile(slugOrId: string | number, file: globalThis.File, isPublic: boolean = false): Promise<{ file: File }> {
    const formData = new FormData();
    formData.append('file', file);
    // Send boolean as string '1' for true, '0' for false (Laravel compatible)
    formData.append('is_public', isPublic ? '1' : '0');

    // Content-Type header will be automatically set by the interceptor for FormData
    // The interceptor removes the default Content-Type to let browser set it with boundary
    const response: AxiosResponse = await this.api.post(`/projects/${slugOrId}/files`, formData);
    return response.data;
  }


  async getProjectFiles(slugOrId: string | number): Promise<{ files: File[]; debug?: any }> {
    const response: AxiosResponse = await this.api.get(`/projects/${slugOrId}/files`);
    return response.data;
  }

  async downloadFile(fileId: number): Promise<Blob> {
    const response: AxiosResponse = await this.api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteFile(fileId: number): Promise<void> {
    await this.api.delete(`/files/${fileId}`);
  }

  // Project interaction endpoints (comments and ratings)
  async getComments(projectId: number): Promise<{ comments: Comment[] }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/comments`);
    return response.data;
  }

  async addComment(projectId: number, content: string, parentId?: number): Promise<{
    message: string;
    comment: Comment;
  }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/comments`, { 
      content,
      parent_id: parentId 
    });
    return response.data;
  }

  async getRatings(projectId: number): Promise<{
    ratings: Rating[];
    average_rating: number | null;
    total_ratings: number;
  }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/ratings`);
    return response.data;
  }

  async rateProject(projectId: number, rating: number, review?: string): Promise<{
    message: string;
    rating: Rating;
  }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/rate`, { 
      rating, 
      review 
    });
    return response.data;
  }

  // Profile management endpoints
  async updateProfile(data: {
    full_name?: string;
    email?: string;
  }): Promise<{ user: User; message: string }> {
    const response: AxiosResponse = await this.api.put('/profile', data);
    return response.data;
  }

  async uploadAvatar(file: globalThis.File): Promise<{ user: User; avatar_url: string; message: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response: AxiosResponse = await this.api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async deleteAvatar(): Promise<{ user: User; message: string }> {
    const response: AxiosResponse = await this.api.delete('/profile/avatar');
    return response.data;
  }

  // Admin project approval endpoints
  async approveProject(projectId: number, data?: { admin_notes?: string; status?: string }): Promise<{
    message: string;
    project: Project;
  }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/approve`, data || {});
    return response.data;
  }

  async hideProject(projectId: number, data?: { admin_notes?: string }): Promise<{
    message: string;
    project: Project;
  }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/hide`, data || {});
    return response.data;
  }

  async toggleProjectVisibility(projectId: number, adminNotes?: string): Promise<{
    message: string;
    project: Project;
  }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/toggle-visibility`, {
      admin_notes: adminNotes
    });
    return response.data;
  }

  async getAdminProjects(params?: {
    page?: number;
    per_page?: number;
    approval_status?: 'pending' | 'approved' | 'hidden';
    status?: string;
    program_id?: number;
    department_id?: number;
    academic_year?: string;
    created_by?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{
    projects: Project[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more_pages: boolean;
    };
  }> {
    const response: AxiosResponse = await this.api.get('/admin/projects', { params });
    return response.data;
  }

  async getPendingApprovals(params?: {
    page?: number;
    per_page?: number;
    program_id?: number;
    department_id?: number;
    academic_year?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{
    projects: Project[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more_pages: boolean;
    };
  }> {
    const response: AxiosResponse = await this.api.get('/admin/projects/pending', { params });
    return response.data;
  }

  // User management endpoints (admin only)
  async getAdminUsers(): Promise<User[]> {
    const response: AxiosResponse = await this.api.get('/admin/users');
    return response.data || [];
  }

  async getRoles(): Promise<Array<{ id: number; name: string; description?: string; is_system_role?: boolean; is_template?: boolean; user_count?: number; permission_count?: number; permissions?: any[] }>> {
    const response: AxiosResponse = await this.api.get('/admin/roles');
    return response.data || [];
  }

  async getPermissions(): Promise<Array<{ id: number; code: string; name?: string; category: string; description?: string }>> {
    const response: AxiosResponse = await this.api.get('/admin/permissions');
    return response.data || [];
  }

  async createRole(data: {
    name: string;
    description?: string;
    permissions?: Array<{ permission_id: number; scope: string }>;
  }): Promise<{ message: string; role: any }> {
    const response: AxiosResponse = await this.api.post('/admin/roles', data);
    return response.data;
  }

  async updateRole(roleId: number, data: {
    name?: string;
    description?: string;
    permissions?: Array<{ permission_id: number; scope: string }>;
  }): Promise<{ message: string; role: any }> {
    const response: AxiosResponse = await this.api.put(`/admin/roles/${roleId}`, data);
    return response.data;
  }

  async deleteRole(roleId: number): Promise<{ message: string }> {
    const response: AxiosResponse = await this.api.delete(`/admin/roles/${roleId}`);
    return response.data;
  }

  async createUser(data: {
    full_name: string;
    email: string;
    password?: string;
    role_ids: number[];
    status?: string;
  }): Promise<{ message: string; user: User }> {
    const response: AxiosResponse = await this.api.post('/admin/users', data);
    return response.data;
  }

  async updateUser(userId: number, data: {
    full_name?: string;
    email?: string;
    password?: string;
    role_ids?: number[];
    status?: string;
  }): Promise<{ message: string; user: User }> {
    const response: AxiosResponse = await this.api.put(`/admin/users/${userId}`, data);
    return response.data;
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const response: AxiosResponse = await this.api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async toggleUserStatus(userId: number, status: string): Promise<{ message: string; user: User }> {
    const response: AxiosResponse = await this.api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  }

  // Bookmark endpoints
  async bookmarkProject(projectId: number): Promise<{ message: string; is_bookmarked: boolean }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/bookmark`);
    return response.data;
  }

  async unbookmarkProject(projectId: number): Promise<{ message: string; is_bookmarked: boolean }> {
    const response: AxiosResponse = await this.api.delete(`/projects/${projectId}/bookmark`);
    return response.data;
  }

  async getBookmarkedProjects(): Promise<{ data: Project[]; total: number }> {
    const response: AxiosResponse = await this.api.get('/projects/bookmarked');
    return response.data;
  }

  async isProjectBookmarked(projectId: number): Promise<{ is_bookmarked: boolean }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/is-bookmarked`);
    return response.data;
  }

  async syncGuestBookmarks(projectIds: number[]): Promise<{ message: string; synced_count: number; total_bookmarks: number }> {
    const response: AxiosResponse = await this.api.post('/bookmarks/sync', {
      guest_bookmark_ids: projectIds
    });
    return response.data;
  }

  // Utility endpoints

  // Milestone Template endpoints
  async getMilestoneTemplates(params?: {
    program_id?: number;
    department_id?: number;
    is_default?: boolean;
  }): Promise<{ templates: MilestoneTemplate[] }> {
    const response: AxiosResponse = await this.api.get('/milestone-templates', { params });
    return response.data;
  }

  async getMilestoneTemplate(templateId: number): Promise<{ template: MilestoneTemplate }> {
    const response: AxiosResponse = await this.api.get(`/milestone-templates/${templateId}`);
    return response.data;
  }

  async createMilestoneTemplate(data: MilestoneTemplateData): Promise<{ message: string; template: MilestoneTemplate }> {
    const response: AxiosResponse = await this.api.post('/milestone-templates', data);
    return response.data;
  }

  async updateMilestoneTemplate(templateId: number, data: Partial<MilestoneTemplate>): Promise<{ message: string; template: MilestoneTemplate }> {
    const response: AxiosResponse = await this.api.put(`/milestone-templates/${templateId}`, data);
    return response.data;
  }

  async deleteMilestoneTemplate(templateId: number): Promise<{ message: string }> {
    const response: AxiosResponse = await this.api.delete(`/milestone-templates/${templateId}`);
    return response.data;
  }

  async applyTemplateToProject(templateId: number, projectId: number, startDate: string, preserveCustomMilestones?: boolean): Promise<{ message: string; milestones: ProjectMilestone[] }> {
    const response: AxiosResponse = await this.api.post(`/milestone-templates/${templateId}/apply-to-project`, {
      project_id: projectId,
      start_date: startDate,
      preserve_custom_milestones: preserveCustomMilestones,
    });
    return response.data;
  }

  async reorderTemplateItems(templateId: number, itemIds: number[]): Promise<{ message: string }> {
    const response: AxiosResponse = await this.api.put(`/milestone-templates/${templateId}/items/reorder`, {
      item_ids: itemIds,
    });
    return response.data;
  }

  // Project Milestone endpoints
  async getProjectMilestones(projectId: number): Promise<{ milestones: ProjectMilestone[] }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/milestones`);
    return response.data;
  }

  async createMilestone(projectId: number, data: {
    title: string;
    description?: string;
    due_date?: string;
    dependencies?: number[];
    order?: number;
  }): Promise<{ message: string; milestone: ProjectMilestone }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/milestones`, data);
    return response.data;
  }

  async updateMilestone(milestoneId: number, data: Partial<ProjectMilestone>): Promise<{ message: string; milestone: ProjectMilestone }> {
    const response: AxiosResponse = await this.api.put(`/milestones/${milestoneId}`, data);
    return response.data;
  }

  async deleteMilestone(milestoneId: number): Promise<{ message: string }> {
    const response: AxiosResponse = await this.api.delete(`/milestones/${milestoneId}`);
    return response.data;
  }

  async startMilestone(milestoneId: number): Promise<{ message: string; milestone: ProjectMilestone }> {
    const response: AxiosResponse = await this.api.post(`/milestones/${milestoneId}/start`);
    return response.data;
  }

  async completeMilestone(milestoneId: number, completionNotes?: string): Promise<{ message: string; milestone: ProjectMilestone }> {
    const response: AxiosResponse = await this.api.post(`/milestones/${milestoneId}/complete`, {
      completion_notes: completionNotes,
    });
    return response.data;
  }

  async reopenMilestone(milestoneId: number): Promise<{ message: string; milestone: ProjectMilestone }> {
    const response: AxiosResponse = await this.api.post(`/milestones/${milestoneId}/reopen`);
    return response.data;
  }

  async updateMilestoneDueDate(milestoneId: number, dueDate: string): Promise<{ message: string; milestone: ProjectMilestone }> {
    const response: AxiosResponse = await this.api.put(`/milestones/${milestoneId}/due-date`, {
      due_date: dueDate,
    });
    return response.data;
  }

  async getMilestoneTimeline(projectId: number): Promise<TimelineData> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/milestones/timeline`);
    return response.data;
  }

  // Project Activity endpoints
  async getProjectActivities(projectId: number, params?: {
    activity_type?: string;
    from_date?: string;
    to_date?: string;
    per_page?: number;
    page?: number;
  }): Promise<{
    activities: ProjectActivity[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/activities`, { params });
    return response.data;
  }

  async getProjectTimeline(projectId: number): Promise<{
    activities_by_date: Record<string, ProjectActivity[]>;
    milestones: ProjectMilestone[];
    status_changes: ProjectActivity[];
  }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/activities/timeline`);
    return response.data;
  }

  // Project Follow endpoints
  async followProject(projectId: number, notificationPreferences?: Record<string, boolean>): Promise<{ message: string; follower: ProjectFollower }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/follow`, {
      notification_preferences: notificationPreferences,
    });
    return response.data;
  }

  async unfollowProject(projectId: number): Promise<{ message: string }> {
    const response: AxiosResponse = await this.api.delete(`/projects/${projectId}/follow`);
    return response.data;
  }

  async getProjectFollowers(projectId: number): Promise<{ followers: ProjectFollower[] }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/followers`);
    return response.data;
  }

  // Project Flag endpoints
  async createProjectFlag(projectId: number, data: {
    flag_type: ProjectFlag['flag_type'];
    severity: ProjectFlag['severity'];
    message: string;
    is_confidential?: boolean;
  }): Promise<{ message: string; flag: ProjectFlag }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/flags`, data);
    return response.data;
  }

  async resolveFlag(flagId: number, resolutionNotes?: string): Promise<{ message: string; flag: ProjectFlag }> {
    const response: AxiosResponse = await this.api.put(`/flags/${flagId}/resolve`, {
      resolution_notes: resolutionNotes,
    });
    return response.data;
  }

  async getProjectFlags(projectId: number, params?: {
    resolved?: boolean;
    severity?: ProjectFlag['severity'];
    flag_type?: ProjectFlag['flag_type'];
  }): Promise<{ flags: ProjectFlag[] }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/flags`, { params });
    return response.data;
  }
}

export const apiService = new ApiService();

// Auth-specific API service
export const authApi = {
  login: apiService.login.bind(apiService),
  register: apiService.register.bind(apiService),
  logout: apiService.logout.bind(apiService),
  getUser: apiService.getUser.bind(apiService),
  refreshToken: apiService.refreshToken.bind(apiService),
};
