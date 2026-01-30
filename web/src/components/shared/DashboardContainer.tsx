import React from 'react';
import { Box, Container } from '@mui/material';
import { designTokens } from '@/styles/designTokens';

interface DashboardContainerProps {
  children: React.ReactNode;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ children }) => {
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

