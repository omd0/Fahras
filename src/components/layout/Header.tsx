'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Button,
  IconButton,
  useTheme,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  useMediaQuery,
  Avatar,
  Badge,
  Typography,
  alpha,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  SupervisedUserCircle as FacultyIcon,
  HowToReg as ApprovalsIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/providers/LanguageContext';
import { useAuthStore } from '@/features/auth/store';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { MobileDrawer } from './MobileDrawer';
import { Project, Role } from '@/types';
import { apiService } from '@/lib/api';
import { getProjectEditUrl, getProjectFollowUrl } from '@/utils/projectRoutes';
import ProjectVisibilityToggle from '@/features/projects/components/ProjectVisibilityToggle';

interface NavItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadCount } = useNotifications();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const hasRole = (roleName: string): boolean => {
    return user?.roles?.some(role => role.name === roleName) || false;
  };

  const isProjectDetailPage = pathname.startsWith('/pr/') && pathname.split('/').length >= 3;
  const projectSlug = isProjectDetailPage ? pathname.split('/')[2] : null;

  useEffect(() => {
    const fetchProject = async () => {
      if (projectSlug) {
        try {
          const response = await apiService.getProject(projectSlug);
          setCurrentProject(response.project ?? response);
        } catch {
          setCurrentProject(null);
        }
      } else {
        setCurrentProject(null);
      }
    };

    fetchProject();
  }, [projectSlug]);

  const canEdit = user && currentProject && (
    user.id === currentProject.created_by_user_id ||
    user.roles?.some(role => role.name === 'admin')
  );
  const canDelete = user && currentProject && (
    user.id === currentProject.created_by_user_id ||
    user.roles?.some(role => role.name === 'admin')
  );

  const navItems: NavItem[] = [
    {
      label: t('Home') || 'Home',
      path: '/',
      icon: <HomeIcon fontSize="small" />,
    },
    {
      label: t('About') || 'About',
      path: '/about',
      icon: <InfoIcon fontSize="small" />,
    },
    {
      label: t('Help') || 'Help',
      path: '/help',
      icon: <HelpIcon fontSize="small" />,
    },
  ];

  const authNavItems = [
    {
      label: t('Dashboard') || 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon fontSize="small" />,
      roles: [] as string[],
    },
    {
      label: t('My Projects') || 'My Projects',
      path: '/student/my-projects',
      icon: <FolderIcon fontSize="small" />,
      roles: ['student'],
    },
    {
      label: t('Advisor Projects') || 'Advisor Projects',
      path: '/advisor-projects',
      icon: <FacultyIcon fontSize="small" />,
      roles: ['faculty'],
    },
    {
      label: t('Pending Approvals') || 'Pending Approvals',
      path: '/faculty/pending-approvals',
      icon: <ApprovalsIcon fontSize="small" />,
      roles: ['faculty'],
    },
    {
      label: t('Approvals') || 'Approvals',
      path: '/admin/approvals',
      icon: <ApprovalsIcon fontSize="small" />,
      roles: ['admin'],
    },
    {
      label: t('Users') || 'Users',
      path: '/users',
      icon: <AdminIcon fontSize="small" />,
      roles: ['admin'],
    },
    {
      label: t('Access Control') || 'Access Control',
      path: '/access-control',
      icon: <SecurityIcon fontSize="small" />,
      roles: ['admin'],
    },
  ];

  const filteredAuthNavItems = authNavItems.filter(item => {
    if (item.roles.length === 0) return true;
    return item.roles.some(role => hasRole(role));
  });

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleDropdownOpen = (e: React.MouseEvent<HTMLElement>, label: string) => {
    setAnchorEl(e.currentTarget);
    setOpenDropdown(label);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
    setOpenDropdown(null);
  };

  const handleNavigate = (path?: string) => {
    if (path) {
      router.push(path);
      handleDropdownClose();
    }
  };

  return (
    <>
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
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Box
          sx={{
            maxWidth: '1400px',
            mx: 'auto',
            px: { xs: 1.5, sm: 2, md: 3 },
            py: { xs: 1, sm: 1.5 },
            minHeight: { xs: 56, sm: 64, md: 72 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {!isMobile && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ sm: 1, md: 2 }}
              sx={{ flexGrow: 1 }}
            >
              {isProjectDetailPage ? (
                <>
                  <Tooltip title={t('Back') || 'Back'}>
                    <IconButton
                      onClick={() => router.back()}
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </Tooltip>

                  <Button
                    onClick={(e) => handleDropdownOpen(e, 'all-navigation')}
                    endIcon={
                      <ExpandMoreIcon
                        sx={{
                          transform:
                            openDropdown === 'all-navigation' ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease-out',
                          fontSize: '18px',
                        }}
                      />
                    }
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: { sm: '13px', md: '14px' },
                      fontWeight: 500,
                      textTransform: 'none',
                      px: { sm: 1, md: 1.5 },
                      py: 1,
                      '&:hover': {
                        color: theme.palette.secondary.main,
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    {t('Navigation') || 'Navigation'}
                  </Button>

                  <Menu
                    anchorEl={anchorEl}
                    open={openDropdown === 'all-navigation'}
                    onClose={handleDropdownClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    PaperProps={{
                      sx: {
                        borderRadius: '12px',
                        mt: 1,
                        boxShadow: theme.shadows[3],
                        minWidth: 200,
                      },
                    }}
                  >
                    {navItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        sx={{
                          color: theme.palette.text.primary,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                        {item.label}
                      </MenuItem>
                    ))}
                    {isAuthenticated && filteredAuthNavItems.length > 0 && (
                      <>
                        <Divider sx={{ my: 0.5 }} />
                        {filteredAuthNavItems.map((item) => (
                          <MenuItem
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                              color: theme.palette.text.primary,
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                                color: theme.palette.primary.main,
                              },
                            }}
                          >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            {item.label}
                          </MenuItem>
                        ))}
                      </>
                    )}
                  </Menu>
                </>
              ) : (
                <>
                  {navItems.map((item) => (
                    <Tooltip key={item.label} title={item.label}>
                      <IconButton
                        onClick={() => handleNavigate(item.path)}
                        sx={{
                          color: isActive(item.path)
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                          position: 'relative',
                          '&:hover': {
                            color: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          },
                          '&::after': isActive(item.path)
                            ? {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '70%',
                                height: '2px',
                                backgroundColor: theme.palette.primary.main,
                              }
                            : {},
                        }}
                      >
                        {item.icon}
                      </IconButton>
                    </Tooltip>
                  ))}

                  {isAuthenticated && filteredAuthNavItems.length > 0 && (
                    <>
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                          mx: 1,
                          height: 24,
                          alignSelf: 'center',
                        }}
                      />

                      {filteredAuthNavItems.slice(0, isDesktop ? 3 : 2).map((item) => (
                        <Button
                          key={item.path}
                          onClick={() => router.push(item.path)}
                          startIcon={item.icon}
                          sx={{
                            color: isActive(item.path)
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                            fontSize: { sm: '13px', md: '14px' },
                            fontWeight: 500,
                            textTransform: 'none',
                            px: { sm: 1, md: 1.5 },
                            py: 1,
                            position: 'relative',
                            minWidth: 'auto',
                            '&:hover': {
                              color: theme.palette.secondary.main,
                              backgroundColor: 'transparent',
                            },
                            '&::after': isActive(item.path)
                              ? {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  width: '80%',
                                  height: '2px',
                                  backgroundColor: theme.palette.primary.main,
                                }
                              : {},
                          }}
                        >
                          {item.label}
                        </Button>
                      ))}

                      {filteredAuthNavItems.length > (isDesktop ? 3 : 2) && (
                        <>
                          <Button
                            onClick={(e) => handleDropdownOpen(e, 'more-nav')}
                            endIcon={
                              <ExpandMoreIcon
                                sx={{
                                  transform:
                                    openDropdown === 'more-nav' ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease-out',
                                  fontSize: '18px',
                                }}
                              />
                            }
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: { sm: '13px', md: '14px' },
                              fontWeight: 500,
                              textTransform: 'none',
                              px: { sm: 1, md: 1.5 },
                              py: 1,
                              '&:hover': {
                                color: theme.palette.secondary.main,
                                backgroundColor: 'transparent',
                              },
                            }}
                          >
                            {t('More') || 'More'}
                          </Button>

                          <Menu
                            anchorEl={anchorEl}
                            open={openDropdown === 'more-nav'}
                            onClose={handleDropdownClose}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'left',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'left',
                            }}
                            PaperProps={{
                              sx: {
                                borderRadius: '12px',
                                mt: 1,
                                boxShadow: theme.shadows[3],
                              },
                            }}
                          >
                            {filteredAuthNavItems.slice(isDesktop ? 3 : 2).map((item) => (
                              <MenuItem
                                key={item.path}
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                  color: theme.palette.text.primary,
                                  '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                    color: theme.palette.primary.main,
                                  },
                                }}
                              >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                {item.label}
                              </MenuItem>
                            ))}
                          </Menu>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </Stack>
          )}

          {isProjectDetailPage && currentProject && !isMobile && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ ml: 'auto', mr: 2 }}
            >
              {canEdit && (
                <Tooltip title={t('Edit') || 'Edit'}>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => router.push(getProjectEditUrl(currentProject))}
                    size="small"
                    sx={{
                      color: theme.palette.primary.main,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    {t('Edit') || 'Edit'}
                  </Button>
                </Tooltip>
              )}

              {user && (
                <Tooltip title={t('Follow & Track') || 'Follow & Track'}>
                  <Button
                    startIcon={<TimelineIcon />}
                    onClick={() => router.push(getProjectFollowUrl(currentProject))}
                    size="small"
                    sx={{
                      color: theme.palette.secondary.main,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                      },
                    }}
                  >
                    {t('Follow & Track') || 'Follow & Track'}
                  </Button>
                </Tooltip>
              )}

              <Tooltip title={t('Print') || 'Print'}>
                <IconButton
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('project-export'));
                  }}
                  size="small"
                  sx={{
                    color: theme.palette.info.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.info.main, 0.08),
                    },
                  }}
                >
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {canDelete && (
                <Tooltip title={t('Delete') || 'Delete'}>
                  <IconButton
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('project-delete'));
                    }}
                    size="small"
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {user?.roles?.some((role: Role) => role.name === 'admin') && (
                <ProjectVisibilityToggle
                  project={currentProject}
                  onToggleComplete={() => {
                    if (projectSlug) {
                      apiService.getProject(projectSlug).then(res => setCurrentProject(res.project ?? res));
                    }
                  }}
                  variant="button"
                />
              )}

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mx: 1,
                  height: 32,
                  alignSelf: 'center',
                }}
              />
            </Stack>
          )}

          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 0.5, sm: 1 }}
            sx={{ flexShrink: 0 }}
          >
            <Tooltip title={t('Search') || 'Search'}>
              <IconButton
                aria-label={t('Open search') || 'Open search'}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  borderRadius: '50%',
                  width: { xs: 36, sm: 40, md: 44 },
                  height: { xs: 36, sm: 40, md: 44 },
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '&:focus-visible': {
                    outline: `3px solid ${theme.palette.primary.main}`,
                    outlineOffset: '2px',
                  },
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {isAuthenticated && (
              <>
                <Tooltip title={t('Notifications') || 'Notifications'}>
                  <IconButton
                    aria-label={`${unreadCount} ${t('unread notifications') || 'unread notifications'}`}
                    onClick={() => router.push('/notifications')}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                      '&:focus-visible': {
                        outline: `3px solid ${theme.palette.primary.main}`,
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      max={99}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '11px',
                          minWidth: '18px',
                          height: '18px',
                        },
                      }}
                    >
                      <NotificationsIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {!isMobile && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      mx: 0.5,
                      height: 32,
                      alignSelf: 'center',
                    }}
                  />
                )}
              </>
            )}

            <LanguageSwitcher />

            <ThemeToggle />

            {isAuthenticated && user && !isMobile && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    mx: 0.5,
                    height: 32,
                    alignSelf: 'center',
                  }}
                />
                <Tooltip title={t('Account menu') || 'Account menu'}>
                  <IconButton
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    aria-controls={userMenuAnchor ? 'user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={userMenuAnchor ? 'true' : undefined}
                    sx={{
                      p: 0.5,
                      border: userMenuAnchor
                        ? `2px solid ${theme.palette.primary.main}`
                        : `2px solid transparent`,
                      '&:hover': {
                        borderColor: theme.palette.primary.light,
                      },
                      '&:focus-visible': {
                        outline: `3px solid ${theme.palette.primary.main}`,
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { sm: 32, md: 36 },
                        height: { sm: 32, md: 36 },
                        bgcolor: theme.palette.primary.main,
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                      src={user.avatar_url}
                    >
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  id="user-menu"
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={() => setUserMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      borderRadius: '12px',
                      mt: 1,
                      minWidth: 220,
                      boxShadow: theme.shadows[3],
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {user.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.roles?.[0]?.name || t('User') || 'User'}
                    </Typography>
                  </Box>

                  <MenuItem
                    onClick={() => {
                      router.push('/profile');
                      setUserMenuAnchor(null);
                    }}
                    sx={{ py: 1.25, minHeight: 44 }}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    {t('Profile') || 'Profile'}
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      router.push('/settings');
                      setUserMenuAnchor(null);
                    }}
                    sx={{ py: 1.25, minHeight: 44 }}
                  >
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    {t('Settings') || 'Settings'}
                  </MenuItem>

                  <Divider />

                  <MenuItem
                    onClick={() => {
                      logout();
                      setUserMenuAnchor(null);
                      router.push('/');
                    }}
                    sx={{
                      py: 1.25,
                      minHeight: 44,
                      color: theme.palette.error.main,
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    {t('Logout') || 'Logout'}
                  </MenuItem>
                </Menu>
              </>
            )}

            {!isAuthenticated && !isMobile && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    mx: 0.5,
                    height: 32,
                    alignSelf: 'center',
                  }}
                />

                <Button
                  variant="text"
                  onClick={() => router.push('/login')}
                  startIcon={<LoginIcon />}
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {t('Login') || 'Login'}
                </Button>

                <Button
                  variant="contained"
                  onClick={() => router.push('/register')}
                  startIcon={<RegisterIcon />}
                  sx={{
                    borderRadius: 9999,
                    fontSize: '14px',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 2.5,
                    height: 40,
                  }}
                >
                  {t('Register') || 'Register'}
                </Button>
              </>
            )}

            {isMobile && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    mx: 0.5,
                    height: 32,
                    alignSelf: 'center',
                  }}
                />
                <IconButton
                  onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                  aria-label={t('Open navigation menu') || 'Open menu'}
                  sx={{
                    color: theme.palette.text.primary,
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default Header;
