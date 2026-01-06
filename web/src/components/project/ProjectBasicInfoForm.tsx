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
import {
  School as SchoolIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { CreateProjectData, Program } from '../../types';

interface ProjectBasicInfoFormProps {
  formData: CreateProjectData;
  programs: Program[];
  newKeyword: string;
  onInputChange: (field: keyof CreateProjectData, value: any) => void;
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
          sx={{
            p: 5,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
            border: '2px solid #667eea',
            mb: 3,
            position: 'relative',
            zIndex: 3,
            '&:hover': {
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.18)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mr: 3,
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
            }}>
              <SchoolIcon sx={{ color: '#FFFFFF', fontSize: '1.8rem' }} />
            </Box>
            <Typography variant="h6" component="h2" sx={{
              color: '#667eea',
              fontWeight: 700,
              fontSize: '1.3rem',
              textShadow: '0 2px 4px rgba(102, 126, 234, 0.1)'
            }}>
              Basic Information
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel id="program-label" sx={{ color: '#667eea', fontWeight: 600 }}>Program</InputLabel>
                <Select
                  labelId="program-label"
                  value={formData.program_id}
                  label="Program"
                  onChange={(e) => onInputChange('program_id', e.target.value)}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e0e7ff',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      },
                    },
                  }}
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
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#e0e7ff',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#667eea',
                    fontWeight: 600,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
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
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#e0e7ff',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#667eea',
                    fontWeight: 600,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
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
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#e0e7ff',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#667eea',
                    fontWeight: 600,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel id="semester-label" sx={{ color: '#667eea', fontWeight: 600 }}>Semester</InputLabel>
                <Select
                  labelId="semester-label"
                  value={formData.semester}
                  label="Semester"
                  onChange={(e) => onInputChange('semester', e.target.value)}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e0e7ff',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      },
                    },
                  }}
                >
                  <MenuItem value="fall">Fall</MenuItem>
                  <MenuItem value="spring">Spring</MenuItem>
                  <MenuItem value="summer">Summer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel id="status-label" sx={{ color: '#667eea', fontWeight: 600 }}>Project Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={formData.status || 'draft'}
                  label="Project Status"
                  onChange={(e) => onInputChange('status', e.target.value)}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e0e7ff',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      },
                    },
                  }}
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
          sx={{
            p: 5,
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.12)',
            border: '2px solid #22c55e',
            mb: 3,
            position: 'relative',
            zIndex: 3,
            '&:hover': {
              boxShadow: '0 12px 40px rgba(34, 197, 94, 0.18)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              mr: 3,
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
            }}>
              <DescriptionIcon sx={{ color: '#FFFFFF', fontSize: '1.8rem' }} />
            </Box>
            <Typography variant="h6" component="h2" sx={{
              color: '#22c55e',
              fontWeight: 700,
              fontSize: '1.3rem',
              textShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
            }}>
              Keywords & Tags
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Add keyword"
              value={newKeyword}
              onChange={(e) => onNewKeywordChange(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                minWidth: 200,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#dcfce7',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#22c55e',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#22c55e',
                    boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#22c55e',
                  fontWeight: 600,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#22c55e',
                },
              }}
            />
            <Button
              variant="outlined"
              onClick={onAddKeyword}
              disabled={!newKeyword.trim()}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                borderColor: '#22c55e',
                color: '#22c55e',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#16a34a',
                  backgroundColor: '#dcfce7',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                },
                '&:disabled': {
                  borderColor: '#d1d5db',
                  color: '#9ca3af',
                },
              }}
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
                sx={{
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  border: '1px solid #22c55e',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#bbf7d0',
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease-in-out',
                  },
                  '& .MuiChip-deleteIcon': {
                    color: '#16a34a',
                    '&:hover': {
                      color: '#15803d',
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Paper>
      </Grid>
    </>
  );
};
