'use client';

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
  Label as LabelIcon,
} from '@mui/icons-material';
import type { Project, User } from '@/types';
import { getStatusColor, getStatusLabel } from '@/utils/projectHelpers';
import { colorPalette } from '@/styles/theme/colorPalette';
import { designTokens } from '@/styles/designTokens';
import { useLanguage } from '@/providers/LanguageContext';

interface ProjectMainInfoProps {
  project: Project;
  user: User | null;
  _isProfessor: boolean;
  canEdit: boolean;
  onStatusClick?: () => void;
}

export const ProjectMainInfo: React.FC<ProjectMainInfoProps> = ({
  project,
  user,
  canEdit,
  onStatusClick,
}) => {
  const { t } = useLanguage();

  return (
    <Card
      elevation={0}
      sx={{
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
            background: `linear-gradient(135deg, ${colorPalette.secondary.dark} 0%, ${colorPalette.secondary.main} 100%)`,
            color: colorPalette.common.white,
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography
                variant="h4"
                fontWeight="700"
                sx={{
                  mb: 1.5,
                  lineHeight: 1.2,
                  color: colorPalette.common.white,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                {project.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusLabel(project.status)}
                  color={getStatusColor(project.status)}
                  variant="filled"
                  onClick={canEdit && onStatusClick ? onStatusClick : undefined}
                  aria-label={`${t('Project status')}: ${getStatusLabel(project.status)}`}
                  sx={{
                    cursor: canEdit && onStatusClick ? 'pointer' : 'default',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: colorPalette.common.white,
                    '&:hover': canEdit && onStatusClick ? {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      boxShadow: 1,
                    } : {}
                  }}
                />
                {project.admin_approval_status && (() => {
                  if (user?.roles?.some((role: { name: string }) => role.name === 'admin') ||
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

        <Box sx={{ p: { xs: 2.5, sm: 3.5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              background: colorPalette.surface.elevated,
              border: `1px solid ${colorPalette.border.default}`,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{
                mb: 2,
                color: colorPalette.text.primary,
                fontSize: '1.1rem',
                letterSpacing: '-0.01em',
              }}
            >
              {t('Project Abstract')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                color: colorPalette.text.primary,
                fontSize: '0.95rem',
              }}
            >
              {project.abstract}
            </Typography>
          </Paper>

          {project.admin_notes && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: colorPalette.warning.lighter,
                border: `1px solid ${colorPalette.warning.light}`,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="700"
                sx={{
                  mb: 2,
                  color: colorPalette.text.primary,
                  fontSize: '1.1rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('Admin Notes')}
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.6, color: colorPalette.text.primary }}>
                {project.admin_notes}
              </Typography>
              {project.approver && (
                <Typography variant="caption" sx={{ mt: 2, display: 'block', fontWeight: 500, color: colorPalette.text.secondary }}>
                  — {project.approver.full_name} on {new Date(project.approved_at || '').toLocaleDateString()}
                </Typography>
              )}
            </Paper>
          )}

          {project.keywords && project.keywords.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: colorPalette.primary.lighter,
                border: `1px solid ${colorPalette.primary.light}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LabelIcon sx={{ fontSize: 20, color: colorPalette.primary.dark }} />
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{
                    color: colorPalette.text.primary,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {t('Keywords')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(project.keywords || []).map((keyword: string, index: number) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      borderColor: colorPalette.primary.main,
                      color: colorPalette.primary.dark,
                      backgroundColor: colorPalette.common.white,
                      '&:hover': {
                        backgroundColor: colorPalette.primary.main,
                        color: colorPalette.common.white,
                      },
                      transition: designTokens.transitions.micro,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              background: colorPalette.surface.elevated,
              border: `1px solid ${colorPalette.border.default}`,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{
                mb: 3,
                color: colorPalette.text.primary,
                fontSize: '1.1rem',
                letterSpacing: '-0.01em',
              }}
            >
              {t('Academic Information')}
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <CalendarIcon sx={{ mr: 1.5, color: colorPalette.primary.main, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                    {t('Academic Year')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4.5, fontWeight: 600, color: colorPalette.text.primary }}>
                  {project.academic_year}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <SchoolIcon sx={{ mr: 1.5, color: colorPalette.primary.main, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                    {t('Semester')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4.5, fontWeight: 600, color: colorPalette.text.primary, textTransform: 'capitalize' }}>
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
