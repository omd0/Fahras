import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon,
  PauseCircle as PauseCircleIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { ProjectMilestone, TimelineLink } from '@/types';
import { apiService } from '@/lib/api';
import { MilestoneTimelineItem } from './MilestoneTimelineItem';
import { MilestoneDetailDialog } from './MilestoneDetailDialog';
import { ConfirmDialog } from '../shared';

interface MilestoneTimelineProps {
  projectId: number;
  milestones: ProjectMilestone[];
  links: TimelineLink[];
  onMilestoneClick?: (milestone: ProjectMilestone) => void;
  onStart?: (milestoneId: number) => Promise<void>;
  onComplete?: (milestoneId: number, notes?: string) => Promise<void>;
  onUpdate?: (milestoneId: number, data: Partial<ProjectMilestone>) => Promise<void>;
  onDelete?: (milestoneId: number) => Promise<void>;
  canEdit?: boolean;
  onRefresh?: () => void;
}

const statusColors = {
  completed: '#4caf50',
  in_progress: '#2196f3',
  not_started: '#9e9e9e',
  blocked: '#ff9800',
  overdue: '#f44336',
};

const statusIcons = {
  completed: CheckCircleIcon,
  in_progress: PlayCircleIcon,
  not_started: PauseCircleIcon,
  blocked: BlockIcon,
  overdue: WarningIcon,
};

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  projectId,
  milestones: initialMilestones,
  links,
  onMilestoneClick,
  onStart,
  onComplete,
  onUpdate,
  onDelete,
  canEdit = false,
  onRefresh,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(initialMilestones);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<number | null>(null);

  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  const handleMilestoneClick = (milestone: ProjectMilestone) => {
    setSelectedMilestone(milestone);
    setDialogOpen(true);
    if (onMilestoneClick) {
      onMilestoneClick(milestone);
    }
  };

  const handleStart = async (milestoneId: number) => {
    if (!onStart) return;
    setLoading(true);
    setError(null);
    try {
      await onStart(milestoneId);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (milestoneId: number, notes?: string) => {
    if (!onComplete) return;
    setLoading(true);
    setError(null);
    try {
      await onComplete(milestoneId, notes);
      if (onRefresh) onRefresh();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (milestoneId: number, data: Partial<ProjectMilestone>) => {
    if (!onUpdate) return;
    setLoading(true);
    setError(null);
    try {
      await onUpdate(milestoneId, data);
      if (onRefresh) onRefresh();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (milestoneId: number) => {
    if (!onDelete) return;
    setMilestoneToDelete(milestoneId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || milestoneToDelete === null) return;
    
    setLoading(true);
    setError(null);
    try {
      await onDelete(milestoneToDelete);
      if (onRefresh) onRefresh();
      setDialogOpen(false);
      setDeleteConfirmOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete milestone');
      setDeleteConfirmOpen(false);
    } finally {
      setLoading(false);
      setMilestoneToDelete(null);
    }
  };

  const getMilestoneStatus = (milestone: ProjectMilestone): ProjectMilestone['status'] => {
    if (milestone.status === 'completed') return 'completed';
    if (milestone.status === 'in_progress') return 'in_progress';
    if (milestone.status === 'blocked') return 'blocked';
    
    // Check if overdue
    if (milestone.due_date) {
      const dueDate = new Date(milestone.due_date);
      const now = new Date();
      if (dueDate < now && milestone.status !== 'completed') {
        return 'overdue' as any;
      }
    }
    
    return milestone.status;
  };

  const getProgress = (milestone: ProjectMilestone): number => {
    if (milestone.status === 'completed') return 100;
    if (milestone.status === 'in_progress') {
      // Calculate progress based on time elapsed if started_at exists
      if (milestone.started_at && milestone.due_date) {
        const start = new Date(milestone.started_at).getTime();
        const due = new Date(milestone.due_date).getTime();
        const now = Date.now();
        if (due > start) {
          const elapsed = now - start;
          const total = due - start;
          return Math.min(90, Math.max(10, (elapsed / total) * 100));
        }
      }
      return 50; // Default progress for in_progress
    }
    return 0;
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Milestone Timeline
            </Typography>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedMilestone(null);
                  setDialogOpen(true);
                }}
                size="small"
              >
                Add Milestone
              </Button>
            )}
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {sortedMilestones.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No milestones yet. {canEdit && 'Add a milestone to get started.'}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: isMobile ? 'flex' : 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                overflowX: isMobile ? 'visible' : 'auto',
                pb: 2,
                position: 'relative',
              }}
            >
              {sortedMilestones.map((milestone, index) => {
                const status = getMilestoneStatus(milestone);
                const StatusIcon = statusIcons[status] || PauseCircleIcon;
                const progress = getProgress(milestone);
                const isLast = index === sortedMilestones.length - 1;

                return (
                  <React.Fragment key={milestone.id}>
                    <Box
                      sx={{
                        minWidth: isMobile ? '100%' : 280,
                        flexShrink: 0,
                      }}
                    >
                      <MilestoneTimelineItem
                        milestone={milestone}
                        status={status}
                        progress={progress}
                        StatusIcon={StatusIcon}
                        statusColor={statusColors[status] || statusColors.not_started}
                        onClick={() => handleMilestoneClick(milestone)}
                        onStart={canEdit && milestone.status === 'not_started' ? () => handleStart(milestone.id) : undefined}
                        onComplete={canEdit && milestone.status === 'in_progress' ? () => handleComplete(milestone.id) : undefined}
                        canEdit={canEdit}
                      />
                    </Box>
                    {!isLast && !isMobile && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: 40,
                          flexShrink: 0,
                        }}
                      >
                        <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                      </Box>
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {selectedMilestone !== null && (
        <MilestoneDetailDialog
          open={dialogOpen}
          milestone={selectedMilestone}
          projectId={projectId}
          onClose={() => {
            setDialogOpen(false);
            setSelectedMilestone(null);
          }}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onComplete={handleComplete}
          canEdit={canEdit}
        />
      )}

      {selectedMilestone === null && dialogOpen && canEdit && (
        <MilestoneDetailDialog
          open={dialogOpen}
          milestone={null}
          projectId={projectId}
          onClose={() => {
            setDialogOpen(false);
          }}
          onUpdate={async (milestoneId, data) => {
            // Create new milestone
            await apiService.createMilestone(projectId, {
              title: data.title || '',
              description: data.description,
              due_date: data.due_date,
              dependencies: data.dependencies,
            });
            if (onRefresh) onRefresh();
            setDialogOpen(false);
          }}
          canEdit={canEdit}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Milestone"
        message="Are you sure you want to delete this milestone? This action cannot be undone and may affect project progress tracking."
        confirmText="Delete Milestone"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        severity="error"
        loading={loading}
      />
    </Box>
  );
};

