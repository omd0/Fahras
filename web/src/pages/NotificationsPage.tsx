import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Button,
  Badge,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccountCircle,
  ExitToApp,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { getDashboardTheme } from '../config/dashboardThemes';
import { TVTCLogo } from '../components/TVTCLogo';

export const NotificationsPage: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dashboardTheme = getDashboardTheme(user?.roles);
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <InfoIcon color="info" />;
      case 'rating':
        return <CheckCircleIcon color="success" />;
      case 'evaluation_due':
        return <AssignmentIcon color="warning" />;
      case 'approval_required':
        return <WarningIcon color="error" />;
      case 'project_updated':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'info';
      case 'rating':
        return 'success';
      case 'evaluation_due':
        return 'warning';
      case 'approval_required':
        return 'error';
      case 'project_updated':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static"
        sx={{ 
          background: dashboardTheme.appBarGradient,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TVTCLogo size="small" variant="icon" color="inherit" sx={{ mr: 1 }} />
          <NotificationsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            All Notifications
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfileClick}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header with actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications are read'}
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllAsRead}
              sx={{
                background: dashboardTheme.appBarGradient,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Mark All as Read
            </Button>
          )}
        </Box>

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: dashboardTheme.primary }} />
          </Box>
        ) : (
          <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            {notifications && notifications.length > 0 ? (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        px: 3,
                        backgroundColor: notification.is_read ? 'transparent' : `${dashboardTheme.primary}08`,
                        borderLeft: notification.is_read ? 'none' : `4px solid ${dashboardTheme.primary}`,
                        '&:hover': {
                          backgroundColor: notification.is_read ? 'action.hover' : `${dashboardTheme.primary}12`,
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: notification.is_read ? 400 : 600,
                                color: notification.is_read ? 'text.primary' : 'text.primary',
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.is_read && (
                              <Badge
                                variant="dot"
                                sx={{
                                  '& .MuiBadge-badge': {
                                    backgroundColor: dashboardTheme.primary,
                                  },
                                }}
                              />
                            )}
                            <Chip
                              label={notification.type.replace('_', ' ')}
                              size="small"
                              color={getNotificationColor(notification.type) as any}
                              variant="outlined"
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {notification.message}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(notification.created_at)}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {!notification.is_read && (
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    sx={{
                                      color: dashboardTheme.primary,
                                      textTransform: 'none',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    Mark as Read
                                  </Button>
                                )}
                                <Button
                                  size="small"
                                  variant="text"
                                  color="error"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  sx={{
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You'll see notifications about project updates, evaluations, and other activities here.
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
};
