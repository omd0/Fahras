import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Label as LabelIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Project } from '../types';
import { apiService } from '../services/api';
import { CommentSection } from '../components/CommentSection';
import { RatingSection } from '../components/RatingSection';
import ProjectVisibilityToggle from '../components/ProjectVisibilityToggle';
import { StatusSelector } from '../components/StatusSelector';
import { getDashboardTheme } from '../config/dashboardThemes';
import { ProjectExportDialog } from '../components/ProjectExportDialog';

export const ProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const dashboardTheme = getDashboardTheme(user?.roles);

  const handleBackClick = () => {
    // Go back to the previous page or to dashboard if no history
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
    }
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      console.log('Fetching project:', projectId);
      const response = await apiService.getProject(projectId);
      console.log('Project response:', response);
      setProject(response.project);
      
      // Debug: Log files data to console for verification
      if (response.project.files) {
        console.log('Project files loaded:', response.project.files);
        console.log('Number of files:', response.project.files.length);
        response.project.files.forEach((file, index) => {
          console.log(`File ${index + 1}:`, {
            id: file.id,
            original_filename: file.original_filename,
            storage_url: file.storage_url,
            size_bytes: file.size_bytes
          });
        });
      } else {
        console.log('No files found for project');
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      setError(error.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setDeleting(true);
    try {
      await apiService.deleteProject(project.id);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;
    
    await apiService.updateProject(project.id, { status: newStatus as any });
    // Refresh project data
    await fetchProject(project.id);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LEAD': return 'primary';
      case 'MEMBER': return 'secondary';
      case 'MAIN': return 'success';
      case 'CO_ADVISOR': return 'info';
      case 'REVIEWER': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Project not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  // Check if project is hidden and user is not admin or project owner
  if (project.admin_approval_status === 'hidden' && 
      !user?.roles?.some(role => role.name === 'admin') && 
      project.created_by_user_id !== user?.id) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          This project is not available for viewing.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const canEdit = user?.id === project.created_by_user_id && !user?.roles?.some(role => role.name === 'reviewer');
  const canDelete = user?.id === project.created_by_user_id && !user?.roles?.some(role => role.name === 'reviewer');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static"
        sx={{ 
          background: dashboardTheme.appBarGradient,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackClick}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {project.title}
          </Typography>
          {canEdit && (
            <Button
              color="inherit"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/projects/${project.id}/edit`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          <Button
            color="inherit"
            startIcon={<DescriptionIcon />}
            onClick={() => setExportDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          {canDelete && (
            <Button
              color="inherit"
              startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
              onClick={handleDelete}
              disabled={deleting}
            >
              Delete
            </Button>
          )}
          {/* Admin visibility controls */}
          {user?.roles?.some(role => role.name === 'admin') && (
            <ProjectVisibilityToggle
              project={project}
              onToggleComplete={() => fetchProject(project.id)}
              variant="button"
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Main Project Information */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* Header with gradient background */}
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    color: 'white',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="h4" fontWeight="700" sx={{ mb: 1, lineHeight: 1.2 }}>
                        {project.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={project.status.replace('_', ' ')}
                          color={getStatusColor(project.status)}
                          variant="filled"
                          onClick={canEdit ? () => setStatusDialogOpen(true) : undefined}
                          sx={{ 
                            cursor: canEdit ? 'pointer' : 'default',
                            fontWeight: 600,
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': canEdit ? {
                              backgroundColor: 'rgba(255,255,255,0.3)',
                              boxShadow: 1,
                            } : {}
                          }}
                        />
                        {/* Show approval status based on user role */}
                        {project.admin_approval_status && (
                          (() => {
                            // Admin: show all statuses
                            if (user?.roles?.some(role => role.name === 'admin')) {
                              return (
                                <Chip
                                  label={project.admin_approval_status === 'pending' ? 'Pending Approval' : 
                                         project.admin_approval_status === 'approved' ? 'Approved' : 'Hidden'}
                                  color={project.admin_approval_status === 'approved' ? 'success' : 
                                         project.admin_approval_status === 'hidden' ? 'error' : 'warning'}
                                  variant="filled"
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              );
                            }
                            // Project owner: show status for their own projects
                            else if (project.created_by_user_id === user?.id) {
                              return (
                                <Chip
                                  label={project.admin_approval_status === 'pending' ? 'Pending Approval' : 
                                         project.admin_approval_status === 'approved' ? 'Approved' : 'Hidden'}
                                  color={project.admin_approval_status === 'approved' ? 'success' : 
                                         project.admin_approval_status === 'hidden' ? 'error' : 'warning'}
                                  variant="filled"
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              );
                            }
                            // Reviewer and other users: don't show approval status
                            return null;
                          })()
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                  {/* Project Abstract */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      border: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #059669 100%)',
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'text.primary' }}>
                      Project Abstract
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.primary' }}>
                      {project.abstract}
                    </Typography>
                  </Paper>

                  {/* Admin Notes */}
                  {project.admin_notes && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        mb: 3, 
                        p: 3, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        border: '1px solid',
                        borderColor: 'warning.light',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                        }
                      }}
                    >
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'text.primary' }}>
                        Admin Notes
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.6, color: 'text.primary' }}>
                        {project.admin_notes}
                      </Typography>
                      {project.approver && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontWeight: 500 }}>
                          — {project.approver.full_name} on {new Date(project.approved_at || '').toLocaleDateString()}
                        </Typography>
                      )}
                    </Paper>
                  )}

                  {/* Keywords */}
                  {project.keywords && project.keywords.length > 0 && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        mb: 3, 
                        p: 3, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        border: '1px solid',
                        borderColor: 'primary.light',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                        }
                      }}
                    >
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'text.primary' }}>
                        Keywords
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(project.keywords || []).map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ 
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  )}

                  {/* Academic Information */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      border: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #059669 100%)',
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: 'text.primary' }}>
                      Academic Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                            Academic Year
                          </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 4, fontWeight: 500 }}>
                          {project.academic_year}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SchoolIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                            Semester
                          </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 4, fontWeight: 500, textTransform: 'capitalize' }}>
                          {project.semester}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </CardContent>
            </Card>

            {/* Files Section */}
            <Card 
              elevation={0}
              sx={{ 
                mt: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* Header with gradient background */}
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: 'white',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <FileDownloadIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                        Project Files
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {project.files?.length || 0} {project.files?.length !== 1 ? 'files' : 'file'} available
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                  {project.files && project.files.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {(project.files || []).map((file, index) => (
                        <Paper 
                          key={file.id}
                          elevation={0}
                          sx={{ 
                            mb: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          <ListItem sx={{ p: 2 }}>
                            <ListItemIcon>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1.5,
                                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                  color: 'white',
                                }}
                              >
                                <FileDownloadIcon sx={{ fontSize: 20 }} />
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  {file.original_filename}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                  <Chip 
                                    label={`${(file.size_bytes / 1024).toFixed(1)} KB`} 
                                    size="small" 
                                    variant="filled"
                                    sx={{ 
                                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                      color: 'text.secondary',
                                      fontWeight: 500,
                                    }}
                                  />
                                  <Chip 
                                    label={new Date(file.uploaded_at).toLocaleDateString()} 
                                    size="small" 
                                    variant="filled"
                                    sx={{ 
                                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                      color: 'text.secondary',
                                      fontWeight: 500,
                                    }}
                                  />
                                  <Chip 
                                    label={file.mime_type} 
                                    size="small" 
                                    variant="filled"
                                    sx={{ 
                                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                      color: 'text.secondary',
                                      fontWeight: 500,
                                    }}
                                  />
                                  {file.is_public && (
                                    <Chip 
                                      label="Public" 
                                      size="small" 
                                      color="success" 
                                      variant="filled"
                                      sx={{ 
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                            />
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<FileDownloadIcon />}
                              onClick={async () => {
                                try {
                                  // Use the API service to download the file
                                  const blob = await apiService.downloadFile(file.id);
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = file.original_filename;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Error downloading file:', error);
                                  // Fallback to opening the public URL or storage URL
                                  window.open(file.public_url || file.storage_url, '_blank');
                                }
                              }}
                              sx={{ 
                                minWidth: 100,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                borderRadius: 1.5,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              Download
                            </Button>
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        border: '2px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          color: 'white',
                          width: 64,
                          height: 64,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <FileDownloadIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                        No files uploaded yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Files uploaded during project creation will appear here
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Program Information */}
            <Card 
              elevation={0}
              sx={{ 
                mb: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    color: 'white',
                    p: 2.5,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '60px',
                      height: '60px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      transform: 'translate(20px, -20px)',
                    }
                  }}
                >
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                    Program Information
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  {project.program ? (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                          Program
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {project.program.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                          Degree Level
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {project.program.degree_level}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No program information available
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Project Members */}
            <Card 
              elevation={0}
              sx={{ 
                mb: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: 'white',
                    p: 2.5,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '60px',
                      height: '60px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      transform: 'translate(20px, -20px)',
                    }
                  }}
                >
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                    Project Members
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {project.members?.length || 0} {project.members?.length !== 1 ? 'members' : 'member'}
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  {project.members && project.members.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {(project.members || []).map((member) => (
                        <Paper 
                          key={member.id}
                          elevation={0}
                          sx={{ 
                            mb: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          <ListItem sx={{ p: 2 }}>
                            <ListItemIcon>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40,
                                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                }}
                              >
                                {member.full_name.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                  {member.full_name}
                                </Typography>
                              }
                              secondary={
                                <Chip
                                  label={member.pivot.role_in_project}
                                  size="small"
                                  color={getRoleColor(member.pivot.role_in_project)}
                                  variant="filled"
                                  sx={{ 
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                  }}
                                />
                              }
                            />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        border: '2px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No members assigned
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Project Advisors */}
            {project.advisors && project.advisors.length > 0 && (
              <Card 
                elevation={0}
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box 
                    sx={{ 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      p: 2.5,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(20px, -20px)',
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                      Project Advisors
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {project.advisors.length} {project.advisors.length !== 1 ? 'advisors' : 'advisor'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <List sx={{ p: 0 }}>
                      {(project.advisors || []).map((advisor) => (
                        <Paper 
                          key={advisor.id}
                          elevation={0}
                          sx={{ 
                            mb: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          <ListItem sx={{ p: 2 }}>
                            <ListItemIcon>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40,
                                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                }}
                              >
                                {advisor.full_name.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                  {advisor.full_name}
                                </Typography>
                              }
                              secondary={
                                <Chip
                                  label={advisor.pivot.advisor_role}
                                  size="small"
                                  color={getRoleColor(advisor.pivot.advisor_role)}
                                  variant="filled"
                                  sx={{ 
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                  }}
                                />
                              }
                            />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Project Creator */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    color: 'white',
                    p: 2.5,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '60px',
                      height: '60px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      transform: 'translate(20px, -20px)',
                    }
                  }}
                >
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                    Project Creator
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  {project.creator ? (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 48, 
                            height: 48,
                            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                            fontWeight: 600,
                            fontSize: '1.2rem',
                          }}
                        >
                          {project.creator.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                            {project.creator.full_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {project.creator.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No creator information available
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Project Interactions - Comments and Ratings */}
        {/* Comments and Ratings Section */}
        {project && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <RatingSection projectId={project.id} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CommentSection projectId={project.id} />
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Status Selector Dialog */}
      {project && (
        <StatusSelector
          open={statusDialogOpen}
          currentStatus={project.status}
          onClose={() => setStatusDialogOpen(false)}
          onSave={handleStatusChange}
        />
      )}

      {/* Export Dialog */}
      {project && (
        <ProjectExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          project={project}
        />
      )}
    </Box>
  );
};
