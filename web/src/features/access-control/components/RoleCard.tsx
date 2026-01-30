import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  alpha,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { Role } from '@/types';
import { BasePortalCard } from '@/components/shared/BasePortalCard';
import { designTokens } from '@/styles/designTokens';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (roleId: number) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
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
    <BasePortalCard>
      {/* Action Menu (positioned absolutely) */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          aria-label="Role actions"
          sx={{
            color: designTokens.colors.text.muted,
            '&:hover': {
              backgroundColor: alpha(designTokens.colors.primary[50], 0.5),
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Icon Badge */}
      <Box
        sx={{
          width: { xs: designTokens.iconBadge.medium.width, sm: designTokens.iconBadge.large.width },
          height: { xs: designTokens.iconBadge.medium.height, sm: designTokens.iconBadge.large.height },
          borderRadius: designTokens.radii.circle,
          backgroundColor: alpha(designTokens.colors.secondary[50], 0.8),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <AdminIcon
          sx={{
            fontSize: { xs: designTokens.iconBadge.medium.iconSize, sm: designTokens.iconBadge.large.iconSize },
            color: designTokens.colors.primary[500],
          }}
        />
      </Box>

      {/* Role Name */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: designTokens.typography.cardTitle.fontWeight,
          fontSize: designTokens.typography.cardTitle.fontSize,
          lineHeight: designTokens.typography.cardTitle.lineHeight,
          color: designTokens.colors.text.primary,
          mb: 1,
        }}
      >
        {role.name}
      </Typography>

      {/* System/Custom Badge */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mb: 1.5 }}
      >
        {role.is_system_role ? (
          <Chip
            label="System"
            size="small"
            color="primary"
            sx={{
              fontSize: '0.7rem',
              height: 24,
            }}
          />
        ) : (
          <Chip
            label="Custom"
            size="small"
            color="success"
            sx={{
              fontSize: '0.7rem',
              height: 24,
            }}
          />
        )}
      </Stack>

      {/* Description */}
      {role.description && (
        <Typography
          variant="body2"
          sx={{
            fontSize: designTokens.typography.cardDescription.fontSize,
            lineHeight: designTokens.typography.cardDescription.lineHeight,
            color: designTokens.colors.text.secondary,
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

      {/* Metadata Row */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ mt: 'auto' }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PeopleIcon sx={{ fontSize: 16, color: designTokens.colors.text.muted }} />
          <Typography
            variant="caption"
            sx={{
              color: designTokens.colors.text.secondary,
              fontSize: '0.75rem',
            }}
          >
            {role.user_count || 0} users
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <LockIcon sx={{ fontSize: 16, color: designTokens.colors.text.muted }} />
          <Typography
            variant="caption"
            sx={{
              color: designTokens.colors.text.secondary,
              fontSize: '0.75rem',
            }}
          >
            {role.permission_count || 0} permissions
          </Typography>
        </Stack>
      </Stack>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </MenuItem>
        {!role.is_system_role && (
          <MenuItem onClick={handleDelete} sx={{ color: designTokens.colors.status.error }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </BasePortalCard>
  );
};
