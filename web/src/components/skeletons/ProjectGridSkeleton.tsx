import React from 'react';
import { Grid } from '@mui/material';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';

interface ProjectGridSkeletonProps {
  count?: number;
  showProgress?: boolean;
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
