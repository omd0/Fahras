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
    gradientStart: '#7c3aed',
    gradientEnd: '#ec4899',
    appBarBackground: '#7c3aed',
    appBarGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
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
    gradientStart: '#0891b2',
    gradientEnd: '#06b6d4',
    appBarBackground: '#0891b2',
    appBarGradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
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
    gradientStart: '#2563eb',
    gradientEnd: '#8b5cf6',
    appBarBackground: '#2563eb',
    appBarGradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
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
    gradientStart: '#059669',
    gradientEnd: '#10b981',
    appBarBackground: '#059669',
    appBarGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
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
    gradientStart: '#1e3a8a',
    gradientEnd: '#3b82f6',
    appBarBackground: '#1e3a8a',
    appBarGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
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
 */
export const getRoleInfo = (role: string) => {
  const roleInfo = {
    admin: {
      title: 'Administrator Dashboard',
      subtitle: 'Manage projects, users, and system settings',
      icon: '🛡️',
      greeting: 'Welcome back, Administrator',
    },
    faculty: {
      title: 'Faculty Dashboard',
      subtitle: 'Supervise and evaluate student projects',
      icon: '👨‍🏫',
      greeting: 'Welcome, Professor',
    },
    student: {
      title: 'Student Dashboard',
      subtitle: 'Create and manage your graduation projects',
      icon: '🎓',
      greeting: 'Welcome, Student',
    },
    reviewer: {
      title: 'Reviewer Dashboard',
      subtitle: 'Review and evaluate project submissions',
      icon: '📋',
      greeting: 'Welcome, Reviewer',
    },
  };

  return roleInfo[role as keyof typeof roleInfo] || {
    title: 'Dashboard',
    subtitle: 'Project Management System',
    icon: '📊',
    greeting: 'Welcome',
  };
};

