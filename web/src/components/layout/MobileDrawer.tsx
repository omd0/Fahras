import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Stack,
  Avatar,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Explore as ExploreIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/providers/LanguageContext';
import { useAuthStore } from '@/features/auth/store';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuthStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { 
      label: t('Home'), 
      icon: <HomeIcon />, 
      path: '/',
      show: true,
    },
    { 
      label: t('Explore Projects'), 
      icon: <ExploreIcon />, 
      path: '/explore',
      show: true,
    },
    { 
      label: t('About'), 
      icon: <InfoIcon />, 
      path: '/about',
      show: true,
    },
    { 
      label: t('Contact'), 
      icon: <ContactIcon />, 
      path: '/contact',
      show: true,
    },
  ];

  const authItems = [
    {
      label: t('Login'),
      icon: <LoginIcon />,
      path: '/login',
      show: !isAuthenticated,
      primary: false,
    },
    {
      label: t('Register'),
      icon: <RegisterIcon />,
      path: '/register',
      show: !isAuthenticated,
      primary: true,
    },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: tvtcMobile.drawerWidth.mobile,
          maxWidth: 320,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: tvtcMobile.navHeight.mobile,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #008A3E 0%, #18B3A8 100%)',
              }}
            >
              <RocketIcon sx={{ fontSize: 24, color: 'white' }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('TVTC')}
            </Typography>
          </Stack>
          <IconButton
            onClick={onClose}
            aria-label={t('Close menu')}
            sx={{
              minWidth: tvtcMobile.touchTarget.minimum,
              minHeight: tvtcMobile.touchTarget.minimum,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User Info (if authenticated) */}
        {isAuthenticated && user && (
          <Box
            sx={{
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                }}
              >
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user.full_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Navigation Items */}
        <List sx={{ flex: 1, py: 2 }}>
          {menuItems.filter(item => item.show).map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  py: 1.5,
                  px: 2,
                  minHeight: tvtcMobile.touchTarget.comfortable,
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Bottom Section: Auth & Settings */}
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          {/* Theme & Language Toggles */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              borderBottom: !isAuthenticated ? 1 : 0,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('Theme')}:
              </Typography>
              <ThemeToggle />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('Language')}:
              </Typography>
              <LanguageSwitcher />
            </Box>
          </Box>

          {/* Auth Buttons (if not authenticated) */}
          {!isAuthenticated && (
            <List sx={{ p: 2 }}>
              {authItems.filter(item => item.show).map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 9999, // pill-shaped
                      minHeight: tvtcMobile.touchTarget.comfortable,
                      bgcolor: item.primary ? 'primary.main' : 'transparent',
                      color: item.primary ? 'primary.contrastText' : 'text.primary',
                      border: item.primary ? 0 : `1px solid #D7E3E8`,
                      '&:hover': {
                        bgcolor: item.primary
                          ? 'primary.dark'
                          : (theme) => alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 40, 
                        color: item.primary ? 'inherit' : 'primary.main',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
