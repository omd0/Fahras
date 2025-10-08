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
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Project } from '../types';
import { apiService } from '../services/api';
import { CommentSection } from '../components/CommentSection';
import { RatingSection } from '../components/RatingSection';
import ProjectVisibilityToggle from '../components/ProjectVisibilityToggle';

export const ProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
          onClick={() => navigate('/dashboard')}
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
          onClick={() => navigate('/dashboard')}
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
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h4" gutterBottom>
                    {project.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                    <Chip
                      label={project.status.replace('_', ' ')}
                      color={getStatusColor(project.status)}
                      variant="outlined"
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
                            />
                          );
                        }
                        // Reviewer and other users: don't show approval status
                        return null;
                      })()
                    )}
                  </Box>
                </Box>

                <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                  {project.abstract}
                </Typography>

                {/* Admin Notes */}
                {project.admin_notes && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Admin Notes:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {project.admin_notes}
                    </Typography>
                    {project.approver && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        — {project.approver.full_name} on {new Date(project.approved_at || '').toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Keywords */}
                {project.keywords && project.keywords.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Keywords
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(project.keywords || []).map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Academic Information */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle2">Academic Year</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {project.academic_year}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle2">Semester</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {project.semester}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Files Section */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FileDownloadIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2">
                    Project Files
                  </Typography>
                  <Chip 
                    label={`${project.files?.length || 0} files`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ ml: 2 }}
                  />
                </Box>

                
                {project.files && project.files.length > 0 ? (
                  <List>
                    {(project.files || []).map((file, index) => (
                      <ListItem 
                        key={file.id} 
                        divider={index < (project.files || []).length - 1}
                        sx={{ 
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <ListItemIcon>
                          <FileDownloadIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {file.original_filename}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {(file.size_bytes / 1024).toFixed(1)} KB
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(file.uploaded_at).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {file.mime_type}
                              </Typography>
                              {file.is_public && (
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    •
                                  </Typography>
                                  <Chip 
                                    label="Public" 
                                    size="small" 
                                    color="success" 
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.75rem' }}
                                  />
                                </>
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
                            fontWeight: 500
                          }}
                        >
                          Download
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: 'text.secondary'
                  }}>
                    <FileDownloadIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="body1" color="text.secondary">
                      {project.files && project.files.length > 0 ? 
                        'Files are not visible to you at this time' :
                        'No files uploaded yet'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {project.files && project.files.length > 0 ? 
                        'Files may be restricted based on project approval status and your access level' :
                        'Files uploaded during project creation will appear here'
                      }
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Program Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Program Information
                </Typography>
                {project.program && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Program
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.program.name}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Degree Level
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.program.degree_level}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Project Members */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Members
                </Typography>
                {project.members && project.members.length > 0 ? (
                  <List dense>
                    {(project.members || []).map((member) => (
                      <ListItem key={member.id}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {member.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={member.full_name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={member.pivot.role_in_project}
                                size="small"
                                color={getRoleColor(member.pivot.role_in_project)}
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No members assigned
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Project Advisors */}
            {project.advisors && project.advisors.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Advisors
                  </Typography>
                  <List dense>
                    {(project.advisors || []).map((advisor) => (
                      <ListItem key={advisor.id}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {advisor.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={advisor.full_name}
                          secondary={
                            <Chip
                              label={advisor.pivot.advisor_role}
                              size="small"
                              color={getRoleColor(advisor.pivot.advisor_role)}
                              variant="outlined"
                            />
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Project Creator */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Creator
                </Typography>
                {project.creator && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>
                      {project.creator.full_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {project.creator.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.creator.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
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
    </Box>
  );
};
