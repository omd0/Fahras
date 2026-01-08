import React from 'react';
import { Box, Typography } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

interface TVTCLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'full' | 'icon' | 'text';
  color?: 'primary' | 'secondary' | 'inherit';
  sx?: any;
}

export const TVTCLogo: React.FC<TVTCLogoProps> = ({ 
  size = 'medium', 
  variant = 'full',
  color = 'primary',
  sx = {}
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: 16, iconSize: 20 };
      case 'large':
        return { fontSize: 32, iconSize: 40 };
      default:
        return { fontSize: 24, iconSize: 30 };
    }
  };

  const { fontSize: _fontSize, iconSize } = getSizeStyles();

  const getColorStyles = () => {
    switch (color) {
      case 'secondary':
        return { color: 'secondary.main' };
      case 'inherit':
        return { color: 'inherit' };
      default:
        return { color: 'primary.main' };
    }
  };

  const colorStyles = getColorStyles();

  if (variant === 'icon') {
    return (
      <SchoolIcon 
        sx={{ 
          fontSize: iconSize, 
          ...colorStyles,
          ...sx 
        }} 
      />
    );
  }

  if (variant === 'text') {
    return (
      <Typography 
        variant={size === 'large' ? 'h4' : size === 'small' ? 'h6' : 'h5'}
        sx={{ 
          fontWeight: 700,
          ...colorStyles,
          ...sx 
        }}
      >
        TVTC
      </Typography>
    );
  }

  // Full variant with icon and text
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        ...sx 
      }}
    >
      <SchoolIcon 
        sx={{ 
          fontSize: iconSize, 
          mr: 1,
          ...colorStyles
        }} 
      />
      <Typography 
        variant={size === 'large' ? 'h4' : size === 'small' ? 'h6' : 'h5'}
        sx={{ 
          fontWeight: 700,
          ...colorStyles
        }}
      >
        TVTC
      </Typography>
    </Box>
  );
};

export default TVTCLogo;
