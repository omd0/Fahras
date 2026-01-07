import React from 'react';
import { Box, Typography, useTheme, Divider } from '@mui/material';
import { getTVTCDisplayName } from '@/config/organization';

interface HeaderLogoProps {
  variant?: 'header' | 'footer';
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ variant = 'header' }) => {
  const theme = useTheme();
  const isHeader = variant === 'header';

  // Header styles: clean, prominent with shadow
  const headerStyles = {
    bgcolor: 'background.paper',
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    boxShadow: theme.shadows[2],
  };

  // Footer styles: subtle, distinct background
  const footerStyles = {
    bgcolor: theme.palette.mode === 'dark' 
      ? theme.palette.grey[900] 
      : theme.palette.grey[50],
    borderTop: `2px solid ${theme.palette.divider}`,
  };

  const currentStyles = isHeader ? headerStyles : footerStyles;

  return (
    <Box
      component={isHeader ? 'header' : 'footer'}
      sx={{
        width: '100%',
        py: { xs: 2, sm: 2.5, md: 3 },
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        justifyContent: 'center',
        ...currentStyles,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'center' },
          gap: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Organization Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
            flex: { md: 1 },
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              lineHeight: 1.3,
              mb: 0.5,
            }}
            dir="rtl"
          >
            {getTVTCDisplayName('ar')}
          </Typography>
          <Typography
            component="p"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              lineHeight: 1.4,
            }}
            dir="ltr"
          >
            {getTVTCDisplayName('en')}
          </Typography>
        </Box>

        {/* Vertical Divider - only on desktop and for header */}
        {isHeader && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: 'none', md: 'block' },
              borderColor: theme.palette.divider,
              borderWidth: 1,
            }}
          />
        )}

        {/* College Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-end' },
            textAlign: { xs: 'center', md: 'right' },
            flex: { md: 1 },
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
              lineHeight: 1.3,
              mb: 0.5,
            }}
            dir="rtl"
          >
            الكلية التقنية للاتصالات والمعلومات بالرياض
          </Typography>
          <Typography
            component="p"
            sx={{
              fontWeight: 400,
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
              lineHeight: 1.4,
            }}
            dir="ltr"
          >
            Technical College of Telecommunications and Information in Riyadh
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HeaderLogo;

