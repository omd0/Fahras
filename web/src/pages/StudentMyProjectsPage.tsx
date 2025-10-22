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
import { useNavigate } from 'react-router-dom';
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

      setProjects(response.data || response || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.abstract?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Academic year filter
    if (academicYearFilter !== 'all') {
      filtered = filtered.filter(project => project.academic_year === academicYearFilter);
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
  const academicYears = Array.from(new Set(projects.map(p => p.academic_year).filter(Boolean)));

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

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
      {/* Header */}
      <Box
        sx={{
          background: dashboardTheme.appBarBackground,
          color: 'white',
          py: 3,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TVTCLogo size="medium" />
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  My Projects
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                  Manage your submitted projects
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                sx={{ 
                  backgroundColor: dashboardTheme.primary,
                  '&:hover': { backgroundColor: dashboardTheme.accent }
                }}
              >
                Create Project
              </Button>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Go to Dashboard">
                <IconButton onClick={handleGoHome} sx={{ color: 'white' }}>
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

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`All Projects (${filteredProjects.length})`} />
              <Tab label={`Drafts (${filteredProjects.filter(p => p.status === 'draft').length})`} />
              <Tab label={`Submitted (${filteredProjects.filter(p => p.status === 'submitted').length})`} />
              <Tab label={`Under Review (${filteredProjects.filter(p => p.status === 'under_review').length})`} />
              <Tab label={`Approved (${filteredProjects.filter(p => p.status === 'approved').length})`} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Actions</TableCell>
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
                    currentProjects.map((project) => (
                      <TableRow key={project.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {project.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {project.abstract?.substring(0, 100)}
                            {project.abstract && project.abstract.length > 100 && '...'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(project.status)}
                            color={getStatusColor(project.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.academic_year || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.semester || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewProject(project)}
                                color="primary"
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {project.status === 'draft' && (
                              <Tooltip title="Edit Project">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditProject(project)}
                                  color="secondary"
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
                  {filteredProjects.filter(p => p.status === 'draft').length === 0 ? (
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
                    filteredProjects
                      .filter(p => p.status === 'draft')
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .map((project) => (
                        <TableRow key={project.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {project.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {project.abstract?.substring(0, 100)}
                              {project.abstract && project.abstract.length > 100 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewProject(project)}
                                  color="primary"
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Project">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditProject(project)}
                                  color="secondary"
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

          {/* Submitted Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Title</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.filter(p => p.status === 'submitted').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No submitted projects
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects
                      .filter(p => p.status === 'submitted')
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .map((project) => (
                        <TableRow key={project.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {project.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {project.abstract?.substring(0, 100)}
                              {project.abstract && project.abstract.length > 100 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewProject(project)}
                                color="primary"
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

          {/* Under Review Tab */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Title</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.filter(p => p.status === 'under_review').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No projects under review
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects
                      .filter(p => p.status === 'under_review')
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .map((project) => (
                        <TableRow key={project.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {project.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {project.abstract?.substring(0, 100)}
                              {project.abstract && project.abstract.length > 100 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewProject(project)}
                                color="primary"
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
          <TabPanel value={tabValue} index={4}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Title</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Approved Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.filter(p => p.status === 'approved').length === 0 ? (
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
                    filteredProjects
                      .filter(p => p.status === 'approved')
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .map((project) => (
                        <TableRow key={project.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {project.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {project.abstract?.substring(0, 100)}
                              {project.abstract && project.abstract.length > 100 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.academic_year || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.semester || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewProject(project)}
                                color="primary"
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
                    {selectedProject.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProject.abstract}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedProject.status)}
                    color={getStatusColor(selectedProject.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Academic Year
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.academic_year || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Semester
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.semester || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Program
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.program?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.department?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                {selectedProject.files && selectedProject.files.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Files
                    </Typography>
                    <Stack spacing={1}>
                      {selectedProject.files.map((file, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {file.original_filename}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({file.size_bytes} bytes)
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
