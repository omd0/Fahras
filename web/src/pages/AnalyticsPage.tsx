import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  Paper,
  Divider,
  Rating,
  Stack,
  LinearProgress,
  Fade,
  Slide,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  AccountCircle,
  ExitToApp,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Insights as InsightsIcon,
  Dashboard as DashboardIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
// Chart components will be implemented with basic MUI components for now
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { TVTCLogo } from '../components/TVTCLogo';
import { getDashboardTheme } from '../config/dashboardThemes';
import { Project, Program } from '../types';

interface AnalyticsData {
  status_distribution: Record<string, number>;
  year_distribution: Array<{ academic_year: string; count: number }>;
  department_distribution: Array<{ department: string; count: number }>;
  recent_activity: number;
  monthly_trend: Array<{ month: string; count: number }>;
  total_projects: number;
}

interface TopRatedProject extends Project {
  average_rating: number;
  rating_count: number;
  program?: Program;
}

// Harmonious color palette for analytics
const ANALYTICS_COLORS = {
  primary: {
    main: '#2563eb',
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrast: '#ffffff',
  },
  secondary: {
    main: '#7c3aed',
    light: '#8b5cf6',
    dark: '#6d28d9',
    contrast: '#ffffff',
  },
  success: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
    contrast: '#ffffff',
  },
  warning: {
    main: '#d97706',
    light: '#f59e0b',
    dark: '#b45309',
    contrast: '#ffffff',
  },
  info: {
    main: '#0891b2',
    light: '#06b6d4',
    dark: '#0e7490',
    contrast: '#ffffff',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
};

const CHART_COLORS = [
  ANALYTICS_COLORS.primary.main,
  ANALYTICS_COLORS.secondary.main,
  ANALYTICS_COLORS.success.main,
  ANALYTICS_COLORS.warning.main,
  ANALYTICS_COLORS.info.main,
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // New state for enhanced analytics
  const [programs, setPrograms] = useState<Program[]>([]);
  const [topRatedProjects, setTopRatedProjects] = useState<TopRatedProject[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProgramData, setSelectedProgramData] = useState<Program | null>(null);
  const [programsLoading, setProgramsLoading] = useState(false);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dashboardTheme = getDashboardTheme(user?.roles);

  useEffect(() => {
    fetchAnalytics();
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram || selectedYear) {
      fetchTopRatedProjects();
    }
  }, [selectedProgram, selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getProjectAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      setError(error.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setProgramsLoading(true);
      const response = await apiService.getPrograms();
      const allPrograms = response.data || response || [];
      
      // Filter programs to show only Computer Science, Information Technology, and Software Engineering
      const targetDepartments = ['Computer Science', 'Information Technology', 'Software Engineering'];
      const filteredPrograms = allPrograms.filter((program: any) => 
        program.department && targetDepartments.includes(program.department.name)
      );
      
      setPrograms(filteredPrograms);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      setPrograms([]);
    } finally {
      setProgramsLoading(false);
    }
  };

  const fetchTopRatedProjects = async () => {
    try {
      setProjectsLoading(true);
      const params: any = {
        sort_by: 'created_at',
        sort_order: 'desc',
        per_page: 50, // Increased to get more projects for better filtering
        is_public: true,
        admin_approval_status: 'approved'
      };
      
      if (selectedProgram) {
        params.program_id = selectedProgram;
      }
      
      if (selectedYear) {
        params.academic_year = selectedYear;
      }

      console.log('Fetching projects with params:', params);
      const response = await apiService.getProjects(params);
      const projects = Array.isArray(response) ? response : response.data || [];
      
      console.log('Fetched projects:', projects.length);
      
      // For now, show all projects since we don't have rating data in the list
      // In a real implementation, you would need to fetch ratings separately
      const allProjects = projects
        .filter((project: any) => project.status === 'approved' || project.status === 'completed')
        .slice(0, 20); // Top 20 projects
      
      console.log('Filtered projects:', allProjects.length);
      setTopRatedProjects(allProjects);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      setTopRatedProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProgramChange = (event: any) => {
    const programId = event.target.value;
    setSelectedProgram(programId);
    
    // Find and set the selected program data
    const program = programs.find(p => p.id === programId);
    setSelectedProgramData(program || null);
  };

  const handleYearChange = (event: any) => {
    setSelectedYear(event.target.value);
  };

  const handleClearFilters = () => {
    setSelectedProgram('');
    setSelectedYear('');
    setSelectedProgramData(null);
    setTopRatedProjects([]);
  };

  const handleProjectClick = (projectId: number) => {
    // Use protected route for authenticated users
    navigate(`/dashboard/projects/${projectId}`);
  };

  const formatStatusData = (statusData: Record<string, number>) => {
    return Object.entries(statusData).map(([status, count]) => ({
      status: status.replace('_', ' ').toUpperCase(),
      count,
    }));
  };


  const formatMonthlyData = (monthlyData: Array<{ month: string; count: number }>) => {
    return monthlyData.map(item => ({
      ...item,
      month: new Date(item.month).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No analytics data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      backgroundColor: ANALYTICS_COLORS.neutral[50],
      minHeight: '100vh'
    }}>
      <AppBar 
        position="static"
        sx={{ 
          background: `linear-gradient(135deg, ${ANALYTICS_COLORS.primary.main} 0%, ${ANALYTICS_COLORS.secondary.main} 100%)`,
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
          color: ANALYTICS_COLORS.neutral[50],
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ 
              mr: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TVTCLogo size="small" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <InsightsIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h5" component="div" sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              Project Analytics
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <Avatar sx={{ 
              width: 36, 
              height: 36,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: ANALYTICS_COLORS.neutral[50],
              fontWeight: 600
            }}>
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                borderRadius: 2,
              }
            }}
          >
            <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
              <AccountCircle sx={{ mr: 2, color: ANALYTICS_COLORS.primary.main }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <ExitToApp sx={{ mr: 2, color: ANALYTICS_COLORS.warning.main }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Overview Cards */}
        <Fade in timeout={800}>
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${ANALYTICS_COLORS.primary.main} 0%, ${ANALYTICS_COLORS.primary.light} 100%)`,
                color: ANALYTICS_COLORS.neutral[50],
                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.15)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(37, 99, 235, 0.25)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      mr: 2
                    }}>
                      <AssignmentIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      opacity: 0.9,
                      fontWeight: 500,
                      letterSpacing: '0.5px'
                    }}>
                      Total Projects
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {analytics.total_projects}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Across all programs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${ANALYTICS_COLORS.success.main} 0%, ${ANALYTICS_COLORS.success.light} 100%)`,
                color: ANALYTICS_COLORS.neutral[50],
                boxShadow: '0 8px 32px rgba(5, 150, 105, 0.15)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(5, 150, 105, 0.25)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      mr: 2
                    }}>
                      <TrendingUpIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      opacity: 0.9,
                      fontWeight: 500,
                      letterSpacing: '0.5px'
                    }}>
                      Recent Activity
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {analytics.recent_activity}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Last 30 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${ANALYTICS_COLORS.info.main} 0%, ${ANALYTICS_COLORS.info.light} 100%)`,
                color: ANALYTICS_COLORS.neutral[50],
                boxShadow: '0 8px 32px rgba(8, 145, 178, 0.15)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(8, 145, 178, 0.25)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      mr: 2
                    }}>
                      <SchoolIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      opacity: 0.9,
                      fontWeight: 500,
                      letterSpacing: '0.5px'
                    }}>
                      Departments
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {analytics.department_distribution.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Active departments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${ANALYTICS_COLORS.warning.main} 0%, ${ANALYTICS_COLORS.warning.light} 100%)`,
                color: ANALYTICS_COLORS.neutral[50],
                boxShadow: '0 8px 32px rgba(217, 119, 6, 0.15)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(217, 119, 6, 0.25)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      mr: 2
                    }}>
                      <CalendarIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      opacity: 0.9,
                      fontWeight: 500,
                      letterSpacing: '0.5px'
                    }}>
                      Academic Years
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {analytics.year_distribution.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Years tracked
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Enhanced Analytics Section */}
        <Slide in timeout={1000} direction="up">
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ 
                backgroundColor: ANALYTICS_COLORS.neutral[50],
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: `linear-gradient(135deg, ${ANALYTICS_COLORS.neutral[100]} 0%, ${ANALYTICS_COLORS.neutral[50]} 100%)`,
                  p: 3,
                  borderBottom: `1px solid ${ANALYTICS_COLORS.neutral[200]}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: ANALYTICS_COLORS.primary.main,
                      mr: 2
                    }}>
                      <FilterIcon sx={{ color: ANALYTICS_COLORS.neutral[50], fontSize: 24 }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      flexGrow: 1,
                      fontWeight: 600,
                      color: ANALYTICS_COLORS.neutral[800]
                    }}>
                      Advanced Analytics & Filtering
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: ANALYTICS_COLORS.neutral[600],
                    ml: 6
                  }}>
                    Filter and analyze projects by program, academic year, and other criteria
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                
                {/* Filters */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 600,
                    color: ANALYTICS_COLORS.neutral[800],
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <ShowChartIcon sx={{ mr: 1, color: ANALYTICS_COLORS.secondary.main }} />
                    Filter Options
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ 
                          color: ANALYTICS_COLORS.neutral[600],
                          '&.Mui-focused': {
                            color: ANALYTICS_COLORS.primary.main
                          }
                        }}>
                          Program
                        </InputLabel>
                        <Select
                          value={selectedProgram}
                          onChange={handleProgramChange}
                          label="Program"
                          disabled={programs.length === 0}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: ANALYTICS_COLORS.neutral[300],
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: ANALYTICS_COLORS.primary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: ANALYTICS_COLORS.primary.main,
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>All Programs</em>
                          </MenuItem>
                          {(programs || []).map((program) => (
                            <MenuItem key={program.id} value={program.id}>
                              {program.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {programsLoading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <CircularProgress size={16} sx={{ mr: 1, color: ANALYTICS_COLORS.primary.main }} />
                          <Typography variant="caption" sx={{ color: ANALYTICS_COLORS.neutral[600] }}>
                            Loading programs...
                          </Typography>
                        </Box>
                      )}
                      {!programsLoading && programs.length === 0 && (
                        <Typography variant="caption" sx={{ 
                          mt: 1,
                          color: ANALYTICS_COLORS.neutral[500]
                        }}>
                          No programs available
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ 
                          color: ANALYTICS_COLORS.neutral[600],
                          '&.Mui-focused': {
                            color: ANALYTICS_COLORS.primary.main
                          }
                        }}>
                          Academic Year
                        </InputLabel>
                        <Select
                          value={selectedYear}
                          onChange={handleYearChange}
                          label="Academic Year"
                          disabled={!analytics?.year_distribution?.length}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: ANALYTICS_COLORS.neutral[300],
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: ANALYTICS_COLORS.primary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: ANALYTICS_COLORS.primary.main,
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>All Years</em>
                          </MenuItem>
                          {(analytics?.year_distribution || []).map((year) => (
                            <MenuItem key={year.academic_year} value={year.academic_year}>
                              {year.academic_year}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {!analytics?.year_distribution?.length && (
                        <Typography variant="caption" sx={{ 
                          mt: 1,
                          color: ANALYTICS_COLORS.neutral[500]
                        }}>
                          No academic years available
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={handleClearFilters}
                          disabled={!selectedProgram && !selectedYear}
                          fullWidth
                          sx={{
                            height: 56,
                            borderColor: ANALYTICS_COLORS.neutral[300],
                            color: ANALYTICS_COLORS.neutral[700],
                            '&:hover': {
                              borderColor: ANALYTICS_COLORS.warning.main,
                              backgroundColor: `${ANALYTICS_COLORS.warning.main}10`,
                              color: ANALYTICS_COLORS.warning.main,
                            },
                            '&:disabled': {
                              borderColor: ANALYTICS_COLORS.neutral[200],
                              color: ANALYTICS_COLORS.neutral[400],
                            }
                          }}
                        >
                          Clear Filters
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Selected Program Information */}
                {selectedProgramData && (
                  <Fade in timeout={600}>
                    <Box sx={{ 
                      mb: 4, 
                      p: 4, 
                      background: `linear-gradient(135deg, ${ANALYTICS_COLORS.primary.main}08 0%, ${ANALYTICS_COLORS.secondary.main}08 100%)`,
                      borderRadius: 3, 
                      border: `2px solid ${ANALYTICS_COLORS.primary.main}20`,
                      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: ANALYTICS_COLORS.primary.main,
                          mr: 2
                        }}>
                          <SchoolIcon sx={{ color: ANALYTICS_COLORS.neutral[50], fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ 
                          color: ANALYTICS_COLORS.primary.main, 
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}>
                          Selected Program & Specializations
                        </Typography>
                      </Box>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SchoolIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Program: {selectedProgramData.name}
                          </Typography>
                        </Box>
                        {selectedProgramData.department && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AssessmentIcon sx={{ color: 'secondary.main', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Department: {selectedProgramData.department.name}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Specialization: {selectedProgramData.degree_level?.toUpperCase()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Available specializations for this program
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {/* Show related programs (specializations) */}
                    {selectedProgramData.department && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                          Related Specializations in {selectedProgramData.department.name}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {programs
                            .filter((program: any) => 
                              program.department?.name === selectedProgramData.department?.name && 
                              program.id !== selectedProgramData.id
                            )
                            .map((program: any) => (
                              <Chip
                                key={program.id}
                                label={`${program.degree_level?.toUpperCase()} - ${program.name}`}
                                size="small"
                                variant="outlined"
                                color="info"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  </Fade>
                )}

                {/* Filtered Projects List */}
                {(selectedProgram || selectedYear) ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Filtered Projects
                      </Typography>
                      {selectedProgram && (
                        <Chip 
                          label={selectedProgramData?.name || 'Selected Program'} 
                          size="small" 
                          color="primary"
                          icon={<SchoolIcon />}
                        />
                      )}
                      {selectedYear && (
                        <Chip 
                          label={selectedYear} 
                          size="small" 
                          color="secondary"
                          icon={<CalendarIcon />}
                        />
                      )}
                    </Box>
                    
                    {projectsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    ) : topRatedProjects.length > 0 ? (
                      <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <List>
                          {topRatedProjects.map((project, index) => (
                            <React.Fragment key={project.id}>
                              <ListItem 
                                button 
                                onClick={() => handleProjectClick(project.id)}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'action.hover',
                                    cursor: 'pointer'
                                  }
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        #{index + 1} {project.title}
                                      </Typography>
                                      <Chip 
                                        label={project.status.replace('_', ' ').toUpperCase()} 
                                        size="small" 
                                        color={project.status === 'approved' ? 'success' : 'default'}
                                        sx={{ fontWeight: 'bold' }}
                                      />
                                      {project.program && (
                                        <Chip 
                                          label={`${project.program.degree_level?.toUpperCase()} - ${project.program.name}`}
                                          size="small" 
                                          variant="outlined"
                                          color="info"
                                          icon={<SchoolIcon />}
                                        />
                                      )}
                                    </Box>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
                                        {project.abstract && project.abstract.length > 200 
                                          ? `${project.abstract.substring(0, 200)}...` 
                                          : project.abstract || 'No abstract available'}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                        {project.average_rating && project.average_rating > 0 && (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <StarIcon sx={{ color: 'warning.main', mr: 0.5, fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                              {project.average_rating.toFixed(1)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                              ({project.rating_count || 0} ratings)
                                            </Typography>
                                          </Box>
                                        )}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <VisibilityIcon sx={{ color: 'info.main', mr: 0.5, fontSize: 18 }} />
                                          <Typography variant="body2" color="info.main" sx={{ fontWeight: 'medium' }}>
                                            {project.views || 0} views
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <CalendarIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
                                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                            {project.academic_year} • {project.semester}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProjectClick(project.id);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </ListItemSecondaryAction>
                              </ListItem>
                              {index < topRatedProjects.length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      </Paper>
                    ) : (
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          No projects found for the selected filters.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Select a program or academic year to view filtered projects
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use the filters above to explore projects by specialization and year
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Slide>

        {/* Data Tables */}
        <Slide in timeout={1200} direction="up">
          <Grid container spacing={4}>
            {/* Project Status Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${ANALYTICS_COLORS.neutral[50]} 0%, ${ANALYTICS_COLORS.neutral[100]} 100%)`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: `linear-gradient(135deg, ${ANALYTICS_COLORS.primary.main} 0%, ${ANALYTICS_COLORS.primary.light} 100%)`,
                  p: 2,
                  color: ANALYTICS_COLORS.neutral[50]
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BarChartIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Project Status Distribution
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mt: 2 }}>
                    {formatStatusData(analytics.status_distribution).map((item, index) => (
                      <Box key={item.status} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2,
                        p: 2,
                        backgroundColor: ANALYTICS_COLORS.neutral[50],
                        borderRadius: 2,
                        border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: ANALYTICS_COLORS.neutral[100],
                          transform: 'translateX(4px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            mr: 2
                          }} />
                          <Typography variant="body1" sx={{ 
                            fontWeight: 500,
                            color: ANALYTICS_COLORS.neutral[700]
                          }}>
                            {item.status}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 700,
                          color: ANALYTICS_COLORS.primary.main
                        }}>
                          {item.count} projects
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Projects by Department */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${ANALYTICS_COLORS.neutral[50]} 0%, ${ANALYTICS_COLORS.neutral[100]} 100%)`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: `linear-gradient(135deg, ${ANALYTICS_COLORS.secondary.main} 0%, ${ANALYTICS_COLORS.secondary.light} 100%)`,
                  p: 2,
                  color: ANALYTICS_COLORS.neutral[50]
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Projects by Department
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mt: 2 }}>
                    {(analytics.department_distribution || []).map((item, index) => (
                      <Box key={item.department} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2,
                        p: 2,
                        backgroundColor: ANALYTICS_COLORS.neutral[50],
                        borderRadius: 2,
                        border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: ANALYTICS_COLORS.neutral[100],
                          transform: 'translateX(4px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            mr: 2
                          }} />
                          <Typography variant="body1" sx={{ 
                            fontWeight: 500,
                            color: ANALYTICS_COLORS.neutral[700]
                          }}>
                            {item.department}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 700,
                          color: ANALYTICS_COLORS.secondary.main
                        }}>
                          {item.count} projects
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Projects by Academic Year */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${ANALYTICS_COLORS.neutral[50]} 0%, ${ANALYTICS_COLORS.neutral[100]} 100%)`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: `linear-gradient(135deg, ${ANALYTICS_COLORS.success.main} 0%, ${ANALYTICS_COLORS.success.light} 100%)`,
                  p: 2,
                  color: ANALYTICS_COLORS.neutral[50]
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Projects by Academic Year
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mt: 2 }}>
                    {(analytics.year_distribution || []).map((item, index) => (
                      <Box key={item.academic_year} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2,
                        p: 2,
                        backgroundColor: ANALYTICS_COLORS.neutral[50],
                        borderRadius: 2,
                        border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: ANALYTICS_COLORS.neutral[100],
                          transform: 'translateX(4px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            mr: 2
                          }} />
                          <Typography variant="body1" sx={{ 
                            fontWeight: 500,
                            color: ANALYTICS_COLORS.neutral[700]
                          }}>
                            {item.academic_year}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 700,
                          color: ANALYTICS_COLORS.success.main
                        }}>
                          {item.count} projects
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Trend */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${ANALYTICS_COLORS.neutral[50]} 0%, ${ANALYTICS_COLORS.neutral[100]} 100%)`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: `linear-gradient(135deg, ${ANALYTICS_COLORS.info.main} 0%, ${ANALYTICS_COLORS.info.light} 100%)`,
                  p: 2,
                  color: ANALYTICS_COLORS.neutral[50]
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimelineIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Monthly Project Creation Trend
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mt: 2 }}>
                    {formatMonthlyData(analytics.monthly_trend).map((item, index) => (
                      <Box key={item.month} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2,
                        p: 2,
                        backgroundColor: ANALYTICS_COLORS.neutral[50],
                        borderRadius: 2,
                        border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: ANALYTICS_COLORS.neutral[100],
                          transform: 'translateX(4px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            mr: 2
                          }} />
                          <Typography variant="body1" sx={{ 
                            fontWeight: 500,
                            color: ANALYTICS_COLORS.neutral[700]
                          }}>
                            {item.month}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 700,
                          color: ANALYTICS_COLORS.info.main
                        }}>
                          {item.count} projects
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Slide>
      </Container>
    </Box>
  );
};
