import React from 'react';
import { useAuthStore } from '@/features/auth/store';
import { AdminDashboard } from '@/features/dashboards/components/AdminDashboard';
import { FacultyDashboard } from '@/features/dashboards/components/FacultyDashboard';
import { FacultyHomeDashboard } from '@/features/dashboards/components/FacultyHomeDashboard';
import { StudentDashboard } from '@/features/dashboards/components/StudentDashboard';
import { ReviewerDashboard } from '@/features/dashboards/components/ReviewerDashboard';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TVTCLogo } from '@/components/TVTCLogo';
import { useLanguage } from '@/providers/LanguageContext';
import { useState } from 'react';
import { getDashboardTheme } from '@/config/dashboardThemes';

export const DashboardPage: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
  
  // Get theme based on user role
  const dashboardTheme = getDashboardTheme(user?.roles);

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'faculty':
        return <FacultyHomeDashboard />;
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
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: '#000000',
        }}
      >
        <Toolbar>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#000000' }}>
            {t('Fahras Dashboard')}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            sx={{ color: '#000000' }}
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
              {t('Profile')}
            </MenuItem>
            {user?.roles?.some(role => role.name === 'admin') && (
              <MenuItem onClick={() => { navigate('/admin/projects'); handleMenuClose(); }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                {t('Project Approvals')}
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              {t('Logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Render role-specific dashboard */}
      {renderDashboard()}
    </Box>
  );
};
