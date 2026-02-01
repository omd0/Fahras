import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Project, User, Role } from '@/types';
import ProjectVisibilityToggle from '@/features/projects/components/ProjectVisibilityToggle';
import { designTokens } from '@/styles/designTokens';

interface ProjectHeaderProps {
  project: Project;
  user: User;
  _isProfessor: boolean;
  onBackClick: () => void;
  onRefreshProject: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  user,
  _isProfessor,
  onBackClick,
  onRefreshProject,
}) => {

  // Professor-specific styling with new color scheme
  const appBarStyle = {
    background: designTokens.colors.secondary[700],
    color: designTokens.colors.surface[50],
    boxShadow: 'none',
  };

  return (
    <AppBar
      position="static"
      sx={appBarStyle}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onBackClick}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'common.white' }}>
          {project.title}
        </Typography>

        {/* All action buttons (Edit, Follow & Track, Export, Delete, Print) have been moved to the main Header component */}
        {/* Only keeping the back button and title here for context */}

        {/* Admin visibility controls - keep here as it's admin-specific functionality */}
        {user?.roles?.some((role: Role) => role.name === 'admin') && (
          <ProjectVisibilityToggle
            project={project}
            onToggleComplete={onRefreshProject}
            variant="button"
          />
        )}
      </Toolbar>
    </AppBar>
  );
};
