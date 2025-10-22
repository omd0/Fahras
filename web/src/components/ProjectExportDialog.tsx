import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Project } from '../types';

interface ProjectExportDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

interface ExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'json';
  includeImages: boolean;
  includeComments: boolean;
  includeRatings: boolean;
  includeFiles: boolean;
  includeMetadata: boolean;
}

const formatOptions = [
  { value: 'pdf', label: 'PDF Document', icon: <PdfIcon />, description: 'Professional PDF with formatting' },
  { value: 'docx', label: 'Word Document', icon: <DocIcon />, description: 'Editable Word document' },
  { value: 'html', label: 'HTML Page', icon: <CodeIcon />, description: 'Web page format' },
  { value: 'json', label: 'JSON Data', icon: <CodeIcon />, description: 'Raw data export' },
];

export const ProjectExportDialog: React.FC<ProjectExportDialogProps> = ({
  open,
  onClose,
  project,
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeImages: true,
    includeComments: true,
    includeRatings: true,
    includeFiles: true,
    includeMetadata: true,
  });

  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (option: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call an API endpoint
      // const response = await apiService.exportProject(project.id, exportOptions);
      
      setExportSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getSelectedFormat = () => {
    return formatOptions.find(option => option.value === exportOptions.format);
  };

  const resetOptions = () => {
    setExportOptions({
      format: 'pdf',
      includeImages: true,
      includeComments: true,
      includeRatings: true,
      includeFiles: true,
      includeMetadata: true,
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon color="primary" />
          <Typography variant="h6">Export Project</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Export "{project?.title}" in your preferred format
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {exportSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon />
              <Typography variant="body2">
                Export completed successfully! Your file is ready for download.
              </Typography>
            </Box>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Format Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Export Format
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={exportOptions.format}
              onChange={(e) => handleOptionChange('format', e.target.value)}
              label="Format"
            >
              {formatOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    {option.icon}
                    <Box>
                      <Typography variant="body1">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Content Options */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Include Content
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <ImageIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Project Images" 
                secondary="Include all project images and media"
              />
              <Checkbox
                checked={exportOptions.includeImages}
                onChange={(e) => handleOptionChange('includeImages', e.target.checked)}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CodeIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Comments" 
                secondary="Include all comments and discussions"
              />
              <Checkbox
                checked={exportOptions.includeComments}
                onChange={(e) => handleOptionChange('includeComments', e.target.checked)}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Ratings & Reviews" 
                secondary="Include ratings and evaluation data"
              />
              <Checkbox
                checked={exportOptions.includeRatings}
                onChange={(e) => handleOptionChange('includeRatings', e.target.checked)}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <DownloadIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Attached Files" 
                secondary="Include all project attachments"
              />
              <Checkbox
                checked={exportOptions.includeFiles}
                onChange={(e) => handleOptionChange('includeFiles', e.target.checked)}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CodeIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Metadata" 
                secondary="Include project metadata and timestamps"
              />
              <Checkbox
                checked={exportOptions.includeMetadata}
                onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
              />
            </ListItem>
          </List>
        </Box>

        {/* Export Summary */}
        <Box sx={{ 
          backgroundColor: 'grey.50', 
          p: 2, 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="subtitle2" gutterBottom>
            Export Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={getSelectedFormat()?.label} 
              size="small" 
              color="primary" 
              icon={getSelectedFormat()?.icon}
            />
            {exportOptions.includeImages && <Chip label="Images" size="small" />}
            {exportOptions.includeComments && <Chip label="Comments" size="small" />}
            {exportOptions.includeRatings && <Chip label="Ratings" size="small" />}
            {exportOptions.includeFiles && <Chip label="Files" size="small" />}
            {exportOptions.includeMetadata && <Chip label="Metadata" size="small" />}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          onClick={resetOptions} 
          disabled={exporting}
          color="inherit"
        >
          Reset
        </Button>
        <Button 
          onClick={onClose} 
          disabled={exporting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={exporting}
          startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
        >
          {exporting ? 'Exporting...' : 'Export Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
