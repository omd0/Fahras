import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  ToggleOn as ToggleIcon,
} from '@mui/icons-material';
import { Project } from '@/types';
import { apiService } from '@/lib/api';

interface ProjectVisibilityToggleProps {
  project: Project;
  onToggleComplete: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'icon';
}

const ProjectVisibilityToggle: React.FC<ProjectVisibilityToggleProps> = ({
  project,
  onToggleComplete,
  size = 'small',
  variant = 'button',
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHidden = project.admin_approval_status === 'hidden';
  const isApproved = project.admin_approval_status === 'approved';

  const handleToggle = () => {
    setDialogOpen(true);
    setError(null);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await apiService.toggleProjectVisibility(project.id, adminNotes);
      setDialogOpen(false);
      setAdminNotes('');
      onToggleComplete();
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to toggle project visibility');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setAdminNotes('');
    setError(null);
  };

  const getButtonText = () => {
    if (isHidden) return 'Show Project';
    if (isApproved) return 'Hide Project';
    return 'Toggle Visibility';
  };

  const getButtonIcon = () => {
    if (isHidden) return <ShowIcon />;
    if (isApproved) return <HideIcon />;
    return <ToggleIcon />;
  };

  const getButtonColor = () => {
    if (isHidden) return 'success';
    if (isApproved) return 'error';
    return 'primary';
  };

  const getDialogTitle = () => {
    if (isHidden) return 'Show Project';
    if (isApproved) return 'Hide Project';
    return 'Toggle Project Visibility';
  };

  const getDialogDescription = () => {
    if (isHidden) {
      return 'This will make the project visible to all users again.';
    }
    if (isApproved) {
      return 'This will hide the project from public view. Only admins will be able to see it.';
    }
    return 'This will toggle the project visibility between approved and hidden.';
  };

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={getButtonText()}>
          <IconButton
            onClick={handleToggle}
            color={getButtonColor() as any}
            size={size}
            disabled={!isApproved && !isHidden}
          >
            {getButtonIcon()}
          </IconButton>
        </Tooltip>

        <Dialog open={dialogOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {getDialogDescription()}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Admin Notes (Optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about this visibility change..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color={getButtonColor() as any}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : getButtonIcon()}
            >
              {loading ? 'Processing...' : getButtonText()}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        color={getButtonColor() as any}
        size={size}
        onClick={handleToggle}
        startIcon={getButtonIcon()}
        disabled={!isApproved && !isHidden}
      >
        {getButtonText()}
      </Button>

      <Dialog open={dialogOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {getDialogDescription()}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Admin Notes (Optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes about this visibility change..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={getButtonColor() as any}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : getButtonIcon()}
          >
            {loading ? 'Processing...' : getButtonText()}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectVisibilityToggle;
