import React, { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProjectDetailUrl, getProjectEditUrl, getProjectFollowUrl, getProjectCodeUrl, projectRoutes, getProjectSlug } from '@/utils/projectRoutes';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { RepositoryLayout } from '@/features/repository/components/RepositoryLayout';
import { FileBrowser } from '@/features/repository/components/FileBrowser';
import { FileContentViewer } from '@/features/repository/components/FileContentViewer';
import { useRepositoryStore } from '@/store/repositoryStore';
import { Breadcrumb, BreadcrumbItem } from '@/components/shared/Breadcrumb';
import { Code as CodeIcon } from '@mui/icons-material';

export const RepositoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedFilePath, selectFile } = useRepositoryStore();

  // Extract file path from URL if present
  // URL format: /projects/:id/code/path/to/file
  const pathMatch = location.pathname.match(/\/projects\/\d+\/code\/(.+)$/);
  const urlFilePath = pathMatch ? decodeURIComponent(pathMatch[1]) : null;

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
    }
  }, [id]);

  // Sync URL file path with store
  useEffect(() => {
    if (urlFilePath && urlFilePath !== selectedFilePath) {
      selectFile(urlFilePath);
    }
  }, [urlFilePath, selectedFilePath, selectFile]);

  const fetchProject = async (projectId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProject(projectId);
      setProject(response.project || response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (path: string) => {
    selectFile(path);
    // Update URL to reflect selected file
    navigate(`/projects/${id}/code/${encodeURIComponent(path)}`, {
      replace: true,
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || 'Project not found'}</Alert>
      </Box>
    );
  }

  // Generate breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Projects', path: '/explore' },
    { label: project.title, path: getProjectDetailUrl(project) },
    { label: 'Repository', icon: <CodeIcon fontSize="small" /> },
  ];

  return (
    <RepositoryLayout project={project} onBack={handleBack}>
      <Breadcrumb items={breadcrumbItems} />
      <Grid container sx={{ height: '100%' }}>
        <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%', overflow: 'hidden' }}>
          <FileBrowser
            projectId={project.id}
            onFileSelect={handleFileSelect}
            selectedPath={selectedFilePath}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%', overflow: 'hidden' }}>
          <FileContentViewer
            projectId={project.id}
            filePath={selectedFilePath}
          />
        </Grid>
      </Grid>
    </RepositoryLayout>
  );
};



