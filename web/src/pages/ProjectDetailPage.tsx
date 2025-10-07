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
import { ProjectInteractions } from '../components/ProjectInteractions';

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
      const response = await apiService.getProject(projectId);
      setProject(response.project);
    } catch (error: any) {
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

  const canEdit = user?.id === project.created_by_user_id;
  const canDelete = user?.id === project.created_by_user_id;

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
                  <Chip
                    label={project.status.replace('_', ' ')}
                    color={getStatusColor(project.status)}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                  {project.abstract}
                </Typography>

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
            {project.files && project.files.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Files
                  </Typography>
                  <List>
                    {(project.files || []).map((file) => (
                      <ListItem key={file.id} divider>
                        <ListItemIcon>
                          <FileDownloadIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.original_filename}
                          secondary={`${(file.size_bytes / 1024).toFixed(1)} KB • ${new Date(file.uploaded_at).toLocaleDateString()}`}
                        />
                        <Button
                          size="small"
                          onClick={() => {
                            // Handle file download
                            window.open(file.storage_url, '_blank');
                          }}
                        >
                          Download
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
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
        {project && (
          <ProjectInteractions
            projectId={project.id}
            onCommentAdded={() => {
              // Refresh notifications or show success message
              console.log('Comment added successfully');
            }}
            onRatingAdded={() => {
              // Refresh notifications or show success message
              console.log('Rating added successfully');
            }}
          />
        )}
      </Container>
    </Box>
  );
};
