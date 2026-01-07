import React from 'react';
import { Grid2 as Grid } from '@mui/material';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';
import { DashboardTheme } from '@/config/dashboardThemes';

interface ProjectGridSkeletonProps {
  theme: DashboardTheme;
  count?: number;
  showProgress?: boolean;
  showApprovalStatus?: boolean;
}

export const ProjectGridSkeleton: React.FC<ProjectGridSkeletonProps> = ({
  theme,
  count = 6,
  showProgress = false,
  showApprovalStatus = false,
}) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <ProjectCardSkeleton
            theme={theme}
            showProgress={showProgress}
            showApprovalStatus={showApprovalStatus}
          />
        </Grid>
      ))}
    </Grid>
  );
};
