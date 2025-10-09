import React, { createContext, useContext, ReactNode } from 'react';
import { DashboardTheme, getDashboardTheme, dashboardThemes } from '../config/dashboardThemes';
import { useAuthStore } from '../store/authStore';

interface ThemeContextType {
  theme: DashboardTheme;
  userRole: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: dashboardThemes.default,
  userRole: 'default',
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const theme = getDashboardTheme(user?.roles);
  
  // Determine user role for component-specific logic
  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return 'default';
    
    if (user.roles.some(role => role.name === 'admin')) return 'admin';
    if (user.roles.some(role => role.name === 'faculty')) return 'faculty';
    if (user.roles.some(role => role.name === 'student')) return 'student';
    if (user.roles.some(role => role.name === 'reviewer')) return 'reviewer';
    
    return 'default';
  };

  const value = {
    theme,
    userRole: getUserRole(),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

