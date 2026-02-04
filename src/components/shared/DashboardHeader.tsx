'use client';

import React from 'react';
import { Box, Typography, Paper, Stack, Avatar, useTheme, alpha } from '@mui/material';
import { designTokens } from '@/styles/designTokens';

interface DashboardHeaderProps {
  icon: string;
  greeting: string;
  userName: string;
  subtitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  icon,
  greeting,
  userName,
  subtitle,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: 4,
        borderRadius: 4,
        background: designTokens.colors.primary[500],
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(50px, -50px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          transform: 'translate(-30px, 30px)',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={3}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)',
            fontSize: 36,
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: 'white',
            }}
          >
            {greeting}, {userName?.split(' ')[0] || 'User'}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              fontWeight: 400,
              color: alpha(theme.palette.common.white, 0.9),
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
