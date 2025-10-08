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
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  VisibilityOff as HideIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project, Program, Department } from '../types';
import { apiService } from '../services/api';
import ProjectApprovalActions from '../components/ProjectApprovalActions';
import ProjectVisibilityToggle from '../components/ProjectVisibilityToggle';

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

const AdminProjectApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'hidden' | ''>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);

  // Selected project for detailed view
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [tabValue, currentPage, searchTerm, selectedProgram, selectedDepartment, selectedYear, approvalStatus]);

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
      const params = {
        page: currentPage,
        per_page: perPage,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedProgram && { program_id: selectedProgram }),
        ...(selectedDepartment && { department_id: selectedDepartment }),
        ...(selectedYear && { academic_year: selectedYear }),
        ...(approvalStatus && { approval_status: approvalStatus }),
      };

      let response;
      if (tabValue === 0) {
        // Pending approvals tab
        response = await apiService.getPendingApprovals(params);
        setPendingProjects(response.projects || []);
        setTotalPages(response.pagination.last_page);
        setTotalItems(response.pagination.total);
      } else {
        // All projects tab
        response = await apiService.getAdminProjects(params);
        setProjects(response.projects || []);
        setTotalPages(response.pagination.last_page);
        setTotalItems(response.pagination.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedProgram('');
    setSelectedDepartment('');
    setSelectedYear('');
    setApprovalStatus('');
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleProjectActionComplete = () => {
    loadProjects();
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setDetailDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProgram('');
    setSelectedDepartment('');
    setSelectedYear('');
    setApprovalStatus('');
    setCurrentPage(1);
  };

  const getApprovalStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'hidden':
        return <Chip label="Hidden" color="error" size="small" />;
      case 'pending':
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  const currentProjects = tabValue === 0 ? pendingProjects : projects;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Project Approval Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ ml: 2 }}
        >
          Back to Home
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label={`Pending Approvals ${pendingProjects.length > 0 ? `(${pendingProjects.length})` : ''}`} 
          />
          <Tab label="All Projects" />
        </Tabs>
      </Box>

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
                label="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
            </Grid>
            
            {tabValue === 1 && (
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Approval Status</InputLabel>
                  <Select
                    value={approvalStatus}
                    label="Approval Status"
                    onChange={(e) => setApprovalStatus(e.target.value as any)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="hidden">Hidden</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Department"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
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
              />
            </Grid>

            <Grid size={{ xs: 12, md: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<FilterIcon />}
                  size="small"
                >
                  Clear
                </Button>
                <Tooltip title="Refresh">
                  <IconButton onClick={loadProjects} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Creator</TableCell>
                      <TableCell>Program</TableCell>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Status</TableCell>
                      {tabValue === 1 && <TableCell>Approval Status</TableCell>}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(currentProjects || []).map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {project.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.abstract.substring(0, 100)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.creator?.full_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.program?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.academic_year} - {project.semester}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            color={project.status === 'completed' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        {tabValue === 1 && (
                          <TableCell>
                            {getApprovalStatusChip(project.admin_approval_status)}
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewProject(project)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {project.admin_approval_status === 'pending' && (
                              <ProjectApprovalActions
                                project={project}
                                onActionComplete={handleProjectActionComplete}
                              />
                            )}
                            {(project.admin_approval_status === 'approved' || project.admin_approval_status === 'hidden') && (
                              <ProjectVisibilityToggle
                                project={project}
                                onToggleComplete={handleProjectActionComplete}
                                variant="icon"
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
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

              {totalItems === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No projects found matching your criteria.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Project Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedProject.title}</Typography>
                {getApprovalStatusChip(selectedProject.admin_approval_status)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Creator
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedProject.creator?.full_name}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Program
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedProject.program?.name}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Academic Year
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedProject.academic_year} - {selectedProject.semester}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedProject.status}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {(selectedProject.keywords || []).map((keyword, index) => (
                      <Chip key={index} label={keyword} size="small" />
                    ))}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Abstract
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedProject.abstract}
                  </Typography>
                </Grid>

                {selectedProject.admin_approval_status === 'pending' && (
                  <Grid size={{ xs: 12 }}>
                    <ProjectApprovalActions
                      project={selectedProject}
                      onActionComplete={() => {
                        handleProjectActionComplete();
                        setDetailDialogOpen(false);
                      }}
                    />
                  </Grid>
                )}

                {(selectedProject.admin_approval_status === 'approved' || selectedProject.admin_approval_status === 'hidden') && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <ProjectVisibilityToggle
                        project={selectedProject}
                        onToggleComplete={() => {
                          handleProjectActionComplete();
                          setDetailDialogOpen(false);
                        }}
                        variant="button"
                        size="medium"
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminProjectApprovalPage;
