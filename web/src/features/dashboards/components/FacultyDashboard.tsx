import React, { useState, useEffect } from 'react';
import { designTokens } from '@/styles/designTokens';
import { colorPalette } from '@/styles/theme/colorPalette';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  CircularProgress, 
  Alert,
} from '@mui/material';
import { getErrorMessage } from '@/utils/errorHandling';
import {
  Typography,
  Container,
  Paper,
  Fade,
  Slide,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ShowChart as ShowChartIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getProjectDetailUrl, projectRoutes } from '@/utils/projectRoutes';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { getRoleInfo } from '@/config/dashboardThemes';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';

// Harmonious color palette derived from design system tokens
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
  neutral: colorPalette.neutral,
};

interface FacultyStats {
  advisingProjects: number;
  underReview: number;
  completed: number;
  thisMonth: number;
}

export const FacultyDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FacultyStats>({
    advisingProjects: 0,
    underReview: 0,
    completed: 0,
    thisMonth: 0,
  });
  
  // Enhanced state for filtering and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const _roleInfo = getRoleInfo('faculty', user?.full_name, t);
  const userIsFaculty = (user?.roles || []).some(role => role.name === 'faculty');

  const isMyAdvisingProject = (project: Project) => {
    const advisors = project.advisors || [];
    const isAdvisor = advisors.some(advisor => advisor?.id === user?.id);
    const createdByCurrentFaculty = userIsFaculty && (
      project.created_by_user_id === user?.id ||
      project.creator?.id === user?.id
    );

    return isAdvisor || createdByCurrentFaculty;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects('per_page=50');
      const projectsData = Array.isArray(response) ? response : response.data || [];

      setProjects(projectsData);

      const advisingProjects = projectsData.filter(isMyAdvisingProject);

      setStats({
        advisingProjects: advisingProjects.length,
        underReview: advisingProjects.filter((p: Project) => p.status === 'under_review').length,
        completed: advisingProjects.filter((p: Project) => p.status === 'completed').length,
        thisMonth: advisingProjects.filter((p: Project) => {
          const createdDate = new Date(p.created_at);
          const now = new Date();
          return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        }).length,
      });
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  // Enhanced functionality methods
  const handleProjectClick = (project: Project | number) => {
    if (typeof project === 'number') {
      navigate(`/pr/${project}`); // Fallback for numeric ID
    } else {
      navigate(getProjectDetailUrl(project));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSortBy('created_at');
  };

  // Filter and sort projects
  const getFilteredProjects = () => {
    let filtered = projects.filter(isMyAdvisingProject);

    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.abstract?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  };

  const filteredProjects = getFilteredProjects();


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

  return (
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
                      {t('Total Advising Projects')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {stats.advisingProjects}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {t("Projects you're advising")}
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
                      {t('Under Review')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {stats.underReview}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {t('Projects in review')}
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
                      {t('Completed')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {t('Successfully completed')}
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
                      {t('This Month')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {stats.thisMonth}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {t('New this month')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Enhanced Projects Section */}
        <Slide in timeout={1000} direction="up">
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ 
                backgroundColor: colorPalette.common.white,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: `1px solid ${ANALYTICS_COLORS.neutral[200]}`,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  background: colorPalette.common.white,
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
                      {t('My Advising Projects')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: ANALYTICS_COLORS.neutral[600],
                    ml: 6
                  }}>
                    {t('Manage and filter your advising projects')} {t('with advanced search and sorting')}
                </Typography>
              </Box>
                <CardContent sx={{ p: 4 }}>
                
                {/* Filters and Search */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 600,
                    color: ANALYTICS_COLORS.neutral[800],
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <ShowChartIcon sx={{ mr: 1, color: ANALYTICS_COLORS.secondary.main }} />
                    {t('Search & Filter Options')}
                  </Typography>

              <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        placeholder={t('Search projects...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: ANALYTICS_COLORS.neutral[400] }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: ANALYTICS_COLORS.neutral[300],
                            },
                            '&:hover fieldset': {
                              borderColor: ANALYTICS_COLORS.primary.main,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: ANALYTICS_COLORS.primary.main,
                            }
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ 
                          color: ANALYTICS_COLORS.neutral[600],
                          '&.Mui-focused': {
                            color: ANALYTICS_COLORS.primary.main
                          }
                        }}>
                          {t('Status')}
                        </InputLabel>
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          label={t('Status')}
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
                          <MenuItem value="">{t('All Statuses')}</MenuItem>
                          <MenuItem value="draft">{t('Draft')}</MenuItem>
                          <MenuItem value="submitted">{t('Submit')}</MenuItem>
                          <MenuItem value="under_review">{t('Under Review')}</MenuItem>
                          <MenuItem value="approved">{t('Approved')}</MenuItem>
                          <MenuItem value="completed">{t('Completed')}</MenuItem>
                          <MenuItem value="rejected">{t('Rejected')}</MenuItem>
                        </Select>
                      </FormControl>
              </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ 
                          color: ANALYTICS_COLORS.neutral[600],
                          '&.Mui-focused': {
                            color: ANALYTICS_COLORS.primary.main
                          }
                        }}>
                          {t('Sort By')}
                        </InputLabel>
                        <Select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          label={t('Sort By')}
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
                          <MenuItem value="created_at">{t('Date Created')}</MenuItem>
                          <MenuItem value="title">{t('Title')}</MenuItem>
                          <MenuItem value="status">{t('Status')}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={handleClearFilters}
                          disabled={!searchTerm && !statusFilter}
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
                          {t('Clear')}
                </Button>
              </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Projects List */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {t('Advising Projects')} ({filteredProjects.length})
                    </Typography>
                    {searchTerm && (
                      <Chip 
                        label={`Search: "${searchTerm}"`} 
                        size="small" 
                        color="primary"
                        icon={<SearchIcon />}
                        onDelete={() => setSearchTerm('')}
                      />
                    )}
                    {statusFilter && (
                      <Chip 
                        label={`Status: ${statusFilter.replace('_', ' ').toUpperCase()}`} 
                        size="small" 
                        color="secondary"
                        icon={<AssessmentIcon />}
                        onDelete={() => setStatusFilter('')}
                      />
                    )}
                  </Box>
                  
                  {filteredProjects.length > 0 ? (
                    <Paper sx={{ maxHeight: 600, overflow: 'auto', backgroundColor: 'background.paper' }}>
                      <List>
                        {filteredProjects.map((project, index) => (
                          <React.Fragment key={project.id}>
                            <ListItem 
                              component="div"
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
                                      {project.title}
                                    </Typography>
                                    <Chip 
                                      label={project.status.replace('_', ' ').toUpperCase()} 
                                      size="small" 
                                      color={project.status === 'approved' || project.status === 'completed' ? 'success' : 'default'}
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
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PeopleIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                          {project.members?.length || 0} {t('members')}
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
                            {index < filteredProjects.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'background.paper' }}>
                      <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {stats.advisingProjects === 0 
                          ? t('No advising projects yet. You will see projects here once students add you as their advisor.')
                          : t('No projects match your current filters.')
                        }
                      </Typography>
                      {stats.advisingProjects === 0 && (
                        <Button
                          variant="contained"
                          startIcon={<AssignmentIcon />}
                          onClick={() => navigate(projectRoutes.create())}
                          sx={{
                            background: designTokens.colors.primary[500],
                            '&:hover': {
                              background: designTokens.colors.primary[500],
                            }
                          }}
                        >
                          {t('Create New Project')}
                        </Button>
                      )}
                    </Paper>
                  )}
                </Box>
            </CardContent>
          </Card>
          </Grid>
        </Grid>
        </Slide>
      </Container>
  );
};
