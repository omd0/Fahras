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
  Fade,
  Slide,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  RateReview as RateReviewIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { Rating } from '../types';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';

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
      setError(error.response?.data?.message || 'Failed to fetch ratings');
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
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header with gradient background */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <StarIcon sx={{ fontSize: 28, color: '#ffd700' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                Ratings & Reviews
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PeopleIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {totalRatings} {totalRatings !== 1 ? 'reviews' : 'review'}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }} 
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Enhanced Rating Summary */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #059669 100%)',
              }
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Fade in timeout={800}>
                    <Box>
                      <Typography 
                        variant="h2" 
                        component="div" 
                        sx={{ 
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1,
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {averageRating ? averageRating.toFixed(1) : '0.0'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <MuiRating
                          value={averageRating || 0}
                          readOnly
                          size="large"
                          icon={<StarIcon fontSize="inherit" sx={{ color: '#ffd700' }} />}
                          emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ color: '#e5e7eb' }} />}
                        />
                      </Box>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
                        </Typography>
                      </Stack>
                    </Box>
                  </Fade>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Fade in timeout={1000}>
                  <Box>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: 'text.primary' }}>
                      Share Your Experience
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Typography variant="body1" fontWeight="500">Your Rating:</Typography>
                      <MuiRating
                        value={userRating}
                        onChange={(_, newValue) => {
                          setUserRating(newValue || 0);
                          if (!showReviewForm && newValue && newValue > 0) {
                            setShowReviewForm(true);
                          }
                        }}
                        icon={<StarIcon fontSize="inherit" sx={{ color: '#ffd700' }} />}
                        emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ color: '#e5e7eb' }} />}
                        sx={{
                          '& .MuiRating-iconFilled': {
                            color: '#ffd700',
                          },
                          '& .MuiRating-iconHover': {
                            color: '#ffb400',
                          },
                        }}
                      />
                      {userRating > 0 && (
                        <Chip 
                          size="small" 
                          label={`${userRating} star${userRating !== 1 ? 's' : ''}`} 
                          color="primary" 
                          variant="filled"
                          sx={{ 
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                          }}
                        />
                      )}
                    </Box>
                    {userRating > 0 && (
                      <Slide direction="up" in={userRating > 0} timeout={500}>
                        <Button
                          variant="contained"
                          startIcon={<RateReviewIcon />}
                          onClick={() => setShowReviewForm(!showReviewForm)}
                          size="medium"
                          sx={{
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          {showReviewForm ? 'Hide' : 'Add'} Review
                        </Button>
                      </Slide>
                    )}
                  </Box>
                </Fade>
              </Grid>
            </Grid>
          </Paper>

          {/* Enhanced Review Form */}
          <Slide direction="down" in={showReviewForm} timeout={500}>
            <Paper 
              elevation={0}
              sx={{ 
                mb: 2, 
                p: 1.5, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '1px solid',
                borderColor: 'primary.light',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: 'white',
                  }}
                >
                  <RateReviewIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Write a Review
                </Typography>
              </Stack>
              
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Share your thoughts about this project..."
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                variant="outlined"
                size="medium"
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: '56px',
                    fontSize: '0.875rem',
                    padding: '8px 12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                  },
                }}
              />
              
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setShowReviewForm(false);
                    setUserReview('');
                  }}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 0.5,
                    fontSize: '0.75rem',
                    borderColor: 'text.secondary',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'text.primary',
                      color: 'text.primary',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={submitting ? <CircularProgress size={12} /> : <StarIcon sx={{ fontSize: 16 }} />}
                  onClick={handleRatingSubmit}
                  disabled={userRating === 0 || submitting}
                  sx={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                      color: 'grey.500',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </Stack>
            </Paper>
          </Slide>

          {/* Enhanced Divider */}
          <Box sx={{ mb: 3 }}>
            <Divider 
              sx={{ 
                '&::before, &::after': {
                  borderColor: 'divider',
                }
              }}
            >
              <Chip 
                label="Reviews" 
                size="small" 
                sx={{ 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Divider>
          </Box>

          {/* Enhanced Ratings List */}
          {ratings.length === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  color: 'white',
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <StarIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                No ratings yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to rate this project and share your experience!
              </Typography>
            </Paper>
          ) : (
            <List sx={{ p: 0 }}>
              {ratings.map((rating, index) => (
                <Fade in timeout={600 + index * 100} key={rating.id}>
                  <Box>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        mb: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      <ListItem sx={{ p: 2 }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={rating.user?.avatar_url}
                            sx={{ 
                              width: 40, 
                              height: 40,
                              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                              fontWeight: 600,
                              fontSize: '1rem',
                            }}
                          >
                            {rating.user?.full_name?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                {rating.user?.full_name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {renderStars(rating.rating, 'small')}
                                <Chip 
                                  size="small" 
                                  label={`${rating.rating} star${rating.rating !== 1 ? 's' : ''}`} 
                                  variant="filled"
                                  sx={{
                                    background: 'linear-gradient(135deg, #ffd700 0%, #ffb400 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                              {user?.id === rating.user_id && (
                                <Chip 
                                  size="small" 
                                  label="Your Rating" 
                                  color="primary" 
                                  variant="filled"
                                  sx={{
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                <ThumbUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                  {formatDate(rating.created_at)}
                                </Typography>
                              </Stack>
                              {rating.review && (
                                <Paper 
                                  elevation={0}
                                  sx={{ 
                                    p: 1.5, 
                                    borderRadius: 1.5,
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontStyle: 'italic',
                                      color: 'text.primary',
                                      lineHeight: 1.6,
                                      '&::before': {
                                        content: '"',
                                        fontSize: '1.2em',
                                        color: 'primary.main',
                                        fontWeight: 'bold',
                                      },
                                      '&::after': {
                                        content: '"',
                                        fontSize: '1.2em',
                                        color: 'primary.main',
                                        fontWeight: 'bold',
                                      }
                                    }}
                                  >
                                    {rating.review}
                                  </Typography>
                                </Paper>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    </Paper>
                  </Box>
                </Fade>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
