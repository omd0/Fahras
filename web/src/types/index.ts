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
  program_id: number;
  created_by_user_id: number;
  title: string;
  abstract: string;
  keywords: string[];
  academic_year: string;
  semester: 'fall' | 'spring' | 'summer';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  is_public: boolean;
  doi?: string;
  repo_url?: string;
  program?: Program;
  creator?: User;
  members?: ProjectMember[];
  advisors?: ProjectAdvisor[];
  files?: File[];
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: number;
  full_name: string;
  email: string;
  pivot: {
    role_in_project: 'LEAD' | 'MEMBER';
  };
}

export interface ProjectAdvisor {
  id: number;
  full_name: string;
  email: string;
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
  role: 'student' | 'faculty' | 'admin';
}

export interface CreateProjectData {
  program_id: number;
  title: string;
  abstract: string;
  keywords?: string[];
  academic_year: string;
  semester: 'fall' | 'spring' | 'summer';
  members: Array<{
    user_id: number;
    role: 'LEAD' | 'MEMBER';
  }>;
  advisors?: Array<{
    user_id: number;
    role: 'MAIN' | 'CO_ADVISOR' | 'REVIEWER';
  }>;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
