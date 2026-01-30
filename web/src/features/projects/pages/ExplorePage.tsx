import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Alert,
  Paper,
  Stack,
  alpha,
  Button,
  Fade,
  Grid,
  Skeleton,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  FormControl,
} from '@mui/material';
import { legacyColors as guestColors, createDecorativeElements, backgroundPatterns } from '@/styles/theme/colorPalette';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  EmojiEvents as EmojiEventsIcon,
  Rocket as RocketIcon,
  FilterList as FilterIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { useLanguage } from '@/providers/LanguageContext';
import { SavedSearches } from '@/components/explore/SavedSearches';
import { SmartProjectGrid } from '@/components/explore/SmartProjectGrid';
import { ProjectGridSkeleton } from '@/components/skeletons';
import { useAuthStore } from '@/features/auth/store';
import { getGuestBookmarks } from '@/utils/bookmarkCookies';

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
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
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

  const { t } = useLanguage();
  const { isAuthenticated } = useAuthStore();

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
    setShowSavedOnly(false);
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadSavedSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // Trigger search with new filters after state update
    // Note: Since setFilters is async, we call search with newFilters directly
    // Ideally we would extract search logic to accept filters param
    // For now we'll rely on useEffect or manual trigger, but let's manual trigger:
    // Actually we need to search using these filters.
    // Let's refactor handleSearch to take optional filters?
    // Or just set filters and let user click search?
    // Usually loading a saved search should trigger search.
    // Let's try to trigger it manually:
    const params: any = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.program_id) params.program_id = newFilters.program_id;
    if (newFilters.department_id) params.department_id = newFilters.department_id;
    if (newFilters.academic_year) params.academic_year = newFilters.academic_year;
    if (newFilters.semester) params.semester = newFilters.semester;
    if (newFilters.sort_by) params.sort_by = newFilters.sort_by;
    if (newFilters.sort_order) params.sort_order = newFilters.sort_order;

    setLoading(true); // show loading state briefly
    apiService.getProjects(params)
      .then((response) => {
        const projectsData = Array.isArray(response) ? response : response.data || [];
        setFilteredProjects(projectsData);
      })
      .catch((error: any) => {
        console.error('Failed to load saved search:', error);
        setError('Failed to load saved search');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleToggleSavedFilter = async () => {
    const newShowSavedOnly = !showSavedOnly;
    setShowSavedOnly(newShowSavedOnly);

    if (newShowSavedOnly) {
      // Filter to show only bookmarked projects
      try {
        setSearching(true);
        setError(null);

        if (isAuthenticated) {
          // Authenticated user: fetch bookmarks from API
          const response = await apiService.getBookmarkedProjects();
          const bookmarkedProjects = response.data || [];
          setFilteredProjects(bookmarkedProjects);
        } else {
          // Guest user: filter using cookie bookmarks
          const guestBookmarkIds = getGuestBookmarks();
          if (guestBookmarkIds.length > 0) {
            const bookmarkedProjects = projects.filter((project: Project) =>
              guestBookmarkIds.includes(project.id)
            );
            setFilteredProjects(bookmarkedProjects);
          } else {
            setFilteredProjects([]);
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch bookmarked projects:', error);
        setError(error.response?.data?.message || 'Failed to fetch bookmarked projects');
        setFilteredProjects([]);
      } finally {
        setSearching(false);
      }
    } else {
      // Show all projects again
      setFilteredProjects(projects);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        ...backgroundPatterns.content,
        position: 'relative',
        '&::before': decorativeElements.geometricBackground,
      }}>
        <Container maxWidth="xl" sx={{ py: 6 }}>
          {/* Hero Section Skeleton */}
          <Paper
            elevation={0}
            sx={{
              mb: 6,
              p: { xs: 3, sm: 4, md: 6 },
              ...backgroundPatterns.hero,
              borderRadius: 4,
            }}
          >
            <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
              <Grid size={{ xs: 12, md: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Skeleton variant="circular" width={140} height={140} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: "grow" }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="70%" height={30} />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Search Section Skeleton */}
          <Paper
            elevation={0}
            sx={{
              mb: 6,
              p: 5,
              ...backgroundPatterns.card,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={30} />
              </Box>
            </Stack>
            <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: 2 }} />
          </Paper>

          {/* Projects Grid Skeleton */}
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="30%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={30} />
              </Box>
            </Stack>
            <ProjectGridSkeleton 
              theme={{ 
                primary: COLORS.deepPurple, 
                borderColor: alpha(COLORS.almostBlack, 0.1) 
              } as any} 
              count={6} 
            />
          </Box>

          {/* All Projects Section Skeleton */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="30%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={30} />
              </Box>
            </Stack>
            <ProjectGridSkeleton 
              theme={{ 
                primary: COLORS.deepPurple, 
                borderColor: alpha(COLORS.almostBlack, 0.1) 
              } as any} 
              count={9} 
            />
          </Box>
        </Container>
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
              <Grid size={{ xs: 12, md: "grow" }}>
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

        {/* Browse/Explore Section with Category Scroller */}
        <Fade in timeout={1400}>
          <Paper
            elevation={0}
            sx={{
              mb: 6,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              background: 'white',
              overflow: 'hidden',
            }}
          >
            {/* Row 1 - Category Scroller */}
            <Box
              sx={{
                position: 'relative',
                background: 'white',
                borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                py: 2,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  px: 2,
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(COLORS.deepPurple, 0.3),
                    borderRadius: 2,
                  },
                }}
              >
                {/* Left scroll button */}
                <IconButton
                  size="small"
                  sx={{
                    flexShrink: 0,
                    background: 'white',
                    border: `1px solid ${alpha('#000', 0.12)}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    '&:hover': {
                      background: alpha(COLORS.deepPurple, 0.05),
                    },
                  }}
                >
                  <FilterIcon sx={{ transform: 'rotate(180deg)', fontSize: 20 }} />
                </IconButton>

                {/* Category Items */}
                {[
                  { label: t('Displays'), active: false },
                  { label: t('Wearables'), active: false },
                  { label: t('All categories'), active: false },
                  { label: t('Audio and sound'), active: true },
                  { label: t('Internet of things'), active: false },
                  { label: t('Installations'), active: false },
                  { label: t('Home automation'), active: false },
                  { label: t('Flying things'), active: false },
                  { label: t('Lab tools'), active: false },
                ].map((category, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 100,
                      cursor: 'pointer',
                      pb: 1,
                      borderBottom: category.active
                        ? `3px solid ${COLORS.deepPurple}`
                        : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderBottomColor: category.active
                          ? COLORS.deepPurple
                          : alpha(COLORS.deepPurple, 0.3),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: category.active
                          ? COLORS.deepPurple
                          : COLORS.textSecondary,
                        mb: 0.5,
                        '& svg': { fontSize: 28 },
                      }}
                    >
                      <SearchIcon />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: category.active ? 700 : 500,
                        color: category.active
                          ? COLORS.deepPurple
                          : COLORS.textSecondary,
                        textAlign: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      {category.label}
                    </Typography>
                  </Box>
                ))}

                {/* Right scroll button */}
                <IconButton
                  size="small"
                  sx={{
                    flexShrink: 0,
                    background: 'white',
                    border: `1px solid ${alpha('#000', 0.12)}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    '&:hover': {
                      background: alpha(COLORS.deepPurple, 0.05),
                    },
                  }}
                >
                  <FilterIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            </Box>

            {/* Row 2 - Search & Filters */}
            <Box sx={{ p: 3, background: 'white' }}>
              <Grid container spacing={2} alignItems="center">
                {/* Search Input */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={filters.search}
                    onChange={(e) => handleInputChange('search', e.target.value)}
                    placeholder={t('What do you want to make?')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: COLORS.textSecondary, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Dropdown Filters */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={filters.program_id}
                        onChange={(e) => handleInputChange('program_id', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">{t('Any type')}</MenuItem>
                        {programs.map((program: any) => (
                          <MenuItem key={program.id} value={program.id}>
                            {program.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <Select
                        value={filters.department_id}
                        onChange={(e) => handleInputChange('department_id', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">{t('Any difficulty')}</MenuItem>
                        {departments.map((dept: any) => (
                          <MenuItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>

                {/* Results Count & Sort */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {filteredProjects.length} {t('projects')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                      •
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'pointer' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.25,
                        }}
                      >
                        <Box
                          sx={{
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderBottom: `5px solid ${COLORS.deepPurple}`,
                          }}
                        />
                        <Box
                          sx={{
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: `5px solid ${alpha('#000', 0.3)}`,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {t('Trending')}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>

              {/* Search Button Row */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterIcon />}
                  sx={{
                    borderColor: alpha(COLORS.deepPurple, 0.3),
                    color: COLORS.deepPurple,
                    '&:hover': {
                      borderColor: COLORS.deepPurple,
                      background: alpha(COLORS.deepPurple, 0.05),
                    },
                  }}
                >
                  {t('Filters')}
                </Button>
                <Button
                  variant={showSavedOnly ? 'contained' : 'outlined'}
                  onClick={handleToggleSavedFilter}
                  startIcon={<BookmarkIcon />}
                  disabled={searching}
                  sx={{
                    ...(showSavedOnly ? {
                      background: guestColors.primaryGradient,
                      color: COLORS.white,
                      '&:hover': {
                        background: guestColors.primaryGradient,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(COLORS.deepPurple, 0.3)}`,
                      },
                    } : {
                      borderColor: alpha(COLORS.deepPurple, 0.3),
                      color: COLORS.deepPurple,
                      '&:hover': {
                        borderColor: COLORS.deepPurple,
                        background: alpha(COLORS.deepPurple, 0.05),
                      },
                    }),
                  }}
                >
                  {t('Saved')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searching}
                  sx={{
                    background: guestColors.primaryGradient,
                    color: COLORS.white,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(COLORS.deepPurple, 0.3)}`,
                    },
                  }}
                >
                  {t('Search')}
                </Button>
              </Box>
            </Box>

            <SavedSearches
              open={showSavedSearches}
              onClose={() => setShowSavedSearches(false)}
              currentFilters={filters}
              onLoadSearch={handleLoadSavedSearch}
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

              <SmartProjectGrid projects={topProjects} showTopBadge={true} virtualizationThreshold={50} />
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

            <SmartProjectGrid projects={filteredProjects} virtualizationThreshold={50} />
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
