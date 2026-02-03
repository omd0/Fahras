import { colorPalette } from '@/styles/theme/colorPalette';

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

const unified: DashboardTheme = {
  primary: colorPalette.primary.main,
  secondary: colorPalette.secondary.main,
  accent: colorPalette.teal.main,
  background: colorPalette.surface.background,
  cardBackground: colorPalette.surface.paper,
  textPrimary: colorPalette.text.primary,
  textSecondary: colorPalette.text.secondary,
  borderColor: colorPalette.border.default,
  gradientStart: colorPalette.neutral[100],
  gradientEnd: colorPalette.neutral[200],
  appBarBackground: colorPalette.primary.main,
  appBarGradient: `linear-gradient(135deg, ${colorPalette.primary.main} 0%, ${colorPalette.primary.dark} 100%)`,
};

export const dashboardThemes: Record<string, DashboardTheme> = {
  admin: unified,
  faculty: unified,
  student: unified,
  reviewer: unified,
  default: unified,
};

export const getDashboardTheme = (): DashboardTheme => {
  return unified;
};

export const getRoleInfo = (role: string, userName?: string, t?: (key: string) => string) => {
  const greeting = t ? t('Welcome') : 'Welcome';

  const roleInfo = {
    admin: {
      title: t ? t('Administrator Dashboard') : 'Administrator Dashboard',
      subtitle: t ? t('Manage projects, users, and system settings') : 'Manage projects, users, and system settings',
      icon: '\u{1F6E1}\uFE0F',
      greeting,
    },
    faculty: {
      title: t ? t('Faculty Dashboard') : 'Faculty Dashboard',
      subtitle: t ? t('Supervise and evaluate student projects') : 'Supervise and evaluate student projects',
      icon: '\u{1F468}\u200D\u{1F3EB}',
      greeting,
    },
    student: {
      title: t ? t('Student Dashboard') : 'Student Dashboard',
      subtitle: t ? t('Create and manage your graduation projects') : 'Create and manage your graduation projects',
      icon: '\u{1F393}',
      greeting,
    },
    reviewer: {
      title: t ? t('Reviewer Dashboard') : 'Reviewer Dashboard',
      subtitle: t ? t('Review and evaluate project submissions') : 'Review and evaluate project submissions',
      icon: '\u{1F4CB}',
      greeting,
    },
  };

  return roleInfo[role as keyof typeof roleInfo] || {
    title: t ? t('Dashboard') : 'Dashboard',
    subtitle: t ? t('Project Management System') : 'Project Management System',
    icon: '\u{1F4CA}',
    greeting,
  };
};
