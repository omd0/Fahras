import React from 'react';
import { useAuthStore } from '../store/authStore';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { FacultyDashboard } from '../components/dashboards/FacultyDashboard';
import { StudentDashboard } from '../components/dashboards/StudentDashboard';
import { ReviewerDashboard } from '../components/dashboards/ReviewerDashboard';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Typography,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountCircle,
  ExitToApp,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TVTCLogo } from '../components/TVTCLogo';
import { NotificationCenter } from '../components/NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';
import { useState } from 'react';

export const DashboardPage: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { unreadCount: unreadNotifications } = useNotifications();

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

  // Determine which dashboard to show based on user role
  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return 'student';
    
    // Priority: admin > faculty > student > reviewer
    if (user.roles.some(role => role.name === 'admin')) return 'admin';
    if (user.roles.some(role => role.name === 'faculty')) return 'faculty';
    if (user.roles.some(role => role.name === 'student')) return 'student';
    if (user.roles.some(role => role.name === 'reviewer')) return 'reviewer';
    
    return 'student';
  };

  const userRole = getUserRole();

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'reviewer':
        return <ReviewerDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fahras Dashboard
          </Typography>
          {!user?.roles?.some(role => role.name === 'admin' || role.name === 'reviewer') && (
            <IconButton
              color="inherit"
              onClick={() => navigate('/projects/create')}
              sx={{ mr: 1 }}
            >
              <AddIcon />
            </IconButton>
          )}
          <IconButton
            size="large"
            edge="end"
            aria-label="notifications"
            onClick={() => setNotificationOpen(true)}
            color="inherit"
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
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
            {user?.roles?.some(role => role.name === 'admin') && (
              <MenuItem onClick={() => { navigate('/admin/projects'); handleMenuClose(); }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                Project Approvals
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Render role-specific dashboard */}
      {renderDashboard()}

      {/* Notification Center */}
      <NotificationCenter
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </Box>
  );
};
