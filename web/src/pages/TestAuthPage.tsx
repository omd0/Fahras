import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Box, Typography, Button } from '@mui/material';

export const TestAuthPage: React.FC = () => {
  const { user, isAuthenticated, token } = useAuthStore();

  console.log('TestAuthPage - Auth state:', { isAuthenticated, user, token });

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Authentication Test Page
      </Typography>
      <Typography variant="body1" gutterBottom>
        Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        User: {user ? JSON.stringify(user, null, 2) : 'No user'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Token: {token ? 'Present' : 'Not present'}
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => window.location.href = '/projects/create'}
        sx={{ mt: 2 }}
      >
        Go to Create Project Page
      </Button>
    </Box>
  );
};
