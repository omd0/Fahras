import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Chip,
  IconButton as MuiIconButton,
  Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccountCircle,
  ExitToApp,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getDashboardTheme } from '../config/dashboardThemes';
import { apiService } from '../services/api';

interface User {
  id: number;
  full_name: string;
  email: string;
  status: string;
  roles: Array<{ id: number; name: string }>;
  last_login_at: string | null;
  created_at: string;
}

interface UserFormData {
  full_name: string;
  email: string;
  password: string;
  role_ids: number[];
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserFormData>({
    full_name: '',
    email: '',
    password: '',
    role_ids: [],
  });

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dashboardTheme = getDashboardTheme(user?.roles);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await apiService.getAdminUsers();
      setUsers(usersData || []);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await apiService.getRoles();
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      full_name: '',
      email: '',
      password: '',
      role_ids: [],
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role_ids: user.roles.map(role => role.id),
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      setError(null);
      setSuccess(null);
      if (editingUser) {
        // Update user
        const updateData: any = {
          full_name: userForm.full_name,
          email: userForm.email,
          role_ids: userForm.role_ids,
        };
        if (userForm.password) {
          updateData.password = userForm.password;
        }
        const response = await apiService.updateUser(editingUser.id, updateData);
        setSuccess(response.message || 'User updated successfully');
      } else {
        // Create user
        const createData = {
          full_name: userForm.full_name,
          email: userForm.email,
          password: userForm.password || 'password', // Default password if not provided
          role_ids: userForm.role_ids,
          status: 'active',
        };
        const response = await apiService.createUser(createData);
        setSuccess(response.message || 'User created successfully');
      }
      setUserDialogOpen(false);
      await fetchUsers(); // Refresh the user list
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Failed to save user:', error);
      const errorMessage = error.response?.data?.message 
        || (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : null)
        || error.response?.data?.error
        || 'Failed to save user';
      setError(errorMessage);
      setSuccess(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError(null);
        setSuccess(null);
        const response = await apiService.deleteUser(userId);
        setSuccess(response.message || 'User deleted successfully');
        await fetchUsers(); // Refresh the user list
        setTimeout(() => setSuccess(null), 3000);
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error
          || 'Failed to delete user';
        setError(errorMessage);
        setSuccess(null);
      }
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    try {
      setError(null);
      setSuccess(null);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await apiService.toggleUserStatus(userId, newStatus);
      setSuccess(response.message || 'User status updated successfully');
      await fetchUsers(); // Refresh the user list
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Failed to toggle user status';
      setError(errorMessage);
      setSuccess(null);
    }
  };

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
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
          <PeopleIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#000000' }}>
            User Management
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            sx={{ color: '#000000' }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfileClick}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(users || []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {user.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(user.roles || []).map((role) => (
                        <Chip
                          key={role.id}
                          label={role.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(user.last_login_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <MuiIconButton size="small">
                          <VisibilityIcon />
                        </MuiIconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <MuiIconButton size="small" onClick={() => handleEditUser(user)}>
                          <EditIcon />
                        </MuiIconButton>
                      </Tooltip>
                      <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                        <MuiIconButton 
                          size="small" 
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                        >
                          {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                        </MuiIconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <MuiIconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon />
                        </MuiIconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* User Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={userForm.full_name}
              onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              sx={{ mb: 2 }}
              helperText={editingUser ? "Leave blank to keep current password" : "Leave blank to use default password ('password')"}
            />
            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={userForm.role_ids}
                onChange={(e) => setUserForm(prev => ({ ...prev, role_ids: e.target.value as number[] }))}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected || []).map((value) => {
                      const role = roles.find(r => r.id === value);
                      return (
                        <Chip key={value} label={role?.name} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {(roles || []).map((role) => (
                  <SelectMenuItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectMenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={!userForm.full_name || !userForm.email || userForm.role_ids.length === 0}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
