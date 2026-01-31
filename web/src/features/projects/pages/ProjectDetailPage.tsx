import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Slide,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { CommentSection } from '@/components/CommentSection';
import { RatingSection } from '@/components/RatingSection';
import { StatusSelector } from '@/components/StatusSelector';
import { ProjectExportDialog } from '@/features/projects/components/ProjectExportDialog';

import { useLanguage } from '@/providers/LanguageContext';
import { ProjectMainInfo } from '@/features/projects/components/ProjectMainInfo';
import { ProjectFiles } from '@/features/projects/components/ProjectFiles';
import { ProjectSidebar } from '@/features/projects/components/ProjectSidebar';
import { ConfirmDialog } from '@/components/shared';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export const ProjectDetailPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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

  // Listen for export and delete events from Header
  useEffect(() => {
    const handleExportEvent = () => {
      setExportDialogOpen(true);
    };

    const handleDeleteEvent = () => {
      setDeleteConfirmOpen(true);
    };

    window.addEventListener('project-export', handleExportEvent);
    window.addEventListener('project-delete', handleDeleteEvent);

    return () => {
      window.removeEventListener('project-export', handleExportEvent);
      window.removeEventListener('project-delete', handleDeleteEvent);
    };
  }, []);

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
    } catch (err: any) {
      console.error('Error fetching project:', err);
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

  const handleDelete = () => {
    if (!project) return;
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!project) return;

    setDeleting(true);
    try {
      await apiService.deleteProject(project.id);
      setDeleteConfirmOpen(false);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete project');
      setDeleteConfirmOpen(false);
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => {
              setError(null);
              setLoading(true);
              if (slug) fetchProject(slug);
            }}
          >
            {t('Retry')}
          </Button>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
          >
            {t('Back')}
          </Button>
        </Box>
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
      {/* ProjectHeader removed - all buttons (Edit, Follow & Track, Print, Delete, Hide) are now in the main Header */}

      <Slide in={true} direction="up" timeout={500} mountOnEnter>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t('Projects'), path: '/explore' },
            { label: project.title },
          ]}
        />

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ProjectMainInfo
              project={project}
              user={user}
              isProfessor={!!isProfessor}
              canEdit={!!canEdit}
              onStatusClick={() => setStatusDialogOpen(true)}
            />

            <Box sx={{ mt: 3 }}>
              <ProjectFiles
                project={project}
                isProfessor={!!isProfessor}
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

        <Grid container spacing={4} sx={{ mt: 2 }}>
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and will permanently remove all project data, files, and comments."
        confirmText="Delete Project"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        severity="error"
        loading={deleting}
      />
    </Box>
  );

  return content;
};
