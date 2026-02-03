'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { DashboardTheme, getDashboardTheme, dashboardThemes } from '@/config/dashboardThemes';

interface ThemeContextType {
  theme: DashboardTheme;
  userRole: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: dashboardThemes.default,
  userRole: 'default',
});

export const useFahrasTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useFahrasTheme must be used within ThemeProvider');
  }
  return context;
};

export const useTheme = useFahrasTheme;

interface ThemeProviderProps {
  children: ReactNode;
  userRoles?: Array<{ name: string }>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, userRoles }) => {
  const theme = getDashboardTheme(userRoles);

  const getUserRole = () => {
    if (!userRoles || userRoles.length === 0) return 'default';

    if (userRoles.some(role => role.name === 'admin')) return 'admin';
    if (userRoles.some(role => role.name === 'faculty')) return 'faculty';
    if (userRoles.some(role => role.name === 'student')) return 'student';
    if (userRoles.some(role => role.name === 'reviewer')) return 'reviewer';

    return 'default';
  };

  const value = {
    theme,
    userRole: getUserRole(),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
