import React from 'react';
import { Box, Typography, Chip, SxProps, Theme } from '@mui/material';
import { TVTCLogo } from './TVTCLogo';
import { getAppName, getProjectDescription, getTVTCDisplayName, getCopyrightText } from '@/config/organization';

interface TVTCBrandingProps {
  variant?: 'header' | 'footer' | 'sidebar' | 'card';
  showDescription?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const TVTCBranding: React.FC<TVTCBrandingProps> = ({
  variant = 'header',
  showDescription = false,
  size: _size = 'medium'
}) => {
  const getVariantStyles = (): {
    container: SxProps<Theme>;
    logo: { size: 'small' | 'medium' | 'large'; variant: 'full'; color: 'primary' | 'secondary' | 'inherit' };
    text: { variant: 'body2' | 'h6' | 'h5'; color: string };
  } => {
    switch (variant) {
      case 'footer':
        return {
          container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          } as SxProps<Theme>,
          logo: { size: 'small' as const, variant: 'full' as const, color: 'primary' as const },
          text: { variant: 'body2' as const, color: 'text.secondary' }
        };
      case 'sidebar':
        return {
          container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          } as SxProps<Theme>,
          logo: { size: 'medium' as const, variant: 'full' as const, color: 'primary' as const },
          text: { variant: 'h6' as const, color: 'text.primary' }
        };
      case 'card':
        return {
          container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 2,
          } as SxProps<Theme>,
          logo: { size: 'large' as const, variant: 'full' as const, color: 'inherit' as const },
          text: { variant: 'h5' as const, color: 'inherit' }
        };
      default: // header
        return {
          container: {
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          } as SxProps<Theme>,
          logo: { size: 'medium' as const, variant: 'full' as const, color: 'primary' as const },
          text: { variant: 'h6' as const, color: 'text.primary' }
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Box sx={styles.container}>
      <TVTCLogo {...styles.logo} />
      
      {variant === 'header' && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            {getAppName('en')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getProjectDescription('en')}
          </Typography>
        </Box>
      )}

      {variant === 'card' && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="h5" color="inherit" sx={{ fontWeight: 600 }}>
            {getAppName('en')}
          </Typography>
          <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
            {getProjectDescription('en')}
          </Typography>
          <Chip 
            label="Powered by TVTC" 
            size="small" 
            sx={{ 
              mt: 1, 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'inherit',
              fontWeight: 500
            }} 
          />
        </Box>
      )}

      {showDescription && variant !== 'card' && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          {getTVTCDisplayName('en')}
        </Typography>
      )}

      {variant === 'footer' && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {getCopyrightText()}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TVTCBranding;
