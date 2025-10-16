import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Project } from '../types';
import { apiService } from '../services/api';
import { TVTCLogo } from '../components/TVTCLogo';
import { ReadOnlyCommentSection } from '../components/ReadOnlyCommentSection';
import { ReadOnlyRatingSection } from '../components/ReadOnlyRatingSection';

export const PublicProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
    }
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProject(projectId);
      setProject(response.project);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      setError(error.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    // Go back to the previous page or to the explore page if no history
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate('/explore');
    }
  };

  const handleFileDownload = async (fileId: number, filename: string) => {
    try {
      const blob = await apiService.downloadFile(fileId);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download file:', error);
      // You could add a toast notification here
      alert('Failed to download file. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'success';
      case 'under_review': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBackClick}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Fahras - Project Details
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ color: '#1e3a8a' }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBackClick}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Fahras - Project Details
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            onClick={handleBackClick}
            sx={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}
          >
            Go Back
          </Button>
        </Container>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBackClick}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Fahras - Project Details
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Project not found
          </Alert>
          <Button
            variant="outlined"
            onClick={handleBackClick}
            sx={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}
          >
            Go Back
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackClick}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fahras - Project Details
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login', { state: { from: location } })}
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RegisterIcon />}
            onClick={() => navigate('/register')}
            sx={{ borderColor: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Main Project Information */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                    {project.title}
                  </Typography>
                  <Chip
                    label={project.status.replace('_', ' ')}
                    color={getStatusColor(project.status) as any}
                    variant="outlined"
                    sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                    Abstract
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, color: '#374151' }}>
                    {project.abstract}
                  </Typography>
                </Box>

                {/* Project Keywords */}
                {project.keywords && project.keywords.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                      Keywords
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {project.keywords.map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          variant="outlined"
                          sx={{ 
                            borderColor: '#1e3a8a',
                            color: '#1e3a8a',
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Project Files */}
                {project.files && project.files.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                      Project Files
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {project.files.map((file) => (
                        <Box
                          key={file.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            border: '1px solid #e5e7eb',
                            borderRadius: 2,
                            backgroundColor: '#f9fafb',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: '#f3f4f6',
                              borderColor: '#1e3a8a',
                            },
                          }}
                        >
                          <VisibilityIcon sx={{ color: '#6b7280', mr: 1 }} />
                          <Typography variant="body2" sx={{ flexGrow: 1, color: '#374151' }}>
                            {file.original_filename}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                            {file.size_human}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleFileDownload(file.id, file.original_filename)}
                            sx={{
                              color: '#1e3a8a',
                              '&:hover': {
                                backgroundColor: '#1e3a8a',
                                color: 'white',
                              },
                            }}
                            title="Download file"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar Information */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                  Project Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ color: '#6b7280', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Author: {project.creator?.full_name || 'Unknown'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ color: '#6b7280', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {project.program?.department?.name || 'Unknown Department'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ color: '#6b7280', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {project.program?.name || 'Unknown Program'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ color: '#6b7280', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {project.academic_year} • {project.semester}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Team Members */}
            {(project.members && project.members.length > 0) && (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                    Team Members
                  </Typography>
                  {project.members.map((member, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {member.full_name || member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.pivot?.role_in_project || member.role}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Advisors */}
            {(project.advisors && project.advisors.length > 0) && (
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                    Advisors
                  </Typography>
                  {project.advisors.map((advisor, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {advisor.full_name || advisor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {advisor.pivot?.advisor_role || advisor.role}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Comments and Ratings Section */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ReadOnlyCommentSection projectId={project.id} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ReadOnlyRatingSection projectId={project.id} />
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Box
          sx={{
            mt: 4,
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Want to publish your project?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create an account and start documenting your graduation project today
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RegisterIcon />}
              onClick={() => navigate('/register')}
              sx={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                px: 4,
              }}
            >
              Register Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login', { state: { from: location } })}
              sx={{
                borderColor: '#1e3a8a',
                color: '#1e3a8a',
              }}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
