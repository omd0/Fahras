import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { AdminDashboard } from '@/features/dashboards/components/AdminDashboard';
import { FacultyDashboard } from '@/features/dashboards/components/FacultyDashboard';
import { FacultyHomeDashboard } from '@/features/dashboards/components/FacultyHomeDashboard';
import { StudentDashboard } from '@/features/dashboards/components/StudentDashboard';
import { ReviewerDashboard } from '@/features/dashboards/components/ReviewerDashboard';
import {
  Box,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/providers/LanguageContext';
import { getDashboardTheme } from '@/config/dashboardThemes';
import { Header } from '@/components/layout/Header';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Determine which dashboard to show based on user role
  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return 'student';
    
    // Priority: admin > faculty > student > reviewer
    if (user.roles.some(role => role.name === 'admin')) return 'admin';
    if (user.roles.some(role => role.name === 'faculty')) return 'faculty';
    if (user.roles.some(role => role.name === 'student')) return 'student';
    if (user.roles.some(role => role.name === 'reviewer')) return 'reviewer';
    
    return 'student';
  };

  const userRole = getUserRole();
  
  // Get theme based on user role
  const dashboardTheme = getDashboardTheme(user?.roles);

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'faculty':
        return <FacultyHomeDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'reviewer':
        return <ReviewerDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* Use new two-tier Header */}
      <Header />

      {/* Render role-specific dashboard */}
      {renderDashboard()}
    </Box>
  );
};
