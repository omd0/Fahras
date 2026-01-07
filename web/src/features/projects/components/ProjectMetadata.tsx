import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { Project } from '@/types';
import { StatusSelector } from '@/components/StatusSelector';
import { professorColors } from '@/styles/theme/professorTheme';
import { useLanguage } from '@/providers/LanguageContext';

interface ProjectMetadataProps {
  project: Project;
  user: any;
  isProfessor: boolean;
  canEdit: boolean;
  onStatusChange: (newStatus: string) => Promise<void>;
}

export const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  project,
  user,
  isProfessor,
  canEdit,
  onStatusChange,
}) => {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'submitted': return 'info';
      case 'under_review': return 'primary';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LEAD': return 'primary';
      case 'MEMBER': return 'secondary';
      case 'MAIN': return 'success';
      case 'CO_ADVISOR': return 'info';
      case 'REVIEWER': return 'warning';
      default: return 'default';
    }
  };

  const professorCardStyle = isProfessor ? {
    background: professorColors.backgroundGradient,
    border: `1px solid ${professorColors.border}`,
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0, 74, 173, 0.15)',
  } : {};

  const professorHeaderStyle = isProfessor ? {
    background: professorColors.primaryGradient,
    color: '#FFFFFF',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '120px',
      height: '120px',
      background: `radial-gradient(circle, rgba(78, 205, 196, 0.2) 0%, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    },
  } : {};

  const handleStatusChange = async (newStatus: string) => {
    await onStatusChange(newStatus);
    setStatusDialogOpen(false);
  };

  return (
    <>
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: isProfessor ? professorColors.border : 'divider',
          overflow: 'hidden',
          background: isProfessor ? professorColors.backgroundGradient : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: isProfessor ? '0 8px 32px rgba(0, 74, 173, 0.2)' : '0 8px 32px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          },
          ...professorCardStyle
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Header with gradient background */}
          <Box 
            sx={{ 
              background: isProfessor ? professorColors.primaryGradient : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
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
              },
              ...professorHeaderStyle
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="h4" fontWeight="700" sx={{ mb: 1, lineHeight: 1.2, color: 'white' }}>
                  {project.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={project.status.replace('_', ' ')}
                    color={getStatusColor(project.status)}
                    variant="filled"
                    onClick={canEdit ? () => setStatusDialogOpen(true) : undefined}
                    sx={{ 
                      cursor: canEdit ? 'pointer' : 'default',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': canEdit ? {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        boxShadow: 1,
                      } : {}
                    }}
                  />
                  {/* Show approval status based on user role */}
                  {project.admin_approval_status && (
                    (() => {
                      // Admin: show all statuses
                      if (user?.roles?.some((role: any) => role.name === 'admin')) {
                        return (
                          <Chip
                            label={project.admin_approval_status === 'pending' ? t('Pending Approval') : 
                                   project.admin_approval_status === 'approved' ? t('Approved') : t('Hidden')}
                            color={project.admin_approval_status === 'approved' ? 'success' : 
                                   project.admin_approval_status === 'hidden' ? 'error' : 'warning'}
                            variant="filled"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        );
                      }
                      // Project owner: show status for their own projects
                      else if (project.created_by_user_id === user?.id) {
                        return (
                          <Chip
                            label={project.admin_approval_status === 'pending' ? t('Pending Approval') : 
                                   project.admin_approval_status === 'approved' ? t('Approved') : t('Hidden')}
                            color={project.admin_approval_status === 'approved' ? 'success' : 
                                   project.admin_approval_status === 'hidden' ? 'error' : 'warning'}
                            variant="filled"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        );
                      }
                      // Reviewer and other users: don't show approval status
                      return null;
                    })()
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Project Abstract */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #059669 100%)',
                }
              }}
            >
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'text.primary' }}>
                {t('Project Abstract')}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.primary' }}>
                {project.abstract}
              </Typography>
            </Paper>

            {/* Admin Notes */}
            {project.admin_notes && (
              <Paper 
                elevation={0}
                sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1px solid',
                  borderColor: 'warning.light',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                  }
                }}
              >
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'text.primary' }}>
                  {t('Admin Notes')}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.6, color: 'text.primary' }}>
                  {project.admin_notes}
                </Typography>
                {project.approver && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontWeight: 500 }}>
                    — {project.approver.full_name} on {new Date(project.approved_at || '').toLocaleDateString()}
                  </Typography>
                )}
              </Paper>
            )}

            {/* Keywords */}
            {project.keywords && project.keywords.length > 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                  }
                }}
              >
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'text.primary' }}>
                  Keywords
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(project.keywords || []).map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      size="small"
                      color="primary"
                      variant="filled"
                      sx={{ 
                        fontWeight: 600,
                        background: isProfessor ? professorColors.primaryGradient : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            )}

            {/* Academic Information */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #059669 100%)',
                }
              }}
            >
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: 'text.primary' }}>
                Academic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                      Academic Year
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ ml: 4, fontWeight: 500 }}>
                    {project.academic_year}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                      Semester
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ ml: 4, fontWeight: 500, textTransform: 'capitalize' }}>
                    {project.semester}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </CardContent>
      </Card>

      {/* Status Selector Dialog */}
      <StatusSelector
        open={statusDialogOpen}
        currentStatus={project.status}
        onClose={() => setStatusDialogOpen(false)}
        onSave={handleStatusChange}
      />
    </>
  );
};
