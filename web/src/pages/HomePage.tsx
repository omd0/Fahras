import React, { useState, useEffect } from 'react';
import { designTokens } from '@/styles/designTokens';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Explore as ExploreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import { Project } from '@/types';
import { useLanguage } from '@/providers/LanguageContext';
import { HeroCarousel, HeroSlide } from '@/components/shared/HeroCarousel';
import { SectionBand } from '@/components/shared/SectionBand';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useLanguage();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero carousel slides
  const heroSlides: HeroSlide[] = [
    {
      id: '1',
      backgroundImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
      title: t('Welcome to Fahras') || 'Welcome to Fahras',
      subtitle: t('Discover and explore innovative graduation projects from students across TVTC programs') || 'Discover innovative projects',
      ctaText: t('Explore Projects') || 'Explore',
      ctaAction: () => navigate('/explore'),
    },
    {
      id: '2',
      backgroundImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
      title: t('Share Your Innovation') || 'Share Your Innovation',
      subtitle: t('Showcase your graduation project and inspire the next generation of technologists') || 'Showcase your work',
      ctaText: t('Submit a Project') || 'Submit',
      ctaAction: () => handleSubmitProject(),
    },
    {
      id: '3',
      backgroundImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
      title: t('Join Our Community') || 'Join Our Community',
      subtitle: t('Connect with talented developers and collaborate on groundbreaking projects') || 'Connect and collaborate',
      ctaText: t('Get Started') || 'Start',
      ctaAction: () => navigate('/explore'),
    },
  ];

  useEffect(() => {
    // Redirect logged-in students to their dashboard
    if (isAuthenticated && user?.roles?.some(role => role.name === 'student')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    fetchRecentProjects();
  }, []);

  const fetchRecentProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects({
        per_page: 6,
        is_public: true,
        sort_by: 'created_at',
        sort_order: 'desc',
      });
      const projectsData = Array.isArray(response) ? response : response.data || [];
      setRecentProjects(projectsData);
    } catch (error: any) {
      console.error('Failed to fetch recent projects:', error);
      // If we get a 401 on HomePage, just clear auth and continue showing the page
      if (error.response?.status === 401) {
        localStorage.removeItem('auth-storage');
        // Don't redirect, just show the page without auth
      }
      setRecentProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProject = () => {
    if (isAuthenticated) {
      navigate('/projects/create');
    } else {
      // Store the intended destination for redirect after login
      navigate('/login', { state: { from: '/projects/create' } });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* Hero Carousel - Replaces old AppBar + Hero Section */}
      <HeroCarousel slides={heroSlides} autoplayInterval={6000} />

      {/* Section Band - Recent Projects Introduction */}
      <SectionBand
        title={t('Featured Projects') || 'Featured Projects'}
        subtitle={t('Explore the latest graduation projects from our talented students') || 'Discover innovative work'}
        variant="secondary"
        align="center"
        icon={<SchoolIcon sx={{ fontSize: 32 }} />}
      />

      {/* Recent Projects Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
            {t('Newest Submissions')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Check out what students have been working on')}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : recentProjects.length > 0 ? (
          <>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {recentProjects.map((project) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '14px',
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: 'none',
                      transition: 'all 0.2s ease-out',
                      '&:hover': {
                        borderColor: theme.palette.secondary.main,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => navigate(`/projects/${project.id}`)}>
                      {/* Project Header */}
                      <Box
                        sx={{
                          height: 120,
                          background: designTokens.colors.primary[500],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                        <Chip
                          label={project.status.replace('_', ' ')}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            borderRadius: '9999px',
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: 3 }}>
                        {/* Title */}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 2,
                            minHeight: 64,
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

                        {/* Abstract */}
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2,
                            minHeight: 60,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {project.abstract}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* Author */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {project.creator?.full_name || t('Unknown Author')}
                          </Typography>
                        </Box>

                        {/* Department */}
                        {project.program?.department && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {project.program.department.name}
                            </Typography>
                          </Box>
                        )}

                        {/* Academic Year & Semester */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {project.academic_year} • {project.semester}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Show More Button */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/explore')}
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.main,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-out',
                }}
              >
                {t('Show More Projects')}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('No projects available yet')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("Be the first to submit a project!")}
            </Typography>
          </Box>
        )}
      </Container>

      {/* CTA Section - Using SectionBand for visual consistency */}
      <SectionBand
        title={t('Ready to Share Your Work?') || 'Ready to Share Your Work?'}
        subtitle={t("Join TVTC's growing community of innovators. Submit your graduation project and showcase your achievements.") || 'Showcase your innovations'}
        icon={<SchoolIcon sx={{ fontSize: 32 }} />}
        ctaText={isAuthenticated ? (t('Submit Your Project') || 'Submit') : (t('Get Started - Register') || 'Register')}
        ctaAction={isAuthenticated ? handleSubmitProject : () => navigate('/register')}
        variant="primary"
        align="center"
      />
    </Box>
  );
};

