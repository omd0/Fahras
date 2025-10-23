import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Approval as ApprovalIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { Project } from '../types';
import { TVTCLogo } from '../components/TVTCLogo';
import { getDashboardTheme } from '../config/dashboardThemes';

export const ApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const dashboardTheme = getDashboardTheme(user?.roles);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'hide'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [projectStatus, setProjectStatus] = useState<string>('submitted');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (user && !user.roles?.some(role => role.name === 'admin')) {
      navigate('/dashboard');
    } else {
      fetchPendingProjects();
    }
  }, [user, navigate]);

  const fetchPendingProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingApprovals();
      setProjects(response?.projects || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch pending approvals:', err);
      setError(err.response?.data?.message || 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprovalDialog = (project: Project, action: 'approve' | 'hide') => {
    setSelectedProject(project);
    setApprovalAction(action);
    setAdminNotes('');
    setProjectStatus(project.status);
    setApprovalDialogOpen(true);
  };

  const handleCloseApprovalDialog = () => {
    if (!processing) {
      setApprovalDialogOpen(false);
      setSelectedProject(null);
      setAdminNotes('');
      setProjectStatus('submitted');
    }
  };

  const handleApprovalSubmit = async () => {
    if (!selectedProject) return;

    setProcessing(true);
    try {
      if (approvalAction === 'approve') {
        await apiService.approveProject(selectedProject.id, {
          admin_notes: adminNotes,
          status: projectStatus,
        });
      } else {
        await apiService.hideProject(selectedProject.id, {
          admin_notes: adminNotes,
        });
      }
      
      // Refresh the list
      await fetchPendingProjects();
      handleCloseApprovalDialog();
    } catch (err: any) {
      console.error('Failed to process approval:', err);
      setError(err.response?.data?.message || 'Failed to process approval');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'submitted': return 'info';
      case 'under_review': return 'primary';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static"
        sx={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: '#000000',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TVTCLogo size="small" variant="icon" color="inherit" sx={{ mr: 1 }} />
          <ApprovalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#000000' }}>
            Project Approvals
          </Typography>
          <Chip 
            label={`${projects.length} Pending`} 
            color="warning" 
            variant="filled"
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography variant="h4" gutterBottom>
          Pending Project Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Review and approve or hide projects. You can also set the project status when approving.
        </Typography>
        
        {projects.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ApprovalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Pending Approvals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All projects have been reviewed.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {(projects || []).map((project) => (
              <Card key={project.id} sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" component="h2">
                          {project.title || 'Untitled Project'}
                        </Typography>
                        <Chip
                          label={(project.status || 'unknown').replace('_', ' ')}
                          color={getStatusColor(project.status || 'unknown')}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {(project.abstract || '').length > 200 
                          ? `${(project.abstract || '').substring(0, 200)}...` 
                          : (project.abstract || '')}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {project.program?.name && (
                          <Chip 
                            label={project.program.name} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                        <Chip 
                          label={`${project.academic_year || 'N/A'} - ${project.semester || 'N/A'}`} 
                          size="small" 
                          variant="outlined"
                        />
                        {project.creator?.full_name && (
                          <Chip 
                            label={`By: ${project.creator.full_name}`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>

                      {(project.keywords || []).length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {(project.keywords || []).slice(0, 5).map((keyword, idx) => (
                            <Chip 
                              key={idx}
                              label={keyword} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                          {(project.keywords || []).length > 5 && (
                            <Chip 
                              label={`+${(project.keywords || []).length - 5} more`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1,
                        height: '100%',
                        justifyContent: 'center'
                      }}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleOpenApprovalDialog(project, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<VisibilityOffIcon />}
                          onClick={() => handleOpenApprovalDialog(project, 'hide')}
                        >
                          Hide
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      {/* Approval Dialog */}
      <Dialog 
        open={approvalDialogOpen} 
        onClose={handleCloseApprovalDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalAction === 'approve' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" />
              Approve Project
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VisibilityOffIcon color="error" />
              Hide Project
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {selectedProject.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                By: {selectedProject.creator?.full_name}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {approvalAction === 'approve' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Set Project Status</InputLabel>
                  <Select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value)}
                    label="Set Project Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    This will set the project status when approving it.
                  </Typography>
                </FormControl>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label={approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Hide Reason (Optional)'}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  approvalAction === 'approve'
                    ? 'Add any notes or feedback for the project creator...'
                    : 'Explain why this project is being hidden...'
                }
                helperText={
                  approvalAction === 'approve'
                    ? 'These notes will be visible to the project creator.'
                    : 'The creator will be notified about the hidden status.'
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApprovalDialog} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleApprovalSubmit}
            variant="contained"
            color={approvalAction === 'approve' ? 'success' : 'error'}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : (
              approvalAction === 'approve' ? <CheckCircleIcon /> : <CancelIcon />
            )}
          >
            {processing 
              ? 'Processing...' 
              : approvalAction === 'approve' 
                ? 'Approve Project' 
                : 'Hide Project'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
