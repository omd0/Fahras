import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface StatsCardProps {
  value: number;
  label: string;
  icon: SvgIconComponent;
  gradient: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  icon: Icon,
  gradient,
}) => {
  return (
    <Card
      sx={{
        background: gradient,
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'white !important' }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, color: 'white !important' }}>
              {label}
            </Typography>
          </Box>
          <Icon sx={{ fontSize: 48, opacity: 0.7 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

