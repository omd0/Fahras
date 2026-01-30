import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Chip,
  Button,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { colorPalette } from '@/styles/theme/colorPalette';

export interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface DragDropFileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  showPreview?: boolean;
  showProgress?: boolean;
  filesWithProgress?: FileWithProgress[];
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

// Animation variants
const dropZoneVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.01 },
  dragging: { scale: 1.02, borderColor: colorPalette.info.main },
};

const fileItemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    }
  },
};

const iconVariants = {
  idle: { scale: 1, rotate: 0 },
  dragging: {
    scale: 1.1,
    rotate: [0, -5, 5, -5, 0],
    transition: {
      rotate: {
        repeat: Infinity,
        duration: 0.5,
      }
    }
  },
};

export const DragDropFileUpload: React.FC<DragDropFileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSizeBytes = 50 * 1024 * 1024, // 50MB default
  acceptedTypes = [],
  disabled = false,
  showPreview = true,
  showProgress = false,
  filesWithProgress = [],
  onUploadStart,
  onUploadComplete: _onUploadComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSizeBytes)}`,
      };
    }

    // Check file type if acceptedTypes is provided
    if (acceptedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        // Handle MIME type wildcards like "image/*"
        if (type.includes('*')) {
          const [category] = type.split('/');
          return mimeType.startsWith(category + '/');
        }
        return mimeType === type.toLowerCase();
      });

      if (!isAccepted) {
        return {
          valid: false,
          error: `File "${file.name}" has unsupported type. Accepted: ${acceptedTypes.join(', ')}`,
        };
      }
    }

    return { valid: true };
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(newFiles);

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. Currently ${files.length} file(s) selected.`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        // Check for duplicates
        const isDuplicate = files.some(f => f.name === file.name && f.size === file.size);
        if (!isDuplicate) {
          validFiles.push(file);
        }
      } else {
        setError(validation.error || 'Invalid file');
        return;
      }
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
      if (onUploadStart) {
        onUploadStart();
      }
    }
  }, [files, maxFiles, onFilesChange, onUploadStart, validateFile]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    setError(null);
  }, [files, onFilesChange]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getFileWithProgress = (file: File): FileWithProgress | undefined => {
    if (!showProgress) return undefined;
    return filesWithProgress.find(f => f.file.name === file.name && f.file.size === file.size);
  };

  return (
    <Box>
      {/* Drag and Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Paper
          component={motion.div}
          variants={dropZoneVariants}
          initial="idle"
          animate={isDragging ? 'dragging' : 'idle'}
          whileHover={disabled ? {} : 'hover'}
          whileTap={disabled ? {} : { scale: 0.99 }}
          elevation={0}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 3,
            backgroundColor: isDragging ? 'action.hover' : 'background.paper',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease-in-out',
            position: 'relative',
            overflow: 'hidden',
            opacity: disabled ? 0.6 : 1,
            '&:hover': {
              borderColor: disabled ? 'divider' : 'primary.main',
              backgroundColor: disabled ? 'background.paper' : 'action.hover',
              boxShadow: disabled ? 'none' : '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
          onClick={disabled ? undefined : handleBrowseClick}
        >
          {/* Animated background effect */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at center, rgba(33, 150, 243, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <motion.div
              variants={iconVariants}
              animate={isDragging ? 'dragging' : 'idle'}
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: isDragging ? 'primary.main' : 'primary.light',
                  mx: 'auto',
                  mb: 2,
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
            </motion.div>

            <motion.div
              animate={{
                scale: isDragging ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or click to browse from your computer
              </Typography>
            </motion.div>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={`Max ${maxFiles} files`}
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
              <Chip
                size="small"
                label={`Max ${formatFileSize(maxSizeBytes)}`}
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
              {acceptedTypes.length > 0 && (
                <Chip
                  size="small"
                  label={`Accepted: ${acceptedTypes.join(', ')}`}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List Preview */}
      {showPreview && files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600">
                Selected Files ({files.length}/{maxFiles})
              </Typography>
              {files.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    onFilesChange([]);
                    setError(null);
                  }}
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All
                </Button>
              )}
            </Box>

            <List sx={{ p: 0 }}>
              <AnimatePresence mode="popLayout">
                {files.map((file, index) => {
                  const fileProgress = getFileWithProgress(file);
                  const isUploading = fileProgress?.status === 'uploading';
                  const isSuccess = fileProgress?.status === 'success';
                  const isError = fileProgress?.status === 'error';

                  return (
                    <motion.div
                      key={`${file.name}-${index}`}
                      variants={fileItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          mb: 1.5,
                          border: '1px solid',
                          borderColor: isError ? 'error.main' : isSuccess ? 'success.main' : 'divider',
                          borderRadius: 2,
                          overflow: 'hidden',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <ListItem sx={{ py: 1.5, px: 2 }}>
                          <ListItemAvatar>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: isError ? 'error.light' : isSuccess ? 'success.light' : 'primary.light'
                                }}
                              >
                                {isSuccess ? (
                                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                                ) : isError ? (
                                  <ErrorIcon sx={{ color: 'error.main' }} />
                                ) : (
                                  <AttachFileIcon sx={{ color: 'primary.main' }} />
                                )}
                              </Avatar>
                            </motion.div>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="500" noWrap>
                                {file.name}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mb: showProgress && isUploading ? 1 : 0 }}>
                                  <Chip
                                    size="small"
                                    label={formatFileSize(file.size)}
                                    sx={{ height: 20, fontSize: '0.75rem' }}
                                  />
                                  <Chip
                                    size="small"
                                    label={file.type || 'Unknown type'}
                                    sx={{ height: 20, fontSize: '0.75rem' }}
                                  />
                                  {isUploading && (
                                    <Chip
                                      size="small"
                                      label={`${fileProgress.progress}%`}
                                      color="primary"
                                      sx={{ height: 20, fontSize: '0.75rem' }}
                                    />
                                  )}
                                  {isSuccess && (
                                    <Chip
                                      size="small"
                                      label="Uploaded"
                                      color="success"
                                      sx={{ height: 20, fontSize: '0.75rem' }}
                                    />
                                  )}
                                  {isError && (
                                    <Chip
                                      size="small"
                                      label="Failed"
                                      color="error"
                                      sx={{ height: 20, fontSize: '0.75rem' }}
                                    />
                                  )}
                                </Box>
                                {showProgress && isUploading && (
                                  <motion.div
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    style={{ originX: 0 }}
                                  >
                                    <LinearProgress
                                      variant="determinate"
                                      value={fileProgress.progress}
                                      sx={{
                                        mt: 1,
                                        borderRadius: 1,
                                        height: 6,
                                      }}
                                    />
                                  </motion.div>
                                )}
                                {isError && fileProgress?.error && (
                                  <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                                    {fileProgress.error}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleRemoveFile(index)}
                                disabled={isUploading}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                  },
                                  '&:disabled': {
                                    opacity: 0.5,
                                  },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </motion.div>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Paper>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </List>
          </Box>
        </motion.div>
      )}
    </Box>
  );
};
