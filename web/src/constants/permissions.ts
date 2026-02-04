/**
 * Permission Codes and Categories
 * Mirrors Laravel App\Constants\Permissions and Database\Seeders\PermissionSeeder
 */

export enum PermissionCategory {
  PROJECTS = 'Projects',
  USERS = 'Users',
  FILES = 'Files',
  ANALYTICS = 'Analytics',
  SETTINGS = 'Settings',
  SYSTEM = 'System',
  ROLES = 'Roles',
}

export enum PermissionScope {
  ALL = 'all',
  DEPARTMENT = 'department',
  OWN = 'own',
  NONE = 'none',
}

export const PERMISSIONS = {
  // User management permissions
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Project permissions
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_READ: 'projects.read',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_APPROVE: 'projects.approve',

  // File permissions
  FILES_UPLOAD: 'files.upload',
  FILES_DOWNLOAD: 'files.download',
  FILES_DELETE: 'files.delete',

  // System permissions
  SYSTEM_ADMIN: 'system.admin',
} as const;

export const PERMISSION_CODES = [
  'users.create',
  'users.read',
  'users.update',
  'users.delete',
  'projects.create',
  'projects.read',
  'projects.update',
  'projects.delete',
  'projects.approve',
  'files.upload',
  'files.download',
  'files.delete',
  'system.admin',
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export const PERMISSION_DESCRIPTIONS: Record<PermissionCode, string> = {
  'users.create': 'Create users',
  'users.read': 'View users',
  'users.update': 'Update users',
  'users.delete': 'Delete users',
  'projects.create': 'Create projects',
  'projects.read': 'View projects',
  'projects.update': 'Update projects',
  'projects.delete': 'Delete projects',
  'projects.approve': 'Approve projects',
  'files.upload': 'Upload files',
  'files.download': 'Download files',
  'files.delete': 'Delete files',
  'system.admin': 'System administration',
};

export const PERMISSION_CATEGORIES: Record<PermissionCode, PermissionCategory> = {
  'users.create': PermissionCategory.USERS,
  'users.read': PermissionCategory.USERS,
  'users.update': PermissionCategory.USERS,
  'users.delete': PermissionCategory.USERS,
  'projects.create': PermissionCategory.PROJECTS,
  'projects.read': PermissionCategory.PROJECTS,
  'projects.update': PermissionCategory.PROJECTS,
  'projects.delete': PermissionCategory.PROJECTS,
  'projects.approve': PermissionCategory.PROJECTS,
  'files.upload': PermissionCategory.FILES,
  'files.download': PermissionCategory.FILES,
  'files.delete': PermissionCategory.FILES,
  'system.admin': PermissionCategory.SYSTEM,
};

/**
 * Check if a permission code is valid
 */
export function isValidPermissionCode(code: unknown): code is PermissionCode {
  return PERMISSION_CODES.includes(code as PermissionCode);
}

/**
 * Get permission category
 */
export function getPermissionCategory(code: PermissionCode): PermissionCategory {
  return PERMISSION_CATEGORIES[code];
}

/**
 * Get permission description
 */
export function getPermissionDescription(code: PermissionCode): string {
  return PERMISSION_DESCRIPTIONS[code];
}
