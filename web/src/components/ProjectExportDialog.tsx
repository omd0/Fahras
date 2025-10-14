import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Slideshow as SlideshowIcon,
  CloudUpload as UploadIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { Project } from '../types';

interface ProjectExportDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

type ExportFormat = 'pdf' | 'docx' | 'pptx';
type TemplateType = 'report' | 'presentation';
type RTLOption = 'auto' | 'force' | 'ltr';

interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const templates: TemplateOption[] = [
  {
    id: 'report',
    name: 'Professional Report',
    description: 'Complete documentation format',
    icon: <DescriptionIcon sx={{ fontSize: 48 }} />,
  },
  {
    id: 'presentation',
    name: 'Presentation Slides',
    description: 'Slide-based format',
    icon: <SlideshowIcon sx={{ fontSize: 48 }} />,
  },
];

export const ProjectExportDialog: React.FC<ProjectExportDialogProps> = ({
  open,
  onClose,
  project,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('report');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [rtlOption, setRtlOption] = useState<RTLOption>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Sections to include (for basic implementation, all are enabled)
  const [includedSections] = useState({
    coverPage: true,
    abstract: true,
    keywords: true,
    teamMembers: true,
    advisors: true,
  });

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const blob = await apiService.exportProject(project.id, selectedFormat, {
        template: selectedTemplate,
        rtl: rtlOption,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const extension = selectedFormat === 'docx' ? 'docx' : selectedFormat === 'pptx' ? 'pptx' : 'pdf';
      const filename = `${project.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}.${extension}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(err.response?.data?.message || 'Failed to export document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCustom = () => {
    // This would open a file upload dialog or navigate to upload page
    // For now, just close this dialog
    alert('Upload custom file feature coming soon!');
    onClose();
  };

  const getEstimatedPages = () => {
    let pages = 2; // Cover + Abstract
    if (includedSections.teamMembers) pages += 1;
    if (includedSections.advisors && project.advisors && project.advisors.length > 0) pages += 1;
    return pages;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '600px',
        },
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Export Project Documentation
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {project.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {loading && <LinearProgress />}

        {/* Main Content */}
        <Grid container sx={{ minHeight: '500px' }}>
          {/* Left Panel - Options */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ p: 4, borderRight: { md: '1px solid #e5e7eb' } }}>
            {/* Step 1: Choose Template */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Choose Your Template
              </Typography>
              <Grid container spacing={2}>
                {templates.map((template) => (
                  <Grid size={{ xs: 6 }} key={template.id}>
                    <Card
                      onClick={() => setSelectedTemplate(template.id)}
                      sx={{
                        cursor: 'pointer',
                        border: selectedTemplate === template.id ? '3px solid #3b82f6' : '2px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      {selectedTemplate === template.id && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: '#3b82f6',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 16 }} />
                        </Box>
                      )}
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Box sx={{ color: '#3b82f6', mb: 1 }}>{template.icon}</Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Step 2: Export Format */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Export Format
              </Typography>
              <RadioGroup
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                row
                sx={{ gap: 2 }}
              >
                <Card
                  sx={{
                    flex: 1,
                    cursor: 'pointer',
                    border: selectedFormat === 'pdf' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    bgcolor: selectedFormat === 'pdf' ? '#eff6ff' : 'white',
                  }}
                  onClick={() => setSelectedFormat('pdf')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <FormControlLabel
                      value="pdf"
                      control={<Radio />}
                      label=""
                      sx={{ m: 0, mb: 1 }}
                    />
                    <PdfIcon sx={{ fontSize: 40, color: '#dc2626', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      PDF
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Best for reading
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    flex: 1,
                    cursor: 'pointer',
                    border: selectedFormat === 'docx' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    bgcolor: selectedFormat === 'docx' ? '#eff6ff' : 'white',
                  }}
                  onClick={() => setSelectedFormat('docx')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <FormControlLabel
                      value="docx"
                      control={<Radio />}
                      label=""
                      sx={{ m: 0, mb: 1 }}
                    />
                    <DescriptionIcon sx={{ fontSize: 40, color: '#2563eb', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      DOCX
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Best for editing
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    flex: 1,
                    cursor: 'pointer',
                    border: selectedFormat === 'pptx' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    bgcolor: selectedFormat === 'pptx' ? '#eff6ff' : 'white',
                  }}
                  onClick={() => setSelectedFormat('pptx')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <FormControlLabel
                      value="pptx"
                      control={<Radio />}
                      label=""
                      sx={{ m: 0, mb: 1 }}
                    />
                    <SlideshowIcon sx={{ fontSize: 40, color: '#ea580c', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      PPTX
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Best for presenting
                    </Typography>
                  </CardContent>
                </Card>
              </RadioGroup>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Step 3: Content Sections */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                What to Include
              </Typography>
              <FormGroup>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Checkbox checked disabled />
                  <Typography variant="body2">Cover Page & Title</Typography>
                  <Chip label="Included" size="small" color="success" sx={{ ml: 'auto' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Checkbox checked disabled />
                  <Typography variant="body2">Abstract & Keywords</Typography>
                  <Chip label="Included" size="small" color="success" sx={{ ml: 'auto' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Checkbox checked disabled />
                  <Typography variant="body2">Team Members</Typography>
                  <Chip label="Included" size="small" color="success" sx={{ ml: 'auto' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Checkbox checked disabled />
                  <Typography variant="body2">Project Advisors</Typography>
                  <Chip label="Included" size="small" color="success" sx={{ ml: 'auto' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, opacity: 0.5 }}>
                  <Checkbox disabled />
                  <Typography variant="body2">Extended Sections</Typography>
                  <Chip label="Coming Soon" size="small" sx={{ ml: 'auto' }} />
                </Box>
              </FormGroup>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Step 4: Language Direction */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Language Direction
              </Typography>
              <Select
                fullWidth
                value={rtlOption}
                onChange={(e) => setRtlOption(e.target.value as RTLOption)}
                size="small"
              >
                <MenuItem value="auto">Auto-detect (Recommended)</MenuItem>
                <MenuItem value="force">Force Right-to-Left (RTL)</MenuItem>
                <MenuItem value="ltr">Force Left-to-Right (LTR)</MenuItem>
              </Select>
            </Box>
          </Grid>

          {/* Right Panel - Preview */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ p: 4, bgcolor: '#f9fafb' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Preview
            </Typography>

            <Card
              sx={{
                mb: 3,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
              }}
            >
              <Box
                sx={{
                  height: 300,
                  bgcolor: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  borderRadius: 1,
                }}
              >
                <Box sx={{ textAlign: 'center', color: '#1e3a8a', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    TVTC FAHRAS
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    textAlign: 'center',
                    mb: 2,
                    px: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {project.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {project.program?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {project.academic_year} - {project.semester}
                </Typography>
              </Box>
            </Card>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={selectedFormat === 'pdf' ? <PdfIcon /> : selectedFormat === 'docx' ? <DescriptionIcon /> : <SlideshowIcon />}
                label={selectedFormat.toUpperCase()}
                color="primary"
                size="small"
              />
              <Chip label={`~${getEstimatedPages()} pages`} size="small" variant="outlined" />
              <Chip label="A4 size" size="small" variant="outlined" />
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              This is a preview. The actual document will include all formatting and branding.
            </Alert>

            {success && (
              <Alert severity="success" icon={<CheckIcon />}>
                Document exported successfully!
              </Alert>
            )}

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Grid>
        </Grid>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 3,
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'white',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleUploadCustom}
            disabled={loading}
          >
            Upload Custom File
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              px: 4,
              py: 1.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Generating...' : 'Generate Export'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

