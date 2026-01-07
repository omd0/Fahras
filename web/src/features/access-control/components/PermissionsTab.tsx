import React from 'react';
import { Box, Typography } from '@mui/material';

export const PermissionsTab: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Permissions
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Permission management interface coming soon...
      </Typography>
    </Box>
  );
};

