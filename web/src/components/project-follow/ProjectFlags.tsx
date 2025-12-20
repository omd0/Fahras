import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { ProjectFlag } from '../../types';
import { apiService } from '../../services/api';
import { ProjectFlagDialog } from './ProjectFlagDialog';

interface ProjectFlagsProps {
  projectId: number;
  canResolve?: boolean;
}

const severityColors = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  critical: '#d32f2f',
};

const flagTypeLabels: Record<ProjectFlag['flag_type'], string> = {
  scope_creep: 'Scope Creep',
  technical_blocker: 'Technical Blocker',
  team_conflict: 'Team Conflict',
  resource_shortage: 'Resource Shortage',
  timeline_risk: 'Timeline Risk',
  other: 'Other',
};

export const ProjectFlags: React.FC<ProjectFlagsProps> = ({
  projectId,
  canResolve = false,
}) => {
  const [flags, setFlags] = useState<ProjectFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterResolved, setFilterResolved] = useState<boolean | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<ProjectFlag | null>(null);

  useEffect(() => {
    loadFlags();
  }, [projectId, filterResolved, filterSeverity]);

  const loadFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProjectFlags(projectId, {
        resolved: filterResolved !== null ? filterResolved : undefined,
        severity: filterSeverity || undefined,
      });
      setFlags(response.flags);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load flags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = () => {
    setSelectedFlag(null);
    setDialogOpen(true);
  };

  const handleResolveFlag = async (flagId: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.resolveFlag(flagId, notes);
      await loadFlags();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve flag');
    } finally {
      setLoading(false);
    }
  };

  const unresolvedFlags = flags.filter(f => !f.resolved_at);
  const resolvedFlags = flags.filter(f => f.resolved_at);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Flags & Warnings
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterResolved === null ? '' : filterResolved}
                onChange={(e) => setFilterResolved(e.target.value === '' ? null : e.target.value === 'true')}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="false">Unresolved</MenuItem>
                <MenuItem value="true">Resolved</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                label="Severity"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateFlag}
              size="small"
            >
              Create Flag
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && flags.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : flags.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FlagIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No flags found
            </Typography>
          </Box>
        ) : (
          <Box>
            {unresolvedFlags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Unresolved ({unresolvedFlags.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {unresolvedFlags.map(flag => (
                    <FlagCard
                      key={flag.id}
                      flag={flag}
                      onResolve={canResolve ? () => handleResolveFlag(flag.id) : undefined}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {resolvedFlags.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Resolved ({resolvedFlags.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {resolvedFlags.map(flag => (
                    <FlagCard key={flag.id} flag={flag} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>

      <ProjectFlagDialog
        open={dialogOpen}
        projectId={projectId}
        flag={selectedFlag}
        onClose={() => {
          setDialogOpen(false);
          setSelectedFlag(null);
        }}
        onSave={() => {
          setDialogOpen(false);
          loadFlags();
        }}
      />
    </Card>
  );
};

interface FlagCardProps {
  flag: ProjectFlag;
  onResolve?: () => void;
}

const FlagCard: React.FC<FlagCardProps> = ({ flag, onResolve }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${severityColors[flag.severity]}`,
        backgroundColor: flag.resolved_at ? 'action.hover' : 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label={flagTypeLabels[flag.flag_type]}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={flag.severity.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: `${severityColors[flag.severity]}20`,
                color: severityColors[flag.severity],
                fontWeight: 600,
              }}
            />
            {flag.is_confidential && (
              <Chip label="Confidential" size="small" color="warning" />
            )}
            {flag.resolved_at && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Resolved"
                size="small"
                color="success"
              />
            )}
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {flag.message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Flagged by {flag.flaggedBy?.full_name || 'Unknown'} on{' '}
            {new Date(flag.created_at).toLocaleDateString()}
          </Typography>
          {flag.resolved_at && flag.resolvedBy && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Resolved by {flag.resolvedBy.full_name} on{' '}
              {new Date(flag.resolved_at).toLocaleDateString()}
            </Typography>
          )}
          {flag.resolution_notes && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Resolution Notes:
              </Typography>
              <Typography variant="body2">{flag.resolution_notes}</Typography>
            </Box>
          )}
        </Box>
        {onResolve && !flag.resolved_at && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={onResolve}
          >
            Resolve
          </Button>
        )}
      </Box>
    </Box>
  );
};

