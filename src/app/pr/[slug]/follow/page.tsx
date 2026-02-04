'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  IconButton,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Timeline as TimelineIcon,
  Feed as FeedIcon,
  Assessment as AssessmentIcon,
  Flag as FlagIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Create as CreateIcon,
  Update as UpdateIcon,
  SwapHoriz as SwapHorizIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  PauseCircle as PauseCircleIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  PlayCircle as PlayCircleIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { useFahrasTheme } from '@/providers/ThemeContext';
import { apiService } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ConfirmDialog } from '@/components/shared';
import type {
  Project,
  ProjectMilestone,
  TimelineData,
  ProjectActivity,
  ProjectFlag,
  ProjectFollower,
} from '@/types';

// ─── Tab Panel ──────────────────────────────────────────────

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`follow-tabpanel-${index}`}
      aria-labelledby={`follow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// ─── Activity Item ──────────────────────────────────────────

const activityIcons: Record<string, React.ReactNode> = {
  project_created: <CreateIcon />,
  project_updated: <UpdateIcon />,
  status_change: <SwapHorizIcon />,
  file_upload: <UploadIcon />,
  file_delete: <DeleteIcon />,
  comment_added: <CommentIcon />,
  milestone_started: <PlayArrowIcon />,
  milestone_completed: <CheckCircleIcon />,
  milestone_updated: <EditIcon />,
};

function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'recently';
  }
}

function ActivityItemCard({ activity }: { activity: ProjectActivity }) {
  const muiTheme = useTheme();

  const activityColors: Record<string, string> = {
    project_created: muiTheme.palette.success.main,
    project_updated: muiTheme.palette.info.main,
    status_change: muiTheme.palette.warning.main,
    file_upload: muiTheme.palette.secondary.main,
    file_delete: muiTheme.palette.error.main,
    comment_added: muiTheme.palette.info.light,
    milestone_started: muiTheme.palette.info.main,
    milestone_completed: muiTheme.palette.success.main,
    milestone_updated: muiTheme.palette.warning.main,
  };

  const icon = activityIcons[activity.activity_type] || <CreateIcon />;
  const color = activityColors[activity.activity_type] || muiTheme.palette.grey[500];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderColor: color,
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar sx={{ bgcolor: `${color}20`, color, width: 40, height: 40 }}>
          {icon}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {activity.user?.full_name || 'Unknown User'}
            </Typography>
            <Chip
              label={activity.title}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: `${color}20`,
                color,
                fontWeight: 500,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {activity.description || activity.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getRelativeTime(activity.created_at)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Activity Feed ──────────────────────────────────────────

const activityTypeOptions = [
  { value: '', label: 'All Activities' },
  { value: 'project_created', label: 'Project Created' },
  { value: 'project_updated', label: 'Project Updated' },
  { value: 'status_change', label: 'Status Changes' },
  { value: 'file_upload', label: 'File Uploads' },
  { value: 'file_delete', label: 'File Deletions' },
  { value: 'comment_added', label: 'Comments' },
  { value: 'milestone_started', label: 'Milestone Started' },
  { value: 'milestone_completed', label: 'Milestone Completed' },
  { value: 'milestone_updated', label: 'Milestone Updated' },
];

function ActivityFeed({ projectId }: { projectId: number }) {
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadActivities = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getProjectActivities(projectId, {
          activity_type: filterType || undefined,
          per_page: 20,
          page: pageNum,
        });
        if (pageNum === 1) {
          setActivities(response.activities || []);
        } else {
          setActivities(prev => [...prev, ...(response.activities || [])]);
        }
        setHasMore(
          (response.pagination?.current_page || 1) < (response.pagination?.last_page || 1),
        );
        setPage(pageNum);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load activities'));
      } finally {
        setLoading(false);
      }
    },
    [projectId, filterType],
  );

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const groupByDate = (items: ProjectActivity[]): Record<string, ProjectActivity[]> => {
    const groups: Record<string, ProjectActivity[]> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    (items || []).forEach(a => {
      const d = new Date(a.created_at);
      let key: string;
      if (d >= today) key = 'Today';
      else if (d >= yesterday) key = 'Yesterday';
      else {
        const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
        if (diff <= 7) key = 'This Week';
        else if (diff <= 30) key = 'This Month';
        else key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  };

  const grouped = groupByDate(activities);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Activity Feed
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              label="Filter by Type"
            >
              {activityTypeOptions.map(t => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && activities.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : Object.keys(grouped).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No activities found
            </Typography>
          </Box>
        ) : (
          <Box>
            {Object.entries(grouped).map(([dateGroup, dateActivities], idx) => (
              <Box key={dateGroup}>
                {idx > 0 && <Divider sx={{ my: 3 }} />}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {dateGroup}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(dateActivities || []).map(a => (
                    <ActivityItemCard key={a.id} activity={a} />
                  ))}
                </Box>
              </Box>
            ))}
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => loadActivities(page + 1)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Load More'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Milestone Timeline Item ────────────────────────────────

const statusIcons: Record<string, typeof CheckCircleIcon> = {
  completed: CheckCircleIcon,
  in_progress: PlayCircleIcon,
  not_started: PauseCircleIcon,
  blocked: BlockIcon,
  overdue: WarningIcon,
};

function MilestoneCard({
  milestone,
  status,
  progress,
  statusColor,
  onClick,
  onStart,
  onComplete,
  canEdit,
}: {
  milestone: ProjectMilestone;
  status: string;
  progress: number;
  statusColor: string;
  onClick: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  canEdit: boolean;
}) {
  const muiTheme = useTheme();

  const formatDate = (ds?: string) => {
    if (!ds) return 'No due date';
    return new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [relativeDue] = useState(() => {
    if (!milestone.due_date) return '';
    const diff = Math.ceil((new Date(milestone.due_date).getTime() - Date.now()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    if (diff <= 7) return `Due in ${diff} days`;
    return formatDate(milestone.due_date);
  });

  const StatusIcon = statusIcons[status] || PauseCircleIcon;
  const isOverdue =
    status === 'overdue' ||
    (milestone.due_date && new Date(milestone.due_date) < new Date() && milestone.status !== 'completed');

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: `2px solid ${statusColor}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { boxShadow: `0 4px 12px ${statusColor}40`, transform: 'translateY(-2px)' },
        height: '100%',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <StatusIcon sx={{ color: statusColor, fontSize: 28, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {milestone.title}
            </Typography>
            {milestone.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {milestone.description}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Chip
            label={status.replace('_', ' ').toUpperCase()}
            size="small"
            sx={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 20,
            }}
          />
        </Box>

        {milestone.due_date && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Due Date
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: isOverdue ? muiTheme.palette.error.main : 'text.primary' }}
            >
              {formatDate(milestone.due_date)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isOverdue ? muiTheme.palette.error.main : 'text.secondary',
                fontWeight: isOverdue ? 600 : 400,
              }}
            >
              {relativeDue}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: statusColor }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: muiTheme.palette.grey[300],
              '& .MuiLinearProgress-bar': { backgroundColor: statusColor, borderRadius: 4 },
            }}
          />
        </Box>

        {(milestone.dependencies || []).length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Depends on {(milestone.dependencies || []).length} milestone
              {(milestone.dependencies || []).length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {canEdit && (onStart || onComplete) && (
          <Box
            sx={{ display: 'flex', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
          >
            {onStart && milestone.status === 'not_started' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={e => {
                  e.stopPropagation();
                  onStart();
                }}
                sx={{ flex: 1, textTransform: 'none', bgcolor: muiTheme.palette.info.main, '&:hover': { bgcolor: muiTheme.palette.info.dark } }}
              >
                Start
              </Button>
            )}
            {onComplete && milestone.status === 'in_progress' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={e => {
                  e.stopPropagation();
                  onComplete();
                }}
                sx={{ flex: 1, textTransform: 'none', bgcolor: muiTheme.palette.success.main, '&:hover': { bgcolor: muiTheme.palette.success.dark } }}
              >
                Complete
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Milestone Detail Dialog ────────────────────────────────

function MilestoneDetailDialog({
  open,
  milestone,
  projectId,
  onClose,
  onUpdate,
  onDelete,
  onComplete,
  canEdit,
}: {
  open: boolean;
  milestone: ProjectMilestone | null;
  projectId: number;
  onClose: () => void;
  onUpdate?: (milestoneId: number, data: Partial<ProjectMilestone>) => Promise<void>;
  onDelete?: (milestoneId: number) => Promise<void>;
  onComplete?: (milestoneId: number, notes?: string) => Promise<void>;
  canEdit: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<ProjectMilestone['status']>('not_started');
  const [completionNotes, setCompletionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMilestones, setAvailableMilestones] = useState<ProjectMilestone[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<number[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, milestone, projectId]);

  const loadAvailableMilestones = async () => {
    try {
      const response = await apiService.getProjectMilestones(projectId);
      setAvailableMilestones(
        (response.milestones || []).filter(m => !milestone || m.id !== milestone.id),
      );
    } catch {
      // silent
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save milestone'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!milestone || !onDelete) return;
    setLoading(true);
    setError(null);
    try {
      await onDelete(milestone.id);
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete milestone'));
      setDeleteConfirmOpen(false);
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to complete milestone'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
              onChange={e => setTitle(e.target.value)}
              required
              fullWidth
              disabled={loading || (!isNew && !canEdit)}
            />
            <TextField
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              disabled={loading || (!isNew && !canEdit)}
            />
            <TextField
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={loading || (!isNew && !canEdit)}
            />
            {!isNew && (
              <FormControl fullWidth disabled={loading || !canEdit}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={e => setStatus(e.target.value as ProjectMilestone['status'])}
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
                  onChange={e => setSelectedDependencies(e.target.value as number[])}
                  label="Dependencies"
                  renderValue={selected =>
                    (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as number[]).map(id => {
                          const dep = availableMilestones.find(m => m.id === id);
                          return dep ? <Chip key={id} label={dep.title} size="small" /> : null;
                        })}
                      </Box>
                    )
                  }
                >
                  {availableMilestones.map(m => (
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
                onChange={e => setCompletionNotes(e.target.value)}
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
              onClick={() => setDeleteConfirmOpen(true)}
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Milestone"
        message="Are you sure you want to delete this milestone? This action cannot be undone."
        confirmText="Delete Milestone"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        severity="error"
        loading={loading}
      />
    </>
  );
}

// ─── Milestone Timeline ─────────────────────────────────────

function MilestoneTimeline({
  projectId,
  milestones: initialMilestones,
  onStart,
  onComplete,
  onUpdate,
  onDelete,
  canEdit,
  onRefresh,
}: {
  projectId: number;
  milestones: ProjectMilestone[];
  onStart: (id: number) => Promise<void>;
  onComplete: (id: number, notes?: string) => Promise<void>;
  onUpdate: (id: number, data: Partial<ProjectMilestone>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  canEdit: boolean;
  onRefresh: () => void;
}) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const statusColors: Record<string, string> = {
    completed: muiTheme.palette.success.main,
    in_progress: muiTheme.palette.info.main,
    not_started: muiTheme.palette.grey[500],
    blocked: muiTheme.palette.warning.main,
    overdue: muiTheme.palette.error.main,
  };

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

  const getMilestoneStatus = (m: ProjectMilestone): string => {
    if (m.status === 'completed') return 'completed';
    if (m.status === 'in_progress') return 'in_progress';
    if (m.status === 'blocked') return 'blocked';
    if (m.due_date && new Date(m.due_date) < new Date() && m.status === 'not_started') return 'overdue';
    return m.status;
  };

  const getProgress = (m: ProjectMilestone): number => {
    if (m.status === 'completed') return 100;
    if (m.status === 'in_progress') {
      if (m.started_at && m.due_date) {
        const start = new Date(m.started_at).getTime();
        const due = new Date(m.due_date).getTime();
        if (due > start) {
          return Math.min(90, Math.max(10, ((Date.now() - start) / (due - start)) * 100));
        }
      }
      return 50;
    }
    return 0;
  };

  const handleStart = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await onStart(id);
      onRefresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to start milestone'));
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await onComplete(id, notes);
      onRefresh();
      setDialogOpen(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to complete milestone'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, data: Partial<ProjectMilestone>) => {
    setLoading(true);
    setError(null);
    try {
      await onUpdate(id, data);
      onRefresh();
      setDialogOpen(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update milestone'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setMilestoneToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (milestoneToDelete === null) return;
    setLoading(true);
    setError(null);
    try {
      await onDelete(milestoneToDelete);
      onRefresh();
      setDialogOpen(false);
      setDeleteConfirmOpen(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete milestone'));
      setDeleteConfirmOpen(false);
    } finally {
      setLoading(false);
      setMilestoneToDelete(null);
    }
  };

  const sorted = [...milestones].sort((a, b) => a.order - b.order);

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

          {sorted.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No milestones yet. {canEdit && 'Add a milestone to get started.'}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                overflowX: isMobile ? 'visible' : 'auto',
                pb: 2,
              }}
            >
              {sorted.map((ms, idx) => {
                const msStatus = getMilestoneStatus(ms);
                const progress = getProgress(ms);
                const isLast = idx === sorted.length - 1;

                return (
                  <Box key={ms.id} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ minWidth: isMobile ? '100%' : 280, flexShrink: 0 }}>
                      <MilestoneCard
                        milestone={ms}
                        status={msStatus}
                        progress={progress}
                        statusColor={statusColors[msStatus] || statusColors.not_started}
                        onClick={() => {
                          setSelectedMilestone(ms);
                          setDialogOpen(true);
                        }}
                        onStart={
                          canEdit && ms.status === 'not_started' ? () => handleStart(ms.id) : undefined
                        }
                        onComplete={
                          canEdit && ms.status === 'in_progress'
                            ? () => handleComplete(ms.id)
                            : undefined
                        }
                        canEdit={canEdit}
                      />
                    </Box>
                    {!isLast && !isMobile && (
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 40, flexShrink: 0 }}>
                        <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                      </Box>
                    )}
                  </Box>
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
          onClose={() => setDialogOpen(false)}
          onUpdate={async (_id, data) => {
            await apiService.createMilestone(projectId, {
              title: data.title || '',
              description: data.description,
              due_date: data.due_date,
              dependencies: data.dependencies,
            });
            onRefresh();
            setDialogOpen(false);
          }}
          canEdit={canEdit}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Milestone"
        message="Are you sure you want to delete this milestone? This action cannot be undone."
        confirmText="Delete Milestone"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        severity="error"
        loading={loading}
      />
    </Box>
  );
}

// ─── Health Score ────────────────────────────────────────────

interface HealthScoreData {
  overall: number;
  activity: number;
  milestones: number;
  timeliness: number;
  engagement: number;
  files: number;
  recommendations: string[];
}

function HealthScorePanel({ score }: { score: HealthScoreData }) {
  const muiTheme = useTheme();

  const getScoreColor = (v: number) => {
    if (v >= 80) return muiTheme.palette.success.main;
    if (v >= 60) return muiTheme.palette.warning.main;
    return muiTheme.palette.error.main;
  };

  const getScoreLabel = (v: number) => {
    if (v >= 80) return 'Excellent';
    if (v >= 60) return 'Good';
    if (v >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getScoreIcon = (v: number) => {
    if (v >= 80) return <CheckCircleIcon sx={{ color: muiTheme.palette.success.main }} />;
    if (v >= 60) return <WarningIcon sx={{ color: muiTheme.palette.warning.main }} />;
    return <ErrorIcon sx={{ color: muiTheme.palette.error.main }} />;
  };

  const categories = [
    { label: 'Activity', value: score.activity, max: 25 },
    { label: 'Milestones', value: score.milestones, max: 30 },
    { label: 'Timeliness', value: score.timeliness, max: 20 },
    { label: 'Engagement', value: score.engagement, max: 15 },
    { label: 'Files', value: score.files, max: 10 },
  ];

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Project Health Score
        </Typography>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(score.overall)} 0deg ${(score.overall / 100) * 360}deg, ${muiTheme.palette.grey[300]} ${(score.overall / 100) * 360}deg 360deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: getScoreColor(score.overall) }}>
                {score.overall}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                / 100
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {getScoreIcon(score.overall)}
            <Typography variant="h6" sx={{ fontWeight: 600, color: getScoreColor(score.overall) }}>
              {getScoreLabel(score.overall)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            Score Breakdown
          </Typography>
          {categories.map(cat => (
            <Box key={cat.label} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {cat.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: getScoreColor(cat.value) }}>
                  {cat.value}/{cat.max}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(cat.value / cat.max) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: muiTheme.palette.grey[300],
                  '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(cat.value), borderRadius: 4 },
                }}
              />
            </Box>
          ))}
        </Box>

        {(score.recommendations || []).length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
              Recommendations
            </Typography>
            <List dense sx={{ p: 0 }}>
              {(score.recommendations || []).map((rec, i) => (
                <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={rec}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    sx={{ m: 0 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Project Flags ──────────────────────────────────────────

const flagTypeLabels: Record<ProjectFlag['flag_type'], string> = {
  scope_creep: 'Scope Creep',
  technical_blocker: 'Technical Blocker',
  team_conflict: 'Team Conflict',
  resource_shortage: 'Resource Shortage',
  timeline_risk: 'Timeline Risk',
  other: 'Other',
};

function FlagCard({ flag, onResolve }: { flag: ProjectFlag; onResolve?: () => void }) {
  const muiTheme = useTheme();
  const severityColors: Record<string, string> = {
    low: muiTheme.palette.success.main,
    medium: muiTheme.palette.warning.main,
    high: muiTheme.palette.error.main,
    critical: muiTheme.palette.error.dark,
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${severityColors[flag.severity]}`,
        bgcolor: flag.resolved_at ? 'action.hover' : 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Chip label={flagTypeLabels[flag.flag_type]} size="small" sx={{ fontWeight: 600 }} />
            <Chip
              label={flag.severity.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: `${severityColors[flag.severity]}20`,
                color: severityColors[flag.severity],
                fontWeight: 600,
              }}
            />
            {flag.is_confidential && <Chip label="Confidential" size="small" color="warning" />}
            {flag.resolved_at && (
              <Chip icon={<CheckCircleIcon />} label="Resolved" size="small" color="success" />
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
          <Button size="small" variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={onResolve}>
            Resolve
          </Button>
        )}
      </Box>
    </Box>
  );
}

function ProjectFlagDialog({
  open,
  projectId,
  onClose,
  onSave,
}: {
  open: boolean;
  projectId: number;
  onClose: () => void;
  onSave: () => void;
}) {
  const [flagType, setFlagType] = useState<ProjectFlag['flag_type']>('other');
  const [severity, setSeverity] = useState<ProjectFlag['severity']>('medium');
  const [message, setMessage] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFlagType('other');
      setSeverity('medium');
      setMessage('');
      setIsConfidential(false);
    }
  }, [open]);

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
              onChange={e => setFlagType(e.target.value as ProjectFlag['flag_type'])}
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
              onChange={e => setSeverity(e.target.value as ProjectFlag['severity'])}
              label="Severity"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
            <FormHelperText>Select the severity level of this issue</FormHelperText>
          </FormControl>
          <TextField
            label="Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
            helperText="Describe the issue or concern"
          />
          <FormControlLabel
            control={
              <Checkbox checked={isConfidential} onChange={e => setIsConfidential(e.target.checked)} />
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
}

function ProjectFlagsPanel({ projectId, canResolve }: { projectId: number; canResolve: boolean }) {
  const [flags, setFlags] = useState<ProjectFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterResolved, setFilterResolved] = useState<boolean | null>(null);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProjectFlags(projectId, {
        resolved: filterResolved !== null ? filterResolved : undefined,
        severity: filterSeverity ? (filterSeverity as ProjectFlag['severity']) : undefined,
      });
      setFlags(response.flags || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load flags'));
    } finally {
      setLoading(false);
    }
  }, [projectId, filterResolved, filterSeverity]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const handleResolveFlag = async (flagId: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.resolveFlag(flagId);
      await loadFlags();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to resolve flag'));
    } finally {
      setLoading(false);
    }
  };

  const unresolvedFlags = (flags || []).filter(f => !f.resolved_at);
  const resolvedFlags = (flags || []).filter(f => f.resolved_at);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Flags & Warnings
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterResolved === null ? '' : String(filterResolved)}
                onChange={e =>
                  setFilterResolved(e.target.value === '' ? null : e.target.value === 'true')
                }
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
                onChange={e => setFilterSeverity(e.target.value)}
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
              onClick={() => setDialogOpen(true)}
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
                  {unresolvedFlags.map(f => (
                    <FlagCard
                      key={f.id}
                      flag={f}
                      onResolve={canResolve ? () => handleResolveFlag(f.id) : undefined}
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
                  {resolvedFlags.map(f => (
                    <FlagCard key={f.id} flag={f} />
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
        onClose={() => setDialogOpen(false)}
        onSave={() => {
          setDialogOpen(false);
          loadFlags();
        }}
      />
    </Card>
  );
}

// ─── Followers Panel ────────────────────────────────────────

function FollowersPanel({ projectId }: { projectId: number }) {
  const [followers, setFollowers] = useState<ProjectFollower[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getProjectFollowers(projectId);
        setFollowers(response.followers || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load followers'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Followers ({(followers || []).length})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (followers || []).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No followers yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {(followers || []).map(follower => (
              <ListItem
                key={follower.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    {follower.user?.full_name ? getInitials(follower.user.full_name) : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={follower.user?.full_name || 'Unknown User'}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {follower.user?.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Following since {new Date(follower.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                {(follower.user?.roles || []).length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {(follower.user?.roles || []).map(role => (
                      <Chip
                        key={role.id}
                        label={role.name}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function ProjectFollowPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [project, setProject] = useState<Project | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreData>({
    overall: 0,
    activity: 0,
    milestones: 0,
    timeliness: 0,
    engagement: 0,
    files: 0,
    recommendations: [],
  });

  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { theme: fahrasTheme } = useFahrasTheme();
  const { user } = useAuthStore();

  const canEdit =
    (project?.created_by_user_id === user?.id ||
      user?.roles?.some(r => r.name === 'admin' || r.name === 'faculty')) ??
    false;

  const loadProjectData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const projectResponse = await apiService.getProject(slug);
      setProject(projectResponse.project);
      const projectId = projectResponse.project.id;

      const [milestonesRes, timelineRes, activitiesRes, followersRes] = await Promise.all([
        apiService.getProjectMilestones(projectId).catch(() => ({ milestones: [] })),
        apiService.getMilestoneTimeline(projectId).catch(() => ({ milestones: [], links: [] })),
        apiService.getProjectActivities(projectId, { per_page: 50 }).catch(() => ({
          activities: [],
          pagination: { current_page: 1, per_page: 50, total: 0, last_page: 1 },
        })),
        apiService.getProjectFollowers(projectId).catch(() => ({ followers: [] })),
      ]);

      setTimelineData(timelineRes);
      setIsFollowing((followersRes.followers || []).some(f => f.user_id === user?.id));

      calculateHealthScore(milestonesRes.milestones || [], activitiesRes.activities || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load project data'));
    } finally {
      setLoading(false);
    }
  }, [slug, user?.id]);

  const calculateHealthScore = (milestones: ProjectMilestone[], acts: ProjectActivity[]) => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    const total = milestones.length;
    const milestoneScore = total > 0 ? (completed / total) * 30 : 0;

    const recentActivities = acts.filter(a => {
      const daysSince = (Date.now() - new Date(a.created_at).getTime()) / 86400000;
      return daysSince <= 7;
    });
    const activityScore = Math.min(25, (recentActivities.length / 10) * 25);
    const overall = Math.round(milestoneScore + activityScore + 20 + 15 + 10);

    setHealthScore({
      overall: Math.min(100, overall),
      activity: Math.round(activityScore),
      milestones: Math.round(milestoneScore),
      timeliness: 20,
      engagement: 15,
      files: 10,
      recommendations: [],
    });
  };

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleFollow = async () => {
    if (!project) return;
    try {
      if (isFollowing) {
        await apiService.unfollowProject(project.id);
        setIsFollowing(false);
      } else {
        await apiService.followProject(project.id);
        setIsFollowing(true);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update follow status'));
    }
  };

  const handleMilestoneStart = async (milestoneId: number) => {
    await apiService.startMilestone(milestoneId);
    await loadProjectData();
  };

  const handleMilestoneComplete = async (milestoneId: number, notes?: string) => {
    await apiService.completeMilestone(milestoneId, notes);
    await loadProjectData();
  };

  const handleMilestoneUpdate = async (milestoneId: number, data: Partial<ProjectMilestone>) => {
    await apiService.updateMilestone(milestoneId, data);
    await loadProjectData();
  };

  const handleMilestoneDelete = async (milestoneId: number) => {
    await apiService.deleteMilestone(milestoneId);
    await loadProjectData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Project not found'}
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Slide in direction="up" timeout={500} mountOnEnter>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumb
          items={[
            { label: 'Projects', path: '/explore' },
            { label: project.title, path: `/pr/${project.slug}` },
            { label: 'Follow Manager' },
          ]}
        />

        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => router.push(`/pr/${project.slug}`)}
                sx={{ mr: 2, color: fahrasTheme.primary }}
                aria-label="Back to project"
              >
                <ArrowBackIcon />
              </IconButton>
              <TimelineIcon sx={{ color: fahrasTheme.primary, mr: 1, fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: fahrasTheme.primary }}>
                  Project Follow Manager
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {project.title}
                </Typography>
              </Box>
            </Box>
            <Button
              variant={isFollowing ? 'outlined' : 'contained'}
              startIcon={isFollowing ? <NotificationsOffIcon /> : <NotificationsIcon />}
              onClick={handleFollow}
              size="small"
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs
              value={activeTab}
              onChange={(_e, v) => setActiveTab(v)}
              aria-label="Project Follow tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 72,
                  fontSize: '1rem',
                  gap: 1,
                  '&.Mui-selected': { color: fahrasTheme.primary },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  backgroundColor: fahrasTheme.primary,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab
                icon={<TimelineIcon />}
                iconPosition="start"
                label="Timeline"
                id="follow-tab-0"
                aria-controls="follow-tabpanel-0"
              />
              <Tab
                icon={<FeedIcon />}
                iconPosition="start"
                label="Activity Feed"
                id="follow-tab-1"
                aria-controls="follow-tabpanel-1"
              />
              <Tab
                icon={<AssessmentIcon />}
                iconPosition="start"
                label="Health Score"
                id="follow-tab-2"
                aria-controls="follow-tabpanel-2"
              />
              <Tab
                icon={<FlagIcon />}
                iconPosition="start"
                label="Flags"
                id="follow-tab-3"
                aria-controls="follow-tabpanel-3"
              />
              <Tab
                icon={<PeopleIcon />}
                iconPosition="start"
                label="Followers"
                id="follow-tab-4"
                aria-controls="follow-tabpanel-4"
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <TabPanel value={activeTab} index={0}>
              {timelineData && (
                <MilestoneTimeline
                  projectId={project.id}
                  milestones={timelineData.milestones || []}
                  onStart={handleMilestoneStart}
                  onComplete={handleMilestoneComplete}
                  onUpdate={handleMilestoneUpdate}
                  onDelete={handleMilestoneDelete}
                  onRefresh={loadProjectData}
                  canEdit={canEdit}
                />
              )}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <ActivityFeed projectId={project.id} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <HealthScorePanel score={healthScore} />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <ProjectFlagsPanel projectId={project.id} canResolve={canEdit} />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
              <FollowersPanel projectId={project.id} />
            </TabPanel>
          </CardContent>
        </Card>
      </Container>
    </Slide>
  );
}
