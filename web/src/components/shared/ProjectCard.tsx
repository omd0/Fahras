import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Rating,
  Stack,
  alpha,
} from '@mui/material';
import {
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { useAuthStore } from '@/features/auth/store';
import { getProjectDetailUrl } from '@/utils/projectRoutes';
import { BasePortalCard } from './BasePortalCard';
import { designTokens } from '@/styles/designTokens';

interface ProjectCardProps {
  project: Project;
  showProgress?: boolean;
  showEdit?: boolean;
  showApprovalStatus?: boolean;
  showRating?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  showEdit = false,
  showRating = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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

  const canEdit = user && (user.id === project.created_by_user_id || user.roles?.some(r => r.name === 'admin'));

  return (
    <BasePortalCard
      onClick={() => navigate(getProjectDetailUrl(project))}
      ariaLabel={`Project: ${project.title}`}
    >
      {/* Icon Badge */}
      <Box
        sx={{
          width: { xs: designTokens.iconBadge.medium.width, sm: designTokens.iconBadge.large.width },
          height: { xs: designTokens.iconBadge.medium.height, sm: designTokens.iconBadge.large.height },
          borderRadius: designTokens.radii.circle,
          backgroundColor: alpha(designTokens.colors.secondary[50], 0.8),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <SchoolIcon
          sx={{
            fontSize: { xs: designTokens.iconBadge.medium.iconSize, sm: designTokens.iconBadge.large.iconSize },
            color: designTokens.colors.primary[500],
          }}
          aria-hidden="true"
        />
      </Box>

      {/* Title */}
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: designTokens.typography.cardTitle.fontWeight,
          fontSize: designTokens.typography.cardTitle.fontSize,
          lineHeight: designTokens.typography.cardTitle.lineHeight,
          color: designTokens.colors.text.primary,
          mb: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {project.title}
      </Typography>

      {/* Metadata Chips (Status + Academic Year) */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}
      >
        <Chip
          label={project.status.replace('_', ' ')}
          color={getStatusColor(project.status)}
          size="small"
          sx={{
            textTransform: 'capitalize',
            fontSize: '0.7rem',
            height: 24,
          }}
          aria-label={`Project status: ${project.status.replace('_', ' ')}`}
        />
        {project.academic_year && (
          <Chip
            label={project.academic_year}
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.7rem',
              height: 24,
              borderColor: alpha(designTokens.colors.border[200], 0.8),
              color: designTokens.colors.text.secondary,
            }}
            aria-label={`Academic year: ${project.academic_year}`}
          />
        )}
      </Stack>

      {/* Abstract/Description */}
      <Typography
        variant="body2"
        sx={{
          fontSize: designTokens.typography.cardDescription.fontSize,
          lineHeight: designTokens.typography.cardDescription.lineHeight,
          color: designTokens.colors.text.secondary,
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {project.abstract}
      </Typography>

      {/* Rating (optional) */}
      {showRating && project.average_rating && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
          sx={{ mb: 2 }}
        >
          <Rating
            value={project.average_rating}
            readOnly
            size="small"
            precision={0.5}
            sx={{
              color: designTokens.colors.primary[500],
              '& .MuiRating-icon': {
                fontSize: { xs: '18px', sm: '20px' },
              },
            }}
            aria-label={`Rating: ${project.average_rating} stars`}
          />
          {project.rating_count !== undefined && (
            <Typography
              variant="caption"
              sx={{
                color: designTokens.colors.text.muted,
                fontSize: '12px',
              }}
            >
              ({project.rating_count})
            </Typography>
          )}
        </Stack>
      )}

      {/* Creator Info */}
      <Typography
        variant="caption"
        sx={{
          color: designTokens.colors.text.muted,
          fontSize: '12px',
          mb: 2,
        }}
      >
        By {project.creator?.full_name || 'Unknown'}
      </Typography>

      {/* Action Buttons */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mt: 'auto', pt: 1 }}
      >
        {showEdit && canEdit && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${project.id}/edit`);
            }}
            sx={{
              color: designTokens.colors.primary[500],
              '&:hover': {
                backgroundColor: alpha(designTokens.colors.primary[50], 0.5),
              },
            }}
            aria-label={`Edit project ${project.title}`}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate(getProjectDetailUrl(project));
          }}
          sx={{
            color: designTokens.colors.primary[500],
            '&:hover': {
              backgroundColor: alpha(designTokens.colors.primary[50], 0.5),
            },
          }}
          aria-label={`View project ${project.title}`}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Stack>
    </BasePortalCard>
  );
};
