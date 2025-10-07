import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginCredentials, RegisterData, User, Project, CreateProjectData, File, Program, Comment, Rating, Department } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/api';

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

    // Request interceptor to add auth token
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
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth data on unauthorized
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
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

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
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
  async getPrograms(): Promise<{ data: Program[] }> {
    const response: AxiosResponse = await this.api.get('/programs');
    return response.data;
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

  async getProject(id: number): Promise<{ project: Project }> {
    const response: AxiosResponse = await this.api.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: CreateProjectData): Promise<{ project: Project }> {
    const response: AxiosResponse = await this.api.post('/projects', data);
    return response.data;
  }

  async updateProject(id: number, data: Partial<CreateProjectData>): Promise<{ project: Project }> {
    const response: AxiosResponse = await this.api.put(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.api.delete(`/projects/${id}`);
  }

  // File endpoints
  async uploadFile(projectId: number, file: globalThis.File, isPublic: boolean = false): Promise<{ file: File }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_public', isPublic.toString());

    console.log('Uploading file:', file.name, 'to project:', projectId);

    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log('File upload response:', response.data);
    return response.data;
  }


  async getProjectFiles(projectId: number): Promise<{ files: File[] }> {
    const response: AxiosResponse = await this.api.get(`/projects/${projectId}/files`);
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
  async approveProject(projectId: number, adminNotes?: string): Promise<{
    message: string;
    project: Project;
  }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/approve`, {
      admin_notes: adminNotes
    });
    return response.data;
  }

  async hideProject(projectId: number, adminNotes?: string): Promise<{
    message: string;
    project: Project;
  }> {
    const response: AxiosResponse = await this.api.post(`/projects/${projectId}/hide`, {
      admin_notes: adminNotes
    });
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

  // Utility endpoints
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
