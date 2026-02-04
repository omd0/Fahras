'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  EmojiEvents as EmojiEventsIcon,
  Explore as ExploreIcon,
  FilterList as FilterIcon,
  Bookmark as BookmarkIcon,
  PersonAdd as PersonAddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Apps as AppsIcon,
  Computer as ComputerIcon,
  Build as BuildIcon,
  BusinessCenter as BusinessCenterIcon,
  Science as ScienceIcon,
  Palette as PaletteIcon,
  HealthAndSafety as HealthIcon,
  Engineering as EngineeringIcon,
  ElectricalServices as ElectricalIcon,
  Architecture as ArchitectureIcon,
  Lan as NetworkIcon,
  Storage as StorageIcon,
  Devices as DevicesIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { Project, SearchFilters, Department } from '@/types';
import { apiService } from '@/lib/api';
import { useLanguage } from '@/providers/LanguageContext';
import { getErrorMessage } from '@/utils/errorHandling';
import { SavedSearches } from '@/components/explore/SavedSearches';
import { SmartProjectGrid } from '@/components/explore/SmartProjectGrid';
import { ProjectGridSkeleton } from '@/components/explore/ProjectGridSkeleton';
import { useAuthStore } from '@/features/auth/store';
import { getGuestBookmarks } from '@/utils/bookmarkCookies';

interface CategoryItem {
  id: number | null;
  label: string;
  icon: React.ReactNode;
}

export default function ExplorePage() {
  const theme = useTheme();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [topProjects, setTopProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [categoryScrollState, setCategoryScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

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
    fetchDepartments();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects({
        per_page: 1000,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      const projectsData = Array.isArray(response) ? response : response.data || [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);

      const topProjectsData = [...projectsData]
        .filter(
          (project) =>
            project.average_rating &&
            project.average_rating >= 4.0 &&
            project.rating_count &&
            project.rating_count > 0,
        )
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 6);
      setTopProjects(topProjectsData);
    } catch (err: unknown) {
      console.error('Failed to fetch projects:', err);
      setError(getErrorMessage(err, 'Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response || []);
    } catch (err: unknown) {
      console.error('Failed to fetch departments:', err);
      setDepartments([]);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setError(null);

      const params: Record<string, unknown> = {};
      if (filters.search) params.search = filters.search;
      if (filters.program_id) params.program_id = filters.program_id;
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.academic_year) params.academic_year = filters.academic_year;
      if (filters.semester) params.semester = filters.semester;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;

      const response = await apiService.getProjects(params as Parameters<typeof apiService.getProjects>[0]);
      const projectsData = Array.isArray(response) ? response : response.data || [];

      setFilteredProjects(projectsData);
    } catch (err: unknown) {
      console.error('Failed to search projects:', err);
      setError(getErrorMessage(err, 'Failed to search projects'));
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
    setSelectedCategory(null);
    setFilteredProjects(projects);
    setShowFilters(false);
    setShowSavedOnly(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const getDepartmentIcon = useCallback((name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('computer') || lower.includes('\u062d\u0627\u0633\u0628') || lower.includes('it') || lower.includes('software'))
      return <ComputerIcon />;
    if (lower.includes('electric') || lower.includes('\u0643\u0647\u0631\u0628') || lower.includes('electron'))
      return <ElectricalIcon />;
    if (lower.includes('engineer') || lower.includes('\u0647\u0646\u062f\u0633'))
      return <EngineeringIcon />;
    if (lower.includes('business') || lower.includes('\u0625\u062f\u0627\u0631') || lower.includes('admin'))
      return <BusinessCenterIcon />;
    if (lower.includes('science') || lower.includes('\u0639\u0644\u0648'))
      return <ScienceIcon />;
    if (lower.includes('design') || lower.includes('art') || lower.includes('\u062a\u0635\u0645\u064a\u0645'))
      return <PaletteIcon />;
    if (lower.includes('health') || lower.includes('\u0635\u062d') || lower.includes('medical'))
      return <HealthIcon />;
    if (lower.includes('architect') || lower.includes('\u0639\u0645\u0627\u0631'))
      return <ArchitectureIcon />;
    if (lower.includes('network') || lower.includes('\u0634\u0628\u0643'))
      return <NetworkIcon />;
    if (lower.includes('data') || lower.includes('\u0628\u064a\u0627\u0646\u0627\u062a'))
      return <StorageIcon />;
    if (lower.includes('device') || lower.includes('mobile') || lower.includes('\u0623\u062c\u0647\u0632'))
      return <DevicesIcon />;
    if (lower.includes('programming') || lower.includes('\u0628\u0631\u0645\u062c') || lower.includes('code'))
      return <CodeIcon />;
    if (lower.includes('mechanic') || lower.includes('\u0645\u064a\u0643\u0627\u0646\u064a\u0643'))
      return <BuildIcon />;
    return <ExploreIcon />;
  }, []);

  const handleCategorySelect = useCallback(
    (departmentId: number | null) => {
      setSelectedCategory(departmentId);

      if (departmentId === null) {
        setFilters((prev) => ({ ...prev, department_id: '' }));
        setFilteredProjects(projects);
      } else {
        setFilters((prev) => ({ ...prev, department_id: String(departmentId) }));
        const filtered = projects.filter((project: Project) => {
          const projectDeptId = project.program?.department?.id || project.department?.id;
          return projectDeptId === departmentId;
        });
        setFilteredProjects(filtered);
      }
    },
    [projects],
  );

  const categoryItems: CategoryItem[] = useMemo(() => {
    const allItem: CategoryItem = {
      id: null,
      label: t('All categories'),
      icon: <AppsIcon />,
    };
    const deptItems: CategoryItem[] = (departments || []).map((dept: Department) => ({
      id: dept.id,
      label: dept.name,
      icon: getDepartmentIcon(dept.name),
    }));
    return [allItem, ...deptItems];
  }, [departments, getDepartmentIcon, t]);

  const updateCategoryScrollState = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;
    const threshold = 2;
    setCategoryScrollState({
      canScrollLeft: scrollLeft > threshold,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - threshold,
    });
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    updateCategoryScrollState();
    const ro = new ResizeObserver(updateCategoryScrollState);
    ro.observe(el);
    el.addEventListener('scroll', updateCategoryScrollState);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', updateCategoryScrollState);
    };
  }, [updateCategoryScrollState, categoryItems.length]);

  const scrollCategories = useCallback((direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleLoadSavedSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    const params: Record<string, unknown> = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.program_id) params.program_id = newFilters.program_id;
    if (newFilters.department_id) params.department_id = newFilters.department_id;
    if (newFilters.academic_year) params.academic_year = newFilters.academic_year;
    if (newFilters.semester) params.semester = newFilters.semester;
    if (newFilters.sort_by) params.sort_by = newFilters.sort_by;
    if (newFilters.sort_order) params.sort_order = newFilters.sort_order;

    setLoading(true);
    apiService
      .getProjects(params as Parameters<typeof apiService.getProjects>[0])
      .then((response) => {
        const projectsData = Array.isArray(response) ? response : response.data || [];
        setFilteredProjects(projectsData);
      })
      .catch((err: unknown) => {
        console.error('Failed to load saved search:', err);
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
              guestBookmarkIds.includes(project.id),
            );
            setFilteredProjects(bookmarkedProjects);
          } else {
            setFilteredProjects([]);
          }
        }
      } catch (err: unknown) {
        console.error('Failed to fetch bookmarked projects:', err);
        const message = getErrorMessage(err, 'Failed to fetch bookmarked projects');
        setError(message);
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
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          position: 'relative',
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
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
              <Grid size={{ xs: 12, md: 'grow' }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="70%" height={30} />
                </Box>
              </Grid>
            </Grid>
          </Paper>

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
            <Skeleton
              variant="rounded"
              width="100%"
              height={56}
              sx={{ borderRadius: `${theme.shape.borderRadius}px` }}
            />
          </Paper>

          <Box sx={{ mb: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="30%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={30} />
              </Box>
            </Stack>
            <ProjectGridSkeleton count={6} />
          </Box>

          <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="30%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={30} />
              </Box>
            </Stack>
            <ProjectGridSkeleton count={9} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        position: 'relative',
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
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
            <Grid
              container
              spacing={{ xs: 4, md: 6 }}
              alignItems="center"
              sx={{ position: 'relative', zIndex: 1 }}
            >
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
                    <ExploreIcon
                      sx={{ fontSize: { xs: 50, md: 70 }, color: theme.palette.primary.contrastText }}
                    />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 'grow' }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: theme.palette.text.primary,
                      fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {t('Explore Innovation')}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      maxWidth: 650,
                      color: theme.palette.text.secondary,
                      mx: { xs: 'auto', md: 0 },
                      lineHeight: 1.6,
                    }}
                  >
                    {t(
                      'Discover groundbreaking graduation projects from TVTC students. Browse, learn, and get inspired by the next generation of innovators!',
                    )}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

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
            <Box
              sx={{
                position: 'relative',
                bgcolor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2 }}>
                {categoryScrollState.canScrollLeft && (
                  <IconButton
                    size="small"
                    onClick={() => scrollCategories('left')}
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
                    <ChevronLeftIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                )}

                <Box
                  ref={categoryScrollRef}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flex: 1,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    py: 0.5,
                  }}
                >
                  {categoryItems.map((category) => {
                    const isActive = selectedCategory === category.id;
                    return (
                      <Box
                        key={category.id ?? 'all'}
                        role="button"
                        tabIndex={0}
                        aria-label={category.label}
                        onClick={() => handleCategorySelect(category.id)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCategorySelect(category.id);
                          }
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: 100,
                          cursor: 'pointer',
                          pb: 1,
                          borderBottom: isActive
                            ? `3px solid ${theme.palette.primary.main}`
                            : '3px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderBottomColor: isActive
                              ? theme.palette.primary.main
                              : alpha(theme.palette.primary.main, 0.3),
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: 2,
                            borderRadius: 1,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            color: isActive
                              ? theme.palette.primary.dark
                              : theme.palette.text.secondary,
                            mb: 0.5,
                            '& svg': { fontSize: 28 },
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            fontWeight: isActive ? 700 : 500,
                            color: isActive
                              ? theme.palette.primary.dark
                              : theme.palette.text.secondary,
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            maxWidth: 100,
                          }}
                        >
                          {category.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>

                {categoryScrollState.canScrollRight && (
                  <IconButton
                    size="small"
                    onClick={() => scrollCategories('right')}
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
                    <ChevronRightIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                )}
              </Stack>
            </Box>

            <Box sx={{ p: 3, bgcolor: theme.palette.background.paper }}>
              <Grid container spacing={5} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={filters.search}
                    onChange={(e) => handleInputChange('search', e.target.value)}
                    placeholder={t('What do you want to make?')}
                    variant="outlined"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
                    >
                      {filteredProjects.length} {t('projects')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: '1.2rem', color: theme.palette.text.disabled }}
                    >
                      {'\u00B7'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'pointer' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
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
                        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                      >
                        {t('Trending')}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>

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

        {filteredProjects.length !== projects.length && (
          <Fade in timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Alert
                severity="info"
                sx={{
                  borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FilterIcon sx={{ fontSize: 24, color: theme.palette.info.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {t('Showing')}{' '}
                      <Box component="strong" sx={{ color: theme.palette.info.dark }}>
                        {filteredProjects.length}
                      </Box>{' '}
                      {t('of')}{' '}
                      <Box component="strong" sx={{ color: theme.palette.text.secondary }}>
                        {projects.length}
                      </Box>{' '}
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
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}
                  >
                    {t('Top Projects')}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}
                  >
                    {t('Most highly rated and innovative projects')}
                  </Typography>
                </Box>
              </Stack>

              <SmartProjectGrid projects={topProjects} showTopBadge={true} virtualizationThreshold={50} />
            </Box>
          </Fade>
        )}

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
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}
                >
                  {t('All Projects')}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}
                >
                  {t('Explore all available graduation projects')}
                </Typography>
              </Box>
            </Stack>

            <SmartProjectGrid projects={filteredProjects} virtualizationThreshold={50} />
          </Box>
        </Fade>

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
              <Typography
                variant="h4"
                sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 2 }}
              >
                {t('No projects found')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 6,
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                {t(
                  "We couldn't find any projects matching your search criteria. Try adjusting your filters to discover more amazing projects!",
                )}
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
              <Typography
                variant="h4"
                sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 2 }}
              >
                {t('No projects available yet')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                {t(
                  "Check back later to discover amazing graduation projects from TVTC students! We're constantly adding new innovative projects to explore.",
                )}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                {!isAuthenticated && (
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => router.push('/register')}
                  >
                    {t('Create Account')}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<AppsIcon />}
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
}
