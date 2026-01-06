import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Permission } from '../../types';
import { apiService } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

interface PermissionSelectorProps {
  selectedPermissions: Record<number, 'all' | 'department' | 'own' | 'none'>;
  onChange: (permissions: Record<number, 'all' | 'department' | 'own' | 'none'>) => void;
  disabled?: boolean;
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

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  selectedPermissions,
  onChange,
  disabled = false,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPermissions();
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      // Silently fail - permissions will be empty, component will still render
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    const newPermissions = { ...selectedPermissions };
    if (checked) {
      newPermissions[permissionId] = 'all'; // Default scope
    } else {
      newPermissions[permissionId] = 'none';
    }
    onChange(newPermissions);
  };

  const handleScopeChange = (permissionId: number, scope: 'all' | 'department' | 'own') => {
    const newPermissions = { ...selectedPermissions };
    newPermissions[permissionId] = scope;
    onChange(newPermissions);
  };

  const getPermissionsByCategory = (category: Permission['category']) => {
    return permissions.filter((p) => p.category === category);
  };

  const filteredPermissions = permissions.filter((p) =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryToggle = (category: Permission['category'], enable: boolean) => {
    const categoryPerms = getPermissionsByCategory(category);
    const newPermissions = { ...selectedPermissions };
    categoryPerms.forEach((perm) => {
      newPermissions[perm.id] = enable ? 'all' : 'none';
    });
    onChange(newPermissions);
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
        disabled={disabled}
      />

      {searchQuery ? (
        <Box>
          {filteredPermissions.map((permission) => {
            const isSelected = selectedPermissions[permission.id] !== 'none' && selectedPermissions[permission.id] !== undefined;
            const scope = selectedPermissions[permission.id] || 'none';
            const supportsScope = ['Projects', 'Users', 'Files'].includes(permission.category);

            return (
              <Box
                key={permission.id}
                sx={{
                  p: 2,
                  mb: 1,
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: 1,
                }}
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
                        onChange={(e) => handleScopeChange(permission.id, e.target.value as 'all' | 'department' | 'own')}
                        disabled={disabled}
                      >
                        {SCOPE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        PERMISSION_CATEGORIES.map((category) => {
          const categoryPerms = getPermissionsByCategory(category.name);
          if (categoryPerms.length === 0) return null;

          const allSelected = categoryPerms.every(
            (p) => selectedPermissions[p.id] !== 'none' && selectedPermissions[p.id] !== undefined
          );
          const someSelected = categoryPerms.some(
            (p) => selectedPermissions[p.id] !== 'none' && selectedPermissions[p.id] !== undefined
          );

          return (
            <Accordion key={category.name} defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
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
                  {categoryPerms.map((permission) => {
                    const isSelected = selectedPermissions[permission.id] !== 'none' && selectedPermissions[permission.id] !== undefined;
                    const scope = selectedPermissions[permission.id] || 'none';
                    const supportsScope = ['Projects', 'Users', 'Files'].includes(permission.category);

                    return (
                      <Box
                        key={permission.id}
                        sx={{
                          p: 1.5,
                          border: `1px solid ${theme.borderColor}`,
                          borderRadius: 1,
                        }}
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
                                onChange={(e) => handleScopeChange(permission.id, e.target.value as 'all' | 'department' | 'own')}
                                disabled={disabled}
                              >
                                {SCOPE_OPTIONS.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
};

