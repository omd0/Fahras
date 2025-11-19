import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface HeaderLogoProps {
  variant?: 'header' | 'footer';
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ variant = 'header' }) => {
  const theme = useTheme();
  const isFooter = variant === 'footer';

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        ...(isFooter 
          ? { borderTop: `1.5px solid ${theme.palette.primary.main}` }
          : { borderBottom: `1.5px solid ${theme.palette.primary.main}`, boxShadow: theme.shadows[1] }
        ),
        py: { xs: 0.75, sm: 0.875, md: 1 },
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0.25, sm: 0.35, md: 0.4 },
        }}
      >
        {/* Main Organization - Arabic */}
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1.05rem' },
            lineHeight: 1.25,
            letterSpacing: '0.01em',
            mb: 0,
          }}
          dir="rtl"
        >
          المؤسسة العامة للتدريب التقني والمهني
        </Typography>

        {/* Main Organization - English */}
        <Typography
          variant="body2"
          component="h2"
          sx={{
            fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
            lineHeight: 1.3,
            letterSpacing: '0.005em',
            mb: { xs: 0.2, sm: 0.25 },
          }}
          dir="ltr"
        >
          Technical and Vocational Training Corporation
        </Typography>

        {/* Divider */}
        <Box
          sx={{
            width: { xs: '40px', sm: '50px', md: '60px' },
            height: '1px',
            backgroundColor: theme.palette.primary.main,
            mx: 'auto',
            my: { xs: 0.15, sm: 0.2 },
            opacity: 0.25,
          }}
        />

        {/* College - Arabic */}
        <Typography
          variant="body2"
          component="h3"
          sx={{
            fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
            fontWeight: 600,
            color: theme.palette.text.secondary,
            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
            lineHeight: 1.25,
            letterSpacing: '0.01em',
          }}
          dir="rtl"
        >
          الكلية التقنية للاتصالات والمعلومات بالرياض
        </Typography>

        {/* College - English */}
        <Typography
          variant="caption"
          component="h4"
          sx={{
            fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
            fontWeight: 500,
            color: theme.palette.text.secondary,
            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
            lineHeight: 1.3,
            letterSpacing: '0.005em',
          }}
          dir="ltr"
        >
          Technical College of Telecommunications and Information in Riyadh
        </Typography>
      </Box>
    </Box>
  );
};

export default HeaderLogo;

