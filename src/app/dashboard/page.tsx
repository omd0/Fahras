'use client';

import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useAuthStore } from '@/features/auth/store';
import { AdminDashboard } from '@/features/dashboards/components/AdminDashboard';
import { FacultyDashboard } from '@/features/dashboards/components/FacultyDashboard';
import { StudentDashboard } from '@/features/dashboards/components/StudentDashboard';
import { ReviewerDashboard } from '@/features/dashboards/components/ReviewerDashboard';

const getUserRole = (roles?: { name: string }[]): string => {
  if (!roles || roles.length === 0) return 'student';

  if (roles.some((role) => role.name === 'admin')) return 'admin';
  if (roles.some((role) => role.name === 'faculty')) return 'faculty';
  if (roles.some((role) => role.name === 'student')) return 'student';
  if (roles.some((role) => role.name === 'reviewer')) return 'reviewer';

  return 'student';
};

export default function DashboardPage() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const userRole = getUserRole(user?.roles);

  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
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
      {renderDashboard()}
    </Box>
  );
}
