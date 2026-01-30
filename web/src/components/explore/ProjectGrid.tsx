import React from 'react';
import { Grid } from '@mui/material';
import { Project } from '@/types';
import { ProjectGridCard } from './ProjectGridCard';

interface ProjectGridProps {
  projects: Project[];
  showTopBadge?: boolean;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  return (
    <Grid container spacing={4}>
      {projects.map((project) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
          <ProjectGridCard project={project} />
        </Grid>
      ))}
    </Grid>
  );
};
