import React from 'react';
import { Box, Typography } from '@mui/material';
import { DashboardTheme } from '../../config/dashboardThemes';

interface DashboardHeaderProps {
  theme: DashboardTheme;
  icon: string;
  greeting: string;
  userName: string;
  subtitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  theme,
  icon,
  greeting,
  userName,
  subtitle,
}) => {
  return (
    <Box
      sx={{
        background: theme.appBarGradient,
        borderRadius: 3,
        p: 4,
        mb: 4,
        color: 'white',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
        {icon} {greeting}
      </Typography>
      <Typography variant="h5" sx={{ opacity: 0.9, color: 'white' }}>
        {userName}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1, opacity: 0.8, color: 'white' }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

