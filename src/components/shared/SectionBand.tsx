'use client';

import React from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { colorPalette } from '@/styles/theme/colorPalette';

interface SectionBandProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  ctaText?: string;
  ctaAction?: () => void;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  align?: 'left' | 'center' | 'right';
  height?: string;
}

/**
 * SectionBand Component - Deep Teal/Blue Section Divider
 *
 * Features:
 * - Gradient background: linear-gradient(to right, #1F6F8B, #3B7D98)
 * - White text, right-aligned section title
 * - Small emblem icon optional
 * - Outline button on left (white border, white text)
 * - Full-width background with contained content
 * - Serves as visual hierarchy separator
 * - RTL-compatible
 *
 * Migrated from web/src/components/shared/SectionBand.tsx
 */
export const SectionBand: React.FC<SectionBandProps> = ({
  title,
  subtitle,
  icon,
  ctaText,
  ctaAction,
  children,
  variant = 'primary',
  align = 'right',
  height = 'auto',
}) => {
  // Gradient backgrounds
  const gradients = {
    primary: `linear-gradient(to right, ${colorPalette.secondary.dark}, ${colorPalette.secondary.main})`,
    secondary: `linear-gradient(to right, ${colorPalette.primary.main}, ${colorPalette.teal.light})`,
  };

  return (
    <Box
      component="section"
      sx={{
        background: gradients[variant],
        color: 'white',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
        width: '100%',
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'center', md: 'center' }}
          justifyContent="space-between"
          spacing={3}
        >
          {/* Left: CTA Button */}
          {ctaText && ctaAction && (
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Button
                onClick={ctaAction}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: 9999,
                  px: 3,
                  py: 1.25,
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                  transition: 'all 0.2s ease-out',
                }}
              >
                {ctaText}
              </Button>
            </Box>
          )}

          {/* Center/Right: Title Section */}
          <Box
            sx={{
              flex: 1,
              textAlign: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left',
              display: 'flex',
              flexDirection: 'column',
              alignItems: align === 'right'
                ? 'flex-end'
                : align === 'center'
                  ? 'center'
                  : 'flex-start',
            }}
          >
            {/* Icon (optional) */}
            {icon && (
              <Box
                sx={{
                  mb: 1,
                  display: 'flex',
                  justifyContent: align === 'right'
                    ? 'flex-end'
                    : align === 'center'
                      ? 'center'
                      : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    fontSize: 32,
                    color: 'white',
                    opacity: 0.9,
                  }}
                >
                  {icon}
                </Box>
              </Box>
            )}

            {/* Title */}
            <Typography
              component="h2"
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '24px', sm: '28px', md: '32px' },
                lineHeight: 1.2,
                mb: subtitle ? 0.5 : 0,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              {title}
            </Typography>

            {/* Subtitle (optional) */}
            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                  fontSize: { xs: '14px', sm: '16px', md: '18px' },
                  lineHeight: 1.5,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Children content (below title) */}
        {children && (
          <Box sx={{ mt: 3 }}>
            {children}
          </Box>
        )}

        {/* Mobile CTA Button */}
        {ctaText && ctaAction && (
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
            <Button
              onClick={ctaAction}
              fullWidth
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                borderRadius: 9999,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'none',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'white',
                },
                transition: 'all 0.2s ease-out',
              }}
            >
              {ctaText}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SectionBand;
