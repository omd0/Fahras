import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { DashboardTheme } from '@/config/dashboardThemes';
import { useAuthStore } from '@/features/auth/store';
import { getProjectDetailUrl } from '@/utils/projectRoutes';

interface ProjectCardProps {
  project: Project;
  theme: DashboardTheme;
  showProgress?: boolean;
  showEdit?: boolean;
  showApprovalStatus?: boolean;
  currentUserId?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  theme,
  showProgress = false,
  showEdit = false,
  showApprovalStatus = false,
  currentUserId: _currentUserId,
}) => {
  const navigate = useNavigate();
  const { user: _user } = useAuthStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'submitted': return 'info';
      case 'under_review': return 'primary';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getProjectProgress = (status: string) => {
    const statusProgress: Record<string, number> = {
      'draft': 20,
      'submitted': 40,
      'under_review': 60,
      'approved': 80,
      'completed': 100,
    };
    return statusProgress[status] || 0;
  };

  // Get the project detail URL using the utility function
  const getProjectRoute = () => {
    return getProjectDetailUrl(project);
  };

  return (
    <Card
      component="article"
      role="article"
      aria-label={`Project: ${project.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(getProjectRoute());
        }
      }}
      sx={{
        border: `2px solid #18B3A8`, // Portal Hub teal outline
        borderRadius: '14px', // Portal Hub card radius
        cursor: 'pointer',
        height: '100%',
        boxShadow: 'none', // Portal Hub: no shadow
        transition: 'all 0.2s ease-out',
        '&:hover': {
          borderColor: '#008A3E', // Deepen on hover
          transform: 'translateY(-1px)', // Subtle lift
        },
        '&:active': {
          transform: 'translateY(0)',
          transition: 'all 0.1s ease-out',
        },
        '&:focus': {
          outline: `3px solid #008A3E`,
          outlineOffset: '2px',
        },
        '&:focus:not(:focus-visible)': {
          outline: 'none',
        },
        '&:focus-visible': {
          outline: `3px solid #008A3E`,
          outlineOffset: '2px',
        },
      }}
      onClick={() => navigate(getProjectRoute())}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <SchoolIcon sx={{ color: theme.primary, mr: 1 }} aria-hidden="true" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, flex: 1 }}>
              {project.title}
            </Typography>
          </Box>
          <Chip
            label={project.status.replace('_', ' ')}
            color={getStatusColor(project.status) as any}
            size="small"
            sx={{ textTransform: 'capitalize' }}
            aria-label={`Project status: ${project.status.replace('_', ' ')}`}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {project.abstract.substring(0, 120)}...
        </Typography>

        {/* Project Progress */}
        {showProgress && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: theme.primary }}>
                {getProjectProgress(project.status)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getProjectProgress(project.status)}
              aria-label={`Project progress: ${getProjectProgress(project.status)} percent complete`}
              aria-valuenow={getProjectProgress(project.status)}
              aria-valuemin={0}
              aria-valuemax={100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: `${theme.primary}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.primary,
                  borderRadius: 3,
                }
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {project.academic_year} • {project.semester}
            </Typography>
          </Box>
          {showApprovalStatus && project.admin_approval_status && (
            <Chip
              label={project.admin_approval_status}
              color={project.admin_approval_status === 'approved' ? 'success' : 
                     project.admin_approval_status === 'pending' ? 'warning' : 'error'}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {project.creator?.full_name || 'Unknown'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {showEdit && (
              <IconButton 
                size="small" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  navigate(`/projects/${project.id}/edit`); 
                }}
                sx={{ color: theme.primary }}
                aria-label={`Edit project ${project.title}`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton 
              size="small" 
              onClick={(e) => { 
                e.stopPropagation(); 
                navigate(getProjectRoute()); 
              }}
              sx={{ color: theme.primary }}
              aria-label={`View project ${project.title}`}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

