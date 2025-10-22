import React, { useState, useEffect } from 'react';
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
  CalendarToday as CalendarIcon,
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
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

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
      setError(error.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await apiService.getPrograms();
      setPrograms(response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      setPrograms([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response || []);
    } catch (error) {
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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

  const semesterOptions = [
    { value: 'fall', label: 'Fall' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'title', label: 'Title' },
    { value: 'academic_year', label: 'Academic Year' },
    { value: 'average_rating', label: 'Rating' },
  ];

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
              color: COLORS.darkBlue,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }} 
          />
          <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 500 }}>
            Loading amazing projects...
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
          radial-gradient(circle at 20% 20%, rgba(123, 176, 216, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(159, 227, 193, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(245, 233, 216, 0.08) 0%, transparent 50%)
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
              p: 6,
              ...backgroundPatterns.hero,
              color: COLORS.textPrimary,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(123, 176, 216, 0.3), 0 6px 20px rgba(159, 227, 193, 0.18)',
              '&::before': {
                ...decorativeElements.largeCircle,
                background: 'rgba(123, 176, 216, 0.18)',
                transform: 'translate(100px, -100px)',
              },
              '&::after': {
                ...decorativeElements.mediumCircle,
                background: 'rgba(159, 227, 193, 0.12)',
                transform: 'translate(-50px, 50px)',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background: guestColors.primaryGradient,
                  backdropFilter: 'blur(10px)',
                  border: '3px solid rgba(123, 176, 216, 0.35)',
                  boxShadow: '0 8px 32px rgba(123, 176, 216, 0.35)',
                }}
              >
                <RocketIcon sx={{ fontSize: 50, color: COLORS.white }} />
              </Avatar>
              <Box>
                <Typography variant="h2" sx={{ 
                  fontWeight: 800, 
                  mb: 2, 
                  textShadow: '0 2px 4px rgba(123, 176, 216, 0.25)', 
                  color: COLORS.textPrimary,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}>
                  Explore Innovation 🚀
                </Typography>
                <Typography variant="h5" sx={{ 
                  opacity: 0.9, 
                  fontWeight: 400,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  maxWidth: '600px',
                  color: COLORS.textSecondary
                }}>
                  Discover groundbreaking graduation projects from TVTC students. 
                  Browse, learn, and get inspired by the next generation of innovators!
                </Typography>
              </Box>
            </Stack>
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
                background: 'rgba(159, 227, 193, 0.12)',
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
                  boxShadow: '0 4px 16px rgba(123, 176, 216, 0.35)',
                }}
              >
                <SearchIcon sx={{ fontSize: 28, color: COLORS.white }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                  Smart Project Discovery
                </Typography>
                <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 400 }}>
                  Find projects that match your interests and expertise
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  placeholder="Search by project name, title, or keywords..."
                  value={filters.search}
                  onChange={(e) => handleInputChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 2, color: COLORS.lightBlue, fontSize: 24 }} />,
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
                          borderColor: COLORS.lightBlue,
                          borderWidth: 2,
                        },
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.lightBlue,
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
                      borderColor: COLORS.lightBlue,
                      color: COLORS.lightBlue,
                      borderRadius: 4,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': {
                        borderColor: COLORS.lightBlue,
                        backgroundColor: alpha(COLORS.lightBlue, 0.08),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Filters
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
                        boxShadow: `0 8px 25px ${alpha(COLORS.lightBlue, 0.4)}`,
                      },
                    }}
                  >
                    {searching ? <CircularProgress size={20} color="inherit" /> : 'Search'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            <Collapse in={showFilters}>
              <Box sx={{ 
                p: 4, 
                backgroundColor: alpha(COLORS.lightBlue, 0.08), 
                borderRadius: 4,
                border: `1px solid ${alpha(COLORS.lightBlue, 0.2)}`,
              }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>Program</InputLabel>
                      <Select
                        value={filters.program_id}
                        onChange={(e) => handleInputChange('program_id', e.target.value)}
                        label="Program"
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.lightBlue, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.lightBlue,
                          },
                        }}
                      >
                        <MenuItem value="">All Programs</MenuItem>
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
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>Department</InputLabel>
                      <Select
                        value={filters.department_id}
                        onChange={(e) => handleInputChange('department_id', e.target.value)}
                        label="Department"
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.lightBlue, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.lightBlue,
                          },
                        }}
                      >
                        <MenuItem value="">All Departments</MenuItem>
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
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>Academic Year</InputLabel>
                      <Select
                        value={filters.academic_year}
                        onChange={(e) => handleInputChange('academic_year', e.target.value)}
                        label="Academic Year"
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.lightBlue, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.lightBlue,
                          },
                        }}
                      >
                        <MenuItem value="">All Years</MenuItem>
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
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>Semester</InputLabel>
                      <Select
                        value={filters.semester}
                        onChange={(e) => handleInputChange('semester', e.target.value)}
                        label="Semester"
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.lightBlue, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.lightBlue,
                          },
                        }}
                      >
                        <MenuItem value="">All Semesters</MenuItem>
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
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>Sort By</InputLabel>
                      <Select
                        value={filters.sort_by}
                        onChange={(e) => handleInputChange('sort_by', e.target.value)}
                        label="Sort By"
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.lightBlue, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.lightBlue,
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
                      <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>Order</InputLabel>
                      <Select
                        value={filters.sort_order}
                        onChange={(e) => handleInputChange('sort_order', e.target.value)}
                        label="Order"
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: COLORS.white,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(COLORS.lightBlue, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.lightBlue,
                          },
                        }}
                      >
                        <MenuItem value="desc">Newest First</MenuItem>
                        <MenuItem value="asc">Oldest First</MenuItem>
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
                    Clear All
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
                        boxShadow: `0 8px 25px ${alpha(COLORS.lightBlue, 0.4)}`,
                      },
                    }}
                  >
                    Apply Filters
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
                boxShadow: `0 8px 24px ${alpha(COLORS.error, 0.2)}`,
                border: `2px solid ${alpha(COLORS.error, 0.3)}`,
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
                  background: `linear-gradient(135deg, ${alpha(COLORS.lightBlue, 0.12)} 0%, ${alpha(COLORS.mintGreen, 0.12)} 100%)`,
                  border: `2px solid ${alpha(COLORS.lightBlue, 0.35)}`,
                  '& .MuiAlert-icon': {
                    color: COLORS.lightBlue,
                    fontSize: 24,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FilterIcon sx={{ fontSize: 24, color: COLORS.lightBlue }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                      Showing <strong style={{ color: COLORS.lightBlue }}>{filteredProjects.length}</strong> of <strong style={{ color: COLORS.textSecondary }}>{projects.length}</strong> projects
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
                        boxShadow: `0 8px 25px ${alpha(COLORS.lightBlue, 0.4)}`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Clear Filters
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
                    Top Projects ⭐
                  </Typography>
                  <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 400 }}>
                    Most highly rated and innovative projects
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
                      border: `2px solid ${alpha(COLORS.mintGreen, 0.25)}`,
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        boxShadow: `0 24px 48px ${alpha(COLORS.mintGreen, 0.35)}`,
                        borderColor: COLORS.mintGreen,
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
                              <Chip
                                label={project.academic_year}
                                size="small"
                                sx={{
                                  background: guestColors.primaryGradient,
                                  color: COLORS.white,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                }}
                              />
                              <Chip
                                label={project.semester}
                                size="small"
                                sx={{
                                  background: guestColors.secondaryGradient,
                                  color: COLORS.textPrimary,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  textTransform: 'capitalize',
                                }}
                              />
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
                                    color: COLORS.mintGreen,
                                  },
                                }}
                              />
                              <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                                {project.average_rating.toFixed(1)} ({project.rating_count} ratings)
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
                                boxShadow: `0 8px 25px ${alpha(COLORS.darkBlue, 0.4)}`,
                              },
                            }}
                          >
                            View Project
                          </Button>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" sx={{ color: COLORS.textSecondary }}>
                              <CommentIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: COLORS.textSecondary }}>
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
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
                  All Projects
                </Typography>
                <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 400 }}>
                  Explore all available graduation projects
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
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        boxShadow: `0 24px 48px ${alpha(COLORS.lightBlue, 0.3)}`,
                        borderColor: COLORS.lightBlue,
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
                      {/* Project Header */}
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
                              fontSize: '1.2rem',
                              lineHeight: 1.3,
                            }}
                          >
                            {project.title}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip
                              label={project.academic_year}
                              size="small"
                              sx={{
                                background: guestColors.primaryGradient,
                                color: COLORS.white,
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                height: 28,
                              }}
                            />
                            <Chip
                              label={project.semester}
                              size="small"
                              sx={{
                                background: guestColors.secondaryGradient,
                                color: COLORS.textPrimary,
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                height: 28,
                                textTransform: 'capitalize',
                              }}
                            />
                          </Stack>
                        </Box>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            background: guestColors.primaryGradient,
                            ml: 2,
                          }}
                        >
                          {getProjectIcon(project.title)}
                        </Avatar>
                      </Stack>

                      {/* Project Abstract */}
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
                          fontSize: '1rem',
                        }}
                      >
                        {project.abstract}
                      </Typography>

                      {/* Keywords */}
                      {project.keywords && project.keywords.length > 0 && (
                        <Box sx={{ mb: 4 }}>
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
                                  borderColor: alpha(COLORS.mintGreen, 0.45),
                                  color: COLORS.mintGreen,
                                  fontWeight: 500,
                                  '&:hover': {
                                    backgroundColor: alpha(COLORS.mintGreen, 0.12),
                                    borderColor: COLORS.mintGreen,
                                  },
                                }}
                              />
                            ))}
                            {project.keywords.length > 3 && (
                              <Chip
                                label={`+${project.keywords.length - 3} more`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: 28,
                                  borderColor: alpha(COLORS.mintGreen, 0.45),
                                  color: COLORS.mintGreen,
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                      )}

                      {/* Project Stats */}
                      <Box sx={{ mb: 4 }}>
                        <Grid container spacing={3}>
                          <Grid size={6}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <AttachFileIcon sx={{ fontSize: 18, color: COLORS.lightBlue }} />
                              <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                                {project.files?.length || 0} files
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid size={6}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <GroupIcon sx={{ fontSize: 18, color: COLORS.mintGreen }} />
                              <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                                {(project.members?.length || 0) + (project.advisors?.length || 0) + 1} members
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Rating */}
                      {project.average_rating && project.rating_count && (
                        <Box sx={{ mb: 4 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Rating
                              value={project.average_rating}
                              readOnly
                              precision={0.1}
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: COLORS.mintGreen,
                                },
                              }}
                            />
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                              {project.average_rating.toFixed(1)} ({project.rating_count} ratings)
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      {/* Project Footer */}
                      <Box sx={{ mt: 'auto' }}>
                        <Divider sx={{ mb: 3, borderColor: alpha(COLORS.lightBlue, 0.25) }} />
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <PersonIcon sx={{ fontSize: 18, color: COLORS.lightBlue }} />
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                              {project.creator?.full_name || 'Unknown'}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CalendarIcon sx={{ fontSize: 18, color: COLORS.mintGreen }} />
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                              {new Date(project.created_at).toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>

                      {/* Action Buttons */}
                      <CardActions sx={{ p: 0, mt: 3, justifyContent: 'space-between' }}>
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
                            fontSize: '1rem',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${alpha(COLORS.lightBlue, 0.4)}`,
                            },
                          }}
                        >
                          View Project
                        </Button>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Comments">
                            <IconButton size="small" sx={{ color: COLORS.textSecondary }}>
                              <CommentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Like Project">
                            <IconButton size="small" sx={{ color: COLORS.textSecondary }}>
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Share Project">
                            <IconButton size="small" sx={{ color: COLORS.textSecondary }}>
                              <ShareIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </CardActions>
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
                  background: `linear-gradient(135deg, ${alpha(COLORS.lightBlue, 0.12)} 0%, ${alpha(COLORS.mintGreen, 0.12)} 100%)`,
                  mx: 'auto',
                  mb: 4,
                  border: `3px solid ${alpha(COLORS.lightBlue, 0.25)}`,
                }}
              >
                <SearchIcon sx={{ fontSize: 70, color: COLORS.lightBlue }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 3 }}>
                No projects found
              </Typography>
              <Typography variant="h6" sx={{ color: COLORS.textSecondary, mb: 6, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                We couldn't find any projects matching your search criteria. 
                Try adjusting your filters to discover more amazing projects!
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
                    boxShadow: `0 12px 30px ${alpha(COLORS.lightBlue, 0.4)}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Clear All Filters
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
                  background: `linear-gradient(135deg, ${alpha(COLORS.lightBlue, 0.12)} 0%, ${alpha(COLORS.mintGreen, 0.12)} 100%)`,
                  mx: 'auto',
                  mb: 4,
                  border: `3px solid ${alpha(COLORS.lightBlue, 0.25)}`,
                }}
              >
                <RocketIcon sx={{ fontSize: 70, color: COLORS.lightBlue }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 3 }}>
                No projects available yet
              </Typography>
              <Typography variant="h6" sx={{ color: COLORS.textSecondary, mb: 6, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                Check back later to discover amazing graduation projects from TVTC students! 
                We're constantly adding new innovative projects to explore.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                startIcon={<RocketIcon />}
                onClick={() => window.location.reload()}
                sx={{
                  borderColor: COLORS.lightBlue,
                  color: COLORS.lightBlue,
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 4,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: COLORS.lightBlue,
                    backgroundColor: alpha(COLORS.lightBlue, 0.08),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Refresh Page
              </Button>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};