import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from '@mui/material';
import { ProjectActivity } from '@/types';
import { apiService } from '@/lib/api';
import { ActivityItem } from './ActivityItem';

interface ActivityFeedProps {
  projectId: number;
  initialActivities?: ProjectActivity[];
}

const activityTypes = [
  { value: '', label: 'All Activities' },
  { value: 'project_created', label: 'Project Created' },
  { value: 'project_updated', label: 'Project Updated' },
  { value: 'status_change', label: 'Status Changes' },
  { value: 'file_upload', label: 'File Uploads' },
  { value: 'file_delete', label: 'File Deletions' },
  { value: 'comment_added', label: 'Comments' },
  { value: 'milestone_started', label: 'Milestone Started' },
  { value: 'milestone_completed', label: 'Milestone Completed' },
  { value: 'milestone_updated', label: 'Milestone Updated' },
];

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  projectId,
  initialActivities = [],
}) => {
  const [activities, setActivities] = useState<ProjectActivity[]>(initialActivities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [projectId, filterType]);

  const loadActivities = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProjectActivities(projectId, {
        activity_type: filterType || undefined,
        per_page: 20,
        page: pageNum,
      });
      
      if (pageNum === 1) {
        setActivities(response.activities);
      } else {
        setActivities(prev => [...prev, ...response.activities]);
      }
      
      setHasMore(response.pagination.current_page < response.pagination.last_page);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (activities: ProjectActivity[]): Record<string, ProjectActivity[]> => {
    const groups: Record<string, ProjectActivity[]> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    activities.forEach(activity => {
      const activityDate = new Date(activity.created_at);
      let groupKey: string;

      if (activityDate >= today) {
        groupKey = 'Today';
      } else if (activityDate >= yesterday) {
        groupKey = 'Yesterday';
      } else {
        const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) {
          groupKey = 'This Week';
        } else if (daysDiff <= 30) {
          groupKey = 'This Month';
        } else {
          groupKey = activityDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });

    return groups;
  };

  const groupedActivities = groupByDate(activities);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Activity Feed
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter by Type"
            >
              {activityTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && activities.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : Object.keys(groupedActivities).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No activities found
            </Typography>
          </Box>
        ) : (
          <Box>
            {Object.entries(groupedActivities).map(([dateGroup, dateActivities], index) => (
              <Box key={dateGroup}>
                {index > 0 && <Divider sx={{ my: 3 }} />}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {dateGroup}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {dateActivities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </Box>
              </Box>
            ))}
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => loadActivities(page + 1)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Load More'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

