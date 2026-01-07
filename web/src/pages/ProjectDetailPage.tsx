import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Project } from '../types';
import { apiService } from '../services/api';
import { CommentSection } from '../components/CommentSection';
import { RatingSection } from '../components/RatingSection';
import { ProjectExportDialog } from '../components/ProjectExportDialog';
import { professorTheme, professorColors } from '../theme/professorTheme';
import { ThemeProvider } from '@mui/material/styles';
import { useLanguage } from '../contexts/LanguageContext';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { ProjectMetadata } from '../components/project/ProjectMetadata';
import { ProjectFiles } from '../components/project/ProjectFiles';
import { ProjectSidebar } from '../components/project/ProjectSidebar';

export const ProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  
  // Check if user is a professor
  const isProfessor = user?.roles?.some(role => role.name === 'faculty');

  const handleBackClick = () => {
    // Go back to the previous page or to dashboard if no history
    if (location.state?.from) {
      // If coming from notifications, go back to notifications
      if (location.state.from === '/notifications') {
        navigate('/notifications');
      } else {
        navigate(-1);
      }
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
    }
  }, [id]);

  // Scroll to top when project details page loads or project ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const loadProjectFiles = async (projectId: number) => {
    setFilesLoading(true);
    try {
      const filesResponse = await apiService.getProjectFiles(projectId);

      if (filesResponse.files && filesResponse.files.length > 0) {
        filesResponse.files.forEach((file: any, index: number) => {
          // File loaded
        });
      }
      
      setProject(prev => prev ? { ...prev, files: filesResponse.files || [] } : prev);
    } catch (error: any) {
      console.error('[DEBUG] Error fetching project files:', error);
      console.error('[DEBUG] Error response:', error.response?.data);
      console.error('[DEBUG] Error status:', error.response?.status);
      console.error('[DEBUG] Full error:', error);
    } finally {
      setFilesLoading(false);
    }
  };

  const fetchProject = async (projectId: number) => {
    try {
      const response = await apiService.getProject(projectId);
      setProject(response.project);
      await loadProjectFiles(projectId);
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
          {error || t('Project not found')}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          {t('Back to Dashboard')}
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
          {t('This project is not available for viewing.')}
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

  // Additional null check to prevent errors
  if (!project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const canEdit = user?.id === project.created_by_user_id && !user?.roles?.some(role => role.name === 'reviewer');
  const canDelete = user?.id === project.created_by_user_id && !user?.roles?.some(role => role.name === 'reviewer');

  const professorCardStyle = isProfessor ? {
    background: professorColors.backgroundGradient,
    border: `1px solid ${professorColors.border}`,
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0, 74, 173, 0.15)',
  } : {};

  const content = (
    <Box sx={{ flexGrow: 1 }}>
      <ProjectHeader
        project={project}
        user={user}
        isProfessor={isProfessor}
        canEdit={canEdit}
        canDelete={canDelete}
        deleting={deleting}
        onBackClick={handleBackClick}
        onDelete={handleDelete}
        onExport={() => setExportDialogOpen(true)}
        onRefreshProject={() => fetchProject(project.id)}
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Main Project Information */}
          <Grid size={{ xs: 12, md: 8 }}>
            <ProjectMetadata
              project={project}
              user={user}
              isProfessor={isProfessor}
              canEdit={canEdit}
              onStatusChange={handleStatusChange}
            />

            <ProjectFiles
              project={project}
              isProfessor={isProfessor}
              filesLoading={filesLoading}
            />
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ProjectSidebar
              project={project}
              isProfessor={isProfessor}
              getRoleColor={getRoleColor}
              professorCardStyle={professorCardStyle}
            />
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

  // Wrap with professor theme if user is a professor
  if (isProfessor) {
    return (
      <ThemeProvider theme={professorTheme}>
        {content}
      </ThemeProvider>
    );
  }

  return content;
};
