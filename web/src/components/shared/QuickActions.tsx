import React from 'react';
import { Card, CardContent, Box, Typography, Button } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { DashboardTheme } from '@/config/dashboardThemes';

export interface QuickAction {
  label: string;
  icon: SvgIconComponent;
  onClick: () => void;
  variant?: 'contained' | 'outlined';
  gradient?: string;
}

interface QuickActionsProps {
  theme: DashboardTheme;
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ theme, actions }) => {
  return (
    <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                startIcon={<Icon />}
                onClick={action.onClick}
                sx={
                  action.variant === 'outlined'
                    ? {
                        borderColor: theme.primary,
                        color: theme.primary,
                        '&:hover': {
                          borderColor: theme.primary,
                          background: `${theme.primary}10`,
                        },
                      }
                    : {
                        background: action.gradient || theme.appBarGradient,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease',
                      }
                }
              >
                {action.label}
              </Button>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

