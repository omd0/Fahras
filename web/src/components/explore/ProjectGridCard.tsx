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
  useTheme,
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

export const ProjectGridCard: React.FC<ProjectGridCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <BasePortalCard
      onClick={() => navigate(getProjectDetailUrl(project))}
      ariaLabel={`Project: ${project.title}`}
    >
      <Box
        sx={{
          width: { xs: 64, sm: 80 },
          height: { xs: 64, sm: 80 },
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.secondary.light, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Box
          sx={{
            fontSize: { xs: 32, sm: 40 },
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {getProjectIcon(project.title)}
        </Box>
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '16px', sm: '18px' },
          lineHeight: 1.3,
          color: theme.palette.text.primary,
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

      {project.academic_year && (
        <Tooltip title={`Created: ${new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} arrow>
          <Chip
            label={project.academic_year}
            size="small"
            variant="outlined"
            color="secondary"
            sx={{
              mb: 1.5,
              height: 24,
            }}
          />
        </Tooltip>
      )}

      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '13px', sm: '14px' },
          lineHeight: 1.5,
          color: theme.palette.text.secondary,
          mb: 2,
          maxWidth: 480,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {project.abstract}
      </Typography>

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
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
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
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.disabled,
                }}
              />
            )}
          </Stack>
        </Box>
      )}

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
                color: theme.palette.warning.main,
              },
            }}
          />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.875rem' }}>
            {project.average_rating.toFixed(1)} ({project.rating_count})
          </Typography>
        </Stack>
      )}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PersonIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
            }}
          >
            {project.creator?.full_name || 'Unknown'}
          </Typography>
        </Stack>
        {(project.files?.length ?? 0) > 0 && (
          <>
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              {'\u00B7'}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AttachFileIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                {project.files?.length} {t('files')}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>

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
            color: theme.palette.text.disabled,
            '&:hover': {
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
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
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
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
