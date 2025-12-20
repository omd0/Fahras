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
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { ProjectMilestone } from '../../types';
import { apiService } from '../../services/api';

interface MilestoneDetailDialogProps {
  open: boolean;
  milestone: ProjectMilestone | null;
  projectId: number;
  onClose: () => void;
  onUpdate?: (milestoneId: number, data: Partial<ProjectMilestone>) => Promise<void>;
  onDelete?: (milestoneId: number) => Promise<void>;
  onComplete?: (milestoneId: number, notes?: string) => Promise<void>;
  canEdit?: boolean;
}

export const MilestoneDetailDialog: React.FC<MilestoneDetailDialogProps> = ({
  open,
  milestone,
  projectId,
  onClose,
  onUpdate,
  onDelete,
  onComplete,
  canEdit = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<ProjectMilestone['status']>('not_started');
  const [completionNotes, setCompletionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMilestones, setAvailableMilestones] = useState<ProjectMilestone[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<number[]>([]);

  const isNew = milestone === null;

  useEffect(() => {
    if (open) {
      if (milestone) {
        setTitle(milestone.title);
        setDescription(milestone.description || '');
        setDueDate(milestone.due_date ? milestone.due_date.split('T')[0] : '');
        setStatus(milestone.status);
        setCompletionNotes(milestone.completion_notes || '');
        setSelectedDependencies(milestone.dependencies || []);
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setStatus('not_started');
        setCompletionNotes('');
        setSelectedDependencies([]);
      }
      loadAvailableMilestones();
    }
  }, [open, milestone, projectId]);

  const loadAvailableMilestones = async () => {
    try {
      const response = await apiService.getProjectMilestones(projectId);
      const filtered = response.milestones.filter(m => !milestone || m.id !== milestone.id);
      setAvailableMilestones(filtered);
    } catch (err) {
      console.error('Failed to load milestones:', err);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isNew && onUpdate) {
        await onUpdate(0, {
          title,
          description,
          due_date: dueDate || undefined,
          dependencies: selectedDependencies.length > 0 ? selectedDependencies : undefined,
        });
      } else if (milestone && onUpdate) {
        await onUpdate(milestone.id, {
          title,
          description,
          due_date: dueDate || undefined,
          status,
          dependencies: selectedDependencies.length > 0 ? selectedDependencies : undefined,
          completion_notes: completionNotes || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!milestone || !onDelete) return;
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;

    setLoading(true);
    setError(null);

    try {
      await onDelete(milestone.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!milestone || !onComplete) return;

    setLoading(true);
    setError(null);

    try {
      await onComplete(milestone.id, completionNotes);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete milestone');
    } finally {
      setLoading(false);
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
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isNew ? 'Create Milestone' : 'Milestone Details'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            disabled={loading || (!isNew && !canEdit)}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            disabled={loading || (!isNew && !canEdit)}
          />

          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={loading || (!isNew && !canEdit)}
          />

          {!isNew && (
            <FormControl fullWidth disabled={loading || !canEdit}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectMilestone['status'])}
                label="Status"
              >
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          )}

          {availableMilestones.length > 0 && (
            <FormControl fullWidth disabled={loading || (!isNew && !canEdit)}>
              <InputLabel>Dependencies</InputLabel>
              <Select
                multiple
                value={selectedDependencies}
                onChange={(e) => setSelectedDependencies(e.target.value as number[])}
                label="Dependencies"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as number[]).map((id) => {
                      const dep = availableMilestones.find(m => m.id === id);
                      return dep ? (
                        <Chip key={id} label={dep.title} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {availableMilestones.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select milestones that must be completed before this one can start
              </FormHelperText>
            </FormControl>
          )}

          {milestone?.status === 'in_progress' && onComplete && (
            <TextField
              label="Completion Notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
              disabled={loading}
              helperText="Add notes about what was accomplished"
            />
          )}

          {milestone?.status === 'completed' && milestone.completion_notes && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Completion Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {milestone.completion_notes}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        {!isNew && milestone && onDelete && canEdit && (
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {milestone?.status === 'in_progress' && onComplete && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleComplete}
            disabled={loading}
          >
            Mark Complete
          </Button>
        )}
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading || !title.trim()}
          >
            {isNew ? 'Create' : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

