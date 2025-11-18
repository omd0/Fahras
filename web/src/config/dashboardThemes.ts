/**
 * Dashboard Theme Configuration
 * Defines unique themes and styles for each user role
 */

export interface DashboardTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  gradientStart: string;
  gradientEnd: string;
  appBarBackground: string;
  appBarGradient: string;
}

export const dashboardThemes: Record<string, DashboardTheme> = {
  admin: {
    primary: '#7c3aed', // Purple
    secondary: '#ec4899', // Pink
    accent: '#f59e0b', // Amber
    background: '#faf5ff', // Very light purple
    cardBackground: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    borderColor: '#e9d5ff',
    gradientStart: '#E0E0E0',
    gradientEnd: '#CCCCCC',
    appBarBackground: '#E0E0E0',
    appBarGradient: 'linear-gradient(135deg, #E0E0E0 0%, #CCCCCC 100%)',
  },
  faculty: {
    primary: '#0891b2', // Cyan
    secondary: '#10b981', // Emerald
    accent: '#06b6d4', // Light cyan
    background: '#ecfeff', // Very light cyan
    cardBackground: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    borderColor: '#a5f3fc',
    gradientStart: '#E0E0E0',
    gradientEnd: '#CCCCCC',
    appBarBackground: '#E0E0E0',
    appBarGradient: 'linear-gradient(135deg, #E0E0E0 0%, #CCCCCC 100%)',
  },
  student: {
    primary: '#2563eb', // Blue
    secondary: '#8b5cf6', // Violet
    accent: '#3b82f6', // Light blue
    background: '#eff6ff', // Very light blue
    cardBackground: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    borderColor: '#bfdbfe',
    gradientStart: '#E0E0E0',
    gradientEnd: '#CCCCCC',
    appBarBackground: '#E0E0E0',
    appBarGradient: 'linear-gradient(135deg, #E0E0E0 0%, #CCCCCC 100%)',
  },
  reviewer: {
    primary: '#059669', // Green
    secondary: '#d97706', // Orange
    accent: '#10b981', // Light green
    background: '#f0fdf4', // Very light green
    cardBackground: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    borderColor: '#bbf7d0',
    gradientStart: '#E0E0E0',
    gradientEnd: '#CCCCCC',
    appBarBackground: '#E0E0E0',
    appBarGradient: 'linear-gradient(135deg, #E0E0E0 0%, #CCCCCC 100%)',
  },
  default: {
    primary: '#1e3a8a', // Default TVTC Blue
    secondary: '#059669', // Default TVTC Green
    accent: '#3b82f6',
    background: '#f8fafc',
    cardBackground: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    borderColor: '#e5e7eb',
    gradientStart: '#E0E0E0',
    gradientEnd: '#CCCCCC',
    appBarBackground: '#E0E0E0',
    appBarGradient: 'linear-gradient(135deg, #E0E0E0 0%, #CCCCCC 100%)',
  },
};

/**
 * Get dashboard theme based on user role
 */
export const getDashboardTheme = (roles: Array<{ name: string }> | undefined): DashboardTheme => {
  if (!roles || roles.length === 0) {
    return dashboardThemes.default;
  }

  // Priority order: admin > faculty > student > reviewer
  if (roles.some(role => role.name === 'admin')) {
    return dashboardThemes.admin;
  }
  if (roles.some(role => role.name === 'faculty')) {
    return dashboardThemes.faculty;
  }
  if (roles.some(role => role.name === 'student')) {
    return dashboardThemes.student;
  }
  if (roles.some(role => role.name === 'reviewer')) {
    return dashboardThemes.reviewer;
  }

  return dashboardThemes.default;
};

/**
 * Get role display information
 * @param role - User role string
 * @param userName - Optional user name (not used in greeting)
 * @param t - Optional translation function
 */
export const getRoleInfo = (role: string, userName?: string, t?: (key: string) => string) => {
  // Simple greeting - just "Welcome"
  const greeting = t ? t('Welcome') : 'Welcome';

  const roleInfo = {
    admin: {
      title: t ? t('Administrator Dashboard') : 'Administrator Dashboard',
      subtitle: t ? t('Manage projects, users, and system settings') : 'Manage projects, users, and system settings',
      icon: '🛡️',
      greeting,
    },
    faculty: {
      title: t ? t('Faculty Dashboard') : 'Faculty Dashboard',
      subtitle: t ? t('Supervise and evaluate student projects') : 'Supervise and evaluate student projects',
      icon: '👨‍🏫',
      greeting,
    },
    student: {
      title: t ? t('Student Dashboard') : 'Student Dashboard',
      subtitle: t ? t('Create and manage your graduation projects') : 'Create and manage your graduation projects',
      icon: '🎓',
      greeting,
    },
    reviewer: {
      title: t ? t('Reviewer Dashboard') : 'Reviewer Dashboard',
      subtitle: t ? t('Review and evaluate project submissions') : 'Review and evaluate project submissions',
      icon: '📋',
      greeting,
    },
  };

  return roleInfo[role as keyof typeof roleInfo] || {
    title: t ? t('Dashboard') : 'Dashboard',
    subtitle: t ? t('Project Management System') : 'Project Management System',
    icon: '📊',
    greeting,
  };
};

