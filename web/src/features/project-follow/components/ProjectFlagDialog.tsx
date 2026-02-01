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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { ProjectFlag } from '@/types';
import { apiService } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';

interface ProjectFlagDialogProps {
  open: boolean;
  projectId: number;
  flag: ProjectFlag | null;
  onClose: () => void;
  onSave: () => void;
}

export const ProjectFlagDialog: React.FC<ProjectFlagDialogProps> = ({
  open,
  projectId,
  flag,
  onClose,
  onSave,
}) => {
  const [flagType, setFlagType] = useState<ProjectFlag['flag_type']>('other');
  const [severity, setSeverity] = useState<ProjectFlag['severity']>('medium');
  const [message, setMessage] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (flag) {
        setFlagType(flag.flag_type);
        setSeverity(flag.severity);
        setMessage(flag.message);
        setIsConfidential(flag.is_confidential);
      } else {
        setFlagType('other');
        setSeverity('medium');
        setMessage('');
        setIsConfidential(false);
      }
    }
  }, [open, flag]);

  const handleSave = async () => {
    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.createProjectFlag(projectId, {
        flag_type: flagType,
        severity,
        message,
        is_confidential: isConfidential,
      });
       onSave();
       onClose();
     } catch (err: unknown) {
       setError(getErrorMessage(err, 'Failed to create flag'));
     } finally {
       setLoading(false);
     }
   };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Create Flag
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Flag Type</InputLabel>
            <Select
              value={flagType}
              onChange={(e) => setFlagType(e.target.value as ProjectFlag['flag_type'])}
              label="Flag Type"
            >
              <MenuItem value="scope_creep">Scope Creep</MenuItem>
              <MenuItem value="technical_blocker">Technical Blocker</MenuItem>
              <MenuItem value="team_conflict">Team Conflict</MenuItem>
              <MenuItem value="resource_shortage">Resource Shortage</MenuItem>
              <MenuItem value="timeline_risk">Timeline Risk</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as ProjectFlag['severity'])}
              label="Severity"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
            <FormHelperText>
              Select the severity level of this issue
            </FormHelperText>
          </FormControl>

          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
            helperText="Describe the issue or concern"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
              />
            }
            label="Confidential (Only visible to admins and advisors)"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading || !message.trim()}
        >
          Create Flag
        </Button>
      </DialogActions>
    </Dialog>
  );
};

