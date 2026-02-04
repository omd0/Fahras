'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';

interface PortalServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  rating?: number;
  ratingCount?: number;
  onClick?: () => void;
  variant?: 'outlined' | 'filled';
  emphasized?: boolean;
  href?: string;
}

/**
 * PortalServiceCard Component - Outlined Service Card with Icon Badge
 *
 * Features:
 * - Thin teal border (1.5-2px solid #18B3A8)
 * - No shadow - border is separator
 * - Centered emblem/icon in soft circular badge (secondary.050 bg)
 * - Centered title (2 lines max), weight 600-700
 * - Rating row with stars in primary.500
 * - 14px border radius
 * - Hover: lift animation (translateY -1px)
 * - RTL-compatible
 *
 * Migrated from web/src/components/shared/PortalServiceCard.tsx
 */
export const PortalServiceCard: React.FC<PortalServiceCardProps> = ({
  icon,
  title,
  description,
  rating,
  ratingCount,
  onClick,
  variant = 'outlined',
  emphasized = false,
  href,
}) => {
  const theme = useTheme();

  const cardComponent = (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '14px',
        boxShadow: variant === 'filled' ? theme.shadows[1] : 'none',
        border:
          variant === 'outlined'
            ? `2px solid ${theme.palette.primary.main}`
            : `1px solid ${theme.palette.divider}`,
        backgroundColor:
          variant === 'filled'
            ? theme.palette.background.paper
            : theme.palette.background.default,
        transition: 'all 0.2s ease-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          borderColor:
            variant === 'outlined'
              ? theme.palette.primary.main
              : theme.palette.divider,
          boxShadow:
            variant === 'filled' ? theme.shadows[2] : undefined,
        },
        '&:focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
      }}
    >
      <CardContent
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2.5, sm: 3 },
        }}
      >
        {/* Icon Badge */}
        <Box
          sx={{
            width: { xs: 64, sm: 80 },
            height: { xs: 64, sm: 80 },
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.secondary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            fontSize: { xs: 32, sm: 40 },
            color: theme.palette.primary.main,
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          component="h3"
          variant="h5"
          sx={{
            fontWeight: emphasized ? 700 : 600,
            color: theme.palette.text.primary,
            fontSize: { xs: '16px', sm: '18px' },
            lineHeight: 1.3,
            mb: description || rating !== undefined ? 0.75 : 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '13px', sm: '14px' },
              lineHeight: 1.4,
              mb: rating !== undefined ? 1 : 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </Typography>
        )}

        {/* Rating */}
        {rating !== undefined && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.5}
            sx={{ mt: 1 }}
          >
            <Rating
              value={rating}
              readOnly
              size="small"
              sx={{
                color: theme.palette.primary.main,
                '& .MuiRating-icon': {
                  fontSize: { xs: '18px', sm: '20px' },
                },
              }}
            />
            {ratingCount !== undefined && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '12px' }}
              >
                ({ratingCount})
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  return href ? (
    <Box
      component="a"
      href={href}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        height: '100%',
      }}
    >
      {cardComponent}
    </Box>
  ) : (
    cardComponent
  );
};

export default PortalServiceCard;
