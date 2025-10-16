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
  Divider,
  Alert,
  CircularProgress,
  Rating as MuiRating,
  Chip,
  Paper,
  Grid,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { Rating } from '../types';
import { apiService } from '../services/api';

interface ReadOnlyRatingSectionProps {
  projectId: number;
}

export const ReadOnlyRatingSection: React.FC<ReadOnlyRatingSectionProps> = ({ projectId }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, [projectId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRatings(projectId);
      setRatings(response.ratings || []);
      setAverageRating(response.average_rating);
      setTotalRatings(response.total_ratings);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    return (
      <MuiRating
        value={rating}
        readOnly
        size={size}
        icon={<StarIcon fontSize="inherit" />}
        emptyIcon={<StarBorderIcon fontSize="inherit" />}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
          Ratings & Reviews ({totalRatings})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Rating Summary */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" component="div" color="primary" fontWeight="bold">
                  {averageRating ? averageRating.toFixed(1) : '0.0'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  {renderStars(averageRating || 0, 'large')}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Want to rate this project?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please login to add your rating and review
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ mb: 2 }} />

        {/* Ratings List */}
        {ratings.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No ratings yet.
          </Typography>
        ) : (
          <List>
            {ratings.map((rating, index) => (
              <Box key={rating.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={rating.user?.avatar_url}>
                      {rating.user?.full_name?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {rating.user?.full_name}
                        </Typography>
                        {renderStars(rating.rating, 'small')}
                        <Chip 
                          size="small" 
                          label={`${rating.rating} star${rating.rating !== 1 ? 's' : ''}`} 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {formatDate(rating.created_at)}
                        </Typography>
                        {rating.review && (
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{rating.review}"
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < ratings.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
