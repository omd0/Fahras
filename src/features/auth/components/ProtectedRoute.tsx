'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerified = true,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireVerified && !user?.email_verified_at) {
      router.replace(`/verify-email?email=${encodeURIComponent(user?.email || '')}`);
    }
  }, [isAuthenticated, user, requireVerified, router, pathname]);

  if (!isAuthenticated) return null;
  if (requireVerified && !user?.email_verified_at) return null;

  return <>{children}</>;
};
