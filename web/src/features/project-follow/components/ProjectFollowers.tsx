import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { ProjectFollower } from '@/types';
import { apiService } from '@/lib/api';

interface ProjectFollowersProps {
  projectId: number;
}

export const ProjectFollowers: React.FC<ProjectFollowersProps> = ({
  projectId,
}) => {
  const [followers, setFollowers] = useState<ProjectFollower[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFollowers();
  }, [projectId]);

  const loadFollowers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProjectFollowers(projectId);
      setFollowers(response.followers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Followers ({followers.length})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : followers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No followers yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {followers.map((follower) => (
              <ListItem
                key={follower.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {follower.user?.full_name
                      ? getUserInitials(follower.user.full_name)
                      : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={follower.user?.full_name || 'Unknown User'}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {follower.user?.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Following since {new Date(follower.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                {follower.user?.roles && follower.user.roles.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {follower.user.roles.map((role) => (
                      <Chip
                        key={role.id}
                        label={role.name}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

