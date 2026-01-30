import React, { createContext, useContext, ReactNode } from 'react';
import { DashboardTheme, getDashboardTheme, dashboardThemes } from '@/config/dashboardThemes';
import { useAuthStore } from '@/features/auth/store';

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
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const theme = getDashboardTheme(user?.roles);
  
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
