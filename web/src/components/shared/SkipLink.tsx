import React from 'react';
import { Box, Link } from '@mui/material';

interface SkipLinkProps {
  href?: string;
  children: React.ReactNode;
}

/**
 * Skip navigation link for keyboard users
 * Allows users to skip repetitive navigation and jump directly to main content
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ 
  href = '#main-content', 
  children 
}) => {
  return (
    <Link
      href={href}
      sx={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        '&:focus': {
          position: 'fixed',
          top: 0,
          left: 0,
          width: 'auto',
          height: 'auto',
          overflow: 'visible',
          zIndex: 9999,
          padding: 2,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          borderRadius: '0 0 4px 0',
          boxShadow: 3,
          fontWeight: 600,
        },
      }}
    >
      {children}
    </Link>
  );
};

/**
 * Skip navigation container - includes multiple skip links
 */
export const SkipNavigation: React.FC = () => {
  return (
    <Box component="nav" aria-label="Skip navigation">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
    </Box>
  );
};
