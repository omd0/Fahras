import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import { getDashboardTheme } from '@/config/dashboardThemes';
import { useLanguage } from '@/providers/LanguageContext';

interface Evaluation {
  id: number;
  project_id: number;
  project_title: string;
  score: number | null;
  status: string;
  due_date: string;
  created_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`evaluation-tabpanel-${index}`}
      aria-labelledby={`evaluation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const EvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    score: 0,
    remarks: '',
    criteria_scores: {} as Record<string, number>,
  });

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const _dashboardTheme = getDashboardTheme(user?.roles);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMyEvaluations();
      setEvaluations(response.data || []);
    } catch (error: unknown) {
      console.error('Failed to fetch evaluations:', error);
      setError(error.response?.data?.message || 'Failed to fetch evaluations');
    } finally {
      setLoading(false);
    }
  };

  const _handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleMenuClose = () => {
    setAnchorEl(null);
  };

  const _handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const _handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEvaluationClick = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setEvaluationForm({
      score: evaluation.score || 0,
      remarks: '',
      criteria_scores: {},
    });
    setEvaluationDialogOpen(true);
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedEvaluation) return;

    try {
      await apiService.submitEvaluation(selectedEvaluation.id, {
        score: evaluationForm.score,
        remarks: evaluationForm.remarks,
        criteria_scores: evaluationForm.criteria_scores,
      });
      
      setEvaluationDialogOpen(false);
      fetchEvaluations();
    } catch (error: unknown) {
      console.error('Failed to submit evaluation:', error);
      setError(error.response?.data?.message || 'Failed to submit evaluation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const pendingEvaluations = evaluations.filter(e => e.status === 'pending');
  const completedEvaluations = evaluations.filter(e => e.status === 'completed');
  const inProgressEvaluations = evaluations.filter(e => e.status === 'in_progress');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Evaluations
                </Typography>
                <Typography variant="h4">
                  {pendingEvaluations.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed Evaluations
                </Typography>
                <Typography variant="h4">
                  {completedEvaluations.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4">
                  {inProgressEvaluations.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="evaluation tabs">
            <Tab 
              label={`Pending (${pendingEvaluations.length})`} 
              icon={<PendingIcon />}
              iconPosition="start"
            />
            <Tab 
              label={`In Progress (${inProgressEvaluations.length})`} 
              icon={<AssignmentIcon />}
              iconPosition="start"
            />
            <Tab 
              label={`Completed (${completedEvaluations.length})`} 
              icon={<CheckCircleIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Pending Evaluations */}
        <TabPanel value={tabValue} index={0}>
          {pendingEvaluations.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                No Pending Evaluations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any pending evaluations at the moment.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(pendingEvaluations || []).map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {evaluation.project_title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {evaluation.project_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2"
                          color={isOverdue(evaluation.due_date) ? 'error' : 'text.primary'}
                        >
                          {formatDate(evaluation.due_date)}
                          {isOverdue(evaluation.due_date) && ' (Overdue)'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(evaluation.status)}
                          label={evaluation.status.replace('_', ' ')}
                          color={getStatusColor(evaluation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          startIcon={<StarIcon />}
                          onClick={() => handleEvaluationClick(evaluation)}
                          size="small"
                        >
                          Evaluate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* In Progress Evaluations */}
        <TabPanel value={tabValue} index={1}>
          {inProgressEvaluations.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                No In Progress Evaluations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any evaluations in progress.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(inProgressEvaluations || []).map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {evaluation.project_title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {evaluation.project_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(evaluation.due_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(evaluation.status)}
                          label={evaluation.status.replace('_', ' ')}
                          color={getStatusColor(evaluation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleEvaluationClick(evaluation)}
                          size="small"
                        >
                          Continue
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Completed Evaluations */}
        <TabPanel value={tabValue} index={2}>
          {completedEvaluations.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                No Completed Evaluations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You haven't completed any evaluations yet.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Completed Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(completedEvaluations || []).map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {evaluation.project_title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {evaluation.project_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating
                            value={(evaluation.score || 0) / 20}
                            readOnly
                            precision={0.1}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {evaluation.score}/100
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(evaluation.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(evaluation.status)}
                          label={evaluation.status.replace('_', ' ')}
                          color={getStatusColor(evaluation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleEvaluationClick(evaluation)}
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Container>

      {/* Evaluation Dialog */}
      <Dialog
        open={evaluationDialogOpen}
        onClose={() => setEvaluationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Evaluate Project: {selectedEvaluation?.project_title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Score
            </Typography>
            <Rating
              value={evaluationForm.score / 20}
              onChange={(event, newValue) => {
                setEvaluationForm(prev => ({
                  ...prev,
                  score: (newValue || 0) * 20
                }));
              }}
              precision={1}
              size="large"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Score: {evaluationForm.score}/100
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('Remarks')}
              value={evaluationForm.remarks}
              onChange={(e) => setEvaluationForm(prev => ({
                ...prev,
                remarks: e.target.value
              }))}
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvaluationDialogOpen(false)}>
            {t('Cancel')}
          </Button>
          <Button
            onClick={handleSubmitEvaluation}
            variant="contained"
            disabled={evaluationForm.score === 0}
          >
            {selectedEvaluation?.status === 'completed' ? 'Update Evaluation' : 'Submit Evaluation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
