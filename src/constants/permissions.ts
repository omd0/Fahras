export const PERMISSIONS = {
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_READ: 'projects.read',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_APPROVE: 'projects.approve',
  
  FILES_UPLOAD: 'files.upload',
  FILES_DOWNLOAD: 'files.download',
  FILES_DELETE: 'files.delete',
  
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

export type PermissionCode = typeof PERMISSION_CODES[number];

export enum PermissionCategory {
  USERS = 'users',
  PROJECTS = 'projects',
  FILES = 'files',
  SYSTEM = 'system',
}

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

export function getPermissionCategory(code: PermissionCode): PermissionCategory {
  const prefix = code.split('.')[0];
  return prefix as PermissionCategory;
}
