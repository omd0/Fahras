import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Button,
  Chip,
  Avatar,
  Rating,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Tooltip,
  Badge,
  alpha,
  useTheme as useMuiTheme,
  CardActions,
  Fade,
  Slide,
} from '@mui/material';
import { guestColors, guestTheme, createDecorativeElements, backgroundPatterns } from '../theme/guestTheme';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Star as StarIcon,
  AttachFile as AttachFileIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  EmojiEvents as EmojiEventsIcon,
  Lightbulb as LightbulbIcon,
  Rocket as RocketIcon,
  Science as ScienceIcon,
  Code as CodeIcon,
  DesignServices as DesignIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  Computer as ComputerIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BookmarkButton } from '../components/BookmarkButton';

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
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'submitted': return 'info';
      case 'under_review': return 'primary';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return `0 ${t('Bytes')}`;
    const k = 1024;
    const sizes = [t('Bytes'), t('KB'), t('MB'), t('GB')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProjectIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('web') || lowerTitle.includes('app') || lowerTitle.includes('software')) {
      return <CodeIcon />;
    } else if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) {
      return <DesignIcon />;
    } else if (lowerTitle.includes('business') || lowerTitle.includes('management') || lowerTitle.includes('marketing')) {
      return <BusinessIcon />;
    } else if (lowerTitle.includes('engineering') || lowerTitle.includes('mechanical') || lowerTitle.includes('electrical')) {
      return <EngineeringIcon />;
    } else if (lowerTitle.includes('computer') || lowerTitle.includes('ai') || lowerTitle.includes('machine learning')) {
      return <ComputerIcon />;
    } else {
      return <ScienceIcon />;
    }
  };


  const academicYearOptions = [
    '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026'
  ];

  const semesterOptions = useMemo(
    () => [
      { value: 'fall', label: t('Fall') },
      { value: 'spring', label: t('Spring') },
      { value: 'summer', label: t('Summer') },
    ],
    [language, t],
  );

  const sortOptions = useMemo(
    () => [
      { value: 'created_at', label: t('Date Created') },
      { value: 'updated_at', label: t('Last Updated') },
      { value: 'title', label: t('Title') },
      { value: 'academic_year', label: t('Academic Year') },
      { value: 'average_rating', label: t('Rating') },
    ],
    [language, t],
  );

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

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  placeholder={t('Search by project name, title, or keywords...')}
                  value={filters.search}
                  onChange={(e) => handleInputChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 2, color: COLORS.almostBlack, fontSize: 24 }} />,
                    endAdornment: filters.search && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleInputChange('search', '')}
                        sx={{ color: COLORS.textSecondary }}
                      >
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      backgroundColor: COLORS.white,
                      fontSize: '1.1rem',
                      py: 1,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.almostBlack,
                          borderWidth: 2,
                        },
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.almostBlack,
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                      borderColor: COLORS.almostBlack,
                      color: COLORS.almostBlack,
                      borderRadius: 4,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': {
                        borderColor: COLORS.almostBlack,
                        backgroundColor: alpha(COLORS.almostBlack, 0.08),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {t('Filters')}
                    {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={searching}
                    sx={{
                      background: guestColors.primaryGradient,
                      borderRadius: 4,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(COLORS.almostBlack, 0.3)}`,
                      },
                    }}
                  >
                    {searching ? <CircularProgress size={20} color="inherit" /> : t('Search')}
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            <Collapse in={showFilters}>
              <Box sx={{ 
                p: 4, 
                backgroundColor: alpha(COLORS.almostBlack, 0.06), 
                borderRadius: 4,
                border: `1px solid ${alpha(COLORS.almostBlack, 0.15)}`,
              }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {t('Program')}
                      </InputLabel>
                      <Select
                        value={filters.program_id}
                        onChange={(e) => handleInputChange('program_id', e.target.value)}
                        label={t('Program')}
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.almostBlack, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.almostBlack,
                          },
                        }}
                      >
                        <MenuItem value="">{t('All Programs')}</MenuItem>
                        {(programs || []).map((program) => (
                          <MenuItem key={program.id} value={program.id}>
                            {program.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {t('Department')}
                      </InputLabel>
                      <Select
                        value={filters.department_id}
                        onChange={(e) => handleInputChange('department_id', e.target.value)}
                        label={t('Department')}
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.almostBlack, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.almostBlack,
                          },
                        }}
                      >
                        <MenuItem value="">{t('All Departments')}</MenuItem>
                        {(departments || []).map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {t('Academic Year')}
                      </InputLabel>
                      <Select
                        value={filters.academic_year}
                        onChange={(e) => handleInputChange('academic_year', e.target.value)}
                        label={t('Academic Year')}
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.almostBlack, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.almostBlack,
                          },
                        }}
                      >
                        <MenuItem value="">{t('All Years')}</MenuItem>
                        {academicYearOptions.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {t('Semester')}
                      </InputLabel>
                      <Select
                        value={filters.semester}
                        onChange={(e) => handleInputChange('semester', e.target.value)}
                        label={t('Semester')}
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.almostBlack, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.almostBlack,
                          },
                        }}
                      >
                        <MenuItem value="">{t('All Semesters')}</MenuItem>
                        {semesterOptions.map((semester) => (
                          <MenuItem key={semester.value} value={semester.value}>
                            {semester.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {t('Sort By')}
                      </InputLabel>
                      <Select
                        value={filters.sort_by}
                        onChange={(e) => handleInputChange('sort_by', e.target.value)}
                        label={t('Sort By')}
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.almostBlack, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.almostBlack,
                          },
                        }}
                      >
                        {sortOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {t('Order')}
                      </InputLabel>
                      <Select
                        value={filters.sort_order}
                        onChange={(e) => handleInputChange('sort_order', e.target.value)}
                        label={t('Order')}
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.almostBlack, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.almostBlack,
                          },
                        }}
                      >
                        <MenuItem value="desc">{t('Newest First')}</MenuItem>
                        <MenuItem value="asc">{t('Oldest First')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={3} sx={{ mt: 4, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleClearSearch}
                    startIcon={<ClearIcon />}
                    sx={{
                      borderColor: COLORS.textSecondary,
                      color: COLORS.textSecondary,
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: COLORS.textSecondary,
                        backgroundColor: alpha(COLORS.textSecondary, 0.05),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {t('Clear All')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={searching}
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
                    {t('Apply Filters')}
                  </Button>
                </Stack>
              </Box>
            </Collapse>
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

              <Grid container spacing={4}>
                {topProjects.map((project, index) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <Card
                    sx={{
                      ...backgroundPatterns.card,
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      border: `2px solid ${alpha(COLORS.lightSkyBlue, 0.2)}`,
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        boxShadow: `0 24px 48px ${alpha(COLORS.lightSkyBlue, 0.25)}`,
                        borderColor: COLORS.deepPurple,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: guestColors.secondaryGradient,
                      },
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                color: COLORS.textPrimary,
                                mb: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {project.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Tooltip title={`Created: ${new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} arrow>
                                <Chip
                                  label={project.academic_year}
                                  size="small"
                                  sx={{
                                    background: guestColors.secondaryGradient,
                                    color: COLORS.textPrimary,
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    textTransform: 'capitalize',
                                  }}
                                />
                              </Tooltip>
                            </Stack>
                          </Box>
                          <Badge
                            badgeContent={index + 1}
                            sx={{
                              '& .MuiBadge-badge': {
                                background: guestColors.accentGradient,
                                color: COLORS.white,
                                fontWeight: 700,
                                fontSize: '0.8rem',
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                background: guestColors.primaryGradient,
                              }}
                            >
                              {getProjectIcon(project.title)}
                            </Avatar>
                          </Badge>
                        </Stack>

                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: COLORS.textSecondary,
                            mb: 3, 
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
                            <Stack direction="row" alignItems="center" spacing={1}>
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

                        <CardActions sx={{ p: 0, justifyContent: 'space-between' }}>
                          <Button
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            sx={{
                              background: guestColors.primaryGradient,
                              borderRadius: 3,
                              px: 3,
                              py: 1,
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
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" sx={{ color: COLORS.textSecondary }}>
                              <CommentIcon fontSize="small" />
                            </IconButton>
                            <BookmarkButton projectId={project.id} size="small" sx={{ color: COLORS.textSecondary }} />
                            <IconButton size="small" sx={{ color: COLORS.textSecondary }}>
                              <ShareIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </CardActions>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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

            <Grid container spacing={4}>
              {(filteredProjects || []).map((project, index) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <Card
                    sx={{
                      ...backgroundPatterns.card,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px ${alpha(COLORS.almostBlack, 0.15)}`,
                        borderColor: COLORS.almostBlack,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: guestColors.primaryGradient,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                      '&:hover::before': {
                        opacity: 1,
                      },
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Project Header - Improved Layout */}
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
                        <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
                          {/* Title and Year Tag - Horizontally Aligned */}
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                color: COLORS.textPrimary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: '1.2rem',
                                lineHeight: 1.3,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {project.title}
                            </Typography>
                            <Tooltip title={`Created: ${new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} arrow>
                              <Chip
                                label={project.academic_year}
                                size="small"
                                sx={{
                                  background: guestColors.secondaryGradient,
                                  color: COLORS.textPrimary,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  height: 24,
                                  textTransform: 'capitalize',
                                  flexShrink: 0,
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </Box>
                        {/* Icon - Perfectly Aligned */}
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            background: guestColors.primaryGradient,
                            flexShrink: 0,
                          }}
                        >
                          {getProjectIcon(project.title)}
                        </Avatar>
                      </Stack>

                      {/* Project Abstract - Improved Spacing */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: COLORS.textSecondary,
                          mb: 3, 
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.6,
                          fontSize: '1rem',
                        }}
                      >
                        {project.abstract}
                      </Typography>

                      {/* Keywords - Increased Spacing */}
                      {project.keywords && project.keywords.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {project.keywords.slice(0, 3).map((keyword, idx) => (
                              <Chip
                                key={idx}
                                label={keyword}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: 28,
                                  borderColor: alpha(COLORS.lightSkyBlue, 0.35),
                                  color: COLORS.deepPurple,
                                  fontWeight: 500,
                                  '&:hover': {
                                    backgroundColor: alpha(COLORS.lightSkyBlue, 0.1),
                                    borderColor: COLORS.deepPurple,
                                  },
                                }}
                              />
                            ))}
                            {project.keywords.length > 3 && (
                              <Chip
                                label={`+${project.keywords.length - 3} ${t('more')}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: 28,
                                  borderColor: alpha(COLORS.lightSkyBlue, 0.35),
                                  color: COLORS.deepPurple,
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                      )}

                      {/* Rating - Moved Above Metadata */}
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
                              {project.average_rating.toFixed(1)} ({project.rating_count} ratings)
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      {/* Metadata Row - Reorganized: Author, Files, Action Icons */}
                      <Box 
                        sx={{ 
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1.5,
                        }}
                      >
                        {/* Left: Author and Files */}
                        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: COLORS.textSecondary, 
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {project.creator?.full_name || 'Unknown'}
                            </Typography>
                          </Stack>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: COLORS.textSecondary,
                              mx: 0.5,
                            }}
                          >
                            ·
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <AttachFileIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                              {project.files?.length || 0} {t('files')}
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Right: Action Icons */}
                        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                          <Tooltip title={t('View Comments')}>
                            <IconButton 
                              size="small" 
                              sx={{ 
                                color: alpha(COLORS.textSecondary, 0.7),
                                '&:hover': {
                                  color: COLORS.textSecondary,
                                  backgroundColor: alpha(COLORS.textSecondary, 0.08),
                                },
                              }}
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                // Handle comment click
                              }}
                            >
                              <CommentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <BookmarkButton 
                            projectId={project.id} 
                            size="small" 
                            sx={{ 
                              color: alpha(COLORS.textSecondary, 0.7),
                              '&:hover': {
                                color: COLORS.textSecondary,
                                backgroundColor: alpha(COLORS.textSecondary, 0.08),
                              },
                            }}
                          />
                          <Tooltip title={t('Share Project')}>
                            <IconButton 
                              size="small" 
                              sx={{ 
                                color: alpha(COLORS.textSecondary, 0.7),
                                '&:hover': {
                                  color: COLORS.textSecondary,
                                  backgroundColor: alpha(COLORS.textSecondary, 0.08),
                                },
                              }}
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                // Handle share click
                              }}
                            >
                              <ShareIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>

                      {/* Action Icon - Hover to View Project */}
                      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                        <Tooltip 
                          title={t('View Project')} 
                          placement="bottom"
                          arrow
                          PopperProps={{
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 8],
                                },
                              },
                            ],
                          }}
                        >
                          <IconButton
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              navigate(`/projects/${project.id}`);
                            }}
                            sx={{
                              background: guestColors.primaryGradient,
                              color: COLORS.white,
                              width: 48,
                              height: 48,
                              '&:hover': {
                                transform: 'translateY(-2px) scale(1.1)',
                                boxShadow: `0 8px 25px ${alpha(COLORS.almostBlack, 0.3)}`,
                                background: `linear-gradient(135deg, ${alpha(COLORS.deepPurple, 0.9)} 0%, ${alpha(COLORS.lightSkyBlue, 0.9)} 100%)`,
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
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