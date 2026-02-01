import React, { useState, useEffect } from 'react';
import { colorPalette } from '@/styles/theme/colorPalette';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Home as HomeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { TVTCLogo } from '@/components/TVTCLogo';
import { getDashboardTheme } from '@/config/dashboardThemes';
import ProjectTable from '@/components/shared/ProjectTable';
import { getStatusColor, getStatusLabel } from '@/utils/projectHelpers';

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
  const { t } = useLanguage();
  const dashboardTheme = getDashboardTheme(user?.roles);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [_filteredProjects, setFilteredProjects] = useState<Project[]>([]);
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
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

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

  // Refetch data when navigating back from project creation
  useEffect(() => {
    if (location.state?.refresh) {
      fetchData();
      // Clear the refresh flag
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchData = async () => {
    // Check if user is authenticated
    if (!user || !user.id) {
      setError('You must be logged in to view your projects.');
      setLoading(false);
      setProjects([]);
      return;
    }
    
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
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access forbidden. You may not have permission to view projects.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      }
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

  const handleViewProject = async (project: Project) => {
    setDetailDialogOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await apiService.getProject(project.id);
      setSelectedProject(response.project);
    } catch (error: any) {
      console.error('Failed to fetch project details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load project details';
      setDetailError(errorMessage);
      // Still set the project so user can see basic info
      setSelectedProject(project);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewFullDetails = (project: Project) => {
    navigate(`/dashboard/projects/${project.id}`);
    handleCloseDetailDialog();
  };

  const handleEditProject = (project: Project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleCreateProject = () => {
    navigate('/pr/create');
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedProject(null);
    setDetailError(null);
  };


  const _handleRefresh = () => {
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
      case 0: // All Projects - Only show approved projects
        // Filter to only show approved projects (exclude pending, hidden, null, or undefined)
        filtered = filtered.filter(project => {
          const approvalStatus = project?.admin_approval_status;
          return approvalStatus === 'approved';
        });
        // Only apply additional statusFilter if it's not 'all'
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
        filtered = filtered.filter(project => {
          if (!project) return false;
          return project.admin_approval_status === 'pending';
        });
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
                {t('Create New Project')}
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
          background: `linear-gradient(135deg, ${colorPalette.common.white} 0%, ${colorPalette.surface.elevated} 100%)`,
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
          background: `linear-gradient(135deg, ${colorPalette.common.white} 0%, ${colorPalette.surface.elevated} 100%)`,
          border: `1px solid ${dashboardTheme.primary}20`,
          overflow: 'hidden',
        }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)`,
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
            <ProjectTable
              projects={currentProjects}
              loading={false}
              onView={handleViewProject}
              onEdit={handleEditProject}
              showStatus={true}
              showProgram={false}
              emptyMessage={searchTerm || statusFilter !== 'all' || academicYearFilter !== 'all'
                ? 'No projects found. Try adjusting your filters.'
                : 'You haven\'t created any projects yet.'}
            />
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
            <ProjectTable
              projects={getTabFilteredProjects(1).slice(indexOfFirstProject, indexOfLastProject)}
              loading={false}
              onView={handleViewProject}
              onEdit={handleEditProject}
              showStatus={false}
              showProgram={false}
              emptyMessage="No draft projects found."
            />
          </TabPanel>

          {/* In Progress Tab */}
          <TabPanel value={tabValue} index={2}>
            <ProjectTable
              projects={getTabFilteredProjects(2).slice(indexOfFirstProject, indexOfLastProject)}
              loading={false}
              onView={handleViewProject}
              showStatus={true}
              showProgram={false}
              emptyMessage="No projects in progress. Projects that are submitted or under review will appear here."
            />
          </TabPanel>


          {/* Approved Tab */}
          <TabPanel value={tabValue} index={5}>
            <ProjectTable
              projects={getTabFilteredProjects(5).slice(indexOfFirstProject, indexOfLastProject)}
              loading={false}
              onView={handleViewProject}
              showStatus={false}
              showProgram={false}
              emptyMessage="No approved projects found."
            />
          </TabPanel>

          {/* Pending Approval Tab */}
          <TabPanel value={tabValue} index={3}>
            <ProjectTable
              projects={getTabFilteredProjects(3).slice(indexOfFirstProject, indexOfLastProject)}
              loading={false}
              onView={handleViewProject}
              showStatus={false}
              showProgram={false}
              showApprovalStatus={true}
              emptyMessage="No projects pending approval."
            />
          </TabPanel>

          {/* Completed Tab */}
          <TabPanel value={tabValue} index={4}>
            <ProjectTable
              projects={getTabFilteredProjects(4).slice(indexOfFirstProject, indexOfLastProject)}
              loading={false}
              onView={handleViewProject}
              showStatus={false}
              showProgram={false}
              emptyMessage="No completed projects found."
            />
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
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedProject ? (
            <Box sx={{ pt: 2 }}>
              {detailError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {detailError}
                </Alert>
              )}
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
          ) : (
            <Typography variant="body1" color="text.secondary">
              {t('No project selected')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {selectedProject && (
            <Button 
              onClick={() => handleViewFullDetails(selectedProject)}
              variant="outlined"
              color="primary"
            >
              {t('View Full Details')}
            </Button>
          )}
          <Button onClick={handleCloseDetailDialog}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentMyProjectsPage;
