import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { Role } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (roleId: number) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { theme } = useTheme();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
        border: `1px solid ${theme.borderColor}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {role.name}
              </Typography>
              {role.is_system_role && (
                <Chip
                  label="System"
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              {!role.is_system_role && (
                <Chip
                  label="Custom"
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
            {role.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {role.description}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            aria-label="Role actions"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Users with this role">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {role.user_count || 0} users
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Permissions assigned">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {role.permission_count || 0} permissions
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
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
      </CardContent>
    </Card>
  );
};

