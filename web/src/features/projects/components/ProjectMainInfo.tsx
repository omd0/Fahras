import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { Project, User } from '@/types';
import { getStatusColor, getStatusLabel } from '@/utils/projectHelpers';
import { designTokens } from '@/styles/designTokens';
import { useLanguage } from '@/providers/LanguageContext';

interface ProjectMainInfoProps {
  project: Project;
  user: User | null;
  isProfessor: boolean;
  canEdit: boolean;
  onStatusClick?: () => void;
}

export const ProjectMainInfo: React.FC<ProjectMainInfoProps> = ({
  project,
  user,
  isProfessor,
  canEdit,
  onStatusClick,
}) => {
  const { t } = useLanguage();

  return (
    <Card
      elevation={0}
      sx={{
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
        {/* Header with solid background */}
        <Box
          sx={{
            background: designTokens.colors.secondary[700],
            color: 'white',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 1, lineHeight: 1.2, color: 'white' }}>
                {project.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusLabel(project.status)}
                  color={getStatusColor(project.status)}
                  variant="filled"
                  onClick={canEdit && onStatusClick ? onStatusClick : undefined}
                  sx={{
                    cursor: canEdit && onStatusClick ? 'pointer' : 'default',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': canEdit && onStatusClick ? {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      boxShadow: 1,
                    } : {}
                  }}
                />
                {project.admin_approval_status && (() => {
                  if (user?.roles?.some(role => role.name === 'admin') ||
                      project.created_by_user_id === user?.id) {
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
                  return null;
                })()}
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
              background: designTokens.colors.surface[50],
              border: '1px solid',
              borderColor: 'divider',
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
                background: designTokens.colors.accent[50],
                border: '1px solid',
                borderColor: 'warning.light',
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
                background: designTokens.colors.primary[50],
                border: '1px solid',
                borderColor: 'primary.light',
              }}
            >
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'text.primary' }}>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {project.keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{
                      fontWeight: 600,
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
              background: designTokens.colors.surface[50],
              border: '1px solid',
              borderColor: 'divider',
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
  );
};
