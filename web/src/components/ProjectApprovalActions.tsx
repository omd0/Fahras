import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  VisibilityOff as HideIcon,
  EditNote as NotesIcon,
} from '@mui/icons-material';
import { Project } from '../types';
import { apiService } from '../services/api';

interface ProjectApprovalActionsProps {
  project: Project;
  onActionComplete: () => void;
  disabled?: boolean;
}

const ProjectApprovalActions: React.FC<ProjectApprovalActionsProps> = ({
  project,
  onActionComplete,
  disabled = false,
}) => {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.approveProject(project.id, adminNotes);
      setApproveDialogOpen(false);
      setAdminNotes('');
      onActionComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve project');
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.hideProject(project.id, adminNotes);
      setHideDialogOpen(false);
      setAdminNotes('');
      onActionComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to hide project');
    } finally {
      setLoading(false);
    }
  };

  const getApprovalStatusChip = () => {
    switch (project.admin_approval_status) {
      case 'approved':
        return (
          <Chip
            icon={<ApproveIcon />}
            label="Approved"
            color="success"
            variant="filled"
            size="small"
          />
        );
      case 'hidden':
        return (
          <Chip
            icon={<HideIcon />}
            label="Hidden"
            color="error"
            variant="filled"
            size="small"
          />
        );
      case 'pending':
      default:
        return (
          <Chip
            label="Pending"
            color="warning"
            variant="filled"
            size="small"
          />
        );
    }
  };

  const canTakeAction = project.admin_approval_status === 'pending';

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Approval Status:
        </Typography>
        {getApprovalStatusChip()}
      </Box>

      {canTakeAction && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => setApproveDialogOpen(true)}
            disabled={disabled || loading}
            size="small"
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<HideIcon />}
            onClick={() => setHideDialogOpen(true)}
            disabled={disabled || loading}
            size="small"
          >
            Hide
          </Button>
        </Box>
      )}

      {project.admin_notes && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Admin Notes:
          </Typography>
          <Typography variant="body2" sx={{ 
            p: 1, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            fontStyle: 'italic'
          }}>
            {project.admin_notes}
          </Typography>
        </Box>
      )}

      {project.approver && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {project.admin_approval_status === 'approved' ? 'Approved' : 'Hidden'} by{' '}
            {project.approver.full_name} on{' '}
            {new Date(project.approved_at || '').toLocaleDateString()}
          </Typography>
        </Box>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ApproveIcon color="success" />
            Approve Project
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to approve "{project.title}"? This will make it visible to everyone.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Admin Notes (Optional)"
            multiline
            rows={3}
            fullWidth
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes about this approval..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setApproveDialogOpen(false);
              setAdminNotes('');
              setError(null);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={loading}
            startIcon={loading ? null : <ApproveIcon />}
          >
            {loading ? 'Approving...' : 'Approve Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hide Dialog */}
      <Dialog
        open={hideDialogOpen}
        onClose={() => setHideDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HideIcon color="error" />
            Hide Project
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to hide "{project.title}"? This will remove it from public view.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Admin Notes (Optional)"
            multiline
            rows={3}
            fullWidth
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes about hiding this project..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setHideDialogOpen(false);
              setAdminNotes('');
              setError(null);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleHide}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? null : <HideIcon />}
          >
            {loading ? 'Hiding...' : 'Hide Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectApprovalActions;
