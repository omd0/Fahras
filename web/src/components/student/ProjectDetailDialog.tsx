import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Project } from '../../types';

interface ProjectDetailDialogProps {
  open: boolean;
  loading: boolean;
  project: Project | null;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  t: (key: string) => string;
}

export const ProjectDetailDialog: React.FC<ProjectDetailDialogProps> = ({
  open,
  loading,
  project,
  onClose,
  getStatusColor,
  getStatusLabel,
  t,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Project Details
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          ×
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : project ? (
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  {project?.title || 'Untitled Project'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {project?.abstract || 'No description available'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={getStatusLabel(project?.status || 'draft')}
                  color={getStatusColor(project?.status || 'draft') as any}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Academic Year
                </Typography>
                <Typography variant="body1">
                  {project?.academic_year || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Semester
                </Typography>
                <Typography variant="body1">
                  {project?.semester || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Program
                </Typography>
                <Typography variant="body1">
                  {project?.program?.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1">
                  {project?.department?.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body1">
                  {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              {project?.files && project.files.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Files
                  </Typography>
                  <Stack spacing={1}>
                    {project.files.map((file, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {file?.original_filename || 'Unknown file'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({file?.size_bytes || 0} bytes)
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            {t('No project selected')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
