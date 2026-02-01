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
import { getStatusColor, getStatusLabel } from '@/utils/projectHelpers';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { Project, Program, Department } from '@/types';
import { getErrorMessage } from '@/utils/errorHandling';
import { apiService } from '@/lib/api';
import { TVTCLogo } from '@/components/TVTCLogo';
import { getDashboardTheme } from '@/config/dashboardThemes';
import { useLanguage } from '@/providers/LanguageContext';

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

const FacultyPendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const dashboardTheme = getDashboardTheme(user?.roles);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect non-faculty users
    if (user && !user.roles?.some(role => role.name === 'faculty')) {
      navigate('/dashboard');
    } else {
      fetchData();
    }
  }, [user, navigate]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, statusFilter, programFilter, departmentFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
       const [projectsResponse, programsResponse, departmentsResponse] = await Promise.all([
         apiService.getPendingApprovals(),
         apiService.getPrograms(),
         apiService.getDepartments(),
       ]);

       setProjects(projectsResponse.projects || projectsResponse || []);
       setPrograms(programsResponse || []);
       setDepartments(departmentsResponse || []);
      setError(null);
     } catch (err: unknown) {
       console.error('Failed to fetch data:', err);
       setError(getErrorMessage(err, 'Failed to load data'));
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
         project.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         project.creator?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
       );
     }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Program filter
    if (programFilter !== 'all') {
      filtered = filtered.filter(project => project.program_id?.toString() === programFilter);
    }

     // Department filter
     if (departmentFilter !== 'all') {
       filtered = filtered.filter(project => project.department?.id?.toString() === departmentFilter);
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

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedProject(null);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

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
           color: dashboardTheme.textPrimary,
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
                   Faculty Pending Approvals
                 </Typography>
                 <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                   Manage student project approvals
                 </Typography>
               </Box>
             </Box>
             <Stack direction="row" spacing={2}>
               <Tooltip title="Refresh">
                 <IconButton onClick={handleRefresh} sx={{ color: dashboardTheme.textPrimary }}>
                   <RefreshIcon />
                 </IconButton>
               </Tooltip>
               <Tooltip title="Go to Dashboard">
                 <IconButton onClick={handleGoHome} sx={{ color: dashboardTheme.textPrimary }}>
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
              <Grid size={{ xs: 12, md: 3 }}>
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
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="submitted">Pending Review</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Program</InputLabel>
                  <Select
                    value={programFilter}
                    label="Program"
                    onChange={(e) => setProgramFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Programs</MenuItem>
                    {(programs || []).map((program) => (
                      <MenuItem key={program.id} value={program.id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {(departments || []).map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
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
              <Tab label={`Pending Review (${filteredProjects.filter(p => p.status === 'submitted').length})`} />
              <Tab label={`Under Review (${filteredProjects.filter(p => p.status === 'under_review').length})`} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Title</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Program</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No projects found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== 'all' || programFilter !== 'all' || departmentFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'No pending projects at the moment'}
                          </Typography>
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
                           <Typography variant="body2">
                             {project.creator?.full_name || 'Unknown'}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2">
                             {project.program?.name || 'N/A'}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2">
                             {project.department?.name || 'N/A'}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Chip
                             label={getStatusLabel(project.status)}
                             color={getStatusColor(project.status)}
                             size="small"
                           />
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2">
                             {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Tooltip title={t('View Details')}>
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

           <TabPanel value={tabValue} index={1}>
             <TableContainer component={Paper}>
               <Table>
                 <TableHead>
                   <TableRow>
                     <TableCell>Project Title</TableCell>
                     <TableCell>Student</TableCell>
                     <TableCell>Program</TableCell>
                     <TableCell>Department</TableCell>
                     <TableCell>Submitted Date</TableCell>
                     <TableCell>Actions</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {filteredProjects.filter(p => p.status === 'submitted').length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={6} align="center">
                         <Box sx={{ py: 4, textAlign: 'center' }}>
                           <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                           <Typography variant="h6" color="text.secondary">
                             No pending projects
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
                               {project.creator?.full_name || 'Unknown'}
                             </Typography>
                           </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.program?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.department?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={t('View Details')}>
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

          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Title</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Program</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.filter(p => p.status === 'under_review').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
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
                               {project.creator?.full_name || 'Unknown'}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2">
                               {project.program?.name || 'N/A'}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2">
                               {project.department?.name || 'N/A'}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2">
                               {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Tooltip title={t('View Details')}>
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
                     Student
                   </Typography>
                   <Typography variant="body1">
                     {selectedProject.creator?.full_name || 'Unknown'}
                   </Typography>
                 </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedProject.status)}
                    color={getStatusColor(selectedProject.status)}
                    size="small"
                  />
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
                    Submitted Date
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

export default FacultyPendingApprovalPage;
