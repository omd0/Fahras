import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
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
import { guestColors } from '@/styles/theme/guestTheme';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';
import { Rating } from '@/types';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';

interface RatingSectionProps {
  projectId: number;
}

export const RatingSection: React.FC<RatingSectionProps> = ({ projectId }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { user } = useAuthStore();

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

      // Find user's existing rating
      const existingRating = response.ratings?.find(r => r.user_id === user?.id);
      if (existingRating) {
        setUserRating(existingRating.rating);
        setUserReview(existingRating.review || '');
      }
    } catch (error: any) {
      // For guest users, don't show error if it's an authentication issue
      if (error.response?.status === 401 && !user) {
        setRatings([]);
        setAverageRating(null);
        setTotalRatings(0);
        setError(null);
      } else {
        setError(error.response?.data?.message || 'Failed to fetch ratings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (userRating === 0) return;

    try {
      setSubmitting(true);
      const response = await apiService.rateProject(
        projectId, 
        userRating, 
        userReview.trim() || undefined
      );
      
      // Update the ratings list
      const updatedRatings = ratings.filter(r => r.user_id !== user?.id);
      setRatings([response.rating, ...updatedRatings]);
      
      // Recalculate average rating
      const allRatings = [response.rating, ...updatedRatings];
      const newAverage = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      setAverageRating(Math.round(newAverage * 10) / 10);
      setTotalRatings(allRatings.length);
      
      setShowReviewForm(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
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
    <Card sx={{
      borderRadius: '8px',
      border: '1px solid rgba(189, 195, 199, 0.3)',
      background: guestColors.white,
      boxShadow: '0 2px 8px rgba(44, 62, 80, 0.1)',
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
            {user && (
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body1">Your Rating:</Typography>
                  <MuiRating
                    value={userRating}
                    onChange={(_, newValue) => {
                      setUserRating(newValue || 0);
                      if (!showReviewForm && newValue && newValue > 0) {
                        setShowReviewForm(true);
                      }
                    }}
                    icon={<StarIcon fontSize="inherit" />}
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                  />
                  {userRating > 0 && (
                    <Chip 
                      size="small" 
                      label={`${userRating} star${userRating !== 1 ? 's' : ''}`} 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </Box>
                {userRating > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<RateReviewIcon />}
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    size="small"
                  >
                    {showReviewForm ? 'Hide' : 'Add'} Review
                  </Button>
                )}
              </Grid>
            )}

            {!user && (
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  textAlign: 'center',
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Want to rate this project? 
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => window.location.href = '/login'}
                      sx={{ ml: 1, color: 'primary.main', fontWeight: 600 }}
                    >
                      Sign in
                    </Button>
                    to add your rating and review!
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Review Form - Only show for authenticated users */}
        {user && showReviewForm && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Write a Review
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Share your thoughts about this project..."
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowReviewForm(false);
                  setUserReview('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={submitting ? <CircularProgress size={16} /> : <StarIcon />}
                onClick={handleRatingSubmit}
                disabled={userRating === 0 || submitting}
                sx={{
                  background: guestColors.softYellow,
                  color: guestColors.white,
                  borderRadius: '8px',
                  fontWeight: 600,
                  '&:hover': {
                    background: guestColors.softOrange,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(241, 196, 15, 0.3)',
                  },
                  '&:disabled': {
                    background: guestColors.lightGray,
                    color: guestColors.darkGray,
                  },
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Ratings List */}
        {ratings.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No ratings yet. Be the first to rate this project!
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
                        {user?.id === rating.user_id && (
                          <Chip 
                            size="small" 
                            label="Your Rating" 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
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
