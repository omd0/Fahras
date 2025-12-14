import React from 'react';
import { Box, Typography, Button, Stack, Avatar, useTheme, alpha } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { Rocket as RocketIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { guestColors } from '../theme/guestTheme';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const theme = useTheme();

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        boxShadow: theme.shadows[2],
        py: { xs: 1.5, sm: 2 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: '1400px',
          mx: 'auto',
          width: '100%',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          {/* Logo and Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flex: { xs: '1 1 100%', sm: '0 1 auto' },
            }}
          >
            <Avatar
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                background: guestColors.primaryGradient,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <RocketIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: '#fff' }} />
            </Avatar>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                whiteSpace: 'nowrap',
              }}
            >
              {t('TVTC Project Explorer')}
            </Typography>
          </Box>

          {/* Right side: Language Switcher and Login Button */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              flex: { xs: '1 1 100%', sm: '0 1 auto' },
              justifyContent: { xs: 'flex-end', sm: 'flex-end' },
            }}
          >
            <LanguageSwitcher />
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                background: guestColors.primaryGradient,
                borderRadius: '28px',
                px: { xs: 3, sm: 4 },
                py: 1.25,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                textTransform: 'none',
                boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              }}
            >
              {t('Login')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Header;

