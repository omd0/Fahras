import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon,
  PauseCircle as PauseCircleIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ProjectMilestone } from '@/types';
import { SvgIconComponent } from '@mui/icons-material';

interface MilestoneTimelineItemProps {
  milestone: ProjectMilestone;
  status: ProjectMilestone['status'] | 'overdue';
  progress: number;
  StatusIcon: SvgIconComponent;
  statusColor: string;
  onClick: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  canEdit?: boolean;
}

export const MilestoneTimelineItem: React.FC<MilestoneTimelineItemProps> = ({
  milestone,
  status,
  progress,
  StatusIcon,
  statusColor,
  onClick,
  onStart,
  onComplete,
  canEdit = false,
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return formatDate(dateString);
    }
  };

  const isOverdue = status === 'overdue' || (milestone.due_date && new Date(milestone.due_date) < new Date() && milestone.status !== 'completed');

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: `2px solid ${statusColor}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 4px 12px ${statusColor}40`,
          transform: 'translateY(-2px)',
        },
        height: '100%',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <StatusIcon
            sx={{
              color: statusColor,
              fontSize: 28,
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {milestone.title}
            </Typography>
            {milestone.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {milestone.description}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Chip
            label={status.replace('_', ' ').toUpperCase()}
            size="small"
            sx={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 20,
            }}
          />
        </Box>

        {milestone.due_date && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Due Date
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: isOverdue ? '#f44336' : 'text.primary',
              }}
            >
              {formatDate(milestone.due_date)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isOverdue ? '#f44336' : 'text.secondary',
                fontWeight: isOverdue ? 600 : 400,
              }}
            >
              {getRelativeTime(milestone.due_date)}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: statusColor }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: statusColor,
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {milestone.dependencies && milestone.dependencies.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Depends on {milestone.dependencies.length} milestone{milestone.dependencies.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {canEdit && (onStart || onComplete) && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            {onStart && milestone.status === 'not_started' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  backgroundColor: '#2196f3',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                }}
              >
                Start
              </Button>
            )}
            {onComplete && milestone.status === 'in_progress' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  backgroundColor: '#4caf50',
                  '&:hover': {
                    backgroundColor: '#388e3c',
                  },
                }}
              >
                Complete
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

