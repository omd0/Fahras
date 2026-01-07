import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { BookmarkButton } from '../BookmarkButton';
import ProjectVisibilityToggle from '../ProjectVisibilityToggle';
import { professorColors } from '../../theme/professorTheme';

interface ProjectHeaderProps {
  project: Project;
  user: any;
  isProfessor: boolean;
  canEdit: boolean;
  canDelete: boolean;
  deleting: boolean;
  onBackClick: () => void;
  onDelete: () => void;
  onExport: () => void;
  onRefreshProject: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  user,
  isProfessor,
  canEdit,
  canDelete,
  deleting,
  onBackClick,
  onDelete,
  onExport,
  onRefreshProject,
}) => {
  const navigate = useNavigate();

  // Professor-specific styling with new color scheme
  const professorAppBarStyle = isProfessor ? {
    background: professorColors.primaryGradient,
    color: '#FFFFFF',
    boxShadow: '0 4px 16px rgba(0, 74, 173, 0.2)',
  } : {
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    color: '#000000',
  };

  return (
    <AppBar 
      position="static"
      sx={professorAppBarStyle}
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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: isProfessor ? '#FFFFFF' : '#000000' }}>
          {project.title}
        </Typography>
        {canEdit && (
          <Button
            color="inherit"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${project.id}/edit`)}
            sx={{ 
              mr: 1,
              color: isProfessor ? professorColors.secondary : '#4CAF50', // Light Blue/Turquoise for Edit
              '&:hover': {
                backgroundColor: isProfessor ? 'rgba(78, 205, 196, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                color: isProfessor ? professorColors.tertiary : '#2E7D32'
              }
            }}
          >
            Edit
          </Button>
        )}
        {user && (
          <Box sx={{ mr: 1 }}>
            <BookmarkButton 
              projectId={project.id} 
              size="medium"
              sx={{ 
                color: isProfessor ? '#FFFFFF' : '#000000',
              }}
            />
          </Box>
        )}
        {user && (
          <Button
            color="inherit"
            startIcon={<TimelineIcon />}
            onClick={() => navigate(`/projects/${project.id}/follow`)}
            sx={{ 
              mr: 1,
              color: isProfessor ? professorColors.secondary : '#9C27B0', // Purple for Timeline
              '&:hover': {
                backgroundColor: isProfessor ? 'rgba(78, 205, 196, 0.1)' : 'rgba(156, 39, 176, 0.1)',
                color: isProfessor ? professorColors.tertiary : '#7B1FA2'
              }
            }}
          >
            Follow & Track
          </Button>
        )}
        <Button
          color="inherit"
          startIcon={<DescriptionIcon />}
          onClick={onExport}
          sx={{ 
            mr: 1,
            color: isProfessor ? professorColors.accent : '#2196F3', // Soft Orange for Export
            '&:hover': {
              backgroundColor: isProfessor ? 'rgba(255, 152, 0, 0.1)' : 'rgba(33, 150, 243, 0.1)',
              color: isProfessor ? '#E65100' : '#1565C0'
            }
          }}
        >
          Export
        </Button>
        {canDelete && (
          <Button
            color="inherit"
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            onClick={onDelete}
            disabled={deleting}
            sx={{
              color: isProfessor ? professorColors.error : '#F44336', // Dark Red/Burgundy for Delete
              '&:hover': {
                backgroundColor: isProfessor ? 'rgba(183, 28, 28, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                color: isProfessor ? '#8B0000' : '#C62828'
              },
              '&:disabled': {
                color: isProfessor ? 'rgba(183, 28, 28, 0.5)' : 'rgba(244, 67, 54, 0.5)'
              }
            }}
          >
            Delete
          </Button>
        )}
        {/* Admin visibility controls */}
        {user?.roles?.some((role: any) => role.name === 'admin') && (
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
