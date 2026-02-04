'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Slide,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import type { Project } from '@/types';
import { apiService } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';
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

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { t } = useLanguage();

  const isProfessor = user?.roles?.some(role => role.name === 'faculty');

  const canEdit = user && project && (
    user.id === project.created_by_user_id ||
    user.roles?.some(role => role.name === 'admin')
  );

  const handleBackClick = useCallback(() => {
    const from = searchParams.get('from');
    if (from) {
      if (from === '/notifications') {
        router.push('/notifications');
      } else {
        router.back();
      }
    } else {
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  const loadProjectFiles = useCallback(async (projectId: number) => {
    setFilesLoading(true);
    try {
      const filesResponse = await apiService.getProjectFiles(projectId);
      setProject(prev => prev ? { ...prev, files: filesResponse.files || [] } : prev);
    } catch (err: unknown) {
      console.error('Error fetching project files:', err);
    } finally {
      setFilesLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (slugOrId: string | number) => {
    try {
      const response = await apiService.getProject(String(slugOrId));
      setProject(response.project);
      await loadProjectFiles(response.project.id);
    } catch (err: unknown) {
      console.error('Error fetching project:', err);
      const msg = getErrorMessage(err, 'Failed to fetch project.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [loadProjectFiles]);

  useEffect(() => {
    if (slug) {
      fetchProject(slug);
    }
  }, [slug, fetchProject]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

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

  const handleConfirmDelete = async () => {
    if (!project) return;

    setDeleting(true);
    try {
      await apiService.deleteProject(project.id);
      setDeleteConfirmOpen(false);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete project'));
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;

    await apiService.updateProject(project.id, { status: newStatus as Project['status'] });
    await fetchProject(project.id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Slide in={true} direction="up" timeout={500} mountOnEnter>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                _isProfessor={!!isProfessor}
                canEdit={!!canEdit}
                onStatusClick={() => setStatusDialogOpen(true)}
              />

              <Box sx={{ mt: 3 }}>
                <ProjectFiles
                  project={project}
                  _isProfessor={!!isProfessor}
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

      <StatusSelector
        open={statusDialogOpen}
        currentStatus={project.status}
        onClose={() => setStatusDialogOpen(false)}
        onSave={handleStatusChange}
      />

      <ProjectExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        project={project}
      />

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
}
