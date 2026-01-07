import React from 'react';
import { Box, Typography } from '@mui/material';

export const AnalyticsTab: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Role usage analytics coming soon...
      </Typography>
    </Box>
  );
};

