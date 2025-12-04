import { Box, Typography } from '@mui/material';
import React from 'react';

export const CatsSavePage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h3" component="h1">
        Cats Save
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for the Cats Save feature.
      </Typography>
    </Box>
  );
};


