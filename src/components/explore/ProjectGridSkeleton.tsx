'use client';

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Skeleton,
  Stack,
  useTheme,
} from '@mui/material';

interface ProjectCardSkeletonProps {
  showRating?: boolean;
}

const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({
  showRating = false,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '14px',
        border: `2px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: { xs: 2.5, sm: 3 },
        }}
      >
        <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={28} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1.5 }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: '12px' }} />
        </Stack>
        <Skeleton variant="text" width="90%" height={18} sx={{ mb: 0.3 }} />
        <Skeleton variant="text" width="85%" height={18} sx={{ mb: 2 }} />
        {showRating && (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" width={100} height={20} />
            <Skeleton variant="text" width={40} height={16} />
          </Stack>
        )}
        <Skeleton variant="text" width={120} height={16} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 'auto' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </CardContent>
    </Card>
  );
};

interface ProjectGridSkeletonProps {
  count?: number;
}

export const ProjectGridSkeleton: React.FC<ProjectGridSkeletonProps> = ({
  count = 6,
}) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <ProjectCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
};
