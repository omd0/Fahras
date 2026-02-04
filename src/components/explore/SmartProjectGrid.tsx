'use client';

import React from 'react';
import { Grid } from '@mui/material';
import type { Project } from '@/types';
import { ProjectCard } from './ProjectCard';
import { useOptimalVirtualization } from '@/hooks/useVirtualization';

interface SmartProjectGridProps {
  projects: Project[];
  showTopBadge?: boolean;
  forceVirtualization?: boolean;
  virtualizationThreshold?: number;
}

export const SmartProjectGrid: React.FC<SmartProjectGridProps> = ({
  projects,
  virtualizationThreshold = 50,
}) => {
  useOptimalVirtualization(projects.length);
  void virtualizationThreshold;

  return (
    <Grid container spacing={4}>
      {(projects || []).map((project) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
          <ProjectCard project={project} />
        </Grid>
      ))}
    </Grid>
  );
};
