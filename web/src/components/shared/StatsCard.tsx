import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface StatsCardProps {
  value: number;
  label: string;
  icon: SvgIconComponent;
  gradient: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  icon: Icon,
  gradient,
  onClick,
  clickable = false,
}) => {
  return (
    <Card
      sx={{
        background: gradient,
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': clickable ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        } : {},
      }}
      onClick={clickable ? onClick : undefined}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
              {label}
            </Typography>
          </Box>
          <Icon sx={{ fontSize: 48, opacity: 0.7 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

