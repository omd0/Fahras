import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Rating,
  Stack,
  Button,
  Paper,
  Fade,
  alpha,
} from '@mui/material';
import { legacyColors as guestColors, createDecorativeElements, backgroundPatterns } from '@/styles/theme/colorPalette';
import {
  Bookmark as BookmarkIcon,
  Visibility as VisibilityIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';
import { getGuestBookmarks } from '@/utils/bookmarkCookies';
import { BookmarkButton } from '@/features/bookmarks/components/BookmarkButton';

const COLORS = guestColors;
const decorativeElements = createDecorativeElements();

export const MyBookmarksPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarkedProjects();
  }, [isAuthenticated]);

  const fetchBookmarkedProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Fetch from API for authenticated users
        const response = await apiService.getBookmarkedProjects();
        setProjects(response.data || []);
      } else {
        // For guests, read from cookies and fetch project details
        const guestBookmarkIds = getGuestBookmarks();
        if (guestBookmarkIds.length === 0) {
          setProjects([]);
          setLoading(false);
          return;
        }

        // Fetch project details for each bookmarked ID
        const projectPromises = guestBookmarkIds.map(id => 
          apiService.getProject(id).catch(() => null)
        );
        const projectResponses = await Promise.all(projectPromises);
        const validProjects = projectResponses
          .filter(response => response !== null)
          .map(response => response!.project)
          .filter(project => project.admin_approval_status === 'approved');
        
        setProjects(validProjects);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch bookmarked projects:', error);
      setError(error.response?.data?.message || error?.message || 'Failed to fetch bookmarked projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        ...backgroundPatterns.hero,
        position: 'relative',
        '&::before': decorativeElements.largeCircle,
        '&::after': decorativeElements.mediumCircle,
      }}>
        <Stack alignItems="center" spacing={3}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: COLORS.deepPurple,
            }} 
          />
          <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 500 }}>
            {t('Loading amazing projects...')}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      ...backgroundPatterns.content,
      position: 'relative',
      '&::before': decorativeElements.geometricBackground,
    }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              mb: 6,
              p: { xs: 3, sm: 4, md: 6 },
              ...backgroundPatterns.hero,
              color: COLORS.textPrimary,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              boxShadow: `0 16px 48px ${alpha(COLORS.deepPurple, 0.15)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  background: guestColors.primaryGradient,
                  boxShadow: `0 10px 40px ${alpha(COLORS.deepPurple, 0.25)}`,
                }}
              >
                <BookmarkIcon sx={{ fontSize: { xs: 40, md: 50 }, color: COLORS.white }} />
              </Avatar>
              <Box>
                <Typography variant="h1" sx={{ 
                  fontWeight: 800, 
                  mb: 2, 
                  color: COLORS.textPrimary,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                }}>
                  {t('My Bookmarks')}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: COLORS.textSecondary,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                }}>
                  {t('Bookmarked Projects')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Fade>

        {/* Guest Login Prompt */}
        {!isAuthenticated && projects.length > 0 && (
          <Fade in timeout={1000}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 4, 
                borderRadius: 4,
                boxShadow: `0 8px 24px ${alpha(COLORS.deepPurple, 0.15)}`,
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => navigate('/login')}
                  sx={{ fontWeight: 600 }}
                >
                  {t('Login')}
                </Button>
              }
            >
              {t('Login to sync your bookmarks')}
            </Alert>
          </Fade>
        )}

        {/* Error Alert */}
        {error && (
          <Fade in timeout={600}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: 4,
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <Fade in timeout={1200}>
            <Grid container spacing={4}>
              {projects.map((project) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <Card
                    sx={{
                      ...backgroundPatterns.card,
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        boxShadow: `0 24px 48px ${alpha(COLORS.almostBlack, 0.2)}`,
                      },
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              color: COLORS.textPrimary,
                              mb: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {project.title}
                          </Typography>
                        </Box>
                        <Box onClick={(e) => e.stopPropagation()}>
                          <BookmarkButton projectId={project.id} size="medium" />
                        </Box>
                      </Stack>

                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: COLORS.textSecondary,
                          mb: 4, 
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.6,
                        }}
                      >
                        {project.abstract}
                      </Typography>

                      {project.average_rating && project.rating_count && (
                        <Box sx={{ mb: 3 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Rating
                              value={project.average_rating}
                              readOnly
                              precision={0.1}
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: COLORS.deepPurple,
                                },
                              }}
                            />
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                              {project.average_rating.toFixed(1)} ({project.rating_count} {t('ratings')})
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        sx={{
                          background: guestColors.primaryGradient,
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(COLORS.almostBlack, 0.3)}`,
                          },
                        }}
                      >
                        {t('View Project')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Fade>
        ) : (
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Avatar
                sx={{
                  width: 140,
                  height: 140,
                  background: `linear-gradient(135deg, ${alpha(COLORS.almostBlack, 0.08)} 0%, ${alpha(COLORS.lightSkyBlue, 0.08)} 100%)`,
                  mx: 'auto',
                  mb: 4,
                  border: `3px solid ${alpha(COLORS.almostBlack, 0.2)}`,
                }}
              >
                <BookmarkIcon sx={{ fontSize: 70, color: COLORS.almostBlack }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 3 }}>
                {t('No bookmarked projects')}
              </Typography>
              <Typography variant="h6" sx={{ color: COLORS.textSecondary, mb: 6, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                {t('Start exploring projects and bookmark your favorites to view them here later!')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<RocketIcon />}
                onClick={() => navigate('/explore')}
                sx={{
                  background: guestColors.primaryGradient,
                  color: COLORS.white,
                  px: 8,
                  py: 2.5,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 4,
                  textTransform: 'none',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 30px ${alpha(COLORS.almostBlack, 0.3)}`,
                  },
                }}
              >
                {t('Explore Projects')}
              </Button>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};
