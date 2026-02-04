'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Paper,
  Container,
  Grid,
  Button,
  Skeleton,
  Fade,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  DataObject as JsonIcon,
  Css as CssIcon,
  Html as HtmlIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import type { Project, ProjectFile } from '@/types';
import { apiService } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { useLanguage } from '@/providers/LanguageContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FileTreeNode {
  path: string;
  type: 'file' | 'folder';
  parent: string | null;
  children: string[];
  name: string;
  meta?: {
    size?: number;
    size_human?: string;
    modified?: string;
    mime_type?: string;
    file_id?: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFileTree(files: ProjectFile[]): Record<string, FileTreeNode> {
  const tree: Record<string, FileTreeNode> = {};

  const ensurePath = (path: string, type: 'file' | 'folder' = 'folder'): void => {
    if (tree[path]) return;

    const parts = path.split('/').filter(Boolean);
    const name = parts[parts.length - 1] || path;
    const parent = parts.length > 1 ? parts.slice(0, -1).join('/') : null;

    tree[path] = { path, type, parent, children: [], name };

    if (parent) {
      ensurePath(parent, 'folder');
      if (!tree[parent].children.includes(path)) {
        tree[parent].children.push(path);
      }
    }
  };

  (files || []).forEach((file) => {
    const filePath = file.filename || file.original_filename;
    ensurePath(filePath, 'file');

    tree[filePath] = {
      ...tree[filePath],
      meta: {
        size: file.size_bytes,
        size_human: file.size_human,
        modified: file.uploaded_at,
        mime_type: file.mime_type,
        file_id: file.id,
      },
    };
  });

  return tree;
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    py: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    md: 'Markdown',
    yml: 'YAML',
    yaml: 'YAML',
    php: 'PHP',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    sql: 'SQL',
    sh: 'Shell',
    bash: 'Shell',
    xml: 'XML',
    txt: 'Text',
    env: 'Env',
    dockerfile: 'Docker',
    gitignore: 'Git',
  };
  return languageMap[ext || ''] || 'Text';
}

function getFileIcon(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const mime = ext;

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(mime)) {
    return <ImageIcon fontSize="small" sx={{ color: '#4ecdc4' }} />;
  }
  if (mime === 'pdf') {
    return <PdfIcon fontSize="small" sx={{ color: '#e74c3c' }} />;
  }
  if (mime === 'json') {
    return <JsonIcon fontSize="small" sx={{ color: '#f1c40f' }} />;
  }
  if (mime === 'css' || mime === 'scss') {
    return <CssIcon fontSize="small" sx={{ color: '#3498db' }} />;
  }
  if (mime === 'html') {
    return <HtmlIcon fontSize="small" sx={{ color: '#e67e22' }} />;
  }
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(mime)) {
    return <TerminalIcon fontSize="small" sx={{ color: '#9b59b6' }} />;
  }
  if (mime === 'md') {
    return <DescriptionIcon fontSize="small" sx={{ color: '#1abc9c' }} />;
  }
  if (['sh', 'bash'].includes(mime)) {
    return <TerminalIcon fontSize="small" sx={{ color: '#27ae60' }} />;
  }
  return <FileIcon fontSize="small" sx={{ color: 'text.secondary' }} />;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getSortedChildren(
  tree: Record<string, FileTreeNode>,
  path: string,
): FileTreeNode[] {
  const node = tree[path];
  if (!node || node.type !== 'folder') return [];

  return (node.children || [])
    .map((childPath) => tree[childPath])
    .filter((child): child is FileTreeNode => child !== undefined)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

// ---------------------------------------------------------------------------
// FileBrowser component
// ---------------------------------------------------------------------------

function FileBrowser({
  fileTree,
  expandedPaths,
  selectedPath,
  onToggleExpand,
  onFileSelect,
  onRefresh,
  loading,
}: {
  fileTree: Record<string, FileTreeNode>;
  expandedPaths: Set<string>;
  selectedPath: string | null;
  onToggleExpand: (path: string) => void;
  onFileSelect: (path: string) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  const rootNodes = useMemo(
    () =>
      Object.values(fileTree)
        .filter((n) => !n.parent)
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        }),
    [fileTree],
  );

  const renderNode = (node: FileTreeNode, depth: number = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedPath === node.path;
    const children = node.type === 'folder' ? getSortedChildren(fileTree, node.path) : [];

    if (node.type === 'folder') {
      return (
        <Box key={node.path}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onToggleExpand(node.path)}
              selected={isSelected}
              sx={{
                py: 0.25,
                pl: 1.5 + depth * 1.5,
                minHeight: 34,
                borderRadius: 1,
                mx: 0.5,
                mb: 0.25,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': { bgcolor: 'action.selected' },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                {isExpanded ? (
                  <FolderOpenIcon fontSize="small" sx={{ color: 'primary.main' }} />
                ) : (
                  <FolderIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={node.name}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: {
                    fontWeight: isSelected ? 600 : 400,
                    fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
                    fontSize: '0.8rem',
                    letterSpacing: '-0.01em',
                  },
                }}
              />
              {children.length > 0 && (
                <Box sx={{ ml: 0.5, display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
                  {isExpanded ? (
                    <ExpandMoreIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                  )}
                </Box>
              )}
            </ListItemButton>
          </ListItem>
          {children.length > 0 && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {children.map((child) => renderNode(child, depth + 1))}
              </List>
            </Collapse>
          )}
        </Box>
      );
    }

    return (
      <ListItem key={node.path} disablePadding>
        <ListItemButton
          onClick={() => onFileSelect(node.path)}
          selected={isSelected}
          sx={{
            py: 0.25,
            pl: 1.5 + depth * 1.5,
            minHeight: 34,
            borderRadius: 1,
            mx: 0.5,
            mb: 0.25,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
              '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
              '& .MuiTypography-root': { color: 'primary.contrastText' },
            },
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            {getFileIcon(node.path)}
          </ListItemIcon>
          <ListItemText
            primary={node.name}
            secondary={node.meta?.size_human || formatFileSize(node.meta?.size)}
            primaryTypographyProps={{
              variant: 'body2',
              sx: {
                fontWeight: isSelected ? 600 : 400,
                fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '-0.01em',
              },
            }}
            secondaryTypographyProps={{
              variant: 'caption',
              sx: { fontSize: '0.65rem', opacity: 0.7 },
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const isEmpty = rootNodes.length === 0 && !loading;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 44,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.7rem',
            color: 'text.secondary',
          }}
        >
          Explorer
        </Typography>
        <Tooltip title="Refresh files">
          <IconButton size="small" onClick={onRefresh} disabled={loading}>
            <RefreshIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* File list */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 0.5 }}>
        {loading ? (
          <Box sx={{ px: 2, py: 1 }}>
            {[...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                height={28}
                sx={{ my: 0.5, borderRadius: 1 }}
                animation="wave"
              />
            ))}
          </Box>
        ) : isEmpty ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              px: 2,
              color: 'text.disabled',
            }}
          >
            <FolderIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
            <Typography variant="body2">No files found</Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {rootNodes.map((node) => renderNode(node, 0))}
          </List>
        )}
      </Box>

      {/* Footer stats */}
      {!loading && !isEmpty && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
            {Object.values(fileTree).filter((n) => n.type === 'file').length} files
            {' \u00B7 '}
            {Object.values(fileTree).filter((n) => n.type === 'folder').length} folders
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// FileContentViewer component
// ---------------------------------------------------------------------------

function FileContentViewer({
  fileTree,
  filePath,
}: {
  fileTree: Record<string, FileTreeNode>;
  filePath: string | null;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('text/plain');

  const node = filePath ? fileTree[filePath] : null;
  const language = filePath ? getLanguageFromPath(filePath) : 'Text';
  const fileId = node?.meta?.file_id;
  const fileMime = node?.meta?.mime_type || '';

  useEffect(() => {
    if (!filePath || !fileId) {
      setContent(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const blob = await apiService.downloadFile(fileId);
        if (cancelled) return;

        setMimeType(fileMime || 'text/plain');

        const isTextLike =
          fileMime.startsWith('text/') ||
          fileMime === 'application/json' ||
          fileMime === 'application/xml' ||
          fileMime === 'application/javascript' ||
          fileMime === 'application/x-php' ||
          fileMime === 'application/x-yaml' ||
          fileMime === '';

        if (isTextLike) {
          const text = await blob.text();
          if (!cancelled) setContent(text);
        } else {
          if (!cancelled) setContent(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Failed to load file content'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [filePath, fileId, fileMime]);

  const handleDownload = useCallback(async () => {
    if (!node?.meta?.file_id) return;
    try {
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
  }, [node]);

  if (!filePath) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.disabled',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 3,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CodeIcon sx={{ fontSize: 40, opacity: 0.4 }} />
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Select a file to view
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6, maxWidth: 300, textAlign: 'center' }}>
          Browse the file tree on the left and click any file to preview its contents here.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton width={200} height={24} />
        </Box>
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {[...Array(15)].map((_, i) => (
            <Skeleton
              key={i}
              width={`${60 + Math.random() * 40}%`}
              height={18}
              sx={{ my: 0.25 }}
              animation="wave"
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const isBinary =
    mimeType &&
    !mimeType.startsWith('text/') &&
    mimeType !== 'application/json' &&
    mimeType !== 'application/xml' &&
    mimeType !== 'application/javascript' &&
    mimeType !== 'application/x-php' &&
    mimeType !== 'application/x-yaml' &&
    mimeType !== '';

  if (isBinary || content === null) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getFileIcon(filePath)}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {node?.name}
            </Typography>
          </Box>
          <Tooltip title="Download file">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            color: 'text.secondary',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 2,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getFileIcon(filePath)}
          </Box>
          <Typography variant="body2">
            This file cannot be previewed in the browser.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download {node?.name}
          </Button>
        </Box>
      </Box>
    );
  }

  const lines = content.split('\n');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* File header */}
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 44,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {getFileIcon(filePath)}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
              fontSize: '0.85rem',
            }}
          >
            {node?.name}
          </Typography>
          <Chip
            label={language}
            size="small"
            variant="outlined"
            sx={{
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 600,
              borderRadius: 1,
              letterSpacing: '0.02em',
            }}
          />
          {node?.meta?.size_human && (
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
              {node.meta.size_human}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
            {lines.length} lines
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Download file">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Code content with line numbers */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        }}
      >
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace',
            fontSize: '0.8rem',
            lineHeight: 1.7,
          }}
        >
          <Box component="tbody">
            {lines.map((line, i) => (
              <Box
                component="tr"
                key={i}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box
                  component="td"
                  sx={{
                    px: 2,
                    py: 0,
                    textAlign: 'right',
                    color: 'text.disabled',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    width: 1,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    fontSize: '0.75rem',
                    opacity: 0.5,
                    verticalAlign: 'top',
                  }}
                >
                  {i + 1}
                </Box>
                <Box
                  component="td"
                  sx={{
                    px: 2,
                    py: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    verticalAlign: 'top',
                  }}
                >
                  {line || '\u00A0'}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RepositoryCodePage() {
  const [project, setProject] = useState<Project | null>(null);
  const [fileTree, setFileTree] = useState<Record<string, FileTreeNode>>({});
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { t } = useLanguage();

  const fetchData = useCallback(async (projectSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProject(projectSlug);
      const proj = response.project || response;
      setProject(proj);

      setFilesLoading(true);
      try {
        const filesResponse = await apiService.getProjectFiles(proj.id);
        const files = filesResponse.files || [];
        const tree = buildFileTree(files);
        setFileTree(tree);

        setExpandedPaths(
          new Set(
            Object.values(tree)
              .filter((n) => !n.parent && n.type === 'folder')
              .map((n) => n.path),
          ),
        );
      } catch (err: unknown) {
        console.error('Error fetching files:', err);
      } finally {
        setFilesLoading(false);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load project'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchData(slug);
    }
  }, [slug, fetchData]);

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleFileSelect = useCallback((path: string) => {
    setSelectedFilePath(path);
  }, []);

  const handleRefresh = useCallback(() => {
    if (project) {
      setFileTree({});
      setSelectedFilePath(null);
      setExpandedPaths(new Set());
      setFilesLoading(true);

      apiService
        .getProjectFiles(project.id)
        .then((res) => {
          const files = res.files || [];
          const tree = buildFileTree(files);
          setFileTree(tree);
          const rootFolders = Object.values(tree)
            .filter((n) => !n.parent && n.type === 'folder')
            .map((n) => n.path);
          setExpandedPaths(new Set(rootFolders));
        })
        .catch((err) => console.error('Refresh failed:', err))
        .finally(() => setFilesLoading(false));
    }
  }, [project]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
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
              if (slug) fetchData(slug);
            }}
          >
            {t('Retry')}
          </Button>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
            {t('Back')}
          </Button>
        </Box>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Project not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          {t('Back')}
        </Button>
      </Container>
    );
  }

  return (
    <Fade in timeout={400}>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t('Projects'), path: '/explore' },
            { label: project.title, path: `/pr/${project.slug}` },
            { label: t('Repository'), icon: <CodeIcon fontSize="small" /> },
          ]}
        />

        {/* Main layout */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            height: 'calc(100vh - 200px)',
            minHeight: 500,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2.5,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(0,0,0,0.015)',
            }}
          >
            <Tooltip title="Back to project">
              <IconButton
                size="small"
                onClick={() => router.push(`/pr/${project.slug}`)}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <CodeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {project.title}
              </Typography>
              <Chip
                label="Repository"
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              />
            </Box>

            {/* Selected file path breadcrumb */}
            {selectedFilePath && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'action.hover',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                {selectedFilePath.split('/').map((segment, i, arr) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {i > 0 && (
                      <Typography variant="caption" color="text.disabled">
                        /
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
                        fontSize: '0.7rem',
                        fontWeight: i === arr.length - 1 ? 700 : 400,
                        color: i === arr.length - 1 ? 'text.primary' : 'text.secondary',
                      }}
                    >
                      {segment}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Split pane: file browser + viewer */}
          <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Grid
              size={{ xs: 12, md: 3 }}
              sx={{
                height: '100%',
                overflow: 'hidden',
                display: { xs: selectedFilePath ? 'none' : 'block', md: 'block' },
              }}
            >
              <FileBrowser
                fileTree={fileTree}
                expandedPaths={expandedPaths}
                selectedPath={selectedFilePath}
                onToggleExpand={handleToggleExpand}
                onFileSelect={handleFileSelect}
                onRefresh={handleRefresh}
                loading={filesLoading}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 9 }}
              sx={{ height: '100%', overflow: 'hidden' }}
            >
              <FileContentViewer
                fileTree={fileTree}
                filePath={selectedFilePath}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Mobile: back to file list button */}
        {selectedFilePath && (
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 1 }}>
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => setSelectedFilePath(null)}
              variant="text"
            >
              Back to file list
            </Button>
          </Box>
        )}
      </Container>
    </Fade>
  );
}
