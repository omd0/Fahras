import React from 'react';
import { Box, Container } from '@mui/material';
import { DashboardTheme } from '@/config/dashboardThemes';

interface DashboardContainerProps {
  theme: DashboardTheme;
  children: React.ReactNode;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ theme, children }) => {
  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.gradientStart}15 0%, ${theme.gradientEnd}15 100%)`,
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

