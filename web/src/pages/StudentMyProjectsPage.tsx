import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Project, Program, Department } from '../types';
import { apiService } from '../services/api';
import { TVTCLogo } from '../components/TVTCLogo';
import { getDashboardTheme } from '../config/dashboardThemes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentMyProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const dashboardTheme = getDashboardTheme(user?.roles);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect non-student users
    if (user && !user.roles?.some(role => role.name === 'student')) {
      navigate('/dashboard');
    } else {
      fetchData();
    }
  }, [user, navigate]);

  // Parse URL query parameters to set the correct tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    
    if (section) {
      switch (section) {
        case 'in-progress':
          setTabValue(2); // In Progress tab
          break;
        case 'completed':
          setTabValue(4); // Completed tab
          break;
        case 'pending-approval':
          setTabValue(3); // Pending Approval tab
          break;
        default:
          setTabValue(0); // All Projects tab
      }
    }
  }, [location.search]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, statusFilter, academicYearFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyProjects({
        page: 1,
        per_page: 100, // Get all projects for filtering
      });

      // Handle paginated response structure
      // Response should be: { data: Project[], current_page, last_page, total, per_page, ... }
      let projectsData: Project[] = [];
      
      if (response && typeof response === 'object') {
        // Check if response has a 'data' property (paginated response)
        if ('data' in response && Array.isArray(response.data)) {
          projectsData = response.data;
        } 
        // Check if response itself is an array (direct array response)
        else if (Array.isArray(response)) {
          projectsData = response;
        }
        // Check if response has a 'projects' property (alternative structure)
        else if ('projects' in response && Array.isArray(response.projects)) {
          projectsData = response.projects;
        }
      }
      
      // Filter out any null/undefined projects
      const validProjects = projectsData.filter(p => p != null && p !== undefined);
      
      setProjects(validProjects);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
      setProjects([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...(projects || [])].filter(project => project != null);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project?.abstract?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project?.status === statusFilter);
    }

    // Academic year filter
    if (academicYearFilter !== 'all') {
      filtered = filtered.filter(project => project?.academic_year === academicYearFilter);
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setDetailDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedProject(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'under_review': return 'info';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'under_review': return 'Under Review';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  // Get unique academic years from projects
  const academicYears = Array.from(new Set((projects || []).map(p => p?.academic_year).filter(Boolean)));

  // Helper function to get filtered projects for a specific tab
  const getTabFilteredProjects = (tabIndex: number): Project[] => {
    let filtered = [...(projects || [])].filter(project => project != null);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project?.abstract?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply academic year filter
    if (academicYearFilter !== 'all') {
      filtered = filtered.filter(project => project?.academic_year === academicYearFilter);
    }

    // Apply tab-specific status filter (ignore the statusFilter dropdown when on a specific tab)
    switch (tabIndex) {
      case 0: // All Projects
        // Only apply statusFilter if it's not 'all'
        if (statusFilter !== 'all') {
          filtered = filtered.filter(project => project?.status === statusFilter);
        }
        break;
      case 1: // Drafts
        filtered = filtered.filter(project => project?.status === 'draft');
        break;
      case 2: // In Progress
        filtered = filtered.filter(project => project && (project.status === 'submitted' || project.status === 'under_review'));
        break;
      case 3: // Pending Approval
        filtered = filtered.filter(project => project && project.admin_approval_status === 'pending');
        break;
      case 4: // Completed
        filtered = filtered.filter(project => project && project.status === 'completed');
        break;
      case 5: // Approved
        filtered = filtered.filter(project => project?.status === 'approved');
        break;
      default:
        break;
    }

    return filtered;
  };

  // Get filtered projects for current tab
  const tabFilteredProjects = getTabFilteredProjects(tabValue);

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = tabFilteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(tabFilteredProjects.length / projectsPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: dashboardTheme.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: dashboardTheme.background,
      }}
    >
      {/* Enhanced Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.accent} 100%)`,
          color: 'white',
          py: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(50px, -50px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            transform: 'translate(-30px, 30px)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <TVTCLogo size="medium" />
              <Box>
                <Typography variant="h3" component="h1" fontWeight="800" sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'white' }}>
                  My Projects
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, color: 'white' }}>
                  Manage and track your project portfolio
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Create New Project
              </Button>
              <Tooltip title="Go to Dashboard">
                <IconButton 
                  onClick={handleGoHome} 
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <HomeIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Enhanced Filters */}
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${dashboardTheme.primary}20`,
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <FilterIcon sx={{ color: dashboardTheme.primary, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Filter & Search Projects
              </Typography>
            </Box>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: dashboardTheme.primary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: dashboardTheme.primary,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: dashboardTheme.primary,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: dashboardTheme.primary,
                      },
                    }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={academicYearFilter}
                    label="Academic Year"
                    onChange={(e) => setAcademicYearFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: dashboardTheme.primary,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: dashboardTheme.primary,
                      },
                    }}
                  >
                    <MenuItem value="all">All Years</MenuItem>
                    {academicYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${dashboardTheme.primary}20`,
          overflow: 'hidden',
        }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  minHeight: 60,
                  '&.Mui-selected': {
                    color: dashboardTheme.primary,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: dashboardTheme.primary,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label={`All Projects (${getTabFilteredProjects(0).length})`} />
              <Tab label={`Drafts (${getTabFilteredProjects(1).length})`} />
              <Tab label={`In Progress (${getTabFilteredProjects(2).length})`} />
              <Tab label={`Pending Approval (${getTabFilteredProjects(3).length})`} />
              <Tab label={`Completed (${getTabFilteredProjects(4).length})`} />
              <Tab label={`Approved (${getTabFilteredProjects(5).length})`} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: `1px solid ${dashboardTheme.primary}15`,
              }}
            >
              <Table>
                <TableHead sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No projects found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== 'all' || academicYearFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'You haven\'t created any projects yet'}
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateProject}
                            sx={{ mt: 2 }}
                          >
                            Create Your First Project
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentProjects.filter(project => project != null).map((project) => (
                      <TableRow 
                        key={project?.id || `project-${Math.random()}`} 
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: `${dashboardTheme.primary}08`,
                            transform: 'scale(1.01)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          borderBottom: `1px solid ${dashboardTheme.primary}10`,
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
                            {project?.title || 'Untitled Project'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                          }}>
                            {project?.abstract?.substring(0, 120) || 'No description available'}
                            {project?.abstract && project.abstract.length > 120 && '...'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={getStatusLabel(project?.status || 'draft')}
                            color={getStatusColor(project?.status || 'draft') as any}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 2,
                              textTransform: 'capitalize',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {project?.academic_year || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                            {project?.semester || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => project && handleViewProject(project)}
                                sx={{
                                  color: dashboardTheme.primary,
                                  backgroundColor: `${dashboardTheme.primary}10`,
                                  '&:hover': {
                                    backgroundColor: `${dashboardTheme.primary}20`,
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                disabled={!project}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {project?.status === 'draft' && (
                              <Tooltip title="Edit Project">
                                <IconButton
                                  size="small"
                                  onClick={() => project && handleEditProject(project)}
                                  sx={{
                                    color: dashboardTheme.accent,
                                    backgroundColor: `${dashboardTheme.accent}10`,
                                    '&:hover': {
                                      backgroundColor: `${dashboardTheme.accent}20`,
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  }}
                                  disabled={!project}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </TabPanel>

          {/* Drafts Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Title</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTabFilteredProjects(1).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No draft projects
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getTabFilteredProjects(1)
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .filter(project => project != null)
                      .map((project) => (
                        <TableRow key={project?.id || `draft-project-${Math.random()}`} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {project?.title || 'Untitled Project'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {project?.abstract?.substring(0, 100) || 'No description available'}
                              {project?.abstract && project.abstract.length > 100 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project?.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project?.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => project && handleViewProject(project)}
                                  color="primary"
                                  disabled={!project}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Project">
                                <IconButton
                                  size="small"
                                  onClick={() => project && handleEditProject(project)}
                                  color="secondary"
                                  disabled={!project}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* In Progress Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: `1px solid ${dashboardTheme.primary}15`,
              }}
            >
              <Table>
                <TableHead sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Last Updated</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTabFilteredProjects(2).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No projects in progress
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Projects that are submitted or under review will appear here
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getTabFilteredProjects(2)
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .filter(project => project != null)
                      .map((project) => (
                        <TableRow 
                          key={project?.id || `in-progress-project-${Math.random()}`} 
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: `${dashboardTheme.primary}08`,
                              transform: 'scale(1.01)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderBottom: `1px solid ${dashboardTheme.primary}10`,
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
                              {project?.title || 'Untitled Project'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4,
                            }}>
                              {project?.abstract?.substring(0, 120) || 'No description available'}
                              {project?.abstract && project.abstract.length > 120 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={getStatusLabel(project?.status || 'submitted')}
                              color={getStatusColor(project?.status || 'submitted') as any}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                borderRadius: 2,
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project?.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                              {project?.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => project && handleViewProject(project)}
                                sx={{
                                  color: dashboardTheme.primary,
                                  backgroundColor: `${dashboardTheme.primary}10`,
                                  '&:hover': {
                                    backgroundColor: `${dashboardTheme.primary}20`,
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                disabled={!project}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>


          {/* Approved Tab */}
          <TabPanel value={tabValue} index={5}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: `1px solid ${dashboardTheme.primary}15`,
              }}
            >
              <Table>
                <TableHead sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Approved Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTabFilteredProjects(5).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No approved projects
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getTabFilteredProjects(5)
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .filter(project => project != null)
                      .map((project) => (
                        <TableRow 
                          key={project?.id || `approved-project-${Math.random()}`} 
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: `${dashboardTheme.primary}08`,
                              transform: 'scale(1.01)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderBottom: `1px solid ${dashboardTheme.primary}10`,
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
                              {project?.title || 'Untitled Project'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4,
                            }}>
                              {project?.abstract?.substring(0, 120) || 'No description available'}
                              {project?.abstract && project.abstract.length > 120 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project?.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                              {project?.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => project && handleViewProject(project)}
                                sx={{
                                  color: dashboardTheme.primary,
                                  backgroundColor: `${dashboardTheme.primary}10`,
                                  '&:hover': {
                                    backgroundColor: `${dashboardTheme.primary}20`,
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                disabled={!project}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Pending Approval Tab */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: `1px solid ${dashboardTheme.primary}15`,
              }}
            >
              <Table>
                <TableHead sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Submitted Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTabFilteredProjects(3).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No projects pending approval
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getTabFilteredProjects(3)
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .filter(project => project != null)
                      .map((project) => (
                        <TableRow 
                          key={project?.id || `pending-approval-project-${Math.random()}`} 
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: `${dashboardTheme.primary}08`,
                              transform: 'scale(1.01)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderBottom: `1px solid ${dashboardTheme.primary}10`,
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
                              {project?.title || 'Untitled Project'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4,
                            }}>
                              {project?.abstract?.substring(0, 120) || 'No description available'}
                              {project?.abstract && project.abstract.length > 120 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project?.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                              {project?.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => project && handleViewProject(project)}
                                sx={{
                                  color: dashboardTheme.primary,
                                  backgroundColor: `${dashboardTheme.primary}10`,
                                  '&:hover': {
                                    backgroundColor: `${dashboardTheme.primary}20`,
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                disabled={!project}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Completed Tab */}
          <TabPanel value={tabValue} index={4}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: `1px solid ${dashboardTheme.primary}15`,
              }}
            >
              <Table>
                <TableHead sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Completed Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTabFilteredProjects(4).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No completed projects
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getTabFilteredProjects(4)
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .filter(project => project != null)
                      .map((project) => (
                        <TableRow 
                          key={project?.id || `completed-project-${Math.random()}`} 
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: `${dashboardTheme.primary}08`,
                              transform: 'scale(1.01)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderBottom: `1px solid ${dashboardTheme.primary}10`,
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
                              {project?.title || 'Untitled Project'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4,
                            }}>
                              {project?.abstract?.substring(0, 120) || 'No description available'}
                              {project?.abstract && project.abstract.length > 120 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project?.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                              {project?.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => project && handleViewProject(project)}
                                sx={{
                                  color: dashboardTheme.primary,
                                  backgroundColor: `${dashboardTheme.primary}10`,
                                  '&:hover': {
                                    backgroundColor: `${dashboardTheme.primary}20`,
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                disabled={!project}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>
      </Container>

      {/* Project Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Project Details
          <IconButton
            onClick={handleCloseDetailDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            ×
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedProject?.title || 'Untitled Project'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProject?.abstract || 'No description available'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedProject?.status || 'draft')}
                    color={getStatusColor(selectedProject?.status || 'draft') as any}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Academic Year
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject?.academic_year || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Semester
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject?.semester || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Program
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject?.program?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject?.department?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject?.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                {selectedProject?.files && selectedProject.files.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Files
                    </Typography>
                    <Stack spacing={1}>
                      {selectedProject.files.map((file, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {file?.original_filename || 'Unknown file'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({file?.size_bytes || 0} bytes)
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentMyProjectsPage;
