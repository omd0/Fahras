import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { DashboardTheme } from '@/config/dashboardThemes';

interface ActionIcon {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}

interface DashboardHeaderProps {
  theme: DashboardTheme;
  icon: string;
  greeting: string;
  userName: string;
  subtitle: string;
  actionIcons?: ActionIcon[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  theme,
  icon,
  greeting,
  userName,
  subtitle,
  actionIcons = [],
}) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        color: 'white',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        position: 'relative',
      }}
    >
      {actionIcons.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            gap: 1,
          }}
        >
          {actionIcons.map((actionIcon, index) => (
            <Tooltip key={index} title={actionIcon.tooltip}>
              <IconButton
                onClick={actionIcon.onClick}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {actionIcon.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      )}
      
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white !important' }}>
        {icon} {greeting}
      </Typography>
      <Typography variant="h5" sx={{ opacity: 0.9, color: 'white !important' }}>
        {userName}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1, opacity: 0.8, color: 'white !important' }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

