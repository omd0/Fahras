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
  Stack,
  Fade,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ThumbUp as ThumbUpIcon,
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

        <Box sx={{ p: 3 }}>
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
              p: 4, 
              mb: 4, 
              borderRadius: 3,
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
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
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
              <Grid size={{ xs: 12, md: 6 }}>
                <Fade in timeout={1000}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        border: '2px dashed',
                        borderColor: 'primary.light',
                        mb: 2,
                      }}
                    >
                      <StarIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                        Want to rate this project?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please login to add your rating and review
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              </Grid>
            </Grid>
          </Paper>

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
                This project hasn't been rated yet.
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
                      <ListItem sx={{ p: 3 }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={rating.user?.avatar_url}
                            sx={{ 
                              width: 48, 
                              height: 48,
                              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                              fontWeight: 600,
                              fontSize: '1.1rem',
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
                                    p: 2, 
                                    borderRadius: 2,
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
