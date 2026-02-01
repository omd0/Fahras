import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { repositoryService } from '@/features/repository/api/repositoryApi';
import { useRepositoryStore } from '@/store/repositoryStore';

interface FileContentViewerProps {
  projectId: number;
  filePath: string | null;
}

// Simple syntax highlighting for common file types
const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
  };
  return languageMap[ext || ''] || 'text';
};

export const FileContentViewer: React.FC<FileContentViewerProps> = ({
  projectId,
  filePath,
}) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('text/plain');

  const { findNode } = useRepositoryStore();

  useEffect(() => {
    if (!filePath) {
      setContent(null);
      setError(null);
      return;
    }

    const loadFileContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await repositoryService.getFileContent(
          projectId,
          filePath
        );
        setContent(response.content);
        setMimeType(response.mime_type);
      } catch (err: unknown) {
        setError(err.message || 'Failed to load file content');
        console.error('Failed to load file content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFileContent();
  }, [projectId, filePath]);

  const node = filePath ? findNode(filePath) : null;
  const language = filePath ? getLanguageFromPath(filePath) : 'text';

  const handleDownload = async () => {
    if (!filePath || !node?.meta?.file_id) return;
    try {
      const { apiService } = await import('@/lib/api');
      const blob = await apiService.downloadFile(node.meta.file_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = node.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download file:', err);
    }
  };

  if (!filePath) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
          color: 'text.secondary',
        }}
      >
        <CodeIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="body1">
          Select a file to view its contents
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Handle binary files
  if (mimeType && !mimeType.startsWith('text/') && mimeType !== 'application/json') {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          This file type cannot be displayed in the browser. Please download it
          to view.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <IconButton onClick={handleDownload}>
            <DownloadIcon />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Download {node?.name}
            </Typography>
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* File header */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {node?.name}
          </Typography>
          {language !== 'text' && (
            <Chip label={language} size="small" variant="outlined" />
          )}
          {node?.meta?.size_human && (
            <Typography variant="caption" color="text.secondary">
              {node.meta.size_human}
            </Typography>
          )}
        </Box>
        <Box>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => setContent(null)}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* File content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'grey.50',
          p: 2,
        }}
      >
        {content !== null ? (
          <Box
            component="pre"
            sx={{
              margin: 0,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <code>{content}</code>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        )}
      </Box>
    </Box>
  );
};



