import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  Button,
  Pagination,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import { getStatusColor, getStatusLabel } from '../utils/projectHelpers';
import {
  Home as HomeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../contexts/LanguageContext';
import { Project } from '../types';
import { apiService } from '../services/api';
import { TVTCLogo } from '../components/TVTCLogo';
import { getDashboardTheme } from '../config/dashboardThemes';
import { ProjectTabs } from '../components/student/ProjectTabs';
import { ProjectFilters } from '../components/student/ProjectFilters';
import { ProjectDetailDialog } from '../components/student/ProjectDetailDialog';

const StudentMyProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { t } = useLanguage();
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
  const [detailLoading, setDetailLoading] = useState(false);

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
    try {
      const response = await apiService.getProject(project.id);
      setSelectedProject(response.project);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      setSelectedProject(project);
    } finally {
      setDetailLoading(false);
    }
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

        <ProjectFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          academicYearFilter={academicYearFilter}
          academicYears={academicYears}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onAcademicYearChange={setAcademicYearFilter}
          dashboardTheme={dashboardTheme}
        />

        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${dashboardTheme.primary}20`,
          overflow: 'hidden',
        }}>
          <ProjectTabs
            tabValue={tabValue}
            onTabChange={handleTabChange}
            tabFilteredProjects={tabFilteredProjects}
            currentProjects={currentProjects}
            indexOfFirstProject={indexOfFirstProject}
            indexOfLastProject={indexOfLastProject}
            onViewProject={handleViewProject}
            onEditProject={handleEditProject}
            onCreateProject={handleCreateProject}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            getTabFilteredProjects={getTabFilteredProjects}
            dashboardTheme={dashboardTheme}
            t={t}
          />
        </Card>

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
      </Container>

      <ProjectDetailDialog
        open={detailDialogOpen}
        loading={detailLoading}
        project={selectedProject}
        onClose={handleCloseDetailDialog}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        t={t}
      />
    </Box>
  );
};

export default StudentMyProjectsPage;
