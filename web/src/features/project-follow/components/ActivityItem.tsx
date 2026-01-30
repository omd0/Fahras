import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Create as CreateIcon,
  Update as UpdateIcon,
  SwapHoriz as SwapHorizIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ProjectActivity } from '@/types';

interface ActivityItemProps {
  activity: ProjectActivity;
}

const activityIcons: Record<string, React.ReactNode> = {
  project_created: <CreateIcon />,
  project_updated: <UpdateIcon />,
  status_change: <SwapHorizIcon />,
  file_upload: <UploadIcon />,
  file_delete: <DeleteIcon />,
  comment_added: <CommentIcon />,
  milestone_started: <PlayArrowIcon />,
  milestone_completed: <CheckCircleIcon />,
  milestone_updated: <EditIcon />,
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }: ActivityItemProps) => {
  const theme = useTheme();

  const activityColors: Record<string, string> = {
    project_created: theme.palette.success.main,
    project_updated: theme.palette.info.main,
    status_change: theme.palette.warning.main,
    file_upload: theme.palette.secondary.main,
    file_delete: theme.palette.error.main,
    comment_added: theme.palette.info.light,
    milestone_started: theme.palette.info.main,
    milestone_completed: theme.palette.success.main,
    milestone_updated: theme.palette.warning.main,
  };

  const icon = activityIcons[activity.activity_type] || <CreateIcon />;
  const color = activityColors[activity.activity_type] || theme.palette.grey[500];
  const userInitials = activity.user?.full_name
    ? activity.user.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const getRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    } catch {
      return 'recently';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderColor: color,
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            bgcolor: `${color}20`,
            color: color,
            width: 40,
            height: 40,
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {activity.user?.full_name || 'Unknown User'}
            </Typography>
            <Chip
              label={activity.title}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: `${color}20`,
                color: color,
                fontWeight: 500,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {activity.description || activity.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getRelativeTime(activity.created_at)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

