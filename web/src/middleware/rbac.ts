/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides permission and role checking utilities for the Next.js application
 * Mirrors Laravel App\Services\PermissionService logic
 */

import { PermissionCode, PermissionScope } from '@/constants/permissions';

export interface RBACUser {
  id: number;
  email: string;
  fullName: string;
  roles?: RBACRole[];
  permissions?: RBACPermission[];
}

export interface RBACRole {
  id: number;
  name: string;
  description?: string;
}

export interface RBACPermission {
  id: number;
  code: PermissionCode;
  category?: string;
  scope?: PermissionScope;
}

/**
 * Check if user has a specific permission with optional scope
 * @param user - User object with roles and permissions
 * @param code - Permission code to check
 * @param scope - Optional scope to check (defaults to 'all')
 * @returns true if user has the permission
 */
export function checkPermission(
  user: RBACUser | null | undefined,
  code: PermissionCode,
  scope: PermissionScope = PermissionScope.ALL
): boolean {
  if (!user?.permissions) {
    return false;
  }

  return user.permissions.some(
    (perm) =>
      perm.code === code &&
      (!perm.scope || perm.scope === PermissionScope.ALL || perm.scope === scope)
  );
}

/**
 * Check if user has a specific role
 * @param user - User object with roles
 * @param roleName - Role name to check (case-insensitive)
 * @returns true if user has the role
 */
export function checkRole(user: RBACUser | null | undefined, roleName: string): boolean {
  if (!user?.roles) {
    return false;
  }

  const lowerRoleName = roleName.toLowerCase();
  return user.roles.some((role) => role.name.toLowerCase() === lowerRoleName);
}

/**
 * Check if user is an admin
 * @param user - User object with roles
 * @returns true if user has admin role
 */
export function isAdmin(user: RBACUser | null | undefined): boolean {
  return checkRole(user, 'admin');
}

/**
 * Check if user is faculty
 * @param user - User object with roles
 * @returns true if user has faculty role
 */
export function isFaculty(user: RBACUser | null | undefined): boolean {
  return checkRole(user, 'faculty');
}

/**
 * Check if user is a student
 * @param user - User object with roles
 * @returns true if user has student role
 */
export function isStudent(user: RBACUser | null | undefined): boolean {
  return checkRole(user, 'student');
}

/**
 * Check if user is a reviewer
 * @param user - User object with roles
 * @returns true if user has reviewer role
 */
export function isReviewer(user: RBACUser | null | undefined): boolean {
  return checkRole(user, 'reviewer');
}

/**
 * Get the scope of a permission for a user
 * @param user - User object with permissions
 * @param code - Permission code
 * @returns The scope of the permission, or null if user doesn't have it
 */
export function getPermissionScope(
  user: RBACUser | null | undefined,
  code: PermissionCode
): PermissionScope | null {
  if (!user?.permissions) {
    return null;
  }

  const permission = user.permissions.find((perm) => perm.code === code);
  return permission?.scope ?? null;
}

/**
 * Filter items based on user's permission scope
 * Useful for filtering projects, users, etc. based on department/own scope
 * @param user - User object with permissions
 * @param items - Array of items to filter
 * @param scopeField - Field name that contains the scope identifier (e.g., 'departmentId', 'userId')
 * @param code - Permission code to check
 * @returns Filtered array of items
 */
export function filterByScope<T extends Record<string, unknown>>(
  user: RBACUser | null | undefined,
  items: T[],
  scopeField: keyof T,
  code: PermissionCode
): T[] {
  if (!user) {
    return [];
  }

  const scope = getPermissionScope(user, code);

  if (!scope || scope === PermissionScope.ALL) {
    return items;
  }

  if (scope === PermissionScope.OWN) {
    return items.filter((item) => item[scopeField] === user.id);
  }

  if (scope === PermissionScope.DEPARTMENT) {
    return items.filter((item) => item[scopeField] === user.id);
  }

  return [];
}
