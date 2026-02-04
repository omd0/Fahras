'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  Badge as BadgeIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DashboardContainer } from '@/components/shared/DashboardContainer';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';
import type { Role, Permission, User } from '@/types';
import type { BreadcrumbItem } from '@/components/shared/Breadcrumb';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`access-control-tabpanel-${index}`}
      aria-labelledby={`access-control-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PERMISSION_CATEGORIES: Array<{
  name: Permission['category'];
  label: string;
}> = [
  { name: 'Projects', label: 'Projects' },
  { name: 'Users', label: 'Users' },
  { name: 'Files', label: 'Files' },
  { name: 'Analytics', label: 'Analytics' },
  { name: 'Settings', label: 'Settings' },
  { name: 'System', label: 'System' },
  { name: 'Roles', label: 'Roles & Permissions' },
];

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'department', label: 'Department' },
  { value: 'own', label: 'Own Only' },
];

function PermissionSelector({
  selectedPermissions,
  onChange,
  disabled = false,
}: {
  selectedPermissions: Record<number, 'all' | 'department' | 'own' | 'none'>;
  onChange: (permissions: Record<number, 'all' | 'department' | 'own' | 'none'>) => void;
  disabled?: boolean;
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPermissions();
        setPermissions(Array.isArray(data) ? (data as Permission[]) : []);
      } catch {
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    const next = { ...selectedPermissions };
    next[permissionId] = checked ? 'all' : 'none';
    onChange(next);
  };

  const handleScopeChange = (permissionId: number, scope: 'all' | 'department' | 'own') => {
    onChange({ ...selectedPermissions, [permissionId]: scope });
  };

  const getPermissionsByCategory = (category: Permission['category']) =>
    permissions.filter((p) => p.category === category);

  const filteredPermissions = permissions.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCategoryToggle = (category: Permission['category'], enable: boolean) => {
    const catPerms = getPermissionsByCategory(category);
    const next = { ...selectedPermissions };
    catPerms.forEach((perm) => {
      next[perm.id] = enable ? 'all' : 'none';
    });
    onChange(next);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Loading permissions...
        </Typography>
      </Box>
    );
  }

  const renderPermissionRow = (permission: Permission) => {
    const isSelected =
      selectedPermissions[permission.id] !== 'none' &&
      selectedPermissions[permission.id] !== undefined;
    const scope = selectedPermissions[permission.id] || 'none';
    const supportsScope = ['Projects', 'Users', 'Files'].includes(permission.category);

    return (
      <Box
        key={permission.id}
        sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSelected}
                onChange={(e) => handlePermissionToggle(permission.id, e.target.checked)}
                disabled={disabled}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {permission.code}
                </Typography>
                {permission.description && (
                  <Typography variant="caption" color="text.secondary">
                    {permission.description}
                  </Typography>
                )}
              </Box>
            }
          />
          {isSelected && supportsScope && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Scope</InputLabel>
              <Select
                value={scope}
                label="Scope"
                onChange={(e) =>
                  handleScopeChange(
                    permission.id,
                    e.target.value as 'all' | 'department' | 'own',
                  )
                }
                disabled={disabled}
              >
                {SCOPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Permissions
      </Typography>

      <TextField
        fullWidth
        placeholder="Search permissions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
        disabled={disabled}
      />

      {searchQuery ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(filteredPermissions || []).map(renderPermissionRow)}
        </Box>
      ) : (
        (PERMISSION_CATEGORIES || []).map((category) => {
          const catPerms = getPermissionsByCategory(category.name);
          if (catPerms.length === 0) return null;

          const allSelected = catPerms.every(
            (p) =>
              selectedPermissions[p.id] !== 'none' && selectedPermissions[p.id] !== undefined,
          );
          const someSelected = catPerms.some(
            (p) =>
              selectedPermissions[p.id] !== 'none' && selectedPermissions[p.id] !== undefined,
          );

          return (
            <Accordion key={category.name} defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    width: '100%',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {category.label}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryToggle(category.name, !allSelected);
                    }}
                    disabled={disabled}
                    sx={{ textTransform: 'none' }}
                  >
                    {allSelected ? 'Disable All' : 'Enable All'}
                  </Button>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCategoryToggle(category.name, e.target.checked);
                    }}
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(catPerms || []).map(renderPermissionRow)}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
}

function RoleDialog({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<number, 'all' | 'department' | 'own' | 'none'>
  >({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      const perms: Record<number, 'all' | 'department' | 'own' | 'none'> = {};
      if (role.permissions) {
        (role.permissions || []).forEach((perm) => {
          perms[perm.id] = 'all';
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
          .filter(([, scope]) => scope !== 'none')
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save role'));
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
      PaperProps={{ sx: { borderRadius: 3 } }}
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
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

          <PermissionSelector
            selectedPermissions={selectedPermissions}
            onChange={setSelectedPermissions}
            disabled={saving}
          />
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
        >
          {saving ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Saving...
            </>
          ) : role ? (
            'Update Role'
          ) : (
            'Create Role'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (roleId: number) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleMenuClose();
    onEdit(role);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(role.id);
  };

  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 3,
        textAlign: 'center',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          aria-label="Role actions"
          sx={{ color: 'text.secondary' }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 },
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <AdminIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'primary.main' }} />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.3, mb: 1 }}>
        {role.name}
      </Typography>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1.5 }}>
        {role.is_system_role ? (
          <Chip label="System" size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24 }} />
        ) : (
          <Chip label="Custom" size="small" color="success" sx={{ fontSize: '0.7rem', height: 24 }} />
        )}
      </Stack>

      {role.description && (
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.8rem',
            lineHeight: 1.5,
            color: 'text.secondary',
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {role.description}
        </Typography>
      )}

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PeopleIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {role.user_count || 0} users
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {role.permission_count || 0} permissions
          </Typography>
        </Stack>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </MenuItem>
        {!role.is_system_role && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}

function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch roles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

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
    fetchRoles();
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete role'));
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
      setRoleToDelete(null);
    }
  };

  const filteredRoles = (roles || []).filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const systemRoles = filteredRoles.filter((role) => role.is_system_role);
  const customRoles = filteredRoles.filter((role) => !role.is_system_role);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Roles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRole}
          sx={{
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
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
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
            {(systemRoles || []).map((role) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={role.id}>
                <RoleCard role={role} onEdit={handleEditRole} onDelete={handleDeleteRole} />
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
            {(customRoles || []).map((role) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={role.id}>
                <RoleCard role={role} onEdit={handleEditRole} onDelete={handleDeleteRole} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {filteredRoles.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? 'No roles found matching your search'
              : 'No custom roles yet. Create your first role to get started.'}
          </Typography>
        </Box>
      )}

      <RoleDialog open={dialogOpen} onClose={handleDialogClose} role={editingRole} />

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
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, rolesData] = await Promise.all([
        apiService.getAdminUsers(),
        apiService.getRoles(),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch users and roles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditRoles = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleIds((user.roles || []).map((role) => role.id));
    setRoleDialogOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await apiService.updateUserRoles(selectedUser.id, selectedRoleIds);

      setSuccess('User roles updated successfully');
      setRoleDialogOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update user roles'));
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDialog = () => {
    if (!saving) {
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoleIds([]);
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredUsers = (users || []).filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.roles || []).some((role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Assign Roles to Users
        </Typography>
        <Chip
          label={`${(users || []).length} Users`}
          color="primary"
          variant="outlined"
          icon={<PeopleIcon />}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {searchQuery
                ? 'No users found matching your search'
                : 'No users available for role assignment'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(filteredUsers || []).map((user) => (
                <TableRow
                  key={user.id}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                          color: 'white',
                        }}
                      >
                        {user.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {user.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(user.roles || []).length > 0 ? (
                        (user.roles || []).map((role) => (
                          <Chip
                            key={role.id}
                            label={role.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No roles assigned
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Roles">
                      <IconButton
                        size="small"
                        onClick={() => handleEditRoles(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={roleDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Assign Roles to {selectedUser?.full_name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the roles to assign to this user. Users can have multiple roles.
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={selectedRoleIds}
                onChange={(e) => setSelectedRoleIds(e.target.value as number[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected || []).map((roleId) => {
                      const role = (roles || []).find((r) => r.id === roleId);
                      return <Chip key={roleId} label={role?.name} size="small" />;
                    })}
                  </Box>
                )}
                disabled={saving}
              >
                {(roles || []).map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon
                        sx={{
                          fontSize: 16,
                          color: selectedRoleIds.includes(role.id)
                            ? 'primary.main'
                            : 'transparent',
                        }}
                      />
                      <Box>
                        <Typography variant="body2">{role.name}</Typography>
                        {role.description && (
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSaveRoles} variant="contained" disabled={saving}>
            {saving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Saving...
              </>
            ) : (
              'Save Roles'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function AccessControlPage() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.some((role) => role.name === 'admin') ?? false;

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, router]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Admin', path: '/dashboard' },
    { label: 'Access Control', icon: <SecurityIcon fontSize="small" /> },
  ];

  if (!isAdmin) {
    return (
      <DashboardContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Breadcrumb items={breadcrumbItems} />
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => router.push('/dashboard')}
              sx={{ mr: 2 }}
              color="primary"
              aria-label="Back to dashboard"
            >
              <ArrowBackIcon />
            </IconButton>
            <SecurityIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Access Control & Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage roles and permissions for system access
              </Typography>
            </Box>
          </Box>
          <Chip label="Admin Only" color="primary" size="small" sx={{ fontWeight: 600 }} />
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Access Control tabs"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 72,
                fontSize: '1rem',
                gap: 1,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              icon={<BadgeIcon />}
              iconPosition="start"
              label="Roles & Permissions"
              id="access-control-tab-0"
              aria-controls="access-control-tabpanel-0"
            />
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label="Role Assignments"
              id="access-control-tab-1"
              aria-controls="access-control-tabpanel-1"
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <TabPanel value={activeTab} index={0}>
            <RolesTab />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <UsersTab />
          </TabPanel>
        </CardContent>
      </Card>
    </DashboardContainer>
  );
}
