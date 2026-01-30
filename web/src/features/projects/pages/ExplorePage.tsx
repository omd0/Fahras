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
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  EmojiEvents as EmojiEventsIcon,
  Explore as ExploreIcon,
  FilterList as FilterIcon,
  Bookmark as BookmarkIcon,
  Category as CategoryIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { Project, SearchFilters } from '@/types';
import { apiService } from '@/lib/api';
import { useLanguage } from '@/providers/LanguageContext';
import { SavedSearches } from '@/components/explore/SavedSearches';
import { SmartProjectGrid } from '@/components/explore/SmartProjectGrid';
import { ProjectGridSkeleton } from '@/components/skeletons';
import { useAuthStore } from '@/features/auth/store';
import { getGuestBookmarks } from '@/utils/bookmarkCookies';
import { useNavigate } from 'react-router-dom';

export const ExplorePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
    sort_order: 'desc' as const,
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
      setPrograms([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response || []);
    } catch (error: any) {
      console.error('Failed to fetch departments:', error);
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
      sort_order: 'desc' as const,
    });
    setFilteredProjects(projects);
    setShowFilters(false);
    setShowSavedOnly(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadSavedSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    const params: any = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.program_id) params.program_id = newFilters.program_id;
    if (newFilters.department_id) params.department_id = newFilters.department_id;
    if (newFilters.academic_year) params.academic_year = newFilters.academic_year;
    if (newFilters.semester) params.semester = newFilters.semester;
    if (newFilters.sort_by) params.sort_by = newFilters.sort_by;
    if (newFilters.sort_order) params.sort_order = newFilters.sort_order;

    setLoading(true);
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
      try {
        setSearching(true);
        setError(null);

        if (isAuthenticated) {
          const response = await apiService.getBookmarkedProjects();
          const bookmarkedProjects = response.data || [];
          setFilteredProjects(bookmarkedProjects);
        } else {
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
      setFilteredProjects(projects);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        position: 'relative',
      }}>
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Hero Section Skeleton */}
          <Paper
            elevation={0}
            sx={{
              mb: 6,
              p: { xs: 3, sm: 4, md: 6 },
              bgcolor: theme.palette.background.paper,
              borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
              border: `1px solid ${theme.palette.divider}`,
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
              bgcolor: theme.palette.background.paper,
              borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={30} />
              </Box>
            </Stack>
            <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: `${theme.shape.borderRadius}px` }} />
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
      bgcolor: theme.palette.background.default,
      position: 'relative',
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Hero Section */}
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              mb: 6,
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
                right: -150,
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 60%)`,
                transform: 'translate(80px, -120px) scale(1.2)',
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                borderRadius: '50%',
                width: 200,
                height: 200,
                bottom: -100,
                left: -100,
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 60%)`,
                transform: 'translate(-60px, 70px) scale(1.1)',
                pointerEvents: 'none',
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
                      bgcolor: theme.palette.primary.main,
                      border: `4px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                      boxShadow: theme.shadows[6],
                    }}
                  >
                    <ExploreIcon sx={{ fontSize: { xs: 50, md: 70 }, color: theme.palette.primary.contrastText }} />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: "grow" }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="h1" sx={{ 
                    fontWeight: 800, 
                    mb: 2, 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4rem' },
                    lineHeight: 1.2,
                  }}>
                    {t('Explore Innovation')}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ 
                    maxWidth: 650,
                    color: theme.palette.text.secondary,
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
              borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden',
            }}
          >
            {/* Row 1 - Category Scroller */}
            <Box
              sx={{
                position: 'relative',
                bgcolor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
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
                    background: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: `${theme.shape.borderRadius}px`,
                  },
                }}
              >
                {/* Left scroll button */}
                <IconButton
                  size="small"
                  aria-label={t('Scroll categories left')}
                  sx={{
                    flexShrink: 0,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[1],
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
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
                    role="button"
                    tabIndex={0}
                    aria-label={category.label}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 100,
                      cursor: 'pointer',
                      pb: 1,
                      borderBottom: category.active
                        ? `3px solid ${theme.palette.primary.main}`
                        : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderBottomColor: category.active
                          ? theme.palette.primary.main
                          : alpha(theme.palette.primary.main, 0.3),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: category.active
                          ? theme.palette.primary.dark
                          : theme.palette.text.secondary,
                        mb: 0.5,
                        '& svg': { fontSize: 28 },
                      }}
                    >
                      <CategoryIcon />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: category.active ? 700 : 500,
                        color: category.active
                          ? theme.palette.primary.dark
                          : theme.palette.text.secondary,
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
                  aria-label={t('Scroll categories right')}
                  sx={{
                    flexShrink: 0,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[1],
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <FilterIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            </Box>

            {/* Row 2 - Search & Filters */}
            <Box sx={{ p: 3, bgcolor: theme.palette.background.paper }}>
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
                          <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
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
                    <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
                      {filteredProjects.length} {t('projects')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '1.2rem', color: theme.palette.text.disabled }}>
                      {'\u00B7'}
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
                            borderBottom: `5px solid ${theme.palette.primary.main}`,
                          }}
                        />
                        <Box
                          sx={{
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: `5px solid ${theme.palette.text.disabled}`,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
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
                >
                  {t('Filters')}
                </Button>
                <Button
                  variant={showSavedOnly ? 'contained' : 'outlined'}
                  onClick={handleToggleSavedFilter}
                  startIcon={<BookmarkIcon />}
                  disabled={searching}
                  color={showSavedOnly ? 'primary' : undefined}
                >
                  {t('Saved')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  disabled={searching}
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
                borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
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
                  borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FilterIcon sx={{ fontSize: 24, color: theme.palette.info.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {t('Showing')}{' '}
                      <Box component="strong" sx={{ color: theme.palette.info.dark }}>{filteredProjects.length}</Box>{' '}
                      {t('of')}{' '}
                      <Box component="strong" sx={{ color: theme.palette.text.secondary }}>{projects.length}</Box>{' '}
                      {t('projects')}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={<ClearIcon />}
                    onClick={handleClearSearch}
                    disabled={searching}
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
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
                    {t('Top Projects')}
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}>
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
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                <ExploreIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
                  {t('All Projects')}
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}>
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
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  mx: 'auto',
                  mb: 4,
                  border: `3px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                }}
              >
                <SearchIcon sx={{ fontSize: 70, color: theme.palette.secondary.main }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 2 }}>
                {t('No projects found')}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 6, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                {t('We couldn\'t find any projects matching your search criteria. Try adjusting your filters to discover more amazing projects!')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                color="primary"
                startIcon={<ClearIcon />}
                onClick={handleClearSearch}
              >
                {t('Clear All Filters')}
              </Button>
            </Box>
          </Fade>
        )}

        {/* No Projects at All — Improved empty state */}
        {projects.length === 0 && (
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Avatar
                sx={{
                  width: 140,
                  height: 140,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  mx: 'auto',
                  mb: 4,
                  border: `3px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <ExploreIcon sx={{ fontSize: 70, color: theme.palette.info.main }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 2 }}>
                {t('No projects available yet')}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                {t('Check back later to discover amazing graduation projects from TVTC students! We\'re constantly adding new innovative projects to explore.')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                {!isAuthenticated && (
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/register')}
                  >
                    {t('Create Account')}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CategoryIcon />}
                  onClick={() => window.location.reload()}
                >
                  {t('Refresh Page')}
                </Button>
              </Stack>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};
