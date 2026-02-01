import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  Typography,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { authApi } from '@/lib/api';
import { useAuthStore } from '../store';

export const LogoutAllDevicesButton: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setError('');
    }
  };

  const handleLogoutAll = async () => {
    setLoading(true);
    setError('');

    try {
      await authApi.logoutAll();

      // Clear local auth state
      logout();

      // Close dialog
      setOpen(false);

      // Redirect to login
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      setError(
        err.response?.data?.message ||
          'Failed to logout from all devices. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Session Management
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Logout from all devices where you're currently signed in. This will revoke all your active sessions.
        </Typography>

        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleOpen}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Logout All Devices
        </Button>
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Logout from All Devices?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            This will log you out from all devices and browsers where you're currently signed in. You'll need to log in again on all devices.
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutAll}
            disabled={loading}
            variant="contained"
            color="error"
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Logout All'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
