import React, { useState, useEffect } from 'react';
import { designTokens } from '@/styles/designTokens';
import { colorPalette } from '@/styles/theme/colorPalette';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getStatusColor } from '@/utils/projectHelpers';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { TVTCLogo } from '@/components/TVTCLogo';
import { TVTCBranding } from '@/components/TVTCBranding';

export const PublicDashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicProjects();
  }, []);

  const fetchPublicProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects('per_page=50');
      const projectsData = Array.isArray(response)
        ? response
        : response.data || [];

      // Filter only approved and public projects
      const publicProjects = projectsData.filter((p: Project) => 
        p.admin_approval_status === 'approved' && p.is_public === true
      );

      setProjects(publicProjects);
    } catch (error: unknown) {
      console.error('Failed to fetch public projects:', error);
      setError(error.response?.data?.message || 'Failed to fetch projects');
      // Even on error, set empty array to avoid crashes
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search term
  const filteredProjects = (projects || []).filter((project) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      project.title.toLowerCase().includes(search) ||
      project.abstract.toLowerCase().includes(search) ||
      (project.keywords || []).some(k => k.toLowerCase().includes(search)) ||
      project.creator?.full_name?.toLowerCase().includes(search)
    );
  });

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh',  background: designTokens.colors.primary[500] }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{  background: designTokens.colors.primary[500] }}>
        <Toolbar>
          <TVTCLogo size="medium" variant="icon" color="inherit" sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fahras - Public Project Repository
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
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

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box
          sx={{
             background: designTokens.colors.primary[500],
            borderRadius: 4,
            p: 6,
            mb: 5,
            color: 'white',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            textAlign: 'center',
          }}
        >
          <PublicIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
            Explore Graduation Projects
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, color: 'white' }}>
            Browse and discover innovative graduation projects from TVTC students
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search projects by title, keywords, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 2,
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center', p: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.dark' }}>
                {projects.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Public Projects
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center', p: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {filteredProjects.filter(p => p.status === 'completed').length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Completed Projects
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center', p: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {new Set((projects || []).map(p => p.program_id)).size}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Programs
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Projects Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Published Projects
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} 
            {searchTerm && ' matching your search'}
          </Typography>
          <Divider sx={{ mb: 4 }} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ color: 'info.dark' }} />
          </Box>
        ) : filteredProjects.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {searchTerm ? 'No projects found' : 'No public projects yet'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Public projects will appear here once students publish their work'
                }
              </Typography>
              {searchTerm && (
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  sx={{ borderColor: 'info.dark', color: 'info.dark' }}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: `1px solid ${colorPalette.border.default}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px)',
                      borderColor: colorPalette.info.dark,
                    },
                  }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <SchoolIcon sx={{ color: 'info.dark', mr: 1, mt: 0.5, fontSize: 28 }} />
                      <Typography variant="h6" component="h2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        {project.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {project.abstract.substring(0, 150)}...
                    </Typography>
                    
                    {/* Project Keywords */}
                    {project.keywords && project.keywords.length > 0 && (
                      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {project.keywords.slice(0, 3).map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: 'info.dark',
                              color: 'info.dark',
                              fontSize: '0.75rem',
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />
                    
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
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {project.creator?.full_name || 'Unknown'}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate(`/projects/${project.id}`); 
                        }}
                        sx={{ color: 'info.dark' }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Call to Action */}
        {!loading && projects.length > 0 && (
          <Box
            sx={{
              mt: 6,
              p: 4,
              borderRadius: 3,
               background: designTokens.colors.primary[500],
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
                   background: designTokens.colors.primary[500],
                  px: 4,
                }}
              >
                Register Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'info.dark',
                  color: 'info.dark',
                }}
              >
                Login
              </Button>
            </Box>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <TVTCBranding variant="footer" showDescription={true} />
    </Box>
  );
};

