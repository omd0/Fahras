import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { BasePortalCard } from './BasePortalCard';
import { designTokens } from '@/styles/designTokens';

interface StatsCardProps {
  value: number;
  label: string;
  icon: SvgIconComponent;
  gradient?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  icon: Icon,
}) => {
  return (
    <BasePortalCard>
      {/* Icon Badge */}
      <Box
        sx={{
          width: { xs: designTokens.iconBadge.large.width, sm: '96px' },
          height: { xs: designTokens.iconBadge.large.height, sm: '96px' },
          borderRadius: designTokens.radii.circle,
          backgroundColor: alpha(designTokens.colors.secondary[50], 0.8),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Icon
          sx={{
            fontSize: { xs: '40px', sm: '48px' },
            color: designTokens.colors.primary[500],
          }}
        />
      </Box>

      {/* Value */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: designTokens.colors.text.primary,
          mb: 0.5,
          fontSize: { xs: '2rem', sm: '2.5rem' },
        }}
      >
        {value}
      </Typography>

      {/* Label */}
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '14px', sm: '15px' },
          color: designTokens.colors.text.secondary,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
    </BasePortalCard>
  );
};
