import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Explore as ExploreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TVTCLogo } from '@/components/TVTCLogo';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import { Project } from '@/types';
import { useLanguage } from '@/providers/LanguageContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useLanguage();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" elevation={2} sx={{ bgcolor: '#1e3a8a' }}>
        <Toolbar>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {t('Fahras')} - {t('Projects')} {t('Repository')}
          </Typography>
          {!isAuthenticated && (
            <>
              <Button
                color="inherit"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{ mr: 1 }}
              >
                {t('Login')}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RegisterIcon />}
                onClick={() => navigate('/register')}
                sx={{ 
                  borderColor: 'white', 
                  '&:hover': { 
                    borderColor: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)' 
                  } 
                }}
              >
                {t('Register')}
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <TVTCLogo size="large" variant="full" color="inherit" sx={{ mb: 3 }} />
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                color: 'white',
              }}
              >
                {t('Welcome to Fahras')}
              </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                opacity: 0.95,
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: 'white',
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              {t('Discover and explore innovative graduation projects from students across TVTC programs')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleSubmitProject}
                sx={{
                  backgroundColor: 'white',
                  color: '#1e3a8a',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {t('Submit a Project')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ExploreIcon />}
                onClick={() => navigate('/explore')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {t('Explore Projects')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Recent Projects Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>
              {t('Recent Projects')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('Explore the latest graduation projects from our talented students')}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : recentProjects.length > 0 ? (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {recentProjects.map((project) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        transform: 'translateY(-4px)',
                        borderColor: '#3b82f6',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => navigate(`/projects/${project.id}`)}>
                      {/* Project Header */}
                      <Box
                        sx={{
                          height: 120,
                          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
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
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/explore')}
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
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

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#f1f5f9', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 64, color: '#1e3a8a', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1e3a8a' }}>
              {t('Ready to Share Your Work?')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              {t('Join TVTC\'s growing community of innovators. Submit your graduation project and showcase your achievements to the world.')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={isAuthenticated ? <AddIcon /> : <RegisterIcon />}
              onClick={isAuthenticated ? handleSubmitProject : () => navigate('/register')}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isAuthenticated ? t('Submit Your Project') : t('Get Started - Register Now')}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

