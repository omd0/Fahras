import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerified = true
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVerified && !user?.email_verified_at) {
    // Redirect to verification page if email is not verified
    return (
      <Navigate
        to={`/verify-email?email=${encodeURIComponent(user?.email || '')}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};
