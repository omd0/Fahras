import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  Card,
  CardContent,
  Divider,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { MilestoneTemplate, MilestoneTemplateItem, Program, Department } from '@/types';
import type { MilestoneTemplateData } from '@/types/milestones';
import { apiService } from '@/lib/api';
import { getErrorMessage, getValidationErrors } from '@/utils/errorHandling';

interface TemplateEditorProps {
  open: boolean;
  template: MilestoneTemplate | null;
  _programs: Program[];
  _departments: Department[];
  onClose: () => void;
  onSave: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  open,
  template,
  _programs,
  _departments,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [programId, setProgramId] = useState<number | ''>('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [isDefault, setIsDefault] = useState(false);
  const [items, setItems] = useState<Array<Partial<MilestoneTemplateItem> & { tempId?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemEstimatedDays, setItemEstimatedDays] = useState(0);
  const [itemIsRequired, setItemIsRequired] = useState(true);
  const [itemAllowedRoles, setItemAllowedRoles] = useState<('admin' | 'faculty' | 'student')[]>([]);
  const [itemAllowedActions, setItemAllowedActions] = useState<('start' | 'pause' | 'extend' | 'view' | 'edit' | 'complete')[]>([]);
  const [itemPermissions, setItemPermissions] = useState<Set<string>>(new Set());
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isNew = template === null;
  let _nextTempId = 1;

  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setDescription(template.description || '');
        setProgramId(template.program_id || '');
        setDepartmentId(template.department_id || '');
        setIsDefault(template.is_default);
        setItems(template.items?.map(item => ({ ...item, tempId: item.id })) || []);
      } else {
        setName('');
        setDescription('');
        setProgramId('');
        setDepartmentId('');
        setIsDefault(false);
        // Add default steps: Start, Submit, Review
        const baseTime = Date.now();
        const defaultSteps: Array<Partial<MilestoneTemplateItem> & { tempId: number }> = [
          {
            tempId: baseTime,
            title: 'Start',
            description: undefined,
            estimated_days: 0,
            is_required: true,
            order: 0,
            allowed_roles: ['admin', 'faculty', 'student'],
            allowed_actions: ['start', 'view'],
          },
          {
            tempId: baseTime + 1,
            title: 'Submit',
            description: undefined,
            estimated_days: 0,
            is_required: true,
            order: 1,
            allowed_roles: ['admin', 'faculty', 'student'],
            allowed_actions: ['view', 'edit'],
          },
          {
            tempId: baseTime + 2,
            title: 'Review',
            description: undefined,
            estimated_days: 0,
            is_required: true,
            order: 2,
            allowed_roles: ['admin', 'faculty'],
            allowed_actions: ['view', 'edit', 'complete'],
          },
        ];
        setItems(defaultSteps);
      }
      setError(null);
      setEditingItem(null);
      setStepDialogOpen(false);
    }
  }, [open, template]);

  const handleAddItem = () => {
    if (!itemTitle.trim()) {
      setError('Step title is required');
      return;
    }

    const newItem: Partial<MilestoneTemplateItem> & { tempId: number } = {
      tempId: Date.now(),
      title: itemTitle,
      description: itemDescription || undefined,
      estimated_days: itemEstimatedDays,
      is_required: itemIsRequired,
      order: items.length,
      allowed_roles: itemAllowedRoles.length > 0 ? itemAllowedRoles : undefined,
      allowed_actions: itemAllowedActions.length > 0 ? itemAllowedActions : undefined,
    };

    if (editingItem !== null) {
      // Update existing item
      setItems(items.map((item, index) => 
        index === editingItem ? { ...newItem, tempId: item.tempId } : item
      ));
      setEditingItem(null);
    } else {
      // Add new item
      setItems([...items, newItem]);
    }

    // Reset form and close dialog
    setItemTitle('');
    setItemDescription('');
    setItemEstimatedDays(0);
    setItemIsRequired(true);
    setItemAllowedRoles([]);
    setItemAllowedActions([]);
    setItemPermissions(new Set());
    setError(null);
    setStepDialogOpen(false);
  };

  const handleOpenAddStep = () => {
    setEditingItem(null);
    setItemTitle('');
    setItemDescription('');
    setItemEstimatedDays(0);
    setItemIsRequired(true);
    setItemAllowedRoles([]);
    setItemAllowedActions([]);
    setItemPermissions(new Set());
    setError(null);
    setStepDialogOpen(true);
  };

  const handleOpenEditStep = (index: number) => {
    handleEditItem(index);
    setStepDialogOpen(true);
  };

  const handleCloseStepDialog = () => {
    setStepDialogOpen(false);
    setEditingItem(null);
    setItemTitle('');
    setItemDescription('');
    setItemEstimatedDays(0);
    setItemIsRequired(true);
    setItemAllowedRoles([]);
    setItemAllowedActions([]);
    setItemPermissions(new Set());
    setError(null);
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setItemTitle(item.title || '');
    setItemDescription(item.description || '');
    setItemEstimatedDays(item.estimated_days || 0);
    setItemIsRequired(item.is_required !== false);
    setItemAllowedRoles(item.allowed_roles || []);
    setItemAllowedActions(item.allowed_actions || []);
    
    // Build permissions set from roles and actions
    const permissions = new Set<string>();
    if (item.allowed_roles && item.allowed_actions) {
      item.allowed_roles.forEach(role => {
        item.allowed_actions!.forEach(action => {
          permissions.add(`${role}:${action}`);
        });
      });
    }
    setItemPermissions(permissions);
    
    setEditingItem(index);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
    if (editingItem === index) {
      setEditingItem(null);
      setItemTitle('');
      setItemDescription('');
      setItemEstimatedDays(0);
      setItemIsRequired(true);
    } else if (editingItem !== null && editingItem > index) {
      setEditingItem(editingItem - 1);
    }
  };

  const _handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => {
      item.order = i;
    });
    setItems(newItems);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remove the dragged item first
    newItems.splice(draggedIndex, 1);
    
    // Calculate the correct insertion index
    // When dragging forward (draggedIndex < dropIndex), removing the item shifts indices left
    // When dragging backward (draggedIndex > dropIndex), indices don't shift for items before
    let insertIndex = dropIndex;
    if (draggedIndex < dropIndex) {
      insertIndex = dropIndex - 1;
    }
    
    // Insert at new position
    newItems.splice(insertIndex, 0, draggedItem);
    
    // Update order property
    newItems.forEach((item, i) => {
      item.order = i;
    });
    
    setItems(newItems);
    
    // Update editing index if needed
    if (editingItem === draggedIndex) {
      setEditingItem(insertIndex);
    } else if (editingItem !== null) {
      // Adjust editing index if needed
      let newEditingIndex = editingItem;
      if (draggedIndex < editingItem && insertIndex >= editingItem) {
        newEditingIndex = editingItem - 1;
      } else if (draggedIndex > editingItem && insertIndex <= editingItem) {
        newEditingIndex = editingItem + 1;
      }
      setEditingItem(newEditingIndex);
    }
    
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (items.length === 0) {
      setError('At least one step is required');
      return;
    }

    setLoading(true);
    setError(null);
    setServerErrors({});

    try {
      const templateData = {
        name,
        description: description || undefined,
        program_id: programId || undefined,
        department_id: departmentId || undefined,
        is_default: isDefault,
        items: items.map((item, index) => ({
          title: item.title!,
          description: item.description,
          estimated_days: item.estimated_days || 0,
          is_required: item.is_required !== false,
          order: index, // Use array index as definitive order value
          allowed_roles: item.allowed_roles,
          allowed_actions: item.allowed_actions,
        })),
      };

      if (isNew) {
        await apiService.createMilestoneTemplate(templateData as MilestoneTemplateData);
      } else {
        await apiService.updateMilestoneTemplate(template!.id, templateData as Partial<MilestoneTemplate>);
      }

       onSave();
     } catch (err: unknown) {
       // Handle validation errors (422) with field-specific messages
       const validationErrors = getValidationErrors(err);
       if (validationErrors) {
         setServerErrors(validationErrors);
         setError('Validation failed. Please check the form for errors.');
       } else {
         // Handle other errors (500, network error, etc.)
         setError(getErrorMessage(err, 'Failed to save template'));
       }
     } finally {
       setLoading(false);
     }
  };

  if (!open) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        mb: 3,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {isNew ? 'Create Program' : 'Edit Program'}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Program Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            disabled={loading}
            error={!!serverErrors.name}
            helperText={serverErrors.name?.[0]}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
            disabled={loading}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={loading}
              />
            }
            label="Set as default program"
          />

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Steps
            </Typography>
            {items.length > 0 && (
              <Chip
                label={`Total: ${items.reduce((sum, item) => sum + (item.estimated_days || 0), 0)} Days`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Horizontal Flowchart Display */}
          <Box
            sx={{
              position: 'relative',
              bgcolor: theme.palette.grey[100],
              borderRadius: 2,
              p: 3,
              mb: 2,
              overflowX: 'auto',
              overflowY: 'visible',
              backgroundImage: `
                radial-gradient(circle, ${theme.palette.grey[400]} 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.grey[300],
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.grey[400],
                borderRadius: 4,
                '&:hover': {
                  background: theme.palette.grey[500],
                },
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                minWidth: 'fit-content',
                py: 2,
              }}
            >
              {items.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, px: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No steps yet. Click the button below to add your first step.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddStep}
                    sx={{ mt: 1 }}
                  >
                    Add Step
                  </Button>
                </Box>
              ) : (
                items.map((item, index) => (
                  <React.Fragment key={item.tempId || index}>
                    {/* Step Node */}
                    <Card
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      sx={{
                        minWidth: 200,
                        maxWidth: 240,
                        borderRadius: 2,
                        border: editingItem === index 
                          ? `2px solid ${theme.palette.info.main}` 
                          : dragOverIndex === index
                          ? `2px dashed ${theme.palette.info.main}`
                          : `1px solid ${theme.palette.grey[400]}`,
                        bgcolor: draggedIndex === index ? alpha(theme.palette.info.main, 0.08) : theme.palette.background.paper,
                        position: 'relative',
                        transition: draggedIndex === index ? 'none' : 'all 0.2s ease-in-out',
                        boxShadow: editingItem === index 
                          ? '0px 4px 20px rgba(25, 118, 210, 0.2)' 
                          : dragOverIndex === index
                          ? '0px 4px 20px rgba(25, 118, 210, 0.3)'
                          : '0px 2px 8px rgba(0,0,0,0.1)',
                        cursor: draggedIndex === index ? 'grabbing' : 'grab',
                        opacity: draggedIndex === index ? 0.5 : 1,
                        transform: draggedIndex === index ? 'rotate(5deg)' : dragOverIndex === index ? 'scale(1.05)' : 'none',
                        '&:hover': {
                          boxShadow: draggedIndex === index 
                            ? '0px 2px 8px rgba(0,0,0,0.1)' 
                            : '0px 4px 20px rgba(0,0,0,0.15)',
                          transform: draggedIndex === index ? 'rotate(5deg)' : 'translateY(-2px)',
                          '& .action-buttons': {
                            opacity: draggedIndex === index ? 0 : 1,
                          },
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, pb: '16px !important' }}>
                        {/* Drag Handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            color: theme.palette.grey[400],
                            cursor: 'grab',
                            '&:active': {
                              cursor: 'grabbing',
                            },
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.6,
                            transition: 'opacity 0.2s ease-in-out',
                            '&:hover': {
                              opacity: 1,
                              color: theme.palette.text.secondary,
                            },
                          }}
                        >
                          <DragIndicatorIcon sx={{ fontSize: 20 }} />
                        </Box>

                        {/* Action Buttons - Show on Hover */}
                        <Box
                          className="action-buttons"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 0.5,
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out',
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 1,
                            p: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditStep(index);
                            }}
                            color="primary"
                            sx={{ width: 28, height: 28 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(index);
                            }}
                            color="error"
                            sx={{ width: 28, height: 28 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Step Title */}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            mb: 1,
                            pr: 4,
                            pl: 3,
                            minHeight: 40,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.title}
                        </Typography>

                        {/* Estimated Days */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                            mt: 1,
                          }}
                        >
                          {item.estimated_days} Day{item.estimated_days !== 1 ? 's' : ''}
                        </Typography>

                        {/* Permissions and Actions Info */}
                        {(item.allowed_roles && item.allowed_roles.length > 0) || 
                         (item.allowed_actions && item.allowed_actions.length > 0) ? (
                          <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${theme.palette.grey[300]}` }}>
                            {item.allowed_roles && item.allowed_roles.length > 0 && (
                              <Box sx={{ mb: 0.5 }}>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                                  Roles:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {item.allowed_roles.map((role) => (
                                    <Chip
                                      key={role}
                                      label={role.charAt(0).toUpperCase() + role.slice(1)}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.6rem',
                                        bgcolor: alpha(theme.palette.info.main, 0.08),
                                        color: theme.palette.info.main,
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}
                            {item.allowed_actions && item.allowed_actions.length > 0 && (
                              <Box>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                                  Actions:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                   {item.allowed_actions.slice(0, 3).map((action) => (
                                    <Chip
                                      key={action}
                                      label={action.charAt(0).toUpperCase() + action.slice(1)}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.6rem',
                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                        color: theme.palette.secondary.dark,
                                      }}
                                    />
                                  ))}
                                  {item.allowed_actions.length > 3 && (
                                    <Chip
                                      label={`+${item.allowed_actions.length - 3}`}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.6rem',
                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                        color: theme.palette.secondary.dark,
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        ) : null}

                        {/* Required Badge */}
                        {item.is_required && (
                          <Chip
                            label="Required"
                            size="small"
                            color="primary"
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              height: 20,
                              fontSize: '0.65rem',
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>

                    {/* Arrow Connector */}
                    {index < items.length - 1 && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: theme.palette.grey[400],
                          flexShrink: 0,
                        }}
                      >
                        <ArrowForwardIcon sx={{ fontSize: 32 }} />
                      </Box>
                    )}
                  </React.Fragment>
                ))
              )}

              {/* Add Step Button at the End */}
              {items.length > 0 && (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: theme.palette.grey[400],
                      flexShrink: 0,
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddStep}
                    sx={{
                      minWidth: 200,
                      maxWidth: 240,
                      height: 100,
                      borderRadius: 2,
                      border: `2px dashed ${theme.palette.grey[400]}`,
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        border: `2px dashed ${theme.palette.info.main}`,
                        bgcolor: alpha(theme.palette.info.main, 0.04),
                        color: theme.palette.info.main,
                      },
                    }}
                  >
                    Add Step
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Step Dialog for Add/Edit */}
          <Dialog
            open={stepDialogOpen}
            onClose={handleCloseStepDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
              },
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {editingItem !== null ? 'Edit Step' : 'Add Step'}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  label="Step Title"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  placeholder="Enter step title"
                />
                <TextField
                  label="Description"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  disabled={loading}
                  placeholder="Enter step description (optional)"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Estimated Days"
                    type="number"
                    value={itemEstimatedDays}
                    onChange={(e) => setItemEstimatedDays(parseInt(e.target.value) || 0)}
                    fullWidth
                    disabled={loading}
                    inputProps={{ min: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={itemIsRequired}
                        onChange={(e) => setItemIsRequired(e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="Required"
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Permissions Table: Roles vs Actions */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Permissions: Who Can Perform Which Actions
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Role</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Start</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Pause</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Extend</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.default' }}>View</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Edit</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Complete</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(['admin', 'faculty', 'student'] as const).map((role) => (
                          <TableRow key={role}>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </TableCell>
                            {(['start', 'pause', 'extend', 'view', 'edit', 'complete'] as const).map((action) => {
                              const key = `${role}-${action}`;
                              const permissionKey = `${role}:${action}`;
                              const isChecked = itemPermissions.has(permissionKey);
                              
                              return (
                                <TableCell key={key} align="center">
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const newPermissions = new Set(itemPermissions);
                                      
                                      if (e.target.checked) {
                                        // Add this permission
                                        newPermissions.add(permissionKey);
                                      } else {
                                        // Remove this permission
                                        newPermissions.delete(permissionKey);
                                      }
                                      
                                      setItemPermissions(newPermissions);
                                      
                                      // Update roles and actions arrays based on remaining permissions
                                      const _allRoles = ['admin', 'faculty', 'student'] as const;
                                      const _allActions = ['start', 'pause', 'extend', 'view', 'edit', 'complete'] as const;
                                      
                                      const rolesInPermissions = new Set<string>();
                                      const actionsInPermissions = new Set<string>();
                                      
                                      for (const perm of newPermissions) {
                                        const [r, a] = String(perm).split(':');
                                        if (r && a) {
                                          rolesInPermissions.add(r);
                                          actionsInPermissions.add(a);
                                        }
                                      }
                                      
                                      setItemAllowedRoles(Array.from(rolesInPermissions) as ('admin' | 'faculty' | 'student')[]);
                                      setItemAllowedActions(Array.from(actionsInPermissions) as ('start' | 'pause' | 'extend' | 'view' | 'edit' | 'complete')[]);
                                    }}
                                    disabled={loading}
                                    size="small"
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <FormHelperText sx={{ mt: 1 }}>
                    Check the boxes to grant permissions. Each checkbox represents a role-action combination.
                  </FormHelperText>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
              <Button onClick={handleCloseStepDialog} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleAddItem}
                disabled={loading || !itemTitle.trim()}
              >
                {editingItem !== null ? 'Update Step' : 'Add Step'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          px: 3,
          pb: 3,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={loading || !name.trim() || items.length === 0}
        >
          {loading ? 'Saving...' : 'Save Program'}
        </Button>
      </Box>
    </Paper>
  );
};

