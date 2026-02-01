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
import { Project, Rating, Comment, File as ProjectFile } from '@/types';
import { apiService } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';

interface ExportData {
  project: Partial<Project> & Pick<Project, 'id' | 'title'>;
  comments?: { comments: Comment[] };
  ratings?: { ratings: Rating[]; average_rating: number | null; total_ratings: number };
  files?: { files: ProjectFile[] };
}

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

  const handleOptionChange = (option: keyof ExportOptions, value: unknown) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value,
    }));
  };

  // Helper function to download a file
  const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate JSON export
  const generateJSONExport = (exportData: ExportData): string => {
    return JSON.stringify(exportData, null, 2);
  };

  // Generate HTML export
  const generateHTMLExport = (exportData: ExportData): string => {
    const { project, comments, ratings, files } = exportData;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title} - Export</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .section { margin: 20px 0; }
    .comment, .rating { border-left: 3px solid #2196F3; padding-left: 15px; margin: 10px 0; }
    .file-item { padding: 10px; background: #f9f9f9; margin: 5px 0; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${project.title}</h1>
  
  ${exportOptions.includeMetadata ? `
  <div class="metadata">
    <h2>Project Information</h2>
    <p><strong>Academic Year:</strong> ${project.academic_year}</p>
    <p><strong>Semester:</strong> ${project.semester}</p>
    <p><strong>Status:</strong> ${project.status}</p>
    <p><strong>Created:</strong> ${project.created_at ? new Date(project.created_at).toLocaleString() : 'N/A'}</p>
    ${project.program ? `<p><strong>Program:</strong> ${project.program.name}</p>` : ''}
    ${project.creator ? `<p><strong>Creator:</strong> ${project.creator.full_name}</p>` : ''}
  </div>
  ` : ''}
  
  <div class="section">
    <h2>Abstract</h2>
    <p>${project.abstract || 'No abstract available.'}</p>
  </div>
  
  ${project.keywords && project.keywords.length > 0 ? `
  <div class="section">
    <h2>Keywords</h2>
    <p>${project.keywords.join(', ')}</p>
  </div>
  ` : ''}
  
  ${exportOptions.includeRatings && ratings && ratings.ratings && ratings.ratings.length > 0 ? `
  <div class="section">
    <h2>Ratings & Reviews</h2>
    <p><strong>Average Rating:</strong> ${ratings.average_rating?.toFixed(1) || 'N/A'} (${ratings.total_ratings || 0} ratings)</p>
    ${ratings.ratings.map((rating: Rating) => `
      <div class="rating">
        <p><strong>${rating.user?.full_name || 'Anonymous'}</strong> - ${rating.rating}/5</p>
        ${rating.review ? `<p>${rating.review}</p>` : ''}
        <p><small>${new Date(rating.created_at).toLocaleString()}</small></p>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${exportOptions.includeComments && comments && comments.comments && comments.comments.length > 0 ? `
  <div class="section">
    <h2>Comments</h2>
    ${comments.comments.map((comment: Comment) => `
      <div class="comment">
        <p><strong>${comment.user?.full_name || 'Anonymous'}</strong></p>
        <p>${comment.content}</p>
        <p><small>${new Date(comment.created_at).toLocaleString()}</small></p>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${exportOptions.includeFiles && files && files.files && files.files.length > 0 ? `
  <div class="section">
    <h2>Attached Files</h2>
    ${files.files.map((file: ProjectFile) => `
      <div class="file-item">
        <p><strong>${file.original_filename}</strong></p>
        <p><small>Size: ${(file.size_bytes / 1024).toFixed(2)} KB | Type: ${file.mime_type} | Uploaded: ${new Date(file.uploaded_at).toLocaleString()}</small></p>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <hr>
  <p><small>Exported on ${new Date().toLocaleString()}</small></p>
</body>
</html>
    `;
    return html;
  };

  // Generate PDF export (basic implementation using browser print)
  const generatePDFExport = async (exportData: ExportData): Promise<void> => {
    const html = generateHTMLExport(exportData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => printWindow.close(), 100);
        }, 250);
      };
    } else {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      // Fetch project data with all related information
      const [projectData, commentsData, ratingsData, filesData] = await Promise.all([
        apiService.getProject(project.id),
        exportOptions.includeComments ? apiService.getComments(project.id).catch(() => ({ comments: [] })) : Promise.resolve({ comments: [] }),
        exportOptions.includeRatings ? apiService.getRatings(project.id).catch(() => ({ ratings: [], average_rating: null, total_ratings: 0 })) : Promise.resolve({ ratings: [], average_rating: null, total_ratings: 0 }),
        exportOptions.includeFiles ? apiService.getProjectFiles(project.id).catch(() => ({ files: [] })) : Promise.resolve({ files: [] }),
      ]);

      const fullProject = projectData.project || projectData;
      const exportData: ExportData = {
        project: exportOptions.includeMetadata ? fullProject : {
          id: fullProject.id,
          title: fullProject.title,
          abstract: fullProject.abstract,
          keywords: fullProject.keywords,
        },
      };

      if (exportOptions.includeComments) {
        exportData.comments = commentsData;
      }
      if (exportOptions.includeRatings) {
        exportData.ratings = ratingsData;
      }
      if (exportOptions.includeFiles) {
        exportData.files = filesData;
      }

      // Generate and download file based on format
      const sanitizedTitle = fullProject.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
      const timestamp = new Date().toISOString().split('T')[0];

      switch (exportOptions.format) {
        case 'json': {
          const jsonContent = generateJSONExport(exportData);
          downloadFile(jsonContent, `${sanitizedTitle}_${timestamp}.json`, 'application/json');
          break;
        }

        case 'html': {
          const htmlContent = generateHTMLExport(exportData);
          downloadFile(htmlContent, `${sanitizedTitle}_${timestamp}.html`, 'text/html');
          break;
        }

        case 'pdf':
          await generatePDFExport(exportData);
          break;

        case 'docx': {
          // DOCX requires a library, for now we'll export as HTML which can be opened in Word
          const docxContent = generateHTMLExport(exportData);
          downloadFile(docxContent, `${sanitizedTitle}_${timestamp}.html`, 'application/msword');
          break;
        }
      }

       setExportSuccess(true);
       
       // Auto-close after success
       setTimeout(() => {
         onClose();
         setExportSuccess(false);
       }, 2000);
       
     } catch (err: unknown) {
       setError(getErrorMessage(err, 'Export failed. Please try again.'));
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
