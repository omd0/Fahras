'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';

interface EmailVerifiedRouteProps {
  children: React.ReactNode;
}

export const EmailVerifiedRoute: React.FC<EmailVerifiedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!user?.email_verified_at) {
      router.replace(`/verify-email?email=${encodeURIComponent(user?.email || '')}`);
    }
  }, [isAuthenticated, user, router, pathname]);

  if (!isAuthenticated) return null;
  if (!user?.email_verified_at) return null;

  return <>{children}</>;
};
