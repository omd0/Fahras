import React from 'react';
import { Card, CardContent, alpha, SxProps, Theme } from '@mui/material';
import { designTokens } from '@/styles/designTokens';

export interface BasePortalCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'outlined' | 'filled';
  ariaLabel?: string;
  tabIndex?: number;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

/**
 * BasePortalCard - Foundation for all Portal Service Cards
 *
 * Based on design.toon Portal Service Card (Outlined) pattern:
 * - 2px solid teal border (#18B3A8)
 * - 14px border radius
 * - No shadow (border is the separator)
 * - Hover: -1px translateY, border deepens to deep green
 * - Focus: 3px solid green outline with 2px offset
 * - Centered flexbox layout
 * - Keyboard navigation (Enter/Space)
 */
export const BasePortalCard: React.FC<BasePortalCardProps> = ({
  children,
  onClick,
  href,
  variant = 'outlined',
  ariaLabel,
  tabIndex = 0,
  sx,
  contentSx,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  const cardComponent = href ? 'a' : 'div';

  return (
    <Card
      component={cardComponent}
      href={href}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick || href ? tabIndex : undefined}
      role={onClick || href ? 'button' : undefined}
      aria-label={ariaLabel}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick || href ? 'pointer' : 'default',
        borderRadius: designTokens.radii.card,
        textDecoration: 'none',
        color: 'inherit',

        // Variant styles
        ...(variant === 'outlined' && {
          boxShadow: designTokens.shadows.none,
          border: `2px solid ${designTokens.colors.primary[500]}`,
          backgroundColor: '#FFFFFF',
        }),

        ...(variant === 'filled' && {
          boxShadow: designTokens.shadows.elevation1,
          border: `1px solid ${alpha(designTokens.colors.border[200], 0.5)}`,
          backgroundColor: '#FFFFFF',
        }),

        // Transitions
        transition: designTokens.transitions.hover,

        // Hover state
        '&:hover': {
          ...(variant === 'outlined' && {
            transform: 'translateY(-1px)',
            borderColor: designTokens.colors.primary[600],
          }),
          ...(variant === 'filled' && {
            transform: 'translateY(-1px)',
            boxShadow: designTokens.shadows.elevation2,
          }),
        },

        // Active state (pressed)
        '&:active': {
          transform: 'translateY(0)',
          transition: designTokens.transitions.micro,
        },

        // Focus states
        '&:focus': {
          outline: `3px solid ${designTokens.colors.primary[600]}`,
          outlineOffset: '2px',
        },
        '&:focus:not(:focus-visible)': {
          outline: 'none',
        },
        '&:focus-visible': {
          outline: `3px solid ${designTokens.colors.primary[600]}`,
          outlineOffset: '2px',
        },

        // Custom overrides
        ...sx,
      }}
    >
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'center',
          padding: { xs: 2.5, sm: 3 },
          '&:last-child': {
            paddingBottom: { xs: 2.5, sm: 3 },
          },
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default BasePortalCard;
