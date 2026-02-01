import React from 'react';
import {
  Typography,
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { CreateProjectData, Program } from '@/types';

interface ProjectBasicInfoFormProps {
  formData: CreateProjectData;
  programs: Program[];
  newKeyword: string;
  onInputChange: (field: keyof CreateProjectData, value: Record<string, unknown>) => void;
  onNewKeywordChange: (value: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (keyword: string) => void;
}

export const ProjectBasicInfoForm: React.FC<ProjectBasicInfoFormProps> = ({
  formData,
  programs,
  newKeyword,
  onInputChange,
  onNewKeywordChange,
  onAddKeyword,
  onRemoveKeyword,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddKeyword();
    }
  };

  return (
    <>
      {/* Basic Information Section */}
      <Grid size={{ xs: 12 }}>
        <Paper
          elevation={0}
          sx={(theme) => ({
            p: 5,
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
            border: `2px solid ${theme.palette.primary.main}`,
            mb: 3,
            position: 'relative',
            zIndex: 3,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.18)}`,
              transform: 'translateY(-2px)',
            }
          })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={(theme) => ({
              p: 2,
              borderRadius: 3,
              bgcolor: 'primary.main',
              mr: 3,
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
            })}>
              <SchoolIcon sx={{ color: 'primary.contrastText', fontSize: '1.8rem' }} />
            </Box>
            <Typography variant="h6" component="h2" sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '1.3rem',
            }}>
              Basic Information
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel id="program-label">Program</InputLabel>
                <Select
                  labelId="program-label"
                  value={formData.program_id}
                  label="Program"
                  onChange={(e) => onInputChange('program_id', e.target.value)}
                >
                  {(programs || []).map((program) => (
                    <MenuItem key={program.id} value={program.id}>
                      {program.name} - {program.department?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Project Title"
                value={formData.title}
                onChange={(e) => onInputChange('title', e.target.value)}
                required
                helperText="Enter a clear and descriptive title for your project"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Abstract"
                multiline
                rows={4}
                value={formData.abstract}
                onChange={(e) => onInputChange('abstract', e.target.value)}
                required
                helperText="Provide a comprehensive overview of your project's objectives, methodology, and expected outcomes"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Academic Year"
                placeholder="2024-2025"
                value={formData.academic_year}
                onChange={(e) => onInputChange('academic_year', e.target.value)}
                required
                helperText="Format: YYYY-YYYY"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel id="semester-label">Semester</InputLabel>
                <Select
                  labelId="semester-label"
                  value={formData.semester}
                  label="Semester"
                  onChange={(e) => onInputChange('semester', e.target.value)}
                >
                  <MenuItem value="fall">Fall</MenuItem>
                  <MenuItem value="spring">Spring</MenuItem>
                  <MenuItem value="summer">Summer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel id="status-label">Project Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={formData.status || 'draft'}
                  label="Project Status"
                  onChange={(e) => onInputChange('status', e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Keywords Section */}
      <Grid size={{ xs: 12 }}>
        <Paper
          elevation={0}
          sx={(theme) => ({
            p: 5,
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.12)}`,
            border: `2px solid ${theme.palette.success.main}`,
            mb: 3,
            position: 'relative',
            zIndex: 3,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: `0 12px 40px ${alpha(theme.palette.success.main, 0.18)}`,
              transform: 'translateY(-2px)',
            }
          })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={(theme) => ({
              p: 2,
              borderRadius: 3,
              bgcolor: 'success.main',
              mr: 3,
              boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.3)}`
            })}>
              <DescriptionIcon sx={{ color: 'success.contrastText', fontSize: '1.8rem' }} />
            </Box>
            <Typography variant="h6" component="h2" sx={{
              color: 'success.main',
              fontWeight: 700,
              fontSize: '1.3rem',
            }}>
              Keywords & Tags
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Keyword"
              placeholder="Add keyword"
              value={newKeyword}
              onChange={(e) => onNewKeywordChange(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="outlined"
              color="success"
              onClick={onAddKeyword}
              disabled={!newKeyword.trim()}
              startIcon={<AddIcon />}
              sx={{ fontWeight: 600 }}
            >
              Add Keyword
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {(formData.keywords || []).map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                onDelete={() => onRemoveKeyword(keyword)}
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
        </Paper>
      </Grid>
    </>
  );
};
