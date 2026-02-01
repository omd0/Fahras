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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import { colorPalette } from '@/styles/theme/colorPalette';
import { designTokens } from '@/styles/designTokens';
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingIcon,
  FileDownload as FileDownloadIcon,
  Group as GroupIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Label as LabelIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Project, File as ProjectFile, ProjectMember, ProjectAdvisor } from '@/types';
import { apiService } from '@/lib/api';
import { TVTCLogo } from '@/components/TVTCLogo';
import { CommentSection } from '@/components/CommentSection';
import { RatingSection } from '@/components/RatingSection';
import { BookmarkButton } from '@/features/bookmarks/components/BookmarkButton';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProject(projectId);
      setProject(response.project || response);
    } catch (err: unknown) {
      console.error('Failed to fetch project:', err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 404 ? 'Project not found or not available.' : null) ||
        (err.request && !err.response ? 'Cannot reach the server. Check your connection and that the API is running.' : null) ||
        err.message ||
        'Failed to fetch project.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (file: ProjectFile) => {
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
    } catch (err) {
      console.error('Error downloading file:', err);
      window.open(file.public_url || file.storage_url, '_blank');
    }
  };

  const averageRating = project?.average_rating || 0;
  const ratingCount = project?.rating_count || 0;

  const guestCardSx = {
    mb: 4,
    borderRadius: designTokens.radii.card,
    border: `1px solid ${colorPalette.border.default}`,
    boxShadow: designTokens.shadows.elevation1,
    background: colorPalette.surface.paper,
    overflow: 'hidden' as const,
    transition: designTokens.transitions.hover,
    '&:hover': {
      boxShadow: designTokens.shadows.elevation2,
    },
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: colorPalette.surface.background,
      }}>
        <CircularProgress size={60} sx={{ color: colorPalette.primary.main }} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ minHeight: '100vh', background: colorPalette.surface.background }}>
        <AppBar
          position="static"
          sx={{
            background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
            boxShadow: designTokens.shadows.elevation2,
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/explore')}
              aria-label="Back to explore"
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
            sx={{
              mt: 3,
              background: colorPalette.primary.main,
              color: colorPalette.common.white,
              '&:hover': { background: colorPalette.primary.dark },
            }}
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
      background: `linear-gradient(135deg, ${colorPalette.common.white} 0%, ${colorPalette.surface.elevated} 50%, ${colorPalette.common.white} 100%)`,
    }}>
      <AppBar
        position="static"
        sx={{
          background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
          boxShadow: designTokens.shadows.elevation2,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/explore')}
            aria-label="Back to explore"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600, color: colorPalette.common.white }}>
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
              borderColor: colorPalette.common.white,
              fontWeight: 500,
              '&:hover': {
                borderColor: colorPalette.common.white,
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Breadcrumb
          items={[
            { label: 'Explore', path: '/explore' },
            { label: project.title },
          ]}
          showHome={false}
        />

        <Fade in timeout={800}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={guestCardSx}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3,
                      flexShrink: 0,
                      boxShadow: `0 8px 24px ${colorPalette.shadow.medium}`,
                    }}>
                      <SchoolIcon sx={{ fontSize: 36, color: colorPalette.common.white }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: colorPalette.text.primary, flex: 1, fontSize: { xs: '1.4rem', sm: '1.8rem' } }}>
                          {project.title}
                        </Typography>
                        <Box sx={{ ml: 2 }}>
                          <BookmarkButton projectId={project.id} size="medium" />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <VisibilityIcon sx={{ fontSize: 16, color: colorPalette.text.secondary, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colorPalette.text.secondary }}>
                          {project.views || 0} views
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={averageRating} readOnly size="small" />
                        <Typography variant="body2" sx={{ color: colorPalette.text.secondary }}>
                          {averageRating.toFixed(1)} ({ratingCount} ratings)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: 2,
                      background: colorPalette.surface.elevated,
                      border: `1px solid ${colorPalette.border.default}`,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: colorPalette.text.primary, fontSize: '1.1rem' }}>
                      Abstract
                    </Typography>
                    <Typography variant="body1" sx={{
                      lineHeight: 1.8,
                      color: colorPalette.text.primary,
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.95rem',
                    }}>
                      {project.abstract}
                    </Typography>
                  </Paper>

                  {project.keywords && project.keywords.length > 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        background: colorPalette.primary.lighter,
                        border: `1px solid ${colorPalette.primary.light}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LabelIcon sx={{ fontSize: 20, color: colorPalette.primary.dark }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: colorPalette.text.primary, fontSize: '1.1rem' }}>
                          Keywords
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(project.keywords || []).map((keyword: string, index: number) => (
                          <Chip
                            key={index}
                            label={keyword}
                            variant="outlined"
                            sx={{
                              borderColor: colorPalette.primary.main,
                              color: colorPalette.primary.dark,
                              backgroundColor: colorPalette.common.white,
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: colorPalette.primary.main,
                                color: colorPalette.common.white,
                              },
                              transition: designTokens.transitions.micro,
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ color: colorPalette.primary.main, mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="700" sx={{ color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                            Creator
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: colorPalette.text.primary }}>
                            {project.creator?.full_name || 'Unknown'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SchoolIcon sx={{ color: colorPalette.primary.main, mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="700" sx={{ color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                            Program
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: colorPalette.text.primary }}>
                            {project.program?.name || 'TVTC Program'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarIcon sx={{ color: colorPalette.primary.main, mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="700" sx={{ color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                            Academic Year
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: colorPalette.text.primary }}>
                            {project.academic_year} &bull; {project.semester}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BusinessIcon sx={{ color: colorPalette.primary.main, mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="700" sx={{ color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                            Department
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: colorPalette.text.primary }}>
                            {project.department?.name || 'Department'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={guestCardSx}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{
                    background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
                    color: colorPalette.common.white,
                    p: 3,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CloudDownloadIcon sx={{ fontSize: 28, color: colorPalette.common.white }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colorPalette.common.white }}>
                        Project Files ({project.files?.length || 0})
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    {project.files && project.files.length > 0 ? (
                      <List sx={{ p: 0 }}>
                        {(project.files || []).map((file: ProjectFile) => (
                          <Paper
                            key={file.id}
                            elevation={0}
                            sx={{
                              p: 2,
                              mb: 2,
                              borderRadius: 2,
                              background: colorPalette.surface.elevated,
                              border: `1px solid ${colorPalette.border.default}`,
                              cursor: 'pointer',
                              transition: designTokens.transitions.hover,
                              '&:hover': {
                                boxShadow: designTokens.shadows.elevation2,
                                transform: 'translateY(-2px)',
                                borderColor: colorPalette.primary.main,
                              },
                            }}
                            onClick={() => handleDownloadFile(file)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Download ${file.original_filename}`}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleDownloadFile(file);
                              }
                            }}
                          >
                            <ListItem sx={{ p: 0 }}>
                              <ListItemIcon>
                                <Box sx={{
                                  p: 1,
                                  borderRadius: 1.5,
                                  background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
                                  color: colorPalette.common.white,
                                }}>
                                  <FileDownloadIcon sx={{ fontSize: 20 }} />
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colorPalette.text.primary }}>
                                    {file.original_filename}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`${(file.size_bytes / 1024).toFixed(1)} KB`} size="small" variant="filled" sx={{ background: colorPalette.surface.sunken, color: colorPalette.text.secondary, fontWeight: 500 }} />
                                    <Chip label={new Date(file.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} size="small" variant="filled" sx={{ background: colorPalette.surface.sunken, color: colorPalette.text.secondary, fontWeight: 500 }} />
                                    <Chip label={file.mime_type} size="small" variant="filled" sx={{ background: colorPalette.surface.sunken, color: colorPalette.text.secondary, fontWeight: 500 }} />
                                    {file.is_public && (
                                      <Chip label="Public" size="small" color="success" variant="filled" sx={{ fontWeight: 600 }} />
                                    )}
                                  </Box>
                                }
                              />
                              <Tooltip title={`Download ${file.original_filename}`}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<FileDownloadIcon />}
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleDownloadFile(file);
                                  }}
                                  aria-label={`Download ${file.original_filename}`}
                                  sx={{
                                    minWidth: 120,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    background: colorPalette.primary.main,
                                    color: colorPalette.common.white,
                                    borderRadius: '8px',
                                    '&:hover': {
                                      background: colorPalette.primary.dark,
                                      transform: 'translateY(-1px)',
                                      boxShadow: `0 4px 12px ${colorPalette.shadow.medium}`,
                                    },
                                    transition: designTokens.transitions.hover,
                                  }}
                                >
                                  Download
                                </Button>
                              </Tooltip>
                            </ListItem>
                          </Paper>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <FileDownloadIcon sx={{ fontSize: 48, color: colorPalette.text.disabled, mb: 2, display: 'block', mx: 'auto' }} />
                        <Typography variant="body1" sx={{ color: colorPalette.text.secondary }}>
                          No files uploaded yet
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Card sx={guestCardSx}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <GroupIcon sx={{ color: colorPalette.primary.main, mr: 1, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: colorPalette.text.primary, fontSize: '1.1rem' }}>
                          Team Members ({project.members?.length || 0})
                        </Typography>
                      </Box>

                      {project.members && project.members.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {(project.members || []).map((member: ProjectMember) => (
                            <Paper key={member.id} elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 2, background: colorPalette.surface.elevated, border: `1px solid ${colorPalette.border.default}`, transition: designTokens.transitions.hover, '&:hover': { boxShadow: designTokens.shadows.elevation2, transform: 'translateY(-1px)' } }}>
                              <ListItem sx={{ p: 0 }}>
                                <ListItemIcon>
                                  <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.teal.main} 100%)`, fontWeight: 600, fontSize: '1rem' }}>
                                    {member.full_name.charAt(0).toUpperCase()}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={<Typography variant="subtitle1" fontWeight="600" sx={{ color: colorPalette.text.primary }}>{member.full_name}</Typography>}
                                  secondary={<Chip label={member.pivot.role_in_project} size="small" color="primary" variant="filled" sx={{ fontWeight: 600, mt: 0.5 }} />}
                                />
                              </ListItem>
                            </Paper>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <GroupIcon sx={{ fontSize: 48, color: colorPalette.text.disabled, mb: 2, display: 'block', mx: 'auto' }} />
                          <Typography variant="body1" sx={{ color: colorPalette.text.secondary }}>No team members assigned</Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <SupervisorAccountIcon sx={{ color: colorPalette.warning.main, mr: 1, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: colorPalette.text.primary, fontSize: '1.1rem' }}>
                          Project Advisor ({project.advisors?.length || 0})
                        </Typography>
                      </Box>

                      {project.advisors && project.advisors.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {(project.advisors || []).map((advisor: ProjectAdvisor) => (
                            <Paper key={advisor.id} elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 2, background: colorPalette.surface.elevated, border: `1px solid ${colorPalette.border.default}`, transition: designTokens.transitions.hover, '&:hover': { boxShadow: designTokens.shadows.elevation2, transform: 'translateY(-1px)' } }}>
                              <ListItem sx={{ p: 0 }}>
                                <ListItemIcon>
                                  <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${colorPalette.warning.dark} 0%, ${colorPalette.warning.main} 100%)`, fontWeight: 600, fontSize: '1rem' }}>
                                    {advisor.full_name.charAt(0).toUpperCase()}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={<Typography variant="subtitle1" fontWeight="600" sx={{ color: colorPalette.text.primary }}>{advisor.full_name}</Typography>}
                                  secondary={<Chip label={advisor.pivot.advisor_role} size="small" color="warning" variant="filled" sx={{ fontWeight: 600, mt: 0.5 }} />}
                                />
                              </ListItem>
                            </Paper>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <SupervisorAccountIcon sx={{ fontSize: 48, color: colorPalette.text.disabled, mb: 2, display: 'block', mx: 'auto' }} />
                          <Typography variant="body1" sx={{ color: colorPalette.text.secondary }}>No project advisor assigned</Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {project && (
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                    <RatingSection projectId={project.id} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CommentSection projectId={project.id} />
                  </Grid>
                </Grid>
              )}
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{
                ...guestCardSx,
                background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.surface.paper} 100%)`,
                boxShadow: designTokens.shadows.elevation2,
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <TrendingIcon sx={{ fontSize: 48, mb: 2, color: colorPalette.primary.main }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: colorPalette.text.primary }}>
                    Impressed by this project?
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: colorPalette.text.secondary }}>
                    Join our community and showcase your own innovative work
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<RegisterIcon />}
                      onClick={() => navigate('/register')}
                      sx={{
                        background: colorPalette.primary.main,
                        color: colorPalette.common.white,
                        fontWeight: 600,
                        borderRadius: designTokens.radii.card,
                        '&:hover': {
                          background: colorPalette.primary.dark,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${colorPalette.shadow.medium}`,
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
                        borderColor: colorPalette.text.primary,
                        color: colorPalette.text.primary,
                        fontWeight: 600,
                        borderRadius: designTokens.radii.card,
                        '&:hover': {
                          borderColor: colorPalette.primary.main,
                          color: colorPalette.primary.main,
                          backgroundColor: colorPalette.primary.lighter,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={guestCardSx}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{
                    background: `linear-gradient(135deg, ${colorPalette.secondary.dark} 0%, ${colorPalette.secondary.main} 100%)`,
                    color: colorPalette.common.white,
                    p: 2.5,
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colorPalette.common.white }}>
                      Project Information
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {[
                      { label: 'Academic Year', value: project.academic_year },
                      { label: 'Semester', value: project.semester },
                      { label: 'Program', value: project.program?.name || 'TVTC Program' },
                      { label: 'Department', value: project.department?.name || 'Department' },
                    ].map((item) => (
                      <Box key={item.label}>
                        <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 0.5, color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: colorPalette.text.primary, textTransform: item.label === 'Semester' ? 'capitalize' : 'none' }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
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
