'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  useTheme,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  Visibility as VisibilityIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';
import { getGuestBookmarks } from '@/utils/bookmarkCookies';
import { BookmarkButton } from '@/features/bookmarks/components/BookmarkButton';
import { getErrorMessage } from '@/utils/errorHandling';

export default function BookmarksPage() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarkedProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const response = await apiService.getBookmarkedProjects();
        setProjects(response.data || []);
      } else {
        const guestBookmarkIds = getGuestBookmarks();
        if (guestBookmarkIds.length === 0) {
          setProjects([]);
          setLoading(false);
          return;
        }

        const projectPromises = guestBookmarkIds.map(id =>
          apiService.getProject(String(id)).catch(() => null),
        );
        const projectResponses = await Promise.all(projectPromises);
        const validProjects = projectResponses
          .filter((response): response is { project: Project } => response !== null && response?.project)
          .map(response => response.project)
          .filter(project => project.admin_approval_status === 'approved');

        setProjects(validProjects);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch bookmarked projects:', err);
      setError(getErrorMessage(err, 'Failed to fetch bookmarked projects'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookmarkedProjects();
  }, [fetchBookmarkedProjects]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.background.default,
        }}
      >
        <Stack alignItems="center" spacing={3}>
          <CircularProgress size={52} />
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            {t('Loading amazing projects...')}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              mb: 5,
              p: { xs: 3, sm: 4, md: 6 },
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[4],
              '&::before': {
                content: '""',
                position: 'absolute',
                borderRadius: '50%',
                width: 300,
                height: 300,
                top: -150,
                right: -100,
                background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.08)} 0%, transparent 60%)`,
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                borderRadius: '50%',
                width: 200,
                height: 200,
                bottom: -100,
                left: -80,
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 60%)`,
                pointerEvents: 'none',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                sx={{
                  width: { xs: 72, md: 96 },
                  height: { xs: 72, md: 96 },
                  bgcolor: theme.palette.info.main,
                  boxShadow: theme.shadows[6],
                }}
              >
                <BookmarkIcon sx={{ fontSize: { xs: 36, md: 48 }, color: theme.palette.info.contrastText }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    color: theme.palette.text.primary,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  }}
                >
                  {t('My Bookmarks')}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {projects.length > 0
                    ? `${projects.length} ${t('bookmarked projects')}`
                    : t('Bookmarked Projects')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Fade>

        {!isAuthenticated && projects.length > 0 && (
          <Fade in timeout={1000}>
            <Alert
              severity="info"
              sx={{
                mb: 4,
                borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => router.push('/login')}
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

        {error && (
          <Fade in timeout={600}>
            <Alert
              severity="error"
              sx={{
                mb: 4,
                borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {projects.length > 0 ? (
          <Fade in timeout={1200}>
            <Grid container spacing={4}>
              {projects.map((project) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <Card
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      boxShadow: theme.shadows[1],
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: theme.shadows[8],
                        borderColor: theme.palette.primary.light,
                      },
                    }}
                    onClick={() => router.push(`/pr/${project.slug || project.id}`)}
                  >
                    <CardContent sx={{ p: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.text.primary,
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.4,
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
                          color: theme.palette.text.secondary,
                          mb: 3,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.7,
                        }}
                      >
                        {project.abstract}
                      </Typography>

                      {project.average_rating != null && project.rating_count != null && project.rating_count > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Rating
                              value={project.average_rating}
                              readOnly
                              precision={0.1}
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: theme.palette.warning.main,
                                },
                              }}
                            />
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                              {project.average_rating.toFixed(1)} ({project.rating_count} {t('ratings')})
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        color="primary"
                        sx={{
                          borderRadius: `${theme.shape.borderRadius}px`,
                          px: 3,
                          py: 1.2,
                          fontWeight: 600,
                          textTransform: 'none',
                          mt: 'auto',
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
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  mx: 'auto',
                  mb: 4,
                  border: `3px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <BookmarkIcon sx={{ fontSize: 60, color: theme.palette.info.main }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 2 }}>
                {t('No bookmarked projects')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 5,
                  maxWidth: 480,
                  mx: 'auto',
                  lineHeight: 1.7,
                }}
              >
                {t('Start exploring projects and bookmark your favorites to view them here later!')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<RocketIcon />}
                onClick={() => router.push('/explore')}
                color="primary"
                sx={{
                  px: 6,
                  py: 1.8,
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
                  textTransform: 'none',
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
}
