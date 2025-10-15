import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Project, Program, Department } from '../types';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getDashboardTheme } from '../config/dashboardThemes';
import { TVTCLogo } from '../components/TVTCLogo';
import { ProjectCard } from '../components/shared/ProjectCard';
import { useTheme } from '../contexts/ThemeContext';

type ProjectSection = 'in-progress' | 'completed' | 'pending-approval';

const StudentMyProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const dashboardTheme = getDashboardTheme(user?.roles);

  // Debug logging
  console.log('StudentMyProjectsPage: Component rendering', { user, theme, dashboardTheme });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ProjectSection>(
    (searchParams.get('section') as ProjectSection) || 'in-progress'
  );
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  // Stats
  const [stats, setStats] = useState({
    inProgress: 0,
    completed: 0,
    pendingApproval: 0,
  });

  useEffect(() => {
    console.log('StudentMyProjectsPage: loadInitialData effect triggered');
    loadInitialData();
  }, []);

  useEffect(() => {
    console.log('StudentMyProjectsPage: loadProjects effect triggered', { currentPage, searchTerm, selectedProgram, selectedDepartment, selectedYear, statusFilter, userId: user?.id });
    loadProjects();
  }, [currentPage, searchTerm, selectedProgram, selectedDepartment, selectedYear, statusFilter, user?.id]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Handle section change from URL parameters
  useEffect(() => {
    const sectionFromUrl = searchParams.get('section') as ProjectSection;
    if (sectionFromUrl && ['in-progress', 'completed', 'pending-approval'].includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    }
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      const [programsRes, departmentsRes] = await Promise.all([
        apiService.getPrograms(),
        apiService.getDepartments(),
      ]);
      
      setPrograms(programsRes.data || []);
      setDepartments(departmentsRes || []);
    } catch (err) {
      setError('Failed to load initial data');
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getProjects({
        page: currentPage,
        per_page: perPage,
        created_by_user_id: user?.id,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedProgram && { program_id: selectedProgram }),
        ...(selectedDepartment && { department_id: selectedDepartment }),
        ...(selectedYear && { academic_year: selectedYear }),
        ...(statusFilter && { status: statusFilter }),
      });

      const projectsData = Array.isArray(response) ? response : response.data || [];
      
      // Filter for user's projects (created by them or they're a member)
      const myProjects = projectsData.filter((project: Project) => 
        project.created_by_user_id === user?.id || 
        (project.members || []).some(member => member.id === user?.id)
      );

      setProjects(myProjects);
      setFilteredProjects(myProjects);
      setTotalPages(Array.isArray(response) ? 1 : response.last_page || 1);

      // Calculate stats
      setStats({
        inProgress: myProjects.filter((p: Project) => 
          ['submitted', 'under_review'].includes(p.status)
        ).length,
        completed: myProjects.filter((p: Project) => p.status === 'completed').length,
        pendingApproval: myProjects.filter((p: Project) => 
          p.admin_approval_status === 'pending'
        ).length,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProgram('');
    setSelectedDepartment('');
    setSelectedYear('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'submitted': return 'info';
      case 'under_review': return 'primary';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getApprovalStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'hidden':
        return <Chip label="Hidden" color="error" size="small" />;
      case 'pending':
      default:
        return <Chip label="Pending Approval" color="warning" size="small" />;
    }
  };

  const getProjectsBySection = (section: ProjectSection) => {
    switch (section) {
      case 'in-progress':
        return filteredProjects.filter(p => 
          ['submitted', 'under_review'].includes(p.status)
        );
      case 'completed':
        return filteredProjects.filter(p => p.status === 'completed');
      case 'pending-approval':
        return filteredProjects.filter(p => p.admin_approval_status === 'pending');
      default:
        return [];
    }
  };

  const getSectionTitle = (section: ProjectSection) => {
    switch (section) {
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'pending-approval':
        return 'Pending Approval';
      default:
        return '';
    }
  };

  const handleSectionChange = (section: ProjectSection) => {
    setActiveSection(section);
    // Update URL without page reload
    navigate(`/student/my-projects?section=${section}`, { replace: true });
    // Close sidebar on mobile after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getSectionIcon = (section: ProjectSection) => {
    switch (section) {
      case 'in-progress':
        return TrendingUpIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'pending-approval':
        return PendingIcon;
      default:
        return SchoolIcon;
    }
  };

  const sidebarContent = (
    <Box sx={{ width: 320, height: '100%', background: theme.background }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              background: dashboardTheme.appBarGradient,
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <SchoolIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: dashboardTheme.textPrimary }}>
              My Projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your graduation projects
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3, borderColor: dashboardTheme.borderColor }} />
        
        <List sx={{ p: 0 }}>
          {(['in-progress', 'completed', 'pending-approval'] as ProjectSection[]).map((section) => {
            const Icon = getSectionIcon(section);
            const count = getProjectsBySection(section).length;
            const isActive = activeSection === section;
            
            return (
              <ListItem key={section} disablePadding sx={{ mb: 2 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => handleSectionChange(section)}
                  sx={{
                    borderRadius: 3,
                    mx: 1,
                    py: 2,
                    px: 2,
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${dashboardTheme.primary}20, ${dashboardTheme.secondary}20)`,
                      border: `2px solid ${dashboardTheme.primary}40`,
                      boxShadow: `0 4px 12px ${dashboardTheme.primary}20`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${dashboardTheme.primary}30, ${dashboardTheme.secondary}30)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 16px ${dashboardTheme.primary}30`,
                      },
                    },
                    '&:hover': {
                      backgroundColor: `${dashboardTheme.primary}10`,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 2px 8px ${dashboardTheme.primary}15`,
                    },
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        background: isActive 
                          ? dashboardTheme.appBarGradient 
                          : `linear-gradient(135deg, ${dashboardTheme.primary}20, ${dashboardTheme.secondary}20)`,
                        width: 40,
                        height: 40,
                        mr: 1,
                      }}
                    >
                      <Icon 
                        sx={{ 
                          color: isActive ? 'white' : dashboardTheme.primary,
                          fontSize: 20 
                        }} 
                      />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={getSectionTitle(section)}
                    secondary={`${count} projects`}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? dashboardTheme.primary : dashboardTheme.textPrimary,
                      fontSize: '1rem',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.8rem',
                      color: isActive ? dashboardTheme.primary : 'text.secondary',
                      fontWeight: 500,
                    }}
                  />
                  {isActive && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: dashboardTheme.primary,
                        ml: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Quick Stats */}
        <Box sx={{ mt: 4, p: 2, background: `linear-gradient(135deg, ${dashboardTheme.primary}10, ${dashboardTheme.secondary}10)`, borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: dashboardTheme.textPrimary }}>
            Project Overview
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Projects:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: dashboardTheme.primary }}>
              {projects.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">In Progress:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: dashboardTheme.secondary }}>
              {stats.inProgress}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Completed:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: dashboardTheme.accent }}>
              {stats.completed}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const currentProjects = getProjectsBySection(activeSection);

  // Debug: Log current state
  console.log('StudentMyProjectsPage: Render state', { 
    loading, 
    error, 
    projects: projects.length, 
    currentProjects: currentProjects.length,
    activeSection,
    user: user?.id 
  });

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            position: 'relative',
            borderRight: `1px solid ${theme.borderColor}`,
            backgroundColor: theme.background,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: theme.background }}>
        {/* Enhanced Header */}
        <AppBar 
          position="static"
          sx={{ 
            background: dashboardTheme.appBarGradient,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setSidebarOpen(true)}
                sx={{ 
                  mr: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <TVTCLogo size="small" variant="icon" color="inherit" sx={{ mr: 1 }} />
            <SchoolIcon sx={{ mr: 2, fontSize: 28 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                My Projects - {getSectionTitle(activeSection)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {activeSection === 'in-progress' && 'Projects currently in development'}
                {activeSection === 'completed' && 'Successfully completed projects'}
                {activeSection === 'pending-approval' && 'Projects awaiting approval'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={`${currentProjects.length} Projects`} 
                color="primary" 
                variant="filled"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Enhanced Filters */}
          <Card sx={{ 
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${dashboardTheme.borderColor}`,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            backdropFilter: 'blur(10px)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SearchIcon sx={{ color: dashboardTheme.primary, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                  Search & Filter Projects
                </Typography>
              </Box>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Search projects"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: dashboardTheme.primary }} />,
                    }}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.primary,
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.borderColor,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.primary,
                        },
                      }}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="under_review">Under Review</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={selectedDepartment}
                      label="Department"
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.borderColor,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.primary,
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

                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Program</InputLabel>
                    <Select
                      value={selectedProgram}
                      label="Program"
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.borderColor,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.primary,
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

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.primary,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      startIcon={<FilterIcon />}
                      size="small"
                      sx={{
                        borderColor: dashboardTheme.primary,
                        color: dashboardTheme.primary,
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: dashboardTheme.primary,
                          backgroundColor: `${dashboardTheme.primary}10`,
                        },
                      }}
                    >
                      Clear
                    </Button>
                    <Tooltip title="Refresh">
                      <IconButton 
                        onClick={loadProjects} 
                        size="small"
                        sx={{
                          color: dashboardTheme.primary,
                          '&:hover': {
                            backgroundColor: `${dashboardTheme.primary}10`,
                          },
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Enhanced Projects Display */}
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${dashboardTheme.borderColor}`,
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress 
                      size={48} 
                      sx={{ color: dashboardTheme.primary, mb: 2 }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      Loading projects...
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <>
                  {/* Enhanced Grid View for Projects */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {currentProjects.map((project, index) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                          <Box
                            sx={{
                              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                              '@keyframes fadeInUp': {
                                from: {
                                  opacity: 0,
                                  transform: 'translateY(30px)',
                                },
                                to: {
                                  opacity: 1,
                                  transform: 'translateY(0)',
                                },
                              },
                            }}
                          >
                            <ProjectCard
                              project={project}
                              theme={theme}
                              showProgress={true}
                              showEdit={true}
                              showApprovalStatus={true}
                              currentUserId={user?.id}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {totalPages > 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      p: 3,
                      background: `${dashboardTheme.primary}05`,
                    }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: dashboardTheme.primary,
                            '&.Mui-selected': {
                              backgroundColor: dashboardTheme.primary,
                              color: 'white',
                            },
                            '&:hover': {
                              backgroundColor: `${dashboardTheme.primary}20`,
                            },
                          },
                        }}
                      />
                    </Box>
                  )}

                  {currentProjects.length === 0 && !loading && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      background: `linear-gradient(135deg, ${dashboardTheme.primary}05, ${dashboardTheme.secondary}05)`,
                    }}>
                      <Avatar
                        sx={{
                          background: `linear-gradient(135deg, ${dashboardTheme.primary}20, ${dashboardTheme.secondary}20)`,
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 3,
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 40, color: dashboardTheme.primary }} />
                      </Avatar>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                        No {getSectionTitle(activeSection).toLowerCase()} projects
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                        {activeSection === 'in-progress' && "You don't have any projects in progress at the moment. Start a new project to get going!"}
                        {activeSection === 'completed' && "You haven't completed any projects yet. Keep working on your current projects!"}
                        {activeSection === 'pending-approval' && "You don't have any projects awaiting approval. All your projects are either approved or in progress."}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/dashboard')}
                        sx={{
                          background: dashboardTheme.appBarGradient,
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 600,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Back to Dashboard
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default StudentMyProjectsPage;
