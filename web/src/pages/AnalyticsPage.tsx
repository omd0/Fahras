import React, { useState, useEffect } from 'react';
import { designTokens } from '@/styles/designTokens';
import { colorPalette } from '@/styles/theme/colorPalette';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
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
  Fade,
  Slide,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
// Chart components will be implemented with basic MUI components for now
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import { getDashboardTheme } from '@/config/dashboardThemes';
import { Project, Program } from '@/types';
import { useLanguage } from '@/providers/LanguageContext';

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

// Analytics color palette — mapped from unified colorPalette tokens
const ANALYTICS_COLORS = {
  primary: {
    main: colorPalette.info.main,
    light: colorPalette.info.light,
    dark: colorPalette.info.dark,
    contrast: colorPalette.common.white,
  },
  secondary: {
    main: colorPalette.secondary.main,
    light: colorPalette.secondary.light,
    dark: colorPalette.secondary.dark,
    contrast: colorPalette.common.white,
  },
  success: {
    main: colorPalette.success.main,
    light: colorPalette.success.light,
    dark: colorPalette.success.dark,
    contrast: colorPalette.common.white,
  },
  warning: {
    main: colorPalette.warning.main,
    light: colorPalette.warning.light,
    dark: colorPalette.warning.dark,
    contrast: colorPalette.common.white,
  },
  info: {
    main: colorPalette.teal.main,
    light: colorPalette.teal.light,
    dark: colorPalette.teal.dark,
    contrast: colorPalette.common.white,
  },
  neutral: {
    50: colorPalette.neutral[50],
    100: colorPalette.neutral[100],
    200: colorPalette.neutral[200],
    300: colorPalette.neutral[300],
    400: colorPalette.neutral[400],
    500: colorPalette.neutral[500],
    600: colorPalette.neutral[600],
    700: colorPalette.neutral[700],
    800: colorPalette.neutral[800],
    900: colorPalette.neutral[900],
  }
};

const CHART_COLORS = [
  colorPalette.info.main,
  colorPalette.secondary.main,
  colorPalette.success.main,
  colorPalette.warning.main,
  colorPalette.teal.main,
  colorPalette.accent.main,
  colorPalette.accent.light,
  colorPalette.error.main,
];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
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
  const _dashboardTheme = getDashboardTheme(user?.roles);
  const { t } = useLanguage();

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
      const allPrograms = await apiService.getPrograms();
      
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

      const response = await apiService.getProjects(params);
      const projects = Array.isArray(response) ? response : response.data || [];
      
      
      // For now, show all projects since we don't have rating data in the list
      // In a real implementation, you would need to fetch ratings separately
      const allProjects = projects
        .filter((project: any) => project.status === 'approved' || project.status === 'completed')
        .slice(0, 20); // Top 20 projects
      
      setTopRatedProjects(allProjects);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      setTopRatedProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const _handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleMenuClose = () => {
    setAnchorEl(null);
  };

  const _handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const _handleLogout = () => {
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Overview Cards */}
        <Fade in timeout={800}>
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: designTokens.colors.primary[500],
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
                      {t('Total Projects')}
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
                    {t('Across all programs')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: designTokens.colors.primary[500],
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
                      {t('Recent Activity')}
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
                    {t('Last 30 days')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: designTokens.colors.primary[500],
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
                      {t('Departments')}
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
                    {t('Active departments')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: designTokens.colors.primary[500],
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
                      {t('Academic Years')}
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
                    {t('Years tracked')}
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
                  background: designTokens.colors.primary[500],
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
                      {t('Advanced Analytics & Filtering')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: ANALYTICS_COLORS.neutral[600],
                    ml: 6
                  }}>
                    {t('Filter and analyze projects by program, academic year, and other criteria')}
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
                      {t('Filter Options')}
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
                          {t('Program')}
                        </InputLabel>
                        <Select
                          value={selectedProgram}
                          onChange={handleProgramChange}
                          label={t('Program')}
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
                            <em>{t('All Programs')}</em>
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
                            {t('Loading programs...')}
                          </Typography>
                        </Box>
                      )}
                      {!programsLoading && programs.length === 0 && (
                        <Typography variant="caption" sx={{ 
                          mt: 1,
                          color: ANALYTICS_COLORS.neutral[500]
                        }}>
                          {t('No programs available')}
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
                          {t('Academic Year')}
                        </InputLabel>
                        <Select
                          value={selectedYear}
                          onChange={handleYearChange}
                          label={t('Academic Year')}
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
                            <em>{t('All Years')}</em>
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
                          {t('No academic years available')}
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
                          {t('Clear Filters')}
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
                      background: designTokens.colors.primary[500],
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
                          {t('Selected Program & Specializations')}
                        </Typography>
                      </Box>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SchoolIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {t('Program:')} {selectedProgramData.name}
                          </Typography>
                        </Box>
                        {selectedProgramData.department && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AssessmentIcon sx={{ color: 'secondary.main', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {t('Department:')} {selectedProgramData.department.name}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {t('Specialization:')} {selectedProgramData.degree_level?.toUpperCase()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('Available specializations for this program')}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {/* Show related programs (specializations) */}
                    {selectedProgramData.department && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                          {t('Related Specializations in')} {selectedProgramData.department.name}:
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
                        {t('Filtered Projects')}
                      </Typography>
                      {selectedProgram && (
                        <Chip 
                          label={selectedProgramData?.name || t('Selected Program')} 
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
                                              ({project.rating_count || 0} {t('ratings')})
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
                                  {t('View Details')}
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
                          {t('No projects found for the selected filters.')}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {t('Select a program or academic year to view filtered projects')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('Use the filters above to explore projects by specialization and year')}
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
                background: designTokens.colors.primary[500],
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: designTokens.colors.primary[500],
                  p: 2,
                  color: ANALYTICS_COLORS.neutral[50]
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BarChartIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('Project Status Distribution')}
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
                          {item.count} {t('projects')}
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
                background: designTokens.colors.primary[500],
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: designTokens.colors.primary[500],
                  p: 2,
                  color: ANALYTICS_COLORS.neutral[50]
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('Projects by Department')}
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
                          {item.count} {t('projects')}
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
                background: designTokens.colors.primary[500],
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: designTokens.colors.primary[500],
                  p: 2,
                  color: ANALYTICS_COLORS.neutral[50]
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('Projects by Academic Year')}
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
                          {item.count} {t('projects')}
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
                background: designTokens.colors.primary[500],
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: designTokens.colors.primary[500],
                  p: 2,
                  color: ANALYTICS_COLORS.neutral[50]
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimelineIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('Monthly Project Creation Trend')}
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
                          {item.count} {t('projects')}
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
