import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

interface EmailVerifiedRouteProps {
  children: React.ReactNode;
}

export const EmailVerifiedRoute: React.FC<EmailVerifiedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.email_verified_at) {
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
