'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Home as HomeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';
import { getErrorMessage } from '@/utils/errorHandling';
import type { Project } from '@/types';
import { apiService } from '@/lib/api';
import { TVTCLogo } from '@/components/shared/TVTCLogo';
import { getDashboardTheme } from '@/config/dashboardThemes';
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

export default function StudentMyProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const dashboardTheme = getDashboardTheme();

  const [projects, setProjects] = useState<Project[]>([]);
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

  const fetchData = useCallback(async () => {
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
        per_page: 100,
      });

      let projectsData: Project[] = [];

      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          projectsData = response.data;
        } else if (Array.isArray(response)) {
          projectsData = response;
        }
      }

      const validProjects = projectsData.filter((p) => p != null && p !== undefined);
      setProjects(validProjects);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load data'));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !(user.roles || []).some((role) => role.name === 'student')) {
      router.push('/dashboard');
    } else {
      fetchData();
    }
  }, [user, router, fetchData]);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      switch (section) {
        case 'in-progress':
          setTabValue(2);
          break;
        case 'completed':
          setTabValue(4);
          break;
        case 'pending-approval':
          setTabValue(3);
          break;
        default:
          setTabValue(0);
      }
    }
  }, [searchParams]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1);
  };

  const handleViewProject = async (project: Project) => {
    setDetailDialogOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await apiService.getProject(String(project.id));
      setSelectedProject(response.project);
    } catch (err: unknown) {
      setDetailError(getErrorMessage(err, 'Failed to load project details'));
      setSelectedProject(project);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewFullDetails = (project: Project) => {
    router.push(`/pr/${project.slug || project.id}`);
    handleCloseDetailDialog();
  };

  const handleCreateProject = () => {
    router.push('/pr/create');
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedProject(null);
    setDetailError(null);
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const academicYears = Array.from(
    new Set((projects || []).map((p) => p?.academic_year).filter(Boolean)),
  );

  const getTabFilteredProjects = (tabIndex: number): Project[] => {
    let filtered = [...(projects || [])].filter((project) => project != null);

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project?.abstract?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (academicYearFilter !== 'all') {
      filtered = filtered.filter((project) => project?.academic_year === academicYearFilter);
    }

    switch (tabIndex) {
      case 0:
        filtered = filtered.filter((project) => {
          const approvalStatus = project?.admin_approval_status;
          return approvalStatus === 'approved';
        });
        if (statusFilter !== 'all') {
          filtered = filtered.filter((project) => project?.status === statusFilter);
        }
        break;
      case 1:
        filtered = filtered.filter((project) => project?.status === 'draft');
        break;
      case 2:
        filtered = filtered.filter(
          (project) =>
            project && (project.status === 'submitted' || project.status === 'under_review'),
        );
        break;
      case 3:
        filtered = filtered.filter((project) => {
          if (!project) return false;
          return project.admin_approval_status === 'pending';
        });
        break;
      case 4:
        filtered = filtered.filter((project) => project && project.status === 'completed');
        break;
      case 5:
        filtered = filtered.filter((project) => project?.status === 'approved');
        break;
      default:
        break;
    }

    return filtered;
  };

  const tabFilteredProjects = getTabFilteredProjects(tabValue);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = tabFilteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(tabFilteredProjects.length / projectsPerPage);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
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
    <Box sx={{ minHeight: '100vh', background: dashboardTheme.background }}>
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
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <TVTCLogo size="medium" />
              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  fontWeight="800"
                  sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'white' }}
                >
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

        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: `linear-gradient(135deg, ${colorPalette.common.white} 0%, ${colorPalette.surface.elevated} 100%)`,
            border: `1px solid ${dashboardTheme.primary}20`,
          }}
        >
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
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: dashboardTheme.primary },
                      '&.Mui-focused fieldset': { borderColor: dashboardTheme.primary },
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
                    sx={{ borderRadius: 2 }}
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
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Years</MenuItem>
                    {(academicYears || []).map((year) => (
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

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: `linear-gradient(135deg, ${colorPalette.common.white} 0%, ${colorPalette.surface.elevated} 100%)`,
            border: `1px solid ${dashboardTheme.primary}20`,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)`,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  minHeight: 60,
                  '&.Mui-selected': { color: dashboardTheme.primary },
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

          {[0, 1, 2, 3, 4, 5].map((tabIndex) => (
            <TabPanel value={tabValue} index={tabIndex} key={tabIndex}>
              {(tabIndex === 0 ? currentProjects : getTabFilteredProjects(tabIndex).slice(indexOfFirstProject, indexOfLastProject)).length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(tabIndex === 0
                    ? currentProjects
                    : getTabFilteredProjects(tabIndex).slice(indexOfFirstProject, indexOfLastProject)
                  ).map((project) => (
                    <Card
                      key={project.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => handleViewProject(project)}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {project?.title || 'Untitled Project'}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {(project?.abstract || 'No description available').substring(0, 120)}
                              {(project?.abstract || '').length > 120 ? '...' : ''}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={getStatusLabel(project?.status || 'draft')}
                                color={getStatusColor(project?.status || 'draft')}
                                size="small"
                              />
                              {project?.academic_year && (
                                <Typography variant="caption" color="text.secondary">
                                  {project.academic_year}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || statusFilter !== 'all' || academicYearFilter !== 'all'
                      ? 'No projects found. Try adjusting your filters.'
                      : "No projects in this category."}
                  </Typography>
                </Box>
              )}

              {tabIndex === 0 && totalPages > 1 && (
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
          ))}
        </Card>
      </Container>

      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Project Details
          <IconButton
            onClick={handleCloseDetailDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            x
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
                    color={getStatusColor(selectedProject?.status || 'draft')}
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
                  <Typography variant="body1">{selectedProject?.semester || 'N/A'}</Typography>
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
                    {selectedProject?.created_at
                      ? new Date(selectedProject.created_at).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
                {(selectedProject?.files || []).length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Files
                    </Typography>
                    <Stack spacing={1}>
                      {(selectedProject.files || []).map((file, index) => (
                        <Box
                          key={index}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
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
          <Button onClick={handleCloseDetailDialog}>{t('Close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
