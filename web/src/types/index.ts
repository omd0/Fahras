export interface User {
  id: number;
  full_name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: string;
  email_verified_at?: string;
  avatar_url?: string;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system_role?: boolean;
  is_template?: boolean;
  user_count?: number;
  permission_count?: number;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  code: string;
  name?: string;
  category: 'Projects' | 'Users' | 'Files' | 'Analytics' | 'Settings' | 'System' | 'Roles';
  description?: string;
  scope?: 'all' | 'department' | 'own' | 'none';
  created_at?: string;
  updated_at?: string;
}

export interface RolePermission {
  permission_id: number;
  role_id: number;
  scope: 'all' | 'department' | 'own' | 'none';
  permission?: Permission;
}

export interface PermissionDependency {
  id: number;
  permission_id: number;
  depends_on_permission_id: number;
  permission?: Permission;
  depends_on?: Permission;
}

export interface RoleTemplate {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Department {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: number;
  department_id: number;
  name: string;
  degree_level: 'bachelor' | 'master' | 'phd';
  department?: Department;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  slug: string;
  program_id: number;
  created_by_user_id: number;
  title: string;
  abstract: string;
  keywords: string[];
  academic_year: string;
  semester: 'fall' | 'spring' | 'summer';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  is_public: boolean;
  admin_approval_status: 'pending' | 'approved' | 'hidden';
  approved_by_user_id?: number;
  approved_at?: string;
  admin_notes?: string;
  doi?: string;
  repo_url?: string;
  views?: number;
  average_rating?: number;
  rating_count?: number;
  is_bookmarked?: boolean;
  department?: Department;
  program?: Program;
  creator?: User;
  approver?: User;
  members?: ProjectMember[];
  advisors?: ProjectAdvisor[];
  files?: File[];
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: number | null;
  full_name: string;
  email: string | null;
  is_custom?: boolean;
  pivot: {
    role_in_project: 'LEAD' | 'MEMBER';
  };
}

export interface ProjectAdvisor {
  id: number | null;
  full_name: string;
  email: string | null;
  is_custom?: boolean;
  pivot: {
    advisor_role: 'MAIN' | 'CO_ADVISOR' | 'REVIEWER';
  };
}

export interface File {
  id: number;
  project_id: number;
  uploaded_by_user_id: number;
  version: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  storage_url: string;
  public_url?: string;
  size_human?: string;
  checksum?: string;
  is_public: boolean;
  uploaded_at: string;
  uploader?: User;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'student' | 'faculty' | 'admin' | 'reviewer';
}

export interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;  // Laravel's 'confirmed' rule expects field_confirmation
}

export interface CreateProjectData {
  program_id: number;
  title: string;
  abstract: string;
  keywords?: string[];
  academic_year: string;
  semester: 'fall' | 'spring' | 'summer';
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  github_url?: string;
  members: Array<{
    user_id: number;
    role: 'LEAD' | 'MEMBER';
    customName?: string;
  }>;
  advisors?: Array<{
    user_id: number;
    role: 'MAIN' | 'CO_ADVISOR' | 'REVIEWER';
    customName?: string;
  }>;
}

export interface ApiResponse<T = unknown> {
   message?: string;
   data?: T;
   errors?: Record<string, string[]>;
}

export interface Comment {
  id: number;
  project_id: number;
  user_id: number;
  content: string;
  parent_id?: number;
  is_approved: boolean;
  user?: User;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: number;
  project_id: number;
  user_id: number;
  rating: number;
  review?: string;
  is_approved: boolean;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Project Follow Manager Types
export interface MilestoneTemplate {
  id: number;
  name: string;
  description?: string;
  program_id?: number;
  department_id?: number;
  is_default: boolean;
  created_by_user_id: number;
  items?: MilestoneTemplateItem[];
  program?: Program;
  department?: Department;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface MilestoneTemplateItem {
  id: number;
  template_id: number;
  title: string;
  description?: string;
  order: number;
  estimated_days: number;
  is_required: boolean;
  // Permissions: Who can perform actions at this step
  allowed_roles?: ('admin' | 'faculty' | 'student')[];
  // Actions: What can be done at this step
  allowed_actions?: ('start' | 'pause' | 'extend' | 'view' | 'edit' | 'complete')[];
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  template_item_id?: number;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  order: number;
  dependencies?: number[];
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectActivity {
   id: number;
   project_id: number;
   user_id: number;
   activity_type: string;
   title: string;
   description?: string;
   metadata?: Record<string, unknown>;
   user?: User;
   created_at: string;
}

export interface ProjectFlag {
  id: number;
  project_id: number;
  flagged_by_user_id: number;
  flag_type: 'scope_creep' | 'technical_blocker' | 'team_conflict' | 'resource_shortage' | 'timeline_risk' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_confidential: boolean;
  resolved_at?: string;
  resolved_by_user_id?: number;
  resolution_notes?: string;
  flaggedBy?: User;
  resolvedBy?: User;
  created_at: string;
  updated_at: string;
}

export interface ProjectFollower {
  id: number;
  project_id: number;
  user_id: number;
  notification_preferences?: Record<string, boolean>;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface TimelineData {
  milestones: ProjectMilestone[];
  links: Array<{
    source: number;
    target: number;
    type: string;
  }>;
}

export interface TimelineLink {
  source: number;
  target: number;
  type: string;
}

// Saved Search Types
export interface SearchFilters {
  search?: string;
  program_id?: string | number;
  department_id?: string | number;
  academic_year?: string;
  semester?: string;
  status?: string;
  is_public?: boolean | null;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SavedSearch {
  id: number;
  user_id: number;
  name: string;
  filters: SearchFilters;
  is_default: boolean;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSavedSearchData {
  name: string;
  filters: SearchFilters;
  is_default?: boolean;
}

export interface UpdateSavedSearchData {
  name?: string;
  filters?: SearchFilters;
  is_default?: boolean;
}

export type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
