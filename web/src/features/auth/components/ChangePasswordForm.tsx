import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';

export const ChangePasswordForm: React.FC = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = (): boolean => {
    if (!formData.current_password) {
      setError('Current password is required');
      return false;
    }

    if (!formData.new_password) {
      setError('New password is required');
      return false;
    }

    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters');
      return false;
    }

    if (!formData.new_password_confirmation) {
      setError('Password confirmation is required');
      return false;
    }

    if (formData.new_password !== formData.new_password_confirmation) {
      setError('New passwords do not match');
      return false;
    }

    if (formData.current_password === formData.new_password) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.changePassword(formData);
      setSuccess(response.message);

      // Clear form
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
     } catch (err: unknown) {
       setError(getErrorMessage(err, 'Failed to change password. Please try again.'));
     } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
    setSuccess('');
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Change Password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          value={formData.current_password}
          onChange={(e) => handleChange('current_password', e.target.value)}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'info.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'info.main',
              },
            },
          }}
        />

        <TextField
          fullWidth
          label="New Password"
          type={showNewPassword ? 'text' : 'password'}
          value={formData.new_password}
          onChange={(e) => handleChange('new_password', e.target.value)}
          disabled={loading}
          helperText="Minimum 8 characters"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'info.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'info.main',
              },
            },
          }}
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.new_password_confirmation}
          onChange={(e) =>
            handleChange('new_password_confirmation', e.target.value)
          }
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'info.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'info.main',
              },
            },
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            py: 1.5,
            backgroundColor: 'info.main',
            '&:hover': { backgroundColor: 'info.dark' },
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Change Password'}
        </Button>
      </form>
    </Paper>
  );
};
