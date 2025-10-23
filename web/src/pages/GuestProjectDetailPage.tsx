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
  Avatar,
  Rating,
  Paper,
  Fade,
  Slide,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
} from '@mui/material';
import { guestColors, guestTheme, createDecorativeElements, backgroundPatterns } from '../theme/guestTheme';
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
  Star as StarIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  TrendingUp as TrendingIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon,
  Group as GroupIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Project } from '../types';
import { apiService } from '../services/api';
import { TVTCLogo } from '../components/TVTCLogo';
import { CommentSection } from '../components/CommentSection';
import { RatingSection } from '../components/RatingSection';

// Use the new guest theme colors
const colors = guestColors;
const decorativeElements = createDecorativeElements();

export const GuestProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
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
      setProject(response.project || response);
    } catch (error: any) {
      console.error('Failed to fetch project:', error);
      setError(error.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };



  const averageRating = project?.average_rating || 0;
  const ratingCount = project?.rating_count || 0;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        ...backgroundPatterns.hero,
        position: 'relative',
        '&::before': decorativeElements.largeCircle,
        '&::after': decorativeElements.mediumCircle,
      }}>
        <CircularProgress size={60} sx={{ color: colors.deepPurple }} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        ...backgroundPatterns.content,
        position: 'relative',
        '&::before': decorativeElements.geometricBackground,
      }}>
        <AppBar 
          position="static" 
          sx={{ 
            background: guestColors.primaryGradient,
            boxShadow: '0 4px 20px rgba(44, 62, 80, 0.3)',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/explore')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Project Details
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error || 'Project not found'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/explore')}
            sx={{ mt: 3, background: guestColors.primaryGradient }}
          >
            Back to Explore
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      ...backgroundPatterns.content,
      position: 'relative',
      '&::before': decorativeElements.geometricBackground,
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(81, 45, 168, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(174, 223, 247, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(28, 40, 51, 0.04) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      },
    }}>
      {/* Modern Navigation Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          background: guestColors.primaryGradient,
          boxShadow: '0 4px 20px rgba(44, 62, 80, 0.3)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/explore')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Project Details
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ mr: 1, fontWeight: 500 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RegisterIcon />}
            onClick={() => navigate('/register')}
            sx={{ 
              borderColor: colors.white, 
              fontWeight: 500,
              '&:hover': { 
                borderColor: colors.white, 
                backgroundColor: 'rgba(255,255,255,0.1)' 
              } 
            }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Fade in timeout={800}>
          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Project Header */}
              <Card sx={{ 
                ...backgroundPatterns.card,
                mb: 4,
                position: 'relative',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(30, 58, 138, 0.1), 0 2px 8px rgba(55, 65, 81, 0.06)',
                border: '1px solid rgba(55, 65, 81, 0.15)',
                '&::before': decorativeElements.smallCircle,
                '&::after': decorativeElements.smallTriangle,
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 3,
                      background: guestColors.primaryGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3,
                      flexShrink: 0,
                      boxShadow: '0 8px 32px rgba(30, 58, 138, 0.25)',
                    }}>
                      <SchoolIcon sx={{ fontSize: 40, color: colors.white }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.textPrimary }}>
                        {project.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon sx={{ fontSize: 16, color: colors.textSecondary, mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {project.views || 0} views
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating
                            value={averageRating}
                            readOnly
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {averageRating.toFixed(1)} ({ratingCount} ratings)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Project Abstract */}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
                    Abstract
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    lineHeight: 1.7, 
                    color: colors.textPrimary,
                    mb: 3,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {project.abstract}
                  </Typography>

                  {/* Keywords */}
                  {project.keywords && project.keywords.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}>
                        Keywords
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {project.keywords.map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            variant="outlined"
                            sx={{ 
                              borderColor: colors.almostBlack,
                              color: colors.almostBlack,
                              '&:hover': {
                                backgroundColor: colors.almostBlack,
                                color: colors.white,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Divider sx={{ my: 3 }} />

                  {/* Project Details */}
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ color: colors.almostBlack, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {project.creator?.full_name || 'Unknown'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SchoolIcon sx={{ color: colors.almostBlack, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {project.program?.name || 'TVTC Program'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarIcon sx={{ color: colors.deepPurple, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {project.academic_year} • {project.semester}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BusinessIcon sx={{ color: colors.deepPurple, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {project.department?.name || 'Department'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Project Files Section */}
              <Card sx={{ 
                ...backgroundPatterns.card,
                mb: 4,
                position: 'relative',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(30, 58, 138, 0.1), 0 2px 8px rgba(55, 65, 81, 0.06)',
                border: '1px solid rgba(55, 65, 81, 0.15)',
                '&::before': decorativeElements.smallCircle,
                '&::after': decorativeElements.mediumTriangle,
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FileDownloadIcon sx={{ color: colors.almostBlack, mr: 1, fontSize: 24 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                      Project Files ({project.files?.length || 0})
                    </Typography>
                  </Box>
                  
                  {project.files && project.files.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {project.files.map((file, index) => (
                        <Paper
                          key={file.id}
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 3,
                            background: colors.lightGray,
                            border: `1px solid ${colors.almostBlack}20`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          <ListItem sx={{ p: 0 }}>
                            <ListItemIcon>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1.5,
                                  background: guestColors.primaryGradient,
                                  color: colors.white,
                                }}
                              >
                                <FileDownloadIcon sx={{ fontSize: 20 }} />
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
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
                                      background: `linear-gradient(135deg, ${colors.lightGray} 0%, #e2e8f0 100%)`,
                                      color: colors.textSecondary,
                                      fontWeight: 500,
                                    }}
                                  />
                                  <Chip 
                                    label={new Date(file.uploaded_at).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })} 
                                    size="small" 
                                    variant="filled"
                                    sx={{ 
                                      background: `linear-gradient(135deg, ${colors.lightGray} 0%, #e2e8f0 100%)`,
                                      color: colors.textSecondary,
                                      fontWeight: 500,
                                    }}
                                  />
                                  <Chip 
                                    label={file.mime_type} 
                                    size="small" 
                                    variant="filled"
                                    sx={{ 
                                      background: `linear-gradient(135deg, ${colors.lightGray} 0%, #e2e8f0 100%)`,
                                      color: colors.textSecondary,
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
                                        background: `linear-gradient(135deg, ${colors.success} 0%, #10b981 100%)`,
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
                                  window.open(file.public_url || file.storage_url, '_blank');
                                }
                              }}
                              sx={{ 
                                minWidth: 100,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: colors.softYellow,
                                color: colors.white,
                                borderRadius: '8px',
                                '&:hover': {
                                  background: colors.softOrange,
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 12px rgba(241, 196, 15, 0.3)',
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
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <FileDownloadIcon sx={{ fontSize: 48, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No files uploaded yet
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Team Members & Project Advisors Section */}
              <Card sx={{ 
                ...backgroundPatterns.card,
                mb: 4,
                position: 'relative',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(30, 58, 138, 0.1), 0 2px 8px rgba(55, 65, 81, 0.06)',
                border: '1px solid rgba(55, 65, 81, 0.15)',
                '&::before': decorativeElements.smallCircle,
                '&::after': decorativeElements.smallTriangle,
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={4}>
                    {/* Team Members */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <GroupIcon sx={{ color: colors.almostBlack, mr: 1, fontSize: 24 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                          Team Members ({project.members?.length || 0})
                        </Typography>
                      </Box>
                      
                      {project.members && project.members.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {project.members.map((member) => (
                            <Paper
                              key={member.id}
                              sx={{
                                p: 3,
                                mb: 2,
                                borderRadius: 3,
                                background: colors.lightGray,
                                border: `1px solid ${colors.almostBlack}20`,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                  transform: 'translateY(-1px)',
                                }
                              }}
                            >
                              <ListItem sx={{ p: 0 }}>
                                <ListItemIcon>
                                  <Avatar 
                                    sx={{ 
                                      width: 40, 
                                      height: 40,
                                      background: `linear-gradient(135deg, ${colors.almostBlack} 0%, ${colors.deepPurple} 100%)`,
                                      fontWeight: 600,
                                      fontSize: '1rem',
                                    }}
                                  >
                                    {member.full_name.charAt(0).toUpperCase()}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="subtitle1" fontWeight="600" color={colors.textPrimary}>
                                      {member.full_name}
                                    </Typography>
                                  }
                                  secondary={
                                    <Chip
                                      label={member.pivot.role_in_project}
                                      size="small"
                                      color="primary"
                                      variant="filled"
                                      sx={{ 
                                        fontWeight: 600,
                                        background: `linear-gradient(135deg, ${colors.almostBlack} 0%, ${colors.deepPurple} 100%)`,
                                      }}
                                    />
                                  }
                                />
                              </ListItem>
                            </Paper>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <GroupIcon sx={{ fontSize: 48, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            No team members assigned
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    {/* Project Advisors */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <SupervisorAccountIcon sx={{ color: colors.deepPurple, mr: 1, fontSize: 24 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                          Project Advisor ({project.advisors?.length || 0})
                        </Typography>
                      </Box>
                      
                      {project.advisors && project.advisors.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {project.advisors.map((advisor) => (
                            <Paper
                              key={advisor.id}
                              sx={{
                                p: 3,
                                mb: 2,
                                borderRadius: 3,
                                background: colors.lightGray,
                                border: `1px solid ${colors.deepPurple}20`,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                  transform: 'translateY(-1px)',
                                }
                              }}
                            >
                              <ListItem sx={{ p: 0 }}>
                                <ListItemIcon>
                                  <Avatar 
                                    sx={{ 
                                      width: 40, 
                                      height: 40,
                                      background: `linear-gradient(135deg, ${colors.deepPurple} 0%, ${colors.mediumSlateGray} 100%)`,
                                      fontWeight: 600,
                                      fontSize: '1rem',
                                    }}
                                  >
                                    {advisor.full_name.charAt(0).toUpperCase()}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="subtitle1" fontWeight="600" color={colors.textPrimary}>
                                      {advisor.full_name}
                                    </Typography>
                                  }
                                  secondary={
                                    <Chip
                                      label={advisor.pivot.advisor_role}
                                      size="small"
                                      color="warning"
                                      variant="filled"
                                      sx={{ 
                                        fontWeight: 600,
                                        background: `linear-gradient(135deg, ${colors.deepPurple} 0%, ${colors.mediumSlateGray} 100%)`,
                                      }}
                                    />
                                  }
                                />
                              </ListItem>
                            </Paper>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <SupervisorAccountIcon sx={{ fontSize: 48, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            No project advisor assigned
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Comments and Ratings Sections */}
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
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, lg: 4 }}>
              {/* Call to Action */}
              <Card sx={{ 
                ...backgroundPatterns.hero,
                mb: 4,
                color: colors.textPrimary,
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2), 0 4px 16px rgba(55, 65, 81, 0.12)',
                position: 'relative',
                '&::before': decorativeElements.largeCircle,
                '&::after': decorativeElements.mediumCircle,
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <TrendingIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Impressed by this project?
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Join our community and showcase your own innovative work
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<RegisterIcon />}
                      onClick={() => navigate('/register')}
                      sx={{
                        background: colors.deepPurple,
                        color: colors.white,
                        fontWeight: 600,
                        borderRadius: '12px',
                        '&:hover': {
                          background: colors.lightSkyBlue,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(233, 30, 99, 0.3)',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<LoginIcon />}
                      onClick={() => navigate('/login')}
                      sx={{
                        borderColor: colors.almostBlack,
                        color: colors.almostBlack,
                        fontWeight: 600,
                        borderRadius: '12px',
                        '&:hover': {
                          borderColor: colors.almostBlack,
                          backgroundColor: alpha(colors.almostBlack, 0.1),
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </CardContent>
              </Card>


              {/* Project Information - Read Only (Status Hidden) */}
              <Card sx={{ 
                ...backgroundPatterns.card,
                position: 'relative',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(30, 58, 138, 0.1), 0 2px 8px rgba(55, 65, 81, 0.06)',
                border: '1px solid rgba(55, 65, 81, 0.15)',
                '&::before': decorativeElements.smallCircle,
                '&::after': decorativeElements.mediumTriangle,
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.textPrimary }}>
                    Project Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Academic Year:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.academic_year}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Semester:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {project.semester}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Program:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.program?.name || 'TVTC Program'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Department:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.department?.name || 'Department'}
                    </Typography>
                  </Box>
                  
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
};
