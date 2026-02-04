'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Email as EmailIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { authApi, apiService } from '@/lib/api';
import type { User } from '@/types';
import { getErrorMessage } from '@/utils/errorHandling';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { LogoutAllDevicesButton } from '@/features/auth/components/LogoutAllDevicesButton';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
  });
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.getUser();
      setUser(response.user);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        email: user.email || '',
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setUploading(true);
      const response = await apiService.updateProfile(editForm);
      setUser(response.user);
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: getErrorMessage(err, 'Failed to update profile'),
        severity: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please select an image file',
        severity: 'error',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'File size must be less than 2MB',
        severity: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      const response = await apiService.uploadAvatar(file);
      setUser(response.user);
      setSnackbar({
        open: true,
        message: 'Avatar uploaded successfully',
        severity: 'success',
      });
    } catch (err: unknown) {
      console.error('Error uploading avatar:', err);
      setSnackbar({
        open: true,
        message: getErrorMessage(err, 'Failed to upload avatar'),
        severity: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      const response = await apiService.deleteAvatar();
      setUser(response.user);
      setSnackbar({
        open: true,
        message: 'Avatar deleted successfully',
        severity: 'success',
      });
    } catch (err: unknown) {
      console.error('Error deleting avatar:', err);
      setSnackbar({
        open: true,
        message: getErrorMessage(err, 'Failed to delete avatar'),
        severity: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={user?.avatar_url}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                  {user?.avatar_url && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 48,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'error.dark',
                        },
                      }}
                      size="small"
                      onClick={handleDeleteAvatar}
                      disabled={uploading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
                <Typography variant="h5" gutterBottom>
                  {user?.full_name || 'Unknown User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'No email'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  {user?.email_verified_at ? (
                    <Chip
                      icon={<VerifiedUserIcon />}
                      label="Email Verified"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      icon={<WarningIcon />}
                      label="Email Not Verified"
                      color="warning"
                      size="small"
                      variant="outlined"
                      onClick={() => router.push(`/verify-email?email=${encodeURIComponent(user?.email || '')}`)}
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                </Box>
                <Chip
                  label={user?.status || 'unknown'}
                  color={user?.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
                {user?.roles && user.roles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Roles:
                    </Typography>
                    {(user.roles || []).map((role) => (
                      <Chip
                        key={role.id}
                        label={role.name}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
                {user?.last_login_at && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last login: {new Date(user.last_login_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfile}
                    size="small"
                  >
                    Edit Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Security Settings
            </Typography>

            <Box sx={{ mb: 3 }}>
              <ChangePasswordForm />
            </Box>

            <Box sx={{ mb: 3 }}>
              <LogoutAllDevicesButton />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
