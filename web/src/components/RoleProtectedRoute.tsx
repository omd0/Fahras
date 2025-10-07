import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  restrictedRoles?: string[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  restrictedRoles = [] 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has any of the allowed roles
  if (allowedRoles.length > 0) {
    const hasAllowedRole = user?.roles?.some(role => allowedRoles.includes(role.name));
    if (!hasAllowedRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if user has any of the restricted roles
  if (restrictedRoles.length > 0) {
    const hasRestrictedRole = user?.roles?.some(role => restrictedRoles.includes(role.name));
    if (hasRestrictedRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
