'use client';

import React from 'react';
import { Container, Box, useTheme } from '@mui/material';

interface DashboardContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  maxWidth = 'lg',
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        py: 4,
      }}
    >
      <Container maxWidth={maxWidth}>{children}</Container>
    </Box>
  );
};
