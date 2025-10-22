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

// Modern color scheme
const colors = {
  primary: '#4FC3F7',      // Light Sky Blue
  white: '#FFFFFF',        // White
  lightGray: '#F5F5F5',    // Very Light Gray
  accent: '#BA68C8',        // Soft Purple
  accentAlt: '#FFA726',     // Soft Orange
  text: '#2C3E50',         // Dark text
  textSecondary: '#7F8C8D', // Secondary text
  success: '#27AE60',      // Success green
  warning: '#F39C12',      // Warning orange
};

export const GuestProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
      fetchComments(parseInt(id));
      fetchRatings(parseInt(id));
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

  const fetchComments = async (projectId: number) => {
    try {
      const response = await apiService.getComments(projectId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const fetchRatings = async (projectId: number) => {
    try {
      const response = await apiService.getRatings(projectId);
      setRatings(response.ratings || []);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
      setRatings([]);
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
        background: `linear-gradient(135deg, ${colors.lightGray} 0%, #E8F4FD 100%)`
      }}>
        <CircularProgress size={60} sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.lightGray} 0%, #E8F4FD 100%)`
      }}>
        <AppBar 
          position="static" 
          sx={{ 
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
            boxShadow: '0 4px 20px rgba(79, 195, 247, 0.3)',
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
            sx={{ mt: 3, background: colors.primary }}
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
      background: `linear-gradient(135deg, ${colors.lightGray} 0%, #E8F4FD 100%)`
    }}>
      {/* Modern Navigation Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          boxShadow: '0 4px 20px rgba(79, 195, 247, 0.3)',
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
                borderRadius: 4, 
                mb: 4,
                background: colors.white,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: `1px solid ${colors.primary}20`,
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3,
                      flexShrink: 0,
                    }}>
                      <SchoolIcon sx={{ fontSize: 40, color: colors.white }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.text }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon sx={{ fontSize: 16, color: colors.textSecondary, mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {comments.length} comments
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Project Abstract */}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                    Abstract
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    lineHeight: 1.7, 
                    color: colors.text,
                    mb: 3,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {project.abstract}
                  </Typography>

                  {/* Keywords */}
                  {project.keywords && project.keywords.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                        Keywords
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {project.keywords.map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            variant="outlined"
                            sx={{ 
                              borderColor: colors.primary,
                              color: colors.primary,
                              '&:hover': {
                                backgroundColor: colors.primary,
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
                        <PersonIcon sx={{ color: colors.primary, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {project.creator?.full_name || 'Unknown'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SchoolIcon sx={{ color: colors.primary, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {project.program?.name || 'TVTC Program'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarIcon sx={{ color: colors.primary, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {project.academic_year} • {project.semester}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BusinessIcon sx={{ color: colors.primary, mr: 1 }} />
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
                borderRadius: 4, 
                mb: 4,
                background: colors.white,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FileDownloadIcon sx={{ color: colors.primary, mr: 1, fontSize: 24 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
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
                            border: `1px solid ${colors.primary}20`,
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
                                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                                  color: colors.white,
                                }}
                              >
                                <FileDownloadIcon sx={{ fontSize: 20 }} />
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
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
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                                borderRadius: 1.5,
                                '&:hover': {
                                  background: `linear-gradient(135deg, #1e40af 0%, #2563eb 100%)`,
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
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <FileDownloadIcon sx={{ fontSize: 48, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No files uploaded yet
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Team Members Section */}
              <Card sx={{ 
                borderRadius: 4, 
                mb: 4,
                background: colors.white,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <GroupIcon sx={{ color: colors.primary, mr: 1, fontSize: 24 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
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
                            border: `1px solid ${colors.primary}20`,
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
                                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                }}
                              >
                                {member.full_name.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="600" color={colors.text}>
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
                                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
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
                </CardContent>
              </Card>

              {/* Project Advisors Section */}
              {project.advisors && project.advisors.length > 0 && (
                <Card sx={{ 
                  borderRadius: 4, 
                  mb: 4,
                  background: colors.white,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <SupervisorAccountIcon sx={{ color: colors.accent, mr: 1, fontSize: 24 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
                        Project Advisors ({project.advisors.length})
                      </Typography>
                    </Box>
                    
                    <List sx={{ p: 0 }}>
                      {project.advisors.map((advisor) => (
                        <Paper
                          key={advisor.id}
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 3,
                            background: colors.lightGray,
                            border: `1px solid ${colors.accent}20`,
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
                                  background: `linear-gradient(135deg, ${colors.accent} 0%, #d97706 100%)`,
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                }}
                              >
                                {advisor.full_name.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="600" color={colors.text}>
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
                                    background: `linear-gradient(135deg, ${colors.accent} 0%, #d97706 100%)`,
                                  }}
                                />
                              }
                            />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Comments Section - Read Only */}
              <Card sx={{ 
                borderRadius: 4, 
                mb: 4,
                background: colors.white,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CommentIcon sx={{ color: colors.primary, mr: 1, fontSize: 24 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
                      Comments ({comments.length})
                    </Typography>
                  </Box>
                  
                  {comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CommentIcon sx={{ fontSize: 48, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No comments yet.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      {comments.map((comment, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 3,
                            background: colors.lightGray,
                            border: `1px solid ${colors.primary}20`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <Avatar sx={{ bgcolor: colors.primary, mr: 2, width: 32, height: 32 }}>
                              <PersonIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.text }}>
                                {comment.user?.full_name || 'Anonymous'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ color: colors.text, lineHeight: 1.6 }}>
                            {comment.content}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 3, p: 3, borderRadius: 3, background: `${colors.primary}10` }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      Want to leave a comment? 
                      <Button
                        variant="text"
                        onClick={() => navigate('/login')}
                        sx={{ ml: 1, color: colors.primary, fontWeight: 600 }}
                      >
                        Sign in
                      </Button>
                      to join the discussion!
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Ratings Section - Read Only */}
              <Card sx={{ 
                borderRadius: 4,
                background: colors.white,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <StarIcon sx={{ color: colors.accent, mr: 1, fontSize: 24 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
                      Ratings ({ratings.length})
                    </Typography>
                  </Box>
                  
                  {ratings.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <StarIcon sx={{ fontSize: 48, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No ratings yet.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      {ratings.map((rating, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 3,
                            background: colors.lightGray,
                            border: `1px solid ${colors.accent}20`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ bgcolor: colors.accent, mr: 2, width: 32, height: 32 }}>
                              <PersonIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.text }}>
                                {rating.user?.full_name || 'Anonymous'}
                              </Typography>
                            </Box>
                            <Rating value={rating.rating} readOnly size="small" />
                          </Box>
                          {rating.comment && (
                            <Typography variant="body2" sx={{ color: colors.text, lineHeight: 1.6, ml: 5 }}>
                              {rating.comment}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 3, p: 3, borderRadius: 3, background: `${colors.accent}10` }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      Want to rate this project? 
                      <Button
                        variant="text"
                        onClick={() => navigate('/login')}
                        sx={{ ml: 1, color: colors.accent, fontWeight: 600 }}
                      >
                        Sign in
                      </Button>
                      to share your rating!
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, lg: 4 }}>
              {/* Call to Action */}
              <Card sx={{ 
                borderRadius: 4, 
                mb: 4,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                color: colors.white,
                boxShadow: '0 8px 32px rgba(79, 195, 247, 0.3)',
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
                        background: colors.white,
                        color: colors.primary,
                        fontWeight: 600,
                        '&:hover': {
                          background: colors.lightGray,
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
                        borderColor: colors.white,
                        color: colors.white,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: colors.white,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Project Stats */}
              <Card sx={{ 
                borderRadius: 4,
                background: colors.white,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text }}>
                    Project Statistics
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Views</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.views || 0}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Files</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.files?.length || 0}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Team Members</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.members?.length || 0}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Advisors</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.advisors?.length || 0}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Comments</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comments.length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Ratings</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ratings.length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Average Rating</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={averageRating} readOnly size="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600, ml: 1 }}>
                        {averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                  
                </CardContent>
              </Card>

              {/* Project Information - Read Only (Status Hidden) */}
              <Card sx={{ 
                borderRadius: 4,
                background: colors.white,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text }}>
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
