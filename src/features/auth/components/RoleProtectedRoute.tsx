'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  restrictedRoles?: string[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  restrictedRoles = [],
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles.length > 0) {
      const hasAllowedRole = user?.roles?.some((role) => allowedRoles.includes(role.name));
      if (!hasAllowedRole) {
        router.replace('/dashboard');
        return;
      }
    }

    if (restrictedRoles.length > 0) {
      const hasRestrictedRole = user?.roles?.some((role) => restrictedRoles.includes(role.name));
      if (hasRestrictedRole) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, allowedRoles, restrictedRoles, router, pathname]);

  if (!isAuthenticated) return null;

  if (allowedRoles.length > 0) {
    const hasAllowedRole = user?.roles?.some((role) => allowedRoles.includes(role.name));
    if (!hasAllowedRole) return null;
  }

  if (restrictedRoles.length > 0) {
    const hasRestrictedRole = user?.roles?.some((role) => restrictedRoles.includes(role.name));
    if (hasRestrictedRole) return null;
  }

  return <>{children}</>;
};
