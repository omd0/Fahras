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
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Fade,
  Slide,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  RateReview as RateReviewIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project, Program, Department } from '../types';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getDashboardTheme } from '../config/dashboardThemes';
import { TVTCLogo } from '../components/TVTCLogo';

const FacultyPendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const dashboardTheme = getDashboardTheme(user?.roles);

  // Debug logging
  console.log('FacultyPendingApprovalPage: Component rendering', { user, dashboardTheme });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  useEffect(() => {
    console.log('FacultyPendingApprovalPage: loadInitialData effect triggered');
    loadInitialData();
  }, []);

  useEffect(() => {
    console.log('FacultyPendingApprovalPage: loadPendingProjects effect triggered', { currentPage, searchTerm, selectedProgram, selectedDepartment, selectedYear, statusFilter, userId: user?.id });
    loadPendingProjects();
  }, [currentPage, searchTerm, selectedProgram, selectedDepartment, selectedYear, statusFilter, user?.id]);

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

  const loadPendingProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all projects and filter for faculty's projects that are under review or pending
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
      
      // Filter for projects that are under review, pending approval, or submitted
      const pendingProjects = projectsData.filter((project: Project) => 
        ['under_review', 'submitted', 'pending'].includes(project.status) ||
        project.admin_approval_status === 'pending'
      );

      setProjects(pendingProjects);
      setTotalPages(Array.isArray(response) ? 1 : response.last_page || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pending projects');
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

  // Debug: Log current state
  console.log('FacultyPendingApprovalPage: Render state', { 
    loading, 
    error, 
    projects: projects.length, 
    user: user?.id 
  });

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', background: dashboardTheme.background }}>
      <AppBar 
        position="static"
        sx={{ 
          background: dashboardTheme.appBarGradient,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
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
          <RateReviewIcon sx={{ mr: 2, fontSize: 28 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
              Pending Approval Projects
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Projects awaiting your review and approval
            </Typography>
          </Box>
          <Badge 
            badgeContent={projects.length} 
            color="warning"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                fontWeight: 600,
                minWidth: '20px',
                height: '20px',
              }
            }}
          >
            <Chip 
              label="Pending Review" 
              color="warning" 
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
          </Badge>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  background: dashboardTheme.appBarGradient,
                  mr: 2,
                  width: 56,
                  height: 56,
                }}
              >
                <RateReviewIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: dashboardTheme.textPrimary }}>
                  Pending Approval Projects
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  Review and approve projects that are awaiting your attention
                </Typography>
              </Box>
            </Box>
            
            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ 
                  background: `linear-gradient(135deg, ${dashboardTheme.primary}20, ${dashboardTheme.secondary}20)`,
                  border: `1px solid ${dashboardTheme.primary}30`,
                  borderRadius: 3,
                }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PendingIcon sx={{ color: dashboardTheme.primary, mr: 2, fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: dashboardTheme.primary }}>
                          {projects.filter(p => p.admin_approval_status === 'pending').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Awaiting Approval
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ 
                  background: `linear-gradient(135deg, ${dashboardTheme.secondary}20, ${dashboardTheme.accent}20)`,
                  border: `1px solid ${dashboardTheme.secondary}30`,
                  borderRadius: 3,
                }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ color: dashboardTheme.secondary, mr: 2, fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: dashboardTheme.secondary }}>
                          {projects.filter(p => p.status === 'under_review').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Under Review
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ 
                  background: `linear-gradient(135deg, ${dashboardTheme.accent}20, ${dashboardTheme.primary}20)`,
                  border: `1px solid ${dashboardTheme.accent}30`,
                  borderRadius: 3,
                }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: dashboardTheme.accent, mr: 2, fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: dashboardTheme.accent }}>
                          {projects.filter(p => p.status === 'submitted').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Recently Submitted
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {error && (
          <Slide direction="down" in timeout={400}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {error}
            </Alert>
          </Slide>
        )}

        {/* Enhanced Filters */}
        <Slide direction="up" in timeout={800}>
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
                <FilterIcon sx={{ color: dashboardTheme.primary, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                  Search & Filter
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
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="under_review">Under Review</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
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
                        onClick={loadPendingProjects} 
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
        </Slide>

        {/* Enhanced Projects Table */}
        <Slide direction="up" in timeout={1000}>
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
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ 
                        background: `linear-gradient(135deg, ${dashboardTheme.primary}10, ${dashboardTheme.secondary}10)`,
                      }}>
                        <TableRow>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: dashboardTheme.textPrimary,
                            borderBottom: `2px solid ${dashboardTheme.primary}30`,
                          }}>
                            Project Details
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: dashboardTheme.textPrimary,
                            borderBottom: `2px solid ${dashboardTheme.primary}30`,
                          }}>
                            Program
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: dashboardTheme.textPrimary,
                            borderBottom: `2px solid ${dashboardTheme.primary}30`,
                          }}>
                            Academic Year
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: dashboardTheme.textPrimary,
                            borderBottom: `2px solid ${dashboardTheme.primary}30`,
                          }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: dashboardTheme.textPrimary,
                            borderBottom: `2px solid ${dashboardTheme.primary}30`,
                          }}>
                            Approval Status
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: dashboardTheme.textPrimary,
                            borderBottom: `2px solid ${dashboardTheme.primary}30`,
                          }}>
                            Created
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: dashboardTheme.textPrimary,
                            borderBottom: `2px solid ${dashboardTheme.primary}30`,
                          }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(projects || []).map((project, index) => (
                          <Fade in timeout={600 + (index * 100)} key={project.id}>
                            <TableRow 
                              sx={{ 
                                '&:hover': {
                                  backgroundColor: `${dashboardTheme.primary}05`,
                                  transform: 'scale(1.01)',
                                },
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                              }}
                              onClick={() => navigate(`/projects/${project.id}`)}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                  <Avatar
                                    sx={{
                                      background: dashboardTheme.appBarGradient,
                                      width: 40,
                                      height: 40,
                                      mt: 0.5,
                                    }}
                                  >
                                    <SchoolIcon sx={{ fontSize: 20 }} />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {project.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                      {project.abstract.substring(0, 80)}...
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {project.program?.name || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    {project.academic_year} • {project.semester}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={project.status.replace('_', ' ')}
                                  color={getStatusColor(project.status) as any}
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    borderRadius: 2,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {getApprovalStatusChip(project.admin_approval_status)}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(project.created_at).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/projects/${project.id}`);
                                      }}
                                      sx={{
                                        color: dashboardTheme.primary,
                                        '&:hover': {
                                          backgroundColor: `${dashboardTheme.primary}10`,
                                          transform: 'scale(1.1)',
                                        },
                                        transition: 'all 0.3s ease',
                                      }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

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

                  {projects.length === 0 && !loading && (
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
                        <RateReviewIcon sx={{ fontSize: 40, color: dashboardTheme.primary }} />
                      </Avatar>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                        No Pending Projects
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                        You don't have any projects awaiting approval at the moment. All your projects have been reviewed or are in progress.
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
        </Slide>
      </Container>
    </Box>
  );
};

export default FacultyPendingApprovalPage;
