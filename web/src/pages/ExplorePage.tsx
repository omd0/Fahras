import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Rating,
  Avatar,
  Fade,
} from '@mui/material';
import {
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Public as PublicIcon,
  TrendingUp as TrendingIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { apiService } from '../services/api';
import { TVTCLogo } from '../components/TVTCLogo';
import { TVTCBranding } from '../components/TVTCBranding';

// Modern color scheme
const colors = {
  primary: '#4FC3F7',      // Light Sky Blue
  white: '#FFFFFF',        // White
  lightGray: '#F5F5F5',    // Very Light Gray
  accent: '#BA68C8',        // Soft Purple
  accentAlt: '#FFA726',     // Soft Orange
  text: '#2C3E50',         // Dark text
  textSecondary: '#7F8C8D', // Secondary text
  success: '#27AE60',      // Success green
  warning: '#F39C12',      // Warning orange
};

interface FilterState {
  academicYear: string;
  type: string;
  rating: string;
}

export const ExplorePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [topProjects, setTopProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    academicYear: '',
    type: '',
    rating: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearching(true);
          fetchProjects(searchTerm).finally(() => setSearching(false));
        }, 300); // 300ms delay
      };
    })(),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      // If search is cleared, fetch all projects
      setSearching(true);
      fetchProjects().finally(() => setSearching(false));
    }
  };

  const fetchProjects = async (searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        per_page: 100,
        is_public: true,
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      // Add search parameter if provided and sanitize it
      if (searchQuery && searchQuery.trim()) {
        // Sanitize search query to prevent potential issues
        const sanitizedQuery = searchQuery.trim().replace(/[<>]/g, '');
        if (sanitizedQuery.length > 0) {
          params.search = sanitizedQuery;
        }
      }

      const response = await apiService.getProjects(params);
      
      const projectsData = Array.isArray(response)
        ? response
        : response.data || [];

      setProjects(projectsData || []);
      
      // Get top projects (most viewed or highest rated)
      const topProjectsData = projectsData
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 6);
      setTopProjects(topProjectsData);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.status === 500 ? 'Server error. Please try again.' : 'Failed to fetch projects');
      setError(errorMessage);
      setProjects([]);
      setTopProjects([]);
    } finally {
      setLoading(false);
    }
  };


  // Filter projects based on additional filters (search is handled server-side)
  const filteredProjects = (projects || []).filter((project) => {
    // Academic Year filter
    if (filters.academicYear && project.academic_year !== filters.academicYear) {
      return false;
    }

    // Type filter (based on keywords or title)
    if (filters.type) {
      const type = filters.type.toLowerCase();
      const matchesType = (
        project.title.toLowerCase().includes(type) ||
        (project.keywords || []).some(k => k.toLowerCase().includes(type))
      );
      if (!matchesType) return false;
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      const projectRating = project.average_rating || 0;
      if (projectRating < minRating) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      academicYear: '',
      type: '',
      rating: '',
    });
    setSearchTerm('');
    fetchProjects(); // Refetch all projects
  };

  const ProjectCard: React.FC<{ project: Project; featured?: boolean }> = ({ project, featured = false }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: 4,
        boxShadow: featured 
          ? '0 12px 32px rgba(79, 195, 247, 0.2)' 
          : '0 4px 16px rgba(0,0,0,0.08)',
        border: featured 
          ? `2px solid ${colors.primary}` 
          : '1px solid #E8F4FD',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: featured 
          ? `linear-gradient(135deg, ${colors.white} 0%, #F0F9FF 100%)`
          : colors.white,
        '&:hover': {
          boxShadow: featured 
            ? '0 16px 40px rgba(79, 195, 247, 0.3)' 
            : '0 8px 24px rgba(0,0,0,0.15)',
          transform: 'translateY(-6px)',
          borderColor: colors.primary,
        },
      }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Project Thumbnail */}
      <Box
        sx={{
          height: featured ? 200 : 160,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {featured && (
          <Chip
            label="Featured"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: colors.accent,
              color: colors.white,
              fontWeight: 600,
              zIndex: 1,
            }}
          />
        )}
        <SchoolIcon sx={{ fontSize: featured ? 80 : 60, color: colors.white, opacity: 0.9 }} />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Project Title */}
        <Typography 
          variant={featured ? "h6" : "subtitle1"} 
          component="h2" 
          sx={{ 
            fontWeight: 600, 
            mb: 1.5,
            color: colors.text,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.title}
        </Typography>
        
        {/* University/Program */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <SchoolIcon sx={{ fontSize: 16, color: colors.primary, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {project.program?.name || 'TVTC Program'}
          </Typography>
        </Box>
        
        {/* Abstract Preview */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            minHeight: featured ? 60 : 40,
            display: '-webkit-box',
            WebkitLineClamp: featured ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
          }}
        >
          {project.abstract}
        </Typography>
        
        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {project.keywords.slice(0, featured ? 4 : 3).map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                size="small"
                variant="outlined"
                sx={{ 
                  borderColor: colors.primary,
                  color: colors.primary,
                  fontSize: '0.75rem',
                  '&:hover': {
                    backgroundColor: colors.primary,
                    color: colors.white,
                  },
                }}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        {/* Project Stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ fontSize: 16, color: colors.textSecondary, mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {project.academic_year} • {project.semester}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VisibilityIcon sx={{ fontSize: 16, color: colors.textSecondary, mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {project.views || 0} views
            </Typography>
          </Box>
        </Box>
        
        {/* Author and Rating */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: colors.primary }}>
              <PersonIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {project.creator?.full_name || 'Unknown'}
            </Typography>
          </Box>
          
          {/* Star Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating
              value={project.average_rating || 0}
              readOnly
              size="small"
              sx={{ mr: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              ({project.rating_count || 0})
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${colors.lightGray} 0%, #E8F4FD 100%)` 
    }}>
      {/* Modern Navigation Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          boxShadow: '0 4px 20px rgba(79, 195, 247, 0.3)',
        }}
      >
        <Toolbar>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Explore Projects
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ mr: 1, fontWeight: 500 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RegisterIcon />}
            onClick={() => navigate('/register')}
            sx={{ 
              borderColor: colors.white, 
              fontWeight: 500,
              '&:hover': { 
                borderColor: colors.white, 
                backgroundColor: 'rgba(255,255,255,0.1)' 
              } 
            }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Fade in timeout={800}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              borderRadius: 6,
              p: 6,
              mb: 6,
              color: colors.white,
              boxShadow: '0 16px 40px rgba(79, 195, 247, 0.3)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3,
              },
            }}
          >
            <PublicIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: colors.white }}>
              Discover Innovation
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 4, color: colors.white, fontWeight: 400 }}>
              Explore cutting-edge graduation projects from TVTC students
            </Typography>
            
            {/* Search Tips */}
            {!searchTerm && (
              <Box sx={{ mb: 3, opacity: 0.8 }}>
                <Typography variant="body2" sx={{ color: colors.white, mb: 1 }}>
                  💡 Search tips: Try searching by project title, keywords, author name, or technology
                </Typography>
                <Typography variant="body2" sx={{ color: colors.white }}>
                  Examples: "web development", "machine learning", "mobile app", "IoT"
                </Typography>
              </Box>
            )}

            {/* Enhanced Search Bar with Filter Button */}
            <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Search projects by title, keywords, or author..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: colors.white }} />
                      </InputAdornment>
                    ),
                    endAdornment: searching ? (
                      <InputAdornment position="end">
                        <CircularProgress size={20} sx={{ color: colors.white }} />
                      </InputAdornment>
                    ) : null,
                    sx: {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: 3,
                      color: colors.white,
                      fontSize: '1.1rem',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.white,
                      },
                      '& input::placeholder': {
                        color: 'rgba(255,255,255,0.7)',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: colors.white,
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1rem',
                    minWidth: 120,
                    '&:hover': {
                      borderColor: colors.white,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Filter
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Expandable Filter Section */}
        <Fade in={showFilters} timeout={300}>
          <Box sx={{ display: showFilters ? 'block' : 'none', mb: 4 }}>
            <Box
              sx={{
                background: colors.white,
                borderRadius: 4,
                p: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: `1px solid ${colors.primary}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FilterIcon sx={{ color: colors.primary, mr: 1, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                  Filter Projects
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ 
                    color: colors.textSecondary,
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: `${colors.textSecondary}10`,
                    }
                  }}
                >
                  Clear All
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: colors.text }}>
                      Academic Year
                    </Typography>
                    <Select
                      value={filters.academicYear}
                      onChange={(e) => setFilters({...filters, academicYear: e.target.value})}
                      displayEmpty
                      sx={{
                        backgroundColor: colors.lightGray,
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.accent,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em style={{ color: colors.textSecondary, fontStyle: 'normal' }}>All Years</em>
                      </MenuItem>
                      <MenuItem value="2024" sx={{ color: colors.text, fontWeight: 500 }}>2024</MenuItem>
                      <MenuItem value="2023" sx={{ color: colors.text, fontWeight: 500 }}>2023</MenuItem>
                      <MenuItem value="2022" sx={{ color: colors.text, fontWeight: 500 }}>2022</MenuItem>
                      <MenuItem value="2021" sx={{ color: colors.text, fontWeight: 500 }}>2021</MenuItem>
                      <MenuItem value="2020" sx={{ color: colors.text, fontWeight: 500 }}>2020</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: colors.text }}>
                      Project Type
                    </Typography>
                    <Select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      displayEmpty
                      sx={{
                        backgroundColor: colors.lightGray,
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.accent,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em style={{ color: colors.textSecondary, fontStyle: 'normal' }}>All Types</em>
                      </MenuItem>
                      <MenuItem value="web" sx={{ color: colors.text, fontWeight: 500 }}>Web Development</MenuItem>
                      <MenuItem value="mobile" sx={{ color: colors.text, fontWeight: 500 }}>Mobile App</MenuItem>
                      <MenuItem value="ai" sx={{ color: colors.text, fontWeight: 500 }}>AI/ML</MenuItem>
                      <MenuItem value="iot" sx={{ color: colors.text, fontWeight: 500 }}>IoT</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: colors.text }}>
                      Minimum Rating
                    </Typography>
                    <Select
                      value={filters.rating}
                      onChange={(e) => setFilters({...filters, rating: e.target.value})}
                      displayEmpty
                      sx={{
                        backgroundColor: colors.lightGray,
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.accent,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em style={{ color: colors.textSecondary, fontStyle: 'normal' }}>Any Rating</em>
                      </MenuItem>
                      <MenuItem value="4" sx={{ color: colors.text, fontWeight: 500 }}>4+ Stars</MenuItem>
                      <MenuItem value="3" sx={{ color: colors.text, fontWeight: 500 }}>3+ Stars</MenuItem>
                      <MenuItem value="2" sx={{ color: colors.text, fontWeight: 500 }}>2+ Stars</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Fade>

        {/* Top Projects Section */}
        {!loading && topProjects.length > 0 && (
          <Fade in timeout={1200}>
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingIcon sx={{ color: colors.accent, mr: 1, fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text }}>
                  Top Projects
                </Typography>
                <Chip
                  label="Most Popular"
                  sx={{
                    ml: 2,
                    background: colors.accent,
                    color: colors.white,
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Grid container spacing={3}>
                {topProjects.slice(0, 3).map((project) => (
                  <Grid size={{ xs: 12, md: 4 }} key={project.id}>
                    <ProjectCard project={project} featured={true} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        )}

        {/* All Projects Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text }}>
              {searchTerm ? `Search Results` : 'All Projects'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searching ? 'Searching...' : (
                <>
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} 
                  {searchTerm && ` matching "${searchTerm}"`}
                </>
              )}
            </Typography>
          </Box>
          
          {/* Search Results Summary */}
          {searchTerm && !searching && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: `${colors.primary}10`, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Searching for:</strong> "{searchTerm}" • 
                <strong> Results:</strong> {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ mb: 4 }} />
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => fetchProjects(searchTerm)}
                sx={{ fontWeight: 600 }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ color: colors.primary }} />
          </Box>
        ) : filteredProjects.length === 0 ? (
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <SchoolIcon sx={{ fontSize: 80, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ color: colors.text }}>
                {searchTerm ? 'No projects found' : 'No public projects yet'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm 
                  ? `No projects match "${searchTerm}". Try different keywords or check your spelling.`
                  : 'Public projects will appear here once students publish their work'
                }
              </Typography>
              {searchTerm && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    sx={{ 
                      borderColor: colors.primary, 
                      color: colors.primary,
                      '&:hover': {
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}10`,
                      }
                    }}
                  >
                    Clear Search
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleSearchChange('')}
                    sx={{ color: colors.primary }}
                  >
                    Show All Projects
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Call to Action */}
        {!loading && projects.length > 0 && (
          <Fade in timeout={1400}>
            <Box
              sx={{
                mt: 8,
                p: 6,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                textAlign: 'center',
                color: colors.white,
                boxShadow: '0 16px 40px rgba(79, 195, 247, 0.3)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Ready to Showcase Your Work?
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
                Join our community and publish your graduation project today
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<RegisterIcon />}
                  onClick={() => navigate('/register')}
                  sx={{
                    background: colors.white,
                    color: colors.primary,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      background: colors.lightGray,
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: colors.white,
                    color: colors.white,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: colors.white,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          </Fade>
        )}
      </Container>

      {/* Footer */}
      <TVTCBranding variant="footer" showDescription={true} />
    </Box>
  );
};
