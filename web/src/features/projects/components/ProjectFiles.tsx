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
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { designTokens } from '@/styles/designTokens';
import { useLanguage } from '@/providers/LanguageContext';

interface ProjectFilesProps {
  project: Project;
  isProfessor: boolean;
  filesLoading: boolean;
}

export const ProjectFiles: React.FC<ProjectFilesProps> = ({
  project,
  isProfessor,
  filesLoading,
}) => {
  const { t } = useLanguage();

  const handleDownload = async (file: any) => {
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
    } catch (error: any) {
      console.error('[DEBUG] Error downloading file:', error);
      console.error('[DEBUG] Error response:', error.response?.data);
      console.error('[DEBUG] Error status:', error.response?.status);
      
      // Show user-friendly error message
      alert(`Failed to download file: ${file.original_filename}\n${error.response?.data?.message || error.message}`);
      
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
        border: `2px solid ${designTokens.colors.primary[500]}`,
        boxShadow: 'none',
        borderRadius: designTokens.radii.card,
        overflow: 'hidden',
        background: 'white',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          borderColor: designTokens.colors.primary[600],
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header with gradient background */}
        <Box 
          sx={{ 
            background: isProfessor ? professorColors.successGradient : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: 'white',
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
              <FileDownloadIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                {t('Project Files')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                {project.files?.length || 0} {project.files?.length !== 1 ? t('files') : t('file')} {t('available')}
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
              {(project.files || []).map((file) => (
                <Paper 
                  key={file.id}
                  elevation={0}
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  <ListItem sx={{ p: 2 }}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          background: isProfessor ? professorColors.successGradient : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          color: 'white',
                        }}
                      >
                        <FileDownloadIcon sx={{ fontSize: 20 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {file.original_filename}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`${(file.size_bytes / 1024).toFixed(1)} ${t('KB')}`} 
                            size="small" 
                            variant="filled"
                            sx={{ 
                              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                              color: 'text.secondary',
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
                              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                              color: 'text.secondary',
                              fontWeight: 500,
                            }}
                          />
                          <Chip 
                            label={file.mime_type} 
                            size="small" 
                            variant="filled"
                            sx={{ 
                              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                              color: 'text.secondary',
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
                                background: isProfessor ? professorColors.successGradient : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleDownload(file)}
                      sx={{ 
                        minWidth: 100,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: isProfessor ? professorColors.primaryGradient : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                        borderRadius: 1.5,
                        '&:hover': {
                          background: isProfessor ? 'linear-gradient(135deg, #003d8f 0%, #00695c 100%)' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: isProfessor ? '0 4px 12px rgba(0, 74, 173, 0.3)' : '0 4px 12px rgba(30, 58, 138, 0.3)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {t('Download')}
                    </Button>
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
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: isProfessor ? professorColors.successGradient : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white',
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
              <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                {t('No files uploaded yet')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Files uploaded during project creation will appear here')}
              </Typography>
            </Paper>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
