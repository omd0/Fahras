import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { Role } from '../../types';
import { apiService } from '../../services/api';
import { RoleCard } from './RoleCard';
import { RoleDialog } from './RoleDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { getErrorMessage } from '../../utils/errorHandling';
import { ConfirmDialog } from '../shared';

export const RolesTab: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch roles'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRole(null);
    fetchRoles(); // Refresh roles after create/edit
  };

  const handleDeleteRole = (roleId: number) => {
    setRoleToDelete(roleId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (roleToDelete === null) return;
    
    try {
      setDeleteLoading(true);
      await apiService.deleteRole(roleToDelete);
      setDeleteConfirmOpen(false);
      fetchRoles();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete role'));
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
      setRoleToDelete(null);
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systemRoles = filteredRoles.filter((role) => role.is_system_role);
  const customRoles = filteredRoles.filter((role) => !role.is_system_role);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Roles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRole}
          sx={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Create New Role
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {systemRoles.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            System Roles
          </Typography>
          <Grid container spacing={3}>
            {systemRoles.map((role) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={role.id}>
                <RoleCard
                  role={role}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {customRoles.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Custom Roles
          </Typography>
          <Grid container spacing={3}>
            {customRoles.map((role) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={role.id}>
                <RoleCard
                  role={role}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {filteredRoles.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'No roles found matching your search' : 'No custom roles yet. Create your first role to get started.'}
          </Typography>
        </Box>
      )}

      <RoleDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        role={editingRole}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone and may affect users assigned to this role."
        confirmText="Delete Role"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        severity="error"
        loading={deleteLoading}
      />
    </Box>
  );
};

