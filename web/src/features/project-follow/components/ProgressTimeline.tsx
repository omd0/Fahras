import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Create as CreateIcon,
  SwapHoriz as SwapHorizIcon,
  CheckCircle as CheckCircleIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { ProjectActivity, ProjectMilestone } from '@/types';

interface TimelineEvent {
  type: string;
  data: ProjectActivity | ProjectMilestone;
  date: string;
}

interface ProgressTimelineProps {
  activities: ProjectActivity[];
  milestones: ProjectMilestone[];
  statusChanges: ProjectActivity[];
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  activities,
  milestones,
  statusChanges,
}) => {
  const theme = useTheme();
  // Combine and sort all events chronologically
  const allEvents = [
    ...activities.map((a: ProjectActivity) => ({ type: 'activity', data: a, date: a.created_at })),
    ...milestones
      .filter((m: ProjectMilestone) => m.completed_at)
      .map((m: ProjectMilestone) => ({ type: 'milestone', data: m, date: m.completed_at! })),
    ...statusChanges.map((s: ProjectActivity) => ({ type: 'status', data: s, date: s.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getEventIcon = (event: TimelineEvent) => {
    if (event.type === 'milestone') return <CheckCircleIcon />;
    if (event.type === 'status') return <SwapHorizIcon />;
    if ('activity_type' in event.data && event.data.activity_type === 'file_upload') return <UploadIcon />;
    return <CreateIcon />;
  };

  const getEventColor = (event: TimelineEvent): string => {
    if (event.type === 'milestone') return 'success';
    if (event.type === 'status') return 'primary';
    return 'grey';
  };

  const getEventTitle = (event: TimelineEvent): string => {
    if (event.type === 'milestone') {
      return `Milestone Completed: ${event.data.title}`;
    }
    return event.data.title;
  };

  const getEventDescription = (event: TimelineEvent): string => {
    return event.data.description || '';
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Progress Timeline
        </Typography>

        {allEvents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No timeline events yet
            </Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', pl: 3 }}>
            {allEvents.slice(0, 20).map((event, index) => {
              const color = getEventColor(event);
              const colorMap: Record<string, string> = {
                success: theme.palette.success.main,
                primary: theme.palette.info.main,
                grey: theme.palette.grey[500],
              };
              const eventColor = colorMap[color] || colorMap.grey;

              return (
                <React.Fragment key={index}>
                  <Box sx={{ display: 'flex', gap: 2, pb: 3, position: 'relative' }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        sx={{
                          bgcolor: `${eventColor}20`,
                          color: eventColor,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getEventIcon(event)}
                      </Avatar>
                      {index < allEvents.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 40,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 2,
                            height: 'calc(100% + 12px)',
                            bgcolor: 'divider',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {getEventTitle(event)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {' '}
                          {new Date(event.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                      {getEventDescription(event) && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {getEventDescription(event)}
                        </Typography>
                      )}
                      {'user' in event.data && event.data.user && (
                        <Typography variant="caption" color="text.secondary">
                          by {(event.data as ProjectActivity).user?.full_name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

