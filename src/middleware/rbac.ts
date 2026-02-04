import type { PermissionCode } from '@/constants/permissions';

export enum PermissionScope {
  ALL = 'all',
  DEPARTMENT = 'department',
  OWN = 'own',
  NONE = 'none',
}

export interface RBACUser {
  id: number;
  roles?: RBACRole[];
  permissions?: RBACPermission[];
}

export interface RBACRole {
  id: number;
  name: string;
  description?: string;
}

export interface RBACPermission {
  code: string;
  category: string;
  scope?: PermissionScope;
}

export function checkPermission(
  user: RBACUser | null | undefined,
  code: PermissionCode,
  scope?: PermissionScope
): boolean {
  if (!user || !user.permissions) return false;

  const permission = user.permissions.find((p) => p.code === code);
  if (!permission) return false;

  if (!scope) return true;

  const permissionScope = permission.scope || PermissionScope.ALL;
  
  if (permissionScope === PermissionScope.ALL) return true;
  if (permissionScope === PermissionScope.NONE) return false;
  
  return permissionScope === scope;
}

export function checkRole(
  user: RBACUser | null | undefined,
  roleName: string
): boolean {
  if (!user || !user.roles) return false;
  
  return user.roles.some(
    (role) => role.name.toLowerCase() === roleName.toLowerCase()
  );
}

export function isAdmin(user: RBACUser | null | undefined): boolean {
  return checkRole(user, 'admin');
}

export function isFaculty(user: RBACUser | null | undefined): boolean {
  return checkRole(user, 'faculty');
}

export function isStudent(user: RBACUser | null | undefined): boolean {
  return checkRole(user, 'student');
}

export function isReviewer(user: RBACUser | null | undefined): boolean {
  return checkRole(user, 'reviewer');
}

export function getPermissionScope(
  user: RBACUser | null | undefined,
  code: PermissionCode
): PermissionScope | null {
  if (!user || !user.permissions) return null;

  const permission = user.permissions.find((p) => p.code === code);
  return permission?.scope || null;
}

export function filterByScope<T extends Record<string, unknown>>(
  user: RBACUser | null | undefined,
  items: T[],
  scopeField: keyof T,
  code: PermissionCode
): T[] {
  const scope = getPermissionScope(user, code);
  
  if (!scope || scope === PermissionScope.ALL) {
    return items;
  }
  
  if (scope === PermissionScope.NONE) {
    return [];
  }
  
  if (scope === PermissionScope.OWN && user) {
    return items.filter((item) => item[scopeField] === user.id);
  }
  
  if (scope === PermissionScope.DEPARTMENT && user) {
    return items.filter((item) => {
      const itemDeptId = item.departmentId || item.department_id;
      const userDeptId = (user as unknown as Record<string, unknown>).departmentId || 
                         (user as unknown as Record<string, unknown>).department_id;
      return itemDeptId === userDeptId;
    });
  }
  
  return items;
}
