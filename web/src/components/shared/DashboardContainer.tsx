import React from 'react';
import { Box, Container } from '@mui/material';
import { DashboardTheme } from '@/config/dashboardThemes';
import { designTokens } from '@/styles/designTokens';

interface DashboardContainerProps {
  theme: DashboardTheme;
  children: React.ReactNode;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ theme, children }) => {
  return (
    <Box
      sx={{
        background: designTokens.colors.surface[50],
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

