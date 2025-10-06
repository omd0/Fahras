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

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        {
          id: 1,
          full_name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@fahras.edu',
          status: 'active',
          roles: [{ id: 1, name: 'Faculty' }],
          last_login_at: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          full_name: 'Ahmed Almansouri',
          email: 'ahmed.almansouri@student.fahras.edu',
          status: 'active',
          roles: [{ id: 2, name: 'Student' }],
          last_login_at: '2024-01-14T15:45:00Z',
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 3,
          full_name: 'Admin User',
          email: 'admin@fahras.edu',
          status: 'active',
          roles: [{ id: 3, name: 'Admin' }],
          last_login_at: '2024-01-15T09:15:00Z',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];
      setUsers(mockUsers);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // Mock roles data
      const mockRoles = [
        { id: 1, name: 'Faculty' },
        { id: 2, name: 'Student' },
        { id: 3, name: 'Admin' },
      ];
      setRoles(mockRoles);
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
      if (editingUser) {
        // Update user
        console.log('Updating user:', editingUser.id, userForm);
      } else {
        // Create user
        console.log('Creating user:', userForm);
      }
      setUserDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      setError(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('Deleting user:', userId);
        fetchUsers();
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        setError(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      console.log('Toggling user status:', userId, newStatus);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      setError(error.response?.data?.message || 'Failed to toggle user status');
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
      <AppBar position="static">
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            User Management
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
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
            <MenuItem onClick={handleMenuClose}>
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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
              helperText={editingUser ? "Leave blank to keep current password" : "Required for new users"}
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
            disabled={!userForm.full_name || !userForm.email || (!editingUser && !userForm.password)}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
