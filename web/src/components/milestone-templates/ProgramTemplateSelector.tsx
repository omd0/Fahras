import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Button,
  Chip,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { MilestoneTemplate, Program } from '../../types';
import { apiService } from '../../services/api';

interface ProgramTemplateSelectorProps {
  programId: number | null;
  selectedTemplateId: number | null;
  onTemplateSelect: (templateId: number | null) => void;
  onProgramSelect?: (programId: number | null) => void;
  programs?: Program[];
  onApplyTemplate?: (templateId: number, startDate: string) => Promise<void>;
}

export const ProgramTemplateSelector: React.FC<ProgramTemplateSelectorProps> = ({
  programId,
  selectedTemplateId,
  onTemplateSelect,
  onProgramSelect,
  programs = [],
  onApplyTemplate,
}) => {
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MilestoneTemplate | null>(null);

  useEffect(() => {
    if (programId) {
      loadTemplates();
    } else {
      setTemplates([]);
      setSelectedTemplate(null);
    }
  }, [programId]);

  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedTemplateId, templates]);

  const loadTemplates = async () => {
    if (!programId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMilestoneTemplates({
        program_id: programId,
      });
      setTemplates(response.templates || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId: number | '') => {
    const id = templateId === '' ? null : templateId;
    onTemplateSelect(id);
    if (id) {
      const template = templates.find(t => t.id === id);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  };

  const handleProgramChange = (newProgramId: number | '') => {
    const id = newProgramId === '' ? null : newProgramId;
    if (onProgramSelect) {
      onProgramSelect(id);
    }
    // Clear template selection when program changes
    onTemplateSelect(null);
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TimelineIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Program
          </Typography>
        </Box>

        {onProgramSelect && programs.length > 0 && (
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Program</InputLabel>
            <Select
              value={programId || ''}
              onChange={(e) => handleProgramChange(e.target.value as number | '')}
              label="Program"
            >
              {programs.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  {program.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {!programId ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please select a program first to see available program structures
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a program milestone structure to automatically create milestones for your project. 
              You can also create milestones manually later.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : templates.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No program structures available for this program. You can create milestones manually after creating the project.
              </Alert>
            ) : (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Program Structure</InputLabel>
                  <Select
                    value={selectedTemplateId || ''}
                    onChange={(e) => handleTemplateChange(e.target.value as number | '')}
                    label="Select Program Structure"
                  >
                    <MenuItem value="">
                      <em>No Program Structure (Create Manually Later)</em>
                    </MenuItem>
                    {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                        {template.is_default && (
                          <Chip label="Default" size="small" sx={{ ml: 1, height: 18 }} />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedTemplate && (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Program Structure: {selectedTemplate.name}
                      </Typography>
                      {selectedTemplate.description && (
                        <Typography variant="body2" color="text.secondary">
                          {selectedTemplate.description}
                        </Typography>
                      )}
                      {selectedTemplate.items && selectedTemplate.items.length > 0 && (
                        <Chip
                          label={`Total: ${selectedTemplate.items.reduce((sum, item) => sum + (item.estimated_days || 0), 0)} Days`}
                          color="primary"
                          variant="outlined"
                          sx={{ mt: 1, fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    {/* Horizontal Flowchart Display */}
                    <Box
                      sx={{
                        position: 'relative',
                        bgcolor: '#F5F5F5',
                        borderRadius: 2,
                        p: 3,
                        mb: 2,
                        overflowX: 'auto',
                        overflowY: 'visible',
                        backgroundImage: `
                          radial-gradient(circle, #BDBDBD 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0',
                        '&::-webkit-scrollbar': {
                          height: 8,
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#E0E0E0',
                          borderRadius: 4,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#BDBDBD',
                          borderRadius: 4,
                          '&:hover': {
                            background: '#9E9E9E',
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          minWidth: 'fit-content',
                          py: 2,
                        }}
                      >
                        {selectedTemplate.items?.map((item, index) => (
                          <React.Fragment key={item.id}>
                            {/* Milestone Node */}
                            <Card
                              sx={{
                                minWidth: 200,
                                maxWidth: 240,
                                borderRadius: 2,
                                border: '1px solid #BDBDBD',
                                bgcolor: '#FFFFFF',
                                position: 'relative',
                                transition: 'all 0.2s ease-in-out',
                                boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                                '&:hover': {
                                  boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              <CardContent sx={{ p: 2, pb: '16px !important' }}>
                                {/* Milestone Number */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  {index + 1}
                                </Box>

                                {/* Required Badge */}
                                {item.is_required && (
                                  <Chip
                                    label="Required"
                                    size="small"
                                    color="primary"
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      height: 20,
                                      fontSize: '0.65rem',
                                    }}
                                  />
                                )}

                                {/* Milestone Title */}
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 600,
                                    color: '#212121',
                                    mb: 1,
                                    pr: item.is_required ? 4 : 0,
                                    pl: 3,
                                    minHeight: 40,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {item.title}
                                </Typography>

                                {/* Estimated Days */}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: '#757575',
                                    fontWeight: 500,
                                    mt: 1,
                                  }}
                                >
                                  {item.estimated_days} Day{item.estimated_days !== 1 ? 's' : ''}
                                </Typography>

                                {/* Description */}
                                {item.description && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#9E9E9E',
                                      mt: 1,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {item.description}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>

                            {/* Arrow Connector */}
                            {index < (selectedTemplate.items?.length || 0) - 1 && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: '#BDBDBD',
                                  flexShrink: 0,
                                }}
                              >
                                <ArrowForwardIcon sx={{ fontSize: 32 }} />
                              </Box>
                            )}
                          </React.Fragment>
                        ))}
                      </Box>
                    </Box>

                    <Alert severity="info" sx={{ mt: 1 }}>
                      This program structure will be applied when you create the project. You can modify milestones later.
                    </Alert>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

