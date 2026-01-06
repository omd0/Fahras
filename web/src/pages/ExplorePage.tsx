import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  alpha,
  Button,
  Fade,
  Grid,
} from '@mui/material';
import { guestColors, createDecorativeElements, backgroundPatterns } from '../theme/guestTheme';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  EmojiEvents as EmojiEventsIcon,
  Rocket as RocketIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AdvancedFilters } from '../components/explore/AdvancedFilters';
import { ProjectGrid } from '../components/explore/ProjectGrid';

interface SearchFilters {
  search: string;
  program_id: string;
  department_id: string;
  academic_year: string;
  semester: string;
  sort_by: string;
  sort_order: string;
}

// Use the new guest theme colors
const COLORS = guestColors;
const decorativeElements = createDecorativeElements();

export const ExplorePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [topProjects, setTopProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    program_id: '',
    department_id: '',
    academic_year: '',
    semester: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all approved projects for guest users
      const response = await apiService.getProjects({
        per_page: 1000, // Get all projects
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      const projectsData = Array.isArray(response) ? response : response.data || [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);

      // Get top projects (only those with actual ratings and high scores)
      const topProjectsData = [...projectsData]
        .filter(project => project.average_rating && project.average_rating >= 4.0 && project.rating_count && project.rating_count > 0)
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 6);
      setTopProjects(topProjectsData);

    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL
      });
      setError(error.response?.data?.message || error?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const programs = await apiService.getPrograms();
      setPrograms(programs || []);
    } catch (error: any) {
      console.error('Failed to fetch programs:', error);
      console.error('Programs error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL
      });
      setPrograms([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response || []);
    } catch (error: any) {
      console.error('Failed to fetch departments:', error);
      console.error('Departments error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL
      });
      setDepartments([]);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setError(null);

      // Build query parameters from filters
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.program_id) params.program_id = filters.program_id;
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.academic_year) params.academic_year = filters.academic_year;
      if (filters.semester) params.semester = filters.semester;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;

      const response = await apiService.getProjects(params);
      const projectsData = Array.isArray(response) ? response : response.data || [];

      setFilteredProjects(projectsData);
    } catch (error: any) {
      console.error('Failed to search projects:', error);
      setError(error.response?.data?.message || 'Failed to search projects');
      setFilteredProjects([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setFilters({
      search: '',
      program_id: '',
      department_id: '',
      academic_year: '',
      semester: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setFilteredProjects(projects);
    setShowFilters(false);
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
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
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(81, 45, 168, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(174, 223, 247, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(28, 40, 51, 0.04) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      },
    }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Hero Section */}
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
              boxShadow: `0 16px 48px ${alpha(COLORS.deepPurple, 0.15)}, 0 8px 24px ${alpha(COLORS.almostBlack, 0.1)}`,
              '&::before': {
                ...decorativeElements.largeCircle,
                background: `radial-gradient(circle, ${alpha(COLORS.deepPurple, 0.1)} 0%, transparent 60%)`,
                transform: 'translate(80px, -120px) scale(1.2)',
                opacity: 0.8,
              },
              '&::after': {
                ...decorativeElements.mediumCircle,
                background: `radial-gradient(circle, ${alpha(COLORS.lightSkyBlue, 0.07)} 0%, transparent 60%)`,
                transform: 'translate(-60px, 70px) scale(1.1)',
                opacity: 0.9,
              },
            }}
          >
            {/* Main Hero Content */}
            <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid size={{ xs: 12, md: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Avatar
                    sx={{
                      width: { xs: 100, md: 140 },
                      height: { xs: 100, md: 140 },
                      background: guestColors.primaryGradient,
                      border: `4px solid ${alpha(COLORS.white, 0.8)}`,
                      boxShadow: `0 10px 40px ${alpha(COLORS.deepPurple, 0.25)}`,
                    }}
                  >
                    <RocketIcon sx={{ fontSize: { xs: 50, md: 70 }, color: COLORS.white }} />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: true }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="h1" sx={{ 
                    fontWeight: 800, 
                    mb: 2, 
                    color: COLORS.textPrimary,
                    textShadow: `0 3px 8px ${alpha(COLORS.deepPurple, 0.15)}`,
                    fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4rem' },
                    lineHeight: 1.1,
                  }}>
                    {t('Explore Innovation 🚀')}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 400,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    maxWidth: '650px',
                    color: COLORS.textSecondary,
                    mx: { xs: 'auto', md: 0 },
                    lineHeight: 1.6,
                  }}>
                    {t('Discover groundbreaking graduation projects from TVTC students. Browse, learn, and get inspired by the next generation of innovators!')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Search and Filter Section */}
        <Fade in timeout={1400}>
          <Paper
            elevation={0}
            sx={{
              mb: 6,
              p: 5,
              ...backgroundPatterns.card,
              position: 'relative',
              '&::before': decorativeElements.smallCircle,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '20%',
                right: '5%',
                width: '60px',
                height: '60px',
                background: 'rgba(174, 223, 247, 0.08)',
                borderRadius: '50%',
                pointerEvents: 'none',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 4 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: guestColors.primaryGradient,
                  boxShadow: '0 4px 16px rgba(81, 45, 168, 0.25)',
                }}
              >
                <SearchIcon sx={{ fontSize: 28, color: COLORS.white }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                  {t('Smart Project Discovery')}
                </Typography>
                <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 400 }}>
                  {t('Find projects that match your interests and expertise')}
                </Typography>
              </Box>
            </Stack>

            <AdvancedFilters
              filters={filters}
              showFilters={showFilters}
              searching={searching}
              programs={programs}
              departments={departments}
              onFilterChange={handleInputChange}
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </Paper>
        </Fade>

        {/* Error Alert */}
        {error && (
          <Fade in timeout={600}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: 4,
                boxShadow: `0 8px 24px ${alpha(COLORS.error, 0.15)}`,
                border: `2px solid ${alpha(COLORS.error, 0.25)}`,
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Search Results Summary */}
        {filteredProjects.length !== projects.length && (
          <Fade in timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(COLORS.almostBlack, 0.08)} 0%, ${alpha(COLORS.lightSkyBlue, 0.08)} 100%)`,
                  border: `2px solid ${alpha(COLORS.almostBlack, 0.2)}`,
                  '& .MuiAlert-icon': {
                    color: COLORS.almostBlack,
                    fontSize: 24,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FilterIcon sx={{ fontSize: 24, color: COLORS.almostBlack }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                      {t('Showing')}{' '}
                      <strong style={{ color: COLORS.almostBlack }}>{filteredProjects.length}</strong>{' '}
                      {t('of')}{' '}
                      <strong style={{ color: COLORS.textSecondary }}>{projects.length}</strong>{' '}
                      {t('projects')}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ClearIcon />}
                    onClick={handleClearSearch}
                    disabled={searching}
                    sx={{
                      background: guestColors.primaryGradient,
                      color: COLORS.white,
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(COLORS.almostBlack, 0.3)}`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('Clear Filters')}
                  </Button>
                </Box>
              </Alert>
            </Box>
          </Fade>
        )}

        {/* Top Projects Section */}
        {topProjects.length > 0 && (
          <Fade in timeout={1200}>
            <Box sx={{ mb: 6 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: guestColors.secondaryGradient,
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 28, color: COLORS.textPrimary }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                    {t('Top Projects ⭐')}
                  </Typography>
                  <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 400 }}>
                    {t('Most highly rated and innovative projects')}
                  </Typography>
                </Box>
              </Stack>

              <ProjectGrid projects={topProjects} showTopBadge={true} />
            </Box>
          </Fade>
        )}

        {/* All Projects Grid */}
        <Fade in timeout={1600}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: guestColors.primaryGradient,
                }}
              >
                <RocketIcon sx={{ fontSize: 24, color: COLORS.white }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                  {t('All Projects')}
                </Typography>
                <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 400 }}>
                  {t('Explore all available graduation projects')}
                </Typography>
              </Box>
            </Stack>

            <ProjectGrid projects={filteredProjects} />
          </Box>
        </Fade>

        {/* No Results */}
        {filteredProjects.length === 0 && projects.length > 0 && (
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
                <SearchIcon sx={{ fontSize: 70, color: COLORS.almostBlack }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 3 }}>
                {t('No projects found')}
              </Typography>
              <Typography variant="h6" sx={{ color: COLORS.textSecondary, mb: 6, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                {t('We couldn\'t find any projects matching your search criteria. Try adjusting your filters to discover more amazing projects!')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<ClearIcon />}
                onClick={handleClearSearch}
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
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {t('Clear All Filters')}
              </Button>
            </Box>
          </Fade>
        )}

        {/* No Projects at All */}
        {projects.length === 0 && (
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
                <RocketIcon sx={{ fontSize: 70, color: COLORS.almostBlack }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 3 }}>
                {t('No projects available yet')}
              </Typography>
              <Typography variant="h6" sx={{ color: COLORS.textSecondary, mb: 6, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                {t('Check back later to discover amazing graduation projects from TVTC students! We\'re constantly adding new innovative projects to explore.')}
              </Typography>
              <Button
                variant="outlined"
                size="large"
                startIcon={<RocketIcon />}
                onClick={() => window.location.reload()}
                sx={{
                  borderColor: COLORS.almostBlack,
                  color: COLORS.almostBlack,
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 4,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: COLORS.almostBlack,
                    backgroundColor: alpha(COLORS.almostBlack, 0.08),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {t('Refresh Page')}
              </Button>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};
