'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton, useTheme } from '@mui/material';
import {
  School as SchoolIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types';
import { projectRoutes } from '@/utils/projectRoutes';
import { getStatusColor, getStatusLabel } from '@/utils/projectHelpers';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();
  const theme = useTheme();

  const handleClick = () => {
    router.push(projectRoutes.detail(project.slug));
  };

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
          borderColor: theme.palette.primary.main,
        },
      }}
      onClick={handleClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {project.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {(project.abstract || '').substring(0, 120)}
              {(project.abstract || '').length > 120 ? '...' : ''}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={getStatusLabel(project.status || 'draft')}
                color={getStatusColor(project.status || 'draft')}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                by {project.creator?.full_name || 'Unknown'}
              </Typography>
              {project.academic_year && (
                <Typography variant="caption" color="text.secondary">
                  {project.academic_year}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
            <VisibilityIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};
