import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { PageTransition } from '@/components/layout/PageTransition';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { CommentSection } from '@/components/CommentSection';
import { RatingSection } from '@/components/RatingSection';
import { StatusSelector } from '@/components/StatusSelector';
import { ProjectExportDialog } from '@/features/projects/components/ProjectExportDialog';
import { professorTheme } from '@/styles/theme/professorTheme';
import { ThemeProvider } from '@mui/material/styles';
import { useLanguage } from '@/providers/LanguageContext';
import { ProjectHeader } from '@/features/projects/components/ProjectHeader';
import { ProjectMainInfo } from '@/features/projects/components/ProjectMainInfo';
import { ProjectFiles } from '@/features/projects/components/ProjectFiles';
import { ProjectSidebar } from '@/features/projects/components/ProjectSidebar';

export const ProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();


  // Check if user is a professor
  const isProfessor = user?.roles?.some(role => role.name === 'faculty');

  // Check if user can edit or delete the project
  const canEdit = user && project && (
    user.id === project.created_by_user_id ||
    user.roles?.some(role => role.name === 'admin')
  );
  const canDelete = user && project && (
    user.id === project.created_by_user_id ||
    user.roles?.some(role => role.name === 'admin')
  );

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
    if (slug) {
      fetchProject(slug);
    }
  }, [slug]);

  // Scroll to top when project details page loads or project slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const loadProjectFiles = async (projectId: number) => {
    setFilesLoading(true);
    try {
      console.log(`[DEBUG] Loading files for project ${projectId}`);
      const filesResponse = await apiService.getProjectFiles(projectId);
      console.log(`[DEBUG] Files response:`, filesResponse);
      console.log(`[DEBUG] Files array:`, filesResponse.files);
      console.log(`[DEBUG] Number of files:`, filesResponse.files?.length || 0);
      
      if (filesResponse.files && filesResponse.files.length > 0) {
        filesResponse.files.forEach((file: any, index: number) => {
          console.log(`[DEBUG] File ${index + 1}:`, {
            id: file.id,
            original_filename: file.original_filename,
            filename: file.filename,
            storage_url: file.storage_url,
            size_bytes: file.size_bytes,
            mime_type: file.mime_type,
            is_public: file.is_public,
            storage_exists: file.storage_exists,
            uploaded_at: file.uploaded_at,
            uploader: file.uploader
          });
        });
      } else {
        console.log(`[DEBUG] No files found for project ${projectId}`);
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

  const fetchProject = async (slugOrId: string | number) => {
    try {
      console.log('Fetching project:', slugOrId);
      const response = await apiService.getProject(slugOrId);
      console.log('Project response:', response);
      setProject(response.project);
      await loadProjectFiles(response.project.id);
      
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

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
        >
          {t('Back')}
        </Button>
      </Container>
    );
  }

  // Show error if project not found
  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Project not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
        >
          {t('Back')}
        </Button>
      </Container>
    );
  }

  const content = (
    <Box sx={{ flexGrow: 1 }}>
      <Fade in={true} timeout={400}>
        <Box>
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
        </Box>
      </Fade>

      <Slide in={true} direction="up" timeout={500} mountOnEnter>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ProjectMainInfo
              project={project}
              user={user}
              isProfessor={isProfessor}
              canEdit={canEdit}
              onStatusClick={() => setStatusDialogOpen(true)}
            />

            <Box sx={{ mt: 3 }}>
              <ProjectFiles
                project={project}
                isProfessor={isProfessor}
                filesLoading={filesLoading}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ProjectSidebar
              project={project}
              isProfessor={isProfessor}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <RatingSection projectId={project.id} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CommentSection projectId={project.id} />
          </Grid>
        </Grid>
        </Container>
      </Slide>

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
