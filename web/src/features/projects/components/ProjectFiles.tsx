import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { Project, File } from '@/types';
import { apiService } from '@/lib/api';
import { getErrorMessage, getErrorResponseData, getErrorStatus } from '@/utils/errorHandling';
import { colorPalette } from '@/styles/theme/colorPalette';
import { designTokens } from '@/styles/designTokens';
import { useLanguage } from '@/providers/LanguageContext';

interface ProjectFilesProps {
  project: Project;
  _isProfessor: boolean;
  filesLoading: boolean;
}

export const ProjectFiles: React.FC<ProjectFilesProps> = ({
  project,
  _isProfessor,
  filesLoading,
}) => {
  const { t } = useLanguage();

  const handleDownload = async (file: File) => {
    try {
      console.log(`[DEBUG] Starting download for file:`, {
        id: file.id,
        original_filename: file.original_filename,
        storage_url: file.storage_url,
        size_bytes: file.size_bytes,
        storage_exists: file.storage_exists
      });
      
      // Use the API service to download the file
      const blob = await apiService.downloadFile(file.id);
      
      console.log(`[DEBUG] Blob received:`, {
        size: blob.size,
        type: blob.type
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`[DEBUG] File download completed: ${file.original_filename}`);
     } catch (error: unknown) {
       console.error('[DEBUG] Error downloading file:', error);
        console.error('[DEBUG] Error response:', getErrorResponseData(error));
        console.error('[DEBUG] Error status:', getErrorStatus(error));
       
       // Show user-friendly error message
       alert(`Failed to download file: ${file.original_filename}\n${getErrorMessage(error, 'Unknown error')}`);
       
       // Fallback to opening the public URL or storage URL
       if (file.public_url || file.storage_url) {
         console.log('[DEBUG] Attempting fallback download');
         window.open(file.public_url || file.storage_url, '_blank');
       }
     }
  };

  return (
    <Card
      elevation={0}
      sx={{
        mt: 3,
        border: `1px solid ${colorPalette.border.default}`,
        boxShadow: designTokens.shadows.elevation1,
        borderRadius: designTokens.radii.card,
        overflow: 'hidden',
        background: colorPalette.surface.paper,
        transition: designTokens.transitions.hover,
        '&:hover': {
          boxShadow: designTokens.shadows.elevation2,
          borderColor: colorPalette.primary.main,
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box 
          sx={{ 
            background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
            color: colorPalette.common.white,
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CloudDownloadIcon sx={{ fontSize: 28, color: colorPalette.common.white }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5, color: colorPalette.common.white }}>
                {t('Project Files')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: colorPalette.common.white }}>
                {project.files?.length || 0} {(project.files?.length || 0) !== 1 ? t('files') : t('file')} {t('available')}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {filesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : project.files && project.files.length > 0 ? (
            <List sx={{ p: 0 }}>
              {(project.files || []).map((file: File) => (
                <Paper 
                  key={file.id}
                  elevation={0}
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    border: `1px solid ${colorPalette.border.default}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: designTokens.transitions.hover,
                    '&:hover': {
                      boxShadow: designTokens.shadows.elevation2,
                      transform: 'translateY(-2px)',
                      borderColor: colorPalette.primary.main,
                      '& .download-btn': {
                        background: colorPalette.primary.dark,
                        transform: 'scale(1.05)',
                      },
                    }
                  }}
                  onClick={() => handleDownload(file)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t('Download')} ${file.original_filename}`}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDownload(file);
                    }
                  }}
                >
                  <ListItem sx={{ p: 2 }}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
                          color: colorPalette.common.white,
                        }}
                      >
                        <FileDownloadIcon sx={{ fontSize: 20 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colorPalette.text.primary }}>
                          {file.original_filename}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`${(file.size_bytes / 1024).toFixed(1)} ${t('KB')}`} 
                            size="small" 
                            variant="filled"
                            sx={{ 
                              background: colorPalette.surface.sunken,
                              color: colorPalette.text.secondary,
                              fontWeight: 500,
                            }}
                          />
                          <Chip 
                            label={new Date(file.uploaded_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })} 
                            size="small" 
                            variant="filled"
                            sx={{ 
                              background: colorPalette.surface.sunken,
                              color: colorPalette.text.secondary,
                              fontWeight: 500,
                            }}
                          />
                          <Chip 
                            label={file.mime_type} 
                            size="small" 
                            variant="filled"
                            sx={{ 
                              background: colorPalette.surface.sunken,
                              color: colorPalette.text.secondary,
                              fontWeight: 500,
                            }}
                          />
                          {file.is_public && (
                            <Chip 
                              label={t('Public')} 
                              size="small" 
                              color="success" 
                              variant="filled"
                              sx={{ 
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <Tooltip title={`${t('Download')} ${file.original_filename}`}>
                      <Button
                        className="download-btn"
                        variant="contained"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        aria-label={`${t('Download')} ${file.original_filename}`}
                        sx={{ 
                          minWidth: 120,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: colorPalette.primary.main,
                          color: colorPalette.common.white,
                          borderRadius: 1.5,
                          boxShadow: `0 2px 8px ${colorPalette.shadow.light}`,
                          '&:hover': {
                            background: colorPalette.primary.dark,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${colorPalette.shadow.medium}`,
                          },
                          transition: designTokens.transitions.hover,
                        }}
                      >
                        {t('Download')}
                      </Button>
                    </Tooltip>
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Paper 
              elevation={0}
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.surface.sunken} 100%)`,
                border: `2px dashed ${colorPalette.border.default}`,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
                  color: colorPalette.common.white,
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <FileDownloadIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 1, color: colorPalette.text.primary }}>
                {t('No files uploaded yet')}
              </Typography>
              <Typography variant="body2" sx={{ color: colorPalette.text.secondary }}>
                {t('Files uploaded during project creation will appear here')}
              </Typography>
            </Paper>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
