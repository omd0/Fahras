import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { BookmarkButton } from '@/features/bookmarks/components/BookmarkButton';

interface RepositoryHeaderProps {
  project: Project;
  onBack?: () => void;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({
  project,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: 3,
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={handleBack} size="small">
          <ArrowBackIcon />
        </IconButton>

        <Breadcrumbs separator="›" sx={{ flexGrow: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/dashboard')}
            sx={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            Dashboard
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/explore')}
            sx={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            Projects
          </Link>
          <Typography variant="body2" color="text.primary">
            {project.title}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookmarkButton projectId={project.id} variant="icon" />
          
          <Tooltip title="Download ZIP">
            <IconButton size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="More options">
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          {project.title}
        </Typography>

        {project.status && (
          <Chip
            label={project.status.replace('_', ' ').toUpperCase()}
            size="small"
            color={
              project.status === 'approved' || project.status === 'completed'
                ? 'success'
                : project.status === 'rejected'
                ? 'error'
                : 'default'
            }
          />
        )}

        {project.is_public && (
          <Chip label="Public" size="small" color="info" />
        )}
      </Box>

      {project.abstract && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, maxWidth: '80%' }}
        >
          {project.abstract}
        </Typography>
      )}
    </Box>
  );
};



