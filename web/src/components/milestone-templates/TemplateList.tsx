import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Grid,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { MilestoneTemplate, Program, Department } from '../../types';

interface TemplateListProps {
  templates: MilestoneTemplate[];
  programs: Program[];
  departments: Department[];
  onEdit: (template: MilestoneTemplate) => void;
  onDelete: (templateId: number) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  programs,
  departments,
  onEdit,
  onDelete,
}) => {
  const getProgramName = (programId?: number): string => {
    if (!programId) return 'All Programs';
    const program = programs.find(p => p.id === programId);
    return program?.name || 'Unknown';
  };

  const getDepartmentName = (departmentId?: number): string => {
    if (!departmentId) return 'All Departments';
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || 'Unknown';
  };

  if (templates.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No Programs Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first program to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={template.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {template.name}
                  </Typography>
                  {template.is_default && (
                    <Chip
                      label="Default"
                      size="small"
                      color="primary"
                      sx={{ mb: 1, height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit Template">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(template)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Template">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(template.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {template.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  {template.description}
                </Typography>
              )}

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Program: {getProgramName(template.program_id)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Department: {getDepartmentName(template.department_id)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {template.items?.length || 0} Milestone{template.items?.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

