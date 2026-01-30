import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Rating,
  Stack,
  Tooltip,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  AttachFile as AttachFileIcon,
  Code as CodeIcon,
  DesignServices as DesignIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  Computer as ComputerIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { getProjectDetailUrl } from '@/utils/projectRoutes';
import { useLanguage } from '@/providers/LanguageContext';
import { BookmarkButton } from '@/features/bookmarks/components/BookmarkButton';
import { BasePortalCard } from '@/components/shared/BasePortalCard';
import { designTokens } from '@/styles/designTokens';

interface ProjectGridCardProps {
  project: Project;
}

const getProjectIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('web') || lowerTitle.includes('app') || lowerTitle.includes('software')) {
    return <CodeIcon />;
  } else if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) {
    return <DesignIcon />;
  } else if (lowerTitle.includes('business') || lowerTitle.includes('management') || lowerTitle.includes('marketing')) {
    return <BusinessIcon />;
  } else if (lowerTitle.includes('engineering') || lowerTitle.includes('mechanical') || lowerTitle.includes('electrical')) {
    return <EngineeringIcon />;
  } else if (lowerTitle.includes('computer') || lowerTitle.includes('ai') || lowerTitle.includes('machine learning')) {
    return <ComputerIcon />;
  } else {
    return <ScienceIcon />;
  }
};

/**
 * Shared Project Card Component for Project Grid
 * Used by both ProjectGrid and VirtualizedProjectGrid
 */
export const ProjectGridCard: React.FC<ProjectGridCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
        <Box
          sx={{
            fontSize: { xs: designTokens.iconBadge.medium.iconSize, sm: designTokens.iconBadge.large.iconSize },
            color: designTokens.colors.primary[500],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {getProjectIcon(project.title)}
        </Box>
      </Box>

      {/* Title and Year */}
      <Typography
        variant="h6"
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

      {/* Academic Year Chip */}
      {project.academic_year && (
        <Tooltip title={`Created: ${new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} arrow>
          <Chip
            label={project.academic_year}
            size="small"
            sx={{
              mb: 1.5,
              fontSize: '0.75rem',
              height: 24,
              borderColor: alpha(designTokens.colors.border[200], 0.8),
              color: designTokens.colors.text.secondary,
            }}
            variant="outlined"
          />
        </Tooltip>
      )}

      {/* Abstract */}
      <Typography
        variant="body2"
        sx={{
          fontSize: designTokens.typography.cardDescription.fontSize,
          lineHeight: designTokens.typography.cardDescription.lineHeight,
          color: designTokens.colors.text.secondary,
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {project.abstract}
      </Typography>

      {/* Keywords */}
      {project.keywords && project.keywords.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} justifyContent="center">
            {project.keywords.slice(0, 3).map((keyword, idx) => (
              <Chip
                key={idx}
                label={keyword}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  borderColor: alpha(designTokens.colors.border[200], 0.6),
                  color: designTokens.colors.text.secondary,
                }}
              />
            ))}
            {project.keywords.length > 3 && (
              <Chip
                label={`+${project.keywords.length - 3} ${t('more')}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  borderColor: alpha(designTokens.colors.border[200], 0.6),
                  color: designTokens.colors.text.muted,
                }}
              />
            )}
          </Stack>
        </Box>
      )}

      {/* Rating */}
      {project.average_rating && project.rating_count && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Rating
            value={project.average_rating}
            readOnly
            precision={0.1}
            size="small"
            sx={{
              '& .MuiRating-iconFilled': {
                color: designTokens.colors.primary[500],
              },
            }}
          />
          <Typography variant="body2" sx={{ color: designTokens.colors.text.secondary, fontWeight: 600, fontSize: '0.875rem' }}>
            {project.average_rating.toFixed(1)} ({project.rating_count})
          </Typography>
        </Stack>
      )}

      {/* Metadata Row */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PersonIcon sx={{ fontSize: 16, color: designTokens.colors.text.muted }} />
          <Typography
            variant="caption"
            sx={{
              color: designTokens.colors.text.secondary,
              fontSize: '0.75rem',
            }}
          >
            {project.creator?.full_name || 'Unknown'}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: designTokens.colors.text.muted }}>
          ·
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <AttachFileIcon sx={{ fontSize: 16, color: designTokens.colors.text.muted }} />
          <Typography variant="caption" sx={{ color: designTokens.colors.text.secondary, fontSize: '0.75rem' }}>
            {project.files?.length || 0} {t('files')}
          </Typography>
        </Stack>
      </Stack>

      {/* Action Icons */}
      <Stack
        direction="row"
        spacing={0.5}
        justifyContent="center"
        sx={{ mt: 'auto', pt: 1 }}
      >
        <BookmarkButton
          projectId={project.id}
          size="small"
          sx={{
            color: designTokens.colors.text.muted,
            '&:hover': {
              color: designTokens.colors.primary[500],
              backgroundColor: alpha(designTokens.colors.primary[50], 0.5),
            },
          }}
        />
        <Tooltip title={t('View Project')}>
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
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </BasePortalCard>
  );
};
