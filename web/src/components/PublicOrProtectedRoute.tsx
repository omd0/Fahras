import React from 'react';
import { useAuthStore } from '../store/authStore';

interface PublicOrProtectedRouteProps {
  children: React.ReactNode;
  publicComponent?: React.ComponentType<any>;
  protectedComponent?: React.ComponentType<any>;
}

/**
 * Route component that allows both authenticated and unauthenticated users.
 * Renders different components based on authentication status if provided,
 * otherwise renders the same component for all users.
 */
export const PublicOrProtectedRoute: React.FC<PublicOrProtectedRouteProps> = ({ 
  children, 
  publicComponent: PublicComponent,
  protectedComponent: ProtectedComponent 
}) => {
  const { isAuthenticated } = useAuthStore();

  // If specific components are provided for public/protected, use them
  if (PublicComponent && ProtectedComponent) {
    return isAuthenticated ? <ProtectedComponent /> : <PublicComponent />;
  }

  // Otherwise, render the same component for all users
  return <>{children}</>;
};
