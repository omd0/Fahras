import React from 'react';
import { Box, Grid } from '@mui/material';
import { Project } from '@/types';
import { RepositoryHeader } from './RepositoryHeader';
import { RepositoryTabs } from './RepositoryTabs';

interface RepositoryLayoutProps {
  project: Project;
  children: React.ReactNode;
  onBack?: () => void;
}

export const RepositoryLayout: React.FC<RepositoryLayoutProps> = ({
  project,
  children,
  onBack,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <RepositoryHeader project={project} onBack={onBack} />
      <RepositoryTabs projectId={project.id} />
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>{children}</Box>
    </Box>
  );
};



