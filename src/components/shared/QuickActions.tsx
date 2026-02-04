'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, Button } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { designTokens } from '@/styles/designTokens';

export interface QuickAction {
  label: string;
  icon: SvgIconComponent;
  onClick: () => void;
  variant?: 'contained' | 'outlined';
  gradient?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

/**
 * QuickActions Component - Action buttons card
 *
 * Features:
 * - Primary border with pill-shaped buttons
 * - Contained and outlined button variants
 * - Flexible action configuration
 *
 * Migrated from web/src/components/shared/QuickActions.tsx
 */
export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <Card
      sx={{
        mb: 4,
        border: `2px solid ${designTokens.colors.primary[500]}`,
        boxShadow: 'none',
        borderRadius: designTokens.radii.card,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          borderColor: designTokens.colors.primary[600],
        },
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {(actions || []).map((action, index) => {
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
                        borderColor: designTokens.colors.primary[500],
                        color: designTokens.colors.primary[500],
                        borderRadius: designTokens.radii.pill,
                        '&:hover': {
                          borderColor: designTokens.colors.primary[600],
                          background: `${designTokens.colors.primary[500]}10`,
                        },
                      }
                    : {
                        background: designTokens.colors.primary[500],
                        borderRadius: designTokens.radii.pill,
                        '&:hover': {
                          background: designTokens.colors.primary[600],
                          transform: 'translateY(-1px)',
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

export default QuickActions;
