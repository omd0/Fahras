import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRepositoryStore } from '@/store/repositoryStore';
import { repositoryService } from '@/features/repository/api/repositoryApi';

interface FileBrowserProps {
  projectId: number;
  onFileSelect?: (path: string) => void;
  selectedPath?: string | null;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  projectId,
  onFileSelect,
  selectedPath,
}) => {
  const {
    fileTree,
    expandedPaths,
    selectedFilePath,
    toggleExpand,
    getChildren,
    findNode,
    setFileTree,
    selectFile,
    setProject,
  } = useRepositoryStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize project in store
  useEffect(() => {
    setProject(projectId);
  }, [projectId, setProject]);

  // Load file tree
  useEffect(() => {
    const loadFileTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const tree = await repositoryService.getFileTree(projectId);
        setFileTree(tree);
      } catch (err: unknown) {
        setError(err.message || 'Failed to load file tree');
        console.error('Failed to load file tree:', err);
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(fileTree).length === 0) {
      loadFileTree();
    }
  }, [projectId, fileTree, setFileTree]);

  // Get visible items (memoized)
  const visibleItems = useMemo(() => {
    const items: string[] = [];
    const visited = new Set<string>();

    const traverse = (path: string, level: number = 0) => {
      if (visited.has(path)) return;
      visited.add(path);

      const node = findNode(path);
      if (!node) return;

      items.push(path);

      if (node.type === 'folder' && expandedPaths.includes(path)) {
        const children = getChildren(path);
        children.forEach((child) => traverse(child.path, level + 1));
      }
    };

    // Start from root-level items
    Object.values(fileTree).forEach((node) => {
      if (!node.parent) {
        traverse(node.path);
      }
    });

    return items;
  }, [fileTree, expandedPaths, findNode, getChildren]);

  const handleFolderClick = async (path: string) => {
    const node = findNode(path);
    if (!node || node.type !== 'folder') return;

    // Check if we're expanding (before toggle)
    const wasExpanded = expandedPaths.includes(path);
    
    // Toggle expansion
    toggleExpand(path);

    // If we're now expanding (wasn't expanded before) and not loaded, load children
    if (!wasExpanded && node.loadingStatus !== 'loaded') {
      // Mark as loading
      useRepositoryStore.getState().updateFileNode(path, {
        loadingStatus: 'loading',
      });

      try {
        // For now, we'll assume all files are already loaded
        // In a real implementation, you'd fetch children here
        useRepositoryStore.getState().updateFileNode(path, {
          loadingStatus: 'loaded',
        });
       } catch (_err) {
         useRepositoryStore.getState().updateFileNode(path, {
           loadingStatus: 'error',
         });
       }
    }
  };

  const handleFileClick = (path: string) => {
    selectFile(path);
    if (onFileSelect) {
      onFileSelect(path);
    }
  };

  const renderNode = (path: string) => {
    const node = findNode(path);
    if (!node) return null;

    const isExpanded = expandedPaths.includes(path);
    const isSelected = selectedPath === path || selectedFilePath === path;
    const children = node.type === 'folder' ? getChildren(path) : [];
    const hasChildren = children.length > 0;

    if (node.type === 'folder') {
      return (
        <Box key={path}>
          <ListItem
            disablePadding
            sx={{
              pl: 2,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemButton
              onClick={() => handleFolderClick(path)}
              selected={isSelected}
              sx={{
                py: 0.5,
                minHeight: 32,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {isExpanded ? (
                  <FolderOpenIcon fontSize="small" color="primary" />
                ) : (
                  <FolderIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={node.name}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { fontWeight: isSelected ? 600 : 400 },
                }}
              />
              {hasChildren && (
                <IconButton size="small" sx={{ ml: 1 }}>
                  {isExpanded ? (
                    <ExpandMoreIcon fontSize="small" />
                  ) : (
                    <ChevronRightIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </ListItemButton>
          </ListItem>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {children.map((child) => renderNode(child.path))}
              </List>
            </Collapse>
          )}
        </Box>
      );
    }

    return (
      <ListItem
        key={path}
        disablePadding
        sx={{
          pl: 4,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemButton
          onClick={() => handleFileClick(path)}
          selected={isSelected}
          sx={{
            py: 0.5,
            minHeight: 32,
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <FileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={node.name}
            primaryTypographyProps={{
              variant: 'body2',
              sx: { fontWeight: isSelected ? 600 : 400 },
            }}
            secondary={
              node.meta?.size_human
                ? node.meta.size_human
                : node.meta?.size
                ? `${(node.meta.size / 1024).toFixed(1)} KB`
                : undefined
            }
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  if (loading && Object.keys(fileTree).length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No files found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 1 }}>
          Files
        </Typography>
        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={() => {
              setFileTree({});
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <List dense disablePadding>
        {visibleItems.map((path) => renderNode(path))}
      </List>
    </Box>
  );
};

