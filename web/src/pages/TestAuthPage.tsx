import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';

export const TestAuthPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [authTest, setAuthTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAuthentication = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCurrentUser();
      setAuthTest({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setAuthTest({
        success: false,
        error: err.message || 'Authentication test failed',
        timestamp: new Date().toISOString(),
      });
      setError(err.message || 'Authentication test failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <AdminIcon color="error" />;
      case 'faculty':
        return <SchoolIcon color="primary" />;
      case 'student':
        return <PersonIcon color="info" />;
      case 'reviewer':
        return <AssignmentIcon color="warning" />;
      default:
        return <PersonIcon color="action" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'faculty':
        return 'primary';
      case 'student':
        return 'info';
      case 'reviewer':
        return 'warning';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      testAuthentication();
    }
  }, [isAuthenticated]);

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Authentication Status
          </Typography>
          
          {isAuthenticated ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body1">
                ✅ You are currently authenticated
              </Typography>
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body1">
                ⚠️ You are not authenticated
              </Typography>
            </Alert>
          )}

          {user && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Current User Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Name"
                    secondary={user.full_name || 'Not provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email || 'Not provided'}
                  />
                </ListItem>
                {user.roles && user.roles.length > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      {getRoleIcon(user.roles[0].name)}
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {user.roles.map((role: any, index: number) => (
                            <Chip
                              key={index}
                              label={role.name}
                              color={getRoleColor(role.name) as any}
                              size="small"
                            />
                          ))}
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              onClick={testAuthentication}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
            >
              {loading ? 'Testing...' : 'Test Authentication'}
            </Button>
            
            {isAuthenticated && (
              <Button
                variant="outlined"
                color="error"
                onClick={logout}
              >
                Logout
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {authTest && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Authentication Test Results
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: authTest.success ? 'success.light' : 'error.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {authTest.success ? (
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  ) : (
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {authTest.success ? 'Authentication Successful' : 'Authentication Failed'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tested at: {new Date(authTest.timestamp).toLocaleString()}
                </Typography>
                {authTest.success && authTest.data && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>User ID:</strong> {authTest.data.id}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong> {authTest.data.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Name:</strong> {authTest.data.full_name || 'Not provided'}
                    </Typography>
                    {authTest.data.roles && authTest.data.roles.length > 0 && (
                      <Typography variant="body2">
                        <strong>Roles:</strong> {authTest.data.roles.map((role: any) => role.name).join(', ')}
                      </Typography>
                    )}
                  </Box>
                )}
                {!authTest.success && authTest.error && (
                  <Typography variant="body2" color="error">
                    <strong>Error:</strong> {authTest.error}
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Debug Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This page is designed for testing authentication functionality. It allows you to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Check current authentication status" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• View current user information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Test API authentication endpoints" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Debug authentication issues" />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> This is a development/testing page and should not be used in production.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};
