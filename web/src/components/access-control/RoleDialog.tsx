import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Role } from '../../types';
import { apiService } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { PermissionSelector } from './PermissionSelector';

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
}

export const RoleDialog: React.FC<RoleDialogProps> = ({ open, onClose, role }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<number, 'all' | 'department' | 'own' | 'none'>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      // Initialize selected permissions from role
      const perms: Record<number, 'all' | 'department' | 'own' | 'none'> = {};
      if (role.permissions) {
        role.permissions.forEach((perm) => {
          perms[perm.id] = 'all'; // Default scope, should come from role_permission pivot
        });
      }
      setSelectedPermissions(perms);
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions({});
    }
    setError(null);
  }, [role, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const roleData = {
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: Object.entries(selectedPermissions)
          .filter(([_, scope]) => scope !== 'none')
          .map(([permissionId, scope]) => ({
            permission_id: parseInt(permissionId),
            scope: scope as 'all' | 'department' | 'own',
          })),
      };

      if (role) {
        await apiService.updateRole(role.id, roleData);
      } else {
        await apiService.createRole(roleData);
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to save role:', err);
      setError(err.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {role ? 'Edit Role' : 'Create New Role'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Role Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            disabled={saving}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            disabled={saving}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: theme.primary }} />
            </Box>
          ) : (
            <>
              <PermissionSelector
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
                disabled={saving}
              />
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !name.trim()}
          sx={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`,
          }}
        >
          {saving ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Saving...
            </>
          ) : (
            role ? 'Update Role' : 'Create Role'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

