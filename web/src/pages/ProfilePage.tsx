import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Avatar,
  Chip,
  List,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { User, Project } from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Check if user is restricted from creating/editing projects
  const isRestrictedUser = user?.roles?.some(role => role.name === 'admin');
  const isReviewer = user?.roles?.some(role => role.name === 'reviewer');
  
  // Profile editing state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
  });
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUser();
      setUser(response.user);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        email: user.email || '',
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setUploading(true);
      const response = await apiService.updateProfile(editForm);
      setUser(response.user);
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please select an image file',
        severity: 'error',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setSnackbar({
        open: true,
        message: 'File size must be less than 2MB',
        severity: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      const response = await apiService.uploadAvatar(file);
      setUser(response.user);
      setSnackbar({
        open: true,
        message: 'Avatar uploaded successfully',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to upload avatar',
        severity: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      const response = await apiService.deleteAvatar();
      setUser(response.user);
      setSnackbar({
        open: true,
        message: 'Avatar deleted successfully',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Error deleting avatar:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete avatar',
        severity: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const loadUserProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 10,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (yearFilter) {
        params.academic_year = yearFilter;
      }

      const response = await apiService.getMyProjects(params);
      setProjects(response.data || []);
      setTotalPages(response.last_page || 1);
      setTotalProjects(response.total || 0);
    } catch (err) {
      console.error('Error loading user projects:', err);
      setError('Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, yearFilter]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    // Load projects for all users except Admins
    if (!isRestrictedUser) {
      loadUserProjects();
    }
  }, [loadUserProjects, isRestrictedUser]);

  const handleProjectClick = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleYearFilterChange = (event: any) => {
    setYearFilter(event.target.value);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'success';
      case 'under_review': return 'warning';
      case 'submitted': return 'info';
      case 'rejected': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <PersonIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Profile
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <PersonIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* User Profile Information */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: isRestrictedUser ? 12 : 4 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={user?.avatar_url}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                  {user?.avatar_url && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 48,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'error.dark',
                        },
                      }}
                      size="small"
                      onClick={handleDeleteAvatar}
                      disabled={uploading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
                <Typography variant="h5" gutterBottom>
                  {user?.full_name || 'Unknown User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'No email'}
                  </Typography>
                </Box>
                <Chip
                  label={user?.status || 'unknown'}
                  color={user?.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
                {user?.roles && user.roles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Roles:
                    </Typography>
                    {user.roles.map((role) => (
                      <Chip
                        key={role.id}
                        label={role.name}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
                {user?.last_login_at && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last login: {new Date(user.last_login_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfile}
                    size="small"
                  >
                    Edit Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* My Projects Section - Show for all users except Admins */}
          {!isRestrictedUser && (
            <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <WorkIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">
                    My Projects ({totalProjects})
                  </Typography>
                </Box>

                {/* Search and Filters */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status"
                          onChange={handleStatusFilterChange}
                        >
                          <MenuItem value="">All Statuses</MenuItem>
                          <MenuItem value="draft">Draft</MenuItem>
                          <MenuItem value="submitted">Submitted</MenuItem>
                          <MenuItem value="under_review">Under Review</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Academic Year</InputLabel>
                        <Select
                          value={yearFilter}
                          label="Academic Year"
                          onChange={handleYearFilterChange}
                        >
                          <MenuItem value="">All Years</MenuItem>
                          <MenuItem value="2023-2024">2023-2024</MenuItem>
                          <MenuItem value="2024-2025">2024-2025</MenuItem>
                          <MenuItem value="2025-2026">2025-2026</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* Projects List */}
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {projectsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : projects.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No projects found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {searchTerm || statusFilter || yearFilter
                        ? 'Try adjusting your search criteria'
                        : 'You haven\'t created any projects yet'}
                    </Typography>
                    {!searchTerm && !statusFilter && !yearFilter && !isReviewer && (
                      <Button
                        variant="contained"
                        onClick={() => navigate('/create-project')}
                      >
                        Create Your First Project
                      </Button>
                    )}
                  </Paper>
                ) : (
                  <>
                    <List>
                      {projects.map((project, index) => (
                        <React.Fragment key={project.id}>
                          <ListItemButton
                            onClick={() => handleProjectClick(project.id)}
                            sx={{
                              borderRadius: 1,
                              mb: 1,
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    {project.title}
                                  </Typography>
                                  <Chip
                                    label={getStatusLabel(project.status)}
                                    color={getStatusColor(project.status) as any}
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      mb: 1,
                                    }}
                                  >
                                    {project.abstract}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {project.academic_year} - {project.semester}
                                      </Typography>
                                    </Box>
                                    {project.program && (
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <SchoolIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          {project.program.name}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItemButton>
                          {index < projects.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>

                    {/* Pagination */}
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
                  </>
                )}
              </CardContent>
            </Card>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveProfile} 
            variant="contained" 
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};