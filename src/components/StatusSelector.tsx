'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { getErrorMessage } from '@/utils/errorHandling';

interface StatusSelectorProps {
  open: boolean;
  currentStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  onClose: () => void;
  onSave: (newStatus: string) => Promise<void>;
  title?: string;
  description?: string;
}

const statusOptions = [
  { value: 'draft', label: 'Draft', description: 'Project is still being drafted', color: 'warning' as const },
  { value: 'submitted', label: 'Submitted', description: 'Project has been submitted for review', color: 'info' as const },
  { value: 'under_review', label: 'Under Review', description: 'Project is being reviewed', color: 'primary' as const },
  { value: 'approved', label: 'Approved', description: 'Project has been approved', color: 'success' as const },
  { value: 'rejected', label: 'Rejected', description: 'Project has been rejected', color: 'error' as const },
  { value: 'completed', label: 'Completed', description: 'Project has been completed', color: 'success' as const },
];

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  open,
  currentStatus,
  onClose,
  onSave,
  title = 'Change Project Status',
  description = 'Select the new status for this project.',
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(selectedStatus);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update status'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setSelectedStatus(currentStatus);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {description}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Status:
            </Typography>
            <Chip
              label={statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
              color={statusOptions.find(s => s.value === currentStatus)?.color || 'default'}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel>New Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as typeof currentStatus)}
            label="New Status"
            disabled={saving}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box>
                  <Typography variant="body1">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || selectedStatus === currentStatus}
          startIcon={saving ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        >
          {saving ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
