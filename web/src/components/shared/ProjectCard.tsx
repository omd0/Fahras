import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
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
  currentUserId,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
      sx={{
        border: `1px solid ${theme.borderColor}`,
        borderRadius: 2,
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          transform: 'translateY(-8px) scale(1.02)',
          borderColor: theme.primary,
        },
        '&:active': {
          transform: 'translateY(-2px) scale(0.98)',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
      onClick={() => navigate(getProjectRoute())}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <SchoolIcon sx={{ color: theme.primary, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {project.title}
            </Typography>
          </Box>
          <Chip
            label={project.status.replace('_', ' ')}
            color={getStatusColor(project.status) as any}
            size="small"
            sx={{ textTransform: 'capitalize' }}
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
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

