import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Avatar, useTheme, alpha, IconButton } from '@mui/material';
import { Login as LoginIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Rocket as RocketIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/providers/LanguageContext';
import { useNavigationMode } from '@/hooks/useResponsive';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { MobileDrawer } from './MobileDrawer';
import { guestColors } from '@/styles/theme/guestTheme';
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const theme = useTheme();
  const { showMobileNav } = useNavigationMode();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer */}
      <MobileDrawer 
        open={mobileDrawerOpen} 
        onClose={() => setMobileDrawerOpen(false)} 
      />

      <Box
        component="header"
        role="banner"
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          boxShadow: theme.shadows[2],
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: tvtcMobile.navHeight.mobile, sm: tvtcMobile.navHeight.tablet },
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
          >
            {/* Mobile Menu Button (visible only on small screens) */}
            {showMobileNav && (
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                aria-label={t('Open menu')}
                sx={{
                  minWidth: tvtcMobile.touchTarget.minimum,
                  minHeight: tvtcMobile.touchTarget.minimum,
                  color: 'primary.main',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo and Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                flex: showMobileNav ? 1 : '0 1 auto',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
            <Avatar
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                background: guestColors.primaryGradient,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
              role="img"
              aria-label="TVTC Project Explorer Logo"
            >
              <RocketIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: '#fff' }} aria-hidden="true" />
            </Avatar>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: '1rem', sm: '1.5rem', md: '1.75rem' },
                whiteSpace: showMobileNav ? 'normal' : 'nowrap',
                // Hide text on very small mobile screens, show only on larger screens
                display: { xs: showMobileNav ? 'none' : 'block', sm: 'block' },
              }}
            >
              {t('TVTC Project Explorer')}
            </Typography>
          </Box>

          {/* Right side: Language Switcher and Login Button (Desktop only) */}
          {!showMobileNav && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
            >
              <ThemeToggle />
              <LanguageSwitcher />
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                aria-label={t('Login to your account')}
                sx={{
                  background: guestColors.primaryGradient,
                  borderRadius: '28px',
                  px: { xs: 3, sm: 4 },
                  py: 1.25,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  textTransform: 'none',
                  minHeight: tvtcMobile.touchTarget.minimum,
                  boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  '@media (hover: none)': {
                    '&:hover': {
                      transform: 'none',
                    },
                  },
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
              >
                {t('Login')}
              </Button>
            </Stack>
          )}

          {/* Mobile: Only show Avatar logo */}
          {showMobileNav && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: guestColors.primaryGradient,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
              role="img"
              aria-label="TVTC Project Explorer Logo"
            >
              <RocketIcon sx={{ fontSize: 24, color: '#fff' }} aria-hidden="true" />
            </Avatar>
          )}
        </Stack>
      </Box>
    </Box>
    </>
  );
};

export default Header;











