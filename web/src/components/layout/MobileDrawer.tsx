import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Stack,
  Avatar,
  alpha,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  HelpOutline as HelpIcon,
  Rocket as RocketIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  SupervisedUserCircle as FacultyIcon,
  HowToReg as ApprovalsIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/providers/LanguageContext';
import { useAuthStore } from '@/features/auth/store';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { legacyLayout as tvtcMobile } from '@/styles/theme/colorPalette';
import { designTokens } from '@/styles/designTokens';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadCount } = useNotifications();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // Helper function to check if user has a specific role
  const hasRole = (roleName: string): boolean => {
    return user?.roles?.some(role => role.name === roleName) || false;
  };

  const menuItems = [
    // Public items
    {
      label: t('Home'),
      icon: <HomeIcon />,
      path: '/',
      show: true,
    },
    {
      label: t('About'),
      icon: <InfoIcon />,
      path: '/about',
      show: true,
    },
    {
      label: t('Help'),
      icon: <HelpIcon />,
      path: '/help',
      show: true,
    },
    // Authenticated items
    {
      label: t('Dashboard'),
      icon: <DashboardIcon />,
      path: '/dashboard',
      show: isAuthenticated,
    },
    {
      label: t('Notifications'),
      icon: <NotificationsIcon />,
      path: '/notifications',
      show: isAuthenticated,
      badge: unreadCount,
    },
    {
      label: t('Profile'),
      icon: <PersonIcon />,
      path: '/profile',
      show: isAuthenticated,
    },
    {
      label: t('Settings'),
      icon: <SettingsIcon />,
      path: '/settings',
      show: isAuthenticated,
    },
    // Role-based items
    {
      label: t('My Projects'),
      icon: <FolderIcon />,
      path: '/student/my-projects',
      show: isAuthenticated && hasRole('student'),
    },
    {
      label: t('Advisor Projects'),
      icon: <FacultyIcon />,
      path: '/advisor-projects',
      show: isAuthenticated && hasRole('faculty'),
    },
    {
      label: t('Pending Approvals'),
      icon: <ApprovalsIcon />,
      path: '/faculty/pending-approvals',
      show: isAuthenticated && hasRole('faculty'),
    },
    {
      label: t('Approvals'),
      icon: <ApprovalsIcon />,
      path: '/admin/approvals',
      show: isAuthenticated && hasRole('admin'),
    },
    {
      label: t('Users'),
      icon: <AdminIcon />,
      path: '/users',
      show: isAuthenticated && hasRole('admin'),
    },
    {
      label: t('Access Control'),
      icon: <SecurityIcon />,
      path: '/access-control',
      show: isAuthenticated && hasRole('admin'),
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
                 background: designTokens.colors.surface[50],
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
                  {item.badge !== undefined && item.badge > 0 ? (
                    <Badge badgeContent={item.badge} color="error" max={99}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
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
                      border: item.primary ? 0 : (theme) => `1px solid ${theme.palette.divider}`,
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

          {/* Logout Button (if authenticated) */}
          {isAuthenticated && (
            <Box sx={{ p: 2 }}>
              <ListItemButton
                onClick={() => {
                  logout();
                  onClose();
                  navigate('/');
                }}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 9999,
                  minHeight: tvtcMobile.touchTarget.comfortable,
                  border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('Logout') || 'Logout'}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                />
              </ListItemButton>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
