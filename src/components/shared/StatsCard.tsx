'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, Stack, Avatar, useTheme, alpha } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { designTokens } from '@/styles/designTokens';

interface StatsCardProps {
  value: number;
  label: string;
  icon: SvgIconComponent;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ value, label, icon: Icon, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 4,
        background: designTokens.colors.primary[500],
        color: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick
          ? {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
            }
          : undefined,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: 'white' }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500, color: 'white' }}>
              {label}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon sx={{ fontSize: 30 }} />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};
