import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Badge,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountCircle,
  ExitToApp,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Project } from '../types';
import { apiService } from '../services/api';
import { ProjectSearch } from '../components/ProjectSearch';
import { NotificationCenter } from '../components/NotificationCenter';
import { TVTCLogo } from '../components/TVTCLogo';
import { useNotifications } from '../hooks/useNotifications';

interface SearchFilters {
  search: string;
  status: string;
  program_id: string;
  department_id: string;
  academic_year: string;
  semester: string;
  is_public: boolean | null;
  sort_by: string;
  sort_order: string;
}

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    has_more_pages: false,
  });
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { unreadCount: unreadNotifications } = useNotifications();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (filters?: SearchFilters, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }
      params.append('page', page.toString());
      
      const response = await apiService.getProjects(params.toString());
      
      if (Array.isArray(response)) {
        // Simple array response
        setProjects(response);
        setPagination({
          current_page: 1,
          per_page: response.length,
          total: response.length,
          last_page: 1,
          has_more_pages: false,
        });
      } else {
        // Paginated response
        setProjects(response.data || []);
        setPagination({
          current_page: response.current_page || 1,
          per_page: response.per_page || 10,
          total: response.total || 0,
          last_page: response.last_page || 1,
          has_more_pages: response.has_more_pages || false,
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      setError(error.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    setSearching(true);
    fetchProjects(filters, 1);
  };

  const handleClearSearch = () => {
    setCurrentFilters(null);
    setSearching(false);
    fetchProjects();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    if (currentFilters) {
      fetchProjects(currentFilters, page);
    } else {
      fetchProjects(undefined, page);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (roles: any[]) => {
    if (!roles || roles.length === 0) return 'User';
    return roles.map(role => role.name).join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'submitted': return 'info';
      case 'under_review': return 'primary';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fahras Dashboard
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/create')}
          >
            New Project
          </Button>
          <IconButton
            size="large"
            edge="end"
            aria-label="notifications"
            onClick={() => setNotificationOpen(true)}
            color="inherit"
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfileClick}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.full_name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Role: {getRoleDisplayName(user?.roles || [])}
          </Typography>
        </Box>

        {/* Search Component */}
        <ProjectSearch
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
        />

        {/* Results Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            {searching ? 'Search Results' : 'My Projects'}
            {pagination.total > 0 && (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({pagination.total} {pagination.total === 1 ? 'project' : 'projects'})
              </Typography>
            )}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => navigate('/analytics')}
            sx={{ mr: 1 }}
          >
            Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={() => navigate('/evaluations')}
          >
            Evaluations
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                {searching ? 'No projects found' : 'No projects yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searching 
                  ? 'Try adjusting your search criteria'
                  : 'Start by creating your first graduation project'
                }
              </Typography>
              {!searching && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/projects/create')}
                >
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Projects Grid */}
            <Grid container spacing={3}>
              {(projects || []).map((project) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <SchoolIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                        <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                          {project.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.abstract.substring(0, 100)}...
                      </Typography>
                      
                      {/* Project Tags */}
                      <Box sx={{ mb: 2 }}>
                        {project.keywords && project.keywords.slice(0, 3).map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {project.academic_year} • {project.semester}
                          </Typography>
                        </Box>
                        <Chip
                          label={project.status.replace('_', ' ')}
                          color={getStatusColor(project.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                          icon={project.status === 'approved' ? <CheckCircleIcon /> : 
                                project.status === 'submitted' ? <PendingIcon /> : 
                                project.status === 'rejected' ? <CancelIcon /> : <VisibilityIcon />}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {project.creator?.full_name || 'Unknown Student'}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`); }}>
                            <VisibilityIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.last_page}
                  page={pagination.current_page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Notification Center */}
      <NotificationCenter
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </Box>
  );
};
