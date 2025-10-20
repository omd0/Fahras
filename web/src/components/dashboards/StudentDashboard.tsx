import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  CircularProgress, 
  Alert, 
  Typography, 
  Divider, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Paper,
  Stack,
  Avatar,
  Fade,
  Slide,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Container,
  useTheme as useMuiTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon,
  Rocket as RocketIcon,
  Analytics as AnalyticsIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  EmojiEvents as EmojiEventsIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  Timeline as TimelineIcon,
  TrendingFlat as TrendingFlatIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { apiService } from '../../services/api';
import { getRoleInfo } from '../../config/dashboardThemes';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { DashboardContainer } from '../shared/DashboardContainer';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatsCard } from '../shared/StatsCard';
import { ProjectCard } from '../shared/ProjectCard';
import { UniversalSearchBox } from '../shared/UniversalSearchBox';

interface StudentStats {
  myProjects: number;
  inProgress: number;
  completed: number;
  pendingApproval: number;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  project?: Project;
}

export const StudentDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<StudentStats>({
    myProjects: 0,
    inProgress: 0,
    completed: 0,
    pendingApproval: 0,
  });

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const roleInfo = getRoleInfo('student');
  const myProjectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent projects sorted by updated_at descending to show most recently updated first
      const response = await apiService.getProjects({
        per_page: 20,
        sort_by: 'updated_at',
        sort_order: 'desc'
      });
      const projectsData = Array.isArray(response) ? response : response.data || [];

      setProjects(projectsData);
      setFilteredProjects(projectsData);

      const myProjects = projectsData.filter((p: Project) => 
        p.created_by_user_id === user?.id || 
        (p.members || []).some(member => member.id === user?.id)
      );

      setStats({
        myProjects: myProjects.length,
        inProgress: myProjects.filter((p: Project) => 
          ['submitted', 'under_review'].includes(p.status)
        ).length,
        completed: myProjects.filter((p: Project) => p.status === 'completed').length,
        pendingApproval: myProjects.filter((p: Project) => 
          p.admin_approval_status === 'pending'
        ).length,
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await apiService.getNotifications({ per_page: 5 });
      setNotifications(response.notifications || []);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkNotificationRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <CommentIcon sx={{ color: '#3b82f6' }} />;
      case 'rating':
        return <StarIcon sx={{ color: '#f59e0b' }} />;
      case 'project_status':
        return <AssignmentIcon sx={{ color: '#059669' }} />;
      default:
        return <InfoIcon sx={{ color: '#6b7280' }} />;
    }
  };

  const handleSearch = async (filters: any) => {
    try {
      setIsSearching(true);
      setError(null);

      // Build query parameters from filters
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.program_id) params.program_id = filters.program_id;
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.academic_year) params.academic_year = filters.academic_year;
      if (filters.academic_year_filter) params.academic_year = filters.academic_year_filter;
      if (filters.semester) params.semester = filters.semester;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;
      if (filters.title_search) params.title_search = filters.title_search;
      if (filters.is_public !== null && filters.is_public !== undefined) params.is_public = filters.is_public;

      const response = await apiService.getProjects(params);
      const projectsData = Array.isArray(response) ? response : response.data || [];

      setFilteredProjects(projectsData);
    } catch (error: any) {
      console.error('Failed to search projects:', error);
      setError(error.response?.data?.message || 'Failed to search projects');
      setFilteredProjects([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setFilteredProjects(projects);
    setIsSearching(false);
  };

  const handleMyProjectsClick = () => {
    if (myProjectsRef.current) {
      myProjectsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const handleInProgressClick = () => {
    navigate('/student/my-projects?section=in-progress');
  };

  const handleCompletedClick = () => {
    navigate('/student/my-projects?section=completed');
  };

  const handlePendingApprovalClick = () => {
    navigate('/student/my-projects?section=pending-approval');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const myProjects = (projects || []).filter(p => 
    p.created_by_user_id === user?.id || 
    (p.members || []).some(member => member.id === user?.id)
  );

  const muiTheme = useMuiTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.primary, 0.05)} 0%, ${alpha(theme.secondary, 0.05)} 50%, ${alpha(theme.accent, 0.05)} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha(theme.primary, 0.1)} 0%, transparent 50%), 
                      radial-gradient(circle at 80% 20%, ${alpha(theme.secondary, 0.1)} 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, ${alpha(theme.accent, 0.1)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
        {/* Modern Header Section */}
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(50px, -50px)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '150px',
                height: '150px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
                transform: 'translate(-30px, 30px)',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                <RocketIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 🚀
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Ready to build something amazing? Let's explore your projects and create new innovations.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Fade>

        {error && (
          <Fade in timeout={600}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Stack alignItems="center" spacing={3}>
              <CircularProgress 
                size={60} 
                sx={{ 
                  color: theme.primary,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }} 
              />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                Loading your dashboard...
              </Typography>
            </Stack>
        </Box>
      ) : (
        <>
            {/* Enhanced Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="up" in timeout={600}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${alpha(theme.primary, 0.8)} 100%)`,
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(theme.primary, 0.3)}`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'rgba(255,255,255,0.3)',
                      },
                    }}
                onClick={handleMyProjectsClick}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                            {stats.myProjects}
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            My Projects
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 30 }} />
                        </Avatar>
                      </Stack>
                    </CardContent>
                  </Card>
                </Slide>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="up" in timeout={800}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${theme.accent} 0%, ${alpha(theme.accent, 0.8)} 100%)`,
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(theme.accent, 0.3)}`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'rgba(255,255,255,0.3)',
                      },
                    }}
                onClick={handleInProgressClick}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                            {stats.inProgress}
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            In Progress
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <TrendingUpIcon sx={{ fontSize: 30 }} />
                        </Avatar>
                      </Stack>
                    </CardContent>
                  </Card>
                </Slide>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="up" in timeout={1000}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${theme.secondary} 0%, ${alpha(theme.secondary, 0.8)} 100%)`,
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(theme.secondary, 0.3)}`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'rgba(255,255,255,0.3)',
                      },
                    }}
                onClick={handleCompletedClick}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                            {stats.completed}
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            Completed
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 30 }} />
                        </Avatar>
                      </Stack>
                    </CardContent>
                  </Card>
                </Slide>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="up" in timeout={1200}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'rgba(255,255,255,0.3)',
                      },
                    }}
                onClick={handlePendingApprovalClick}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                            {stats.pendingApproval}
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            Pending Approval
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <PendingIcon sx={{ fontSize: 30 }} />
                        </Avatar>
                      </Stack>
                    </CardContent>
                  </Card>
                </Slide>
            </Grid>
          </Grid>

            {/* Modern Activity Feed and Quick Actions */}
            <Grid container spacing={4} sx={{ mb: 5 }}>
              {/* Enhanced Notifications Widget */}
            <Grid size={{ xs: 12, lg: 4 }}>
                <Slide direction="up" in timeout={1400}>
                  <Card 
                    sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: `1px solid ${alpha(theme.primary, 0.1)}`,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                            }}
                          >
                            <NotificationsIcon sx={{ fontSize: 24 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Recent Activity
                      </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Stay updated with your projects
                            </Typography>
                    </Box>
                        </Stack>
                        <Badge
                          badgeContent={notifications.filter(n => !n.is_read).length}
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            },
                          }}
                        >
                    <Chip
                            label="Live"
                      size="small"
                      sx={{
                              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                        </Badge>
                      </Stack>

                  {notificationsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                          <Stack alignItems="center" spacing={2}>
                      <CircularProgress size={40} sx={{ color: theme.primary }} />
                            <Typography variant="body2" color="text.secondary">
                              Loading notifications...
                            </Typography>
                          </Stack>
                    </Box>
                  ) : notifications.length > 0 ? (
                    <>
                      <List sx={{ p: 0 }}>
                            {notifications.map((notification, index) => (
                              <Fade in timeout={600 + index * 100} key={notification.id}>
                                <Paper
                                  elevation={0}
                            sx={{
                                    mb: 2,
                                    borderRadius: 3,
                                    border: `1px solid ${alpha(theme.primary, 0.1)}`,
                                    background: notification.is_read 
                                      ? 'transparent' 
                                      : `linear-gradient(135deg, ${alpha(theme.primary, 0.05)} 0%, ${alpha(theme.secondary, 0.05)} 100%)`,
                              cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: `0 8px 25px ${alpha(theme.primary, 0.15)}`,
                                      borderColor: theme.primary,
                              },
                            }}
                            onClick={() => {
                              if (!notification.is_read) {
                                handleMarkNotificationRead(notification.id);
                              }
                              if (notification.project?.id) {
                                navigate(`/dashboard/projects/${notification.project.id}`);
                              }
                            }}
                          >
                                  <ListItem sx={{ p: 2 }}>
                                    <ListItemIcon sx={{ minWidth: 48 }}>
                                      <Avatar
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                        }}
                                      >
                              {getNotificationIcon(notification.type)}
                                      </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            fontWeight: notification.is_read ? 500 : 700,
                                            color: 'text.primary',
                                            mb: 0.5,
                                          }}
                                        >
                                  {notification.title}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                          <Typography 
                                            variant="caption" 
                                            color="text.secondary" 
                                            sx={{ 
                                              display: 'block', 
                                              mb: 1,
                                              lineHeight: 1.4,
                                            }}
                                          >
                                    {notification.message}
                                  </Typography>
                                          <Stack direction="row" alignItems="center" spacing={1}>
                                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTimeAgo(notification.created_at)}
                                    </Typography>
                                            {!notification.is_read && (
                                              <Box
                                                sx={{
                                                  width: 8,
                                                  height: 8,
                                                  borderRadius: '50%',
                                                  background: theme.primary,
                                                }}
                                              />
                                            )}
                                          </Stack>
                                </Box>
                              }
                            />
                          </ListItem>
                                </Paper>
                              </Fade>
                        ))}
                      </List>

                          <Divider sx={{ my: 3 }} />

                      <Button
                        fullWidth
                            variant="contained"
                        endIcon={<OpenInNewIcon />}
                        onClick={() => navigate('/notifications')}
                        sx={{
                              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                              borderRadius: 2,
                              py: 1.5,
                          textTransform: 'none',
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 25px ${alpha(theme.primary, 0.3)}`,
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        View All Notifications
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              background: `linear-gradient(135deg, ${alpha(theme.primary, 0.1)} 0%, ${alpha(theme.secondary, 0.1)} 100%)`,
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <NotificationsIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                          </Avatar>
                          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                        No recent activity
                      </Typography>
                          <Typography variant="body2" color="text.secondary">
                            You're all caught up! Check back later for updates.
                          </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
                </Slide>
            </Grid>

              {/* Enhanced Quick Actions */}
            <Grid size={{ xs: 12, lg: 8 }}>
                <Slide direction="up" in timeout={1600}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      background: `linear-gradient(135deg, ${alpha(theme.primary, 0.05)} 0%, ${alpha(theme.secondary, 0.05)} 100%)`,
                      border: `2px solid ${alpha(theme.primary, 0.2)}`,
                height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`,
                      },
                    }}
                  >
                    <CardContent sx={{ 
                      textAlign: 'center', 
                      py: 6, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      height: '100%',
                      position: 'relative',
                    }}>
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          mx: 'auto',
                          mb: 3,
                          boxShadow: `0 8px 32px ${alpha(theme.primary, 0.3)}`,
                        }}
                      >
                        <RocketIcon sx={{ fontSize: 60 }} />
                      </Avatar>
                      
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800, 
                        mb: 2, 
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        Ready to Build Something Amazing?
                  </Typography>
                      
                      <Typography variant="h6" color="text.secondary" sx={{ 
                        mb: 4, 
                        maxWidth: 600, 
                        mx: 'auto',
                        fontWeight: 400,
                        lineHeight: 1.6,
                      }}>
                        Create a new graduation project and start documenting your work. 
                        Share your innovations with the TVTC community and make your mark in technology.
                  </Typography>
                      
                      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/create')}
                    sx={{
                            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                            px: 6,
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            borderRadius: 3,
                            textTransform: 'none',
                      '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: `0 12px 40px ${alpha(theme.primary, 0.4)}`,
                      },
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    Create New Project
                  </Button>
                        
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<AnalyticsIcon />}
                          onClick={() => navigate('/analytics')}
                          sx={{
                            borderColor: theme.primary,
                            color: theme.primary,
                            px: 6,
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 3,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: theme.primary,
                              backgroundColor: alpha(theme.primary, 0.05),
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          View Analytics
                        </Button>
                      </Stack>
                      
                      <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AutoAwesomeIcon sx={{ color: theme.primary, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Innovation Ready
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <GroupIcon sx={{ color: theme.secondary, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Community Driven
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmojiEventsIcon sx={{ color: theme.accent, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Excellence Focused
                          </Typography>
                        </Stack>
                      </Stack>
                </CardContent>
              </Card>
                </Slide>
            </Grid>
          </Grid>

            {/* Enhanced Search Section */}
            <Slide direction="up" in timeout={1800}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: `1px solid ${alpha(theme.primary, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                    }}
                  >
                    <PsychologyIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Smart Project Discovery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Find projects that match your interests and expertise
                    </Typography>
                  </Box>
                </Stack>
                
          <Box sx={{ 
            '& .MuiPaper-root': {
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: `2px solid ${alpha(theme.primary, 0.2)}`,
            },
            '& .MuiButton-contained': {
                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
              '&:hover': {
                transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.primary, 0.3)}`,
              },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}>
            <UniversalSearchBox 
              onSearch={handleSearch}
              onClear={handleClearSearch}
              loading={isSearching}
              theme={theme}
              variant="compact"
              showAdvancedFilters={true}
              roleSpecificFilters={{
                showPublicFilter: true,
              }}
              placeholder="Search projects and content..."
            />
          </Box>
              </Paper>
            </Slide>

          {/* Search Results Summary and Clear Button */}
          {filteredProjects.length !== projects.length && (
            <Box sx={{ mb: 3 }}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  background: `${theme.primary}10`,
                  border: `1px solid ${theme.primary}40`,
                  '& .MuiAlert-icon': {
                    color: theme.primary,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterAltIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">
                      Showing <strong>{filteredProjects.length}</strong> of <strong>{projects.length}</strong> projects
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={handleClearSearch}
                    disabled={isSearching}
                    sx={{
                      background: theme.appBarGradient,
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              </Alert>
            </Box>
          )}

            {/* Enhanced My Projects Section */}
            <Slide direction="up" in timeout={2000}>
              <Paper
                ref={myProjectsRef}
                elevation={0}
                sx={{
                  mb: 5,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: `1px solid ${alpha(theme.primary, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                  },
                }}
              >
                <Box sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          My Projects
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {myProjects.length} {myProjects.length === 1 ? 'project' : 'projects'} in your portfolio
                </Typography>
              </Box>
                    </Stack>
                    <Chip
                      label={`${myProjects.length} Total`}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                        py: 1,
                      }}
                    />
                  </Stack>

                  <Grid container spacing={4}>
                {(filteredProjects || [])
                  .filter(p => p.created_by_user_id === user?.id || 
                    (p.members || []).some(member => member.id === user?.id))
                      .map((project, index) => (
                      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                        <Fade in timeout={800 + index * 200}>
                          <Card
                            sx={{
                              borderRadius: 4,
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                              border: `1px solid ${alpha(theme.primary, 0.1)}`,
                              cursor: 'pointer',
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.02)',
                                boxShadow: `0 20px 40px ${alpha(theme.primary, 0.2)}`,
                                borderColor: theme.primary,
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                              },
                              '&:hover::before': {
                                opacity: 1,
                              },
                            }}
                            onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 700, 
                                      color: 'text.primary',
                                      mb: 1,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {project.title}
                                  </Typography>
                                  <Chip
                                    label={project.status.replace('_', ' ')}
                                    size="small"
                                    sx={{
                                      background: project.status === 'completed' 
                                        ? `linear-gradient(135deg, ${theme.secondary} 0%, ${alpha(theme.secondary, 0.8)} 100%)`
                                        : project.status === 'in_progress'
                                        ? `linear-gradient(135deg, ${theme.accent} 0%, ${alpha(theme.accent, 0.8)} 100%)`
                                        : `linear-gradient(135deg, ${theme.primary} 0%, ${alpha(theme.primary, 0.8)} 100%)`,
                                      color: 'white',
                                      fontWeight: 600,
                                      textTransform: 'capitalize',
                                    }}
                                  />
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Edit Project">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/projects/${project.id}/edit`);
                                      }}
                                      sx={{
                                        color: theme.primary,
                                        '&:hover': {
                                          backgroundColor: alpha(theme.primary, 0.1),
                                        },
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="View Project">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/projects/${project.id}`);
                                      }}
                                      sx={{
                                        color: theme.secondary,
                                        '&:hover': {
                                          backgroundColor: alpha(theme.secondary, 0.1),
                                        },
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>

                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 3, 
                                  minHeight: 60,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: 1.5,
                                }}
                              >
                                {project.abstract}
                              </Typography>

                              {/* Progress Bar */}
                              <Box sx={{ mb: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Progress
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: theme.primary }}>
                                    {(() => {
                                      const statusProgress: Record<string, number> = {
                                        'draft': 20,
                                        'submitted': 40,
                                        'under_review': 60,
                                        'approved': 80,
                                        'completed': 100,
                                      };
                                      return statusProgress[project.status] || 0;
                                    })()}%
                                  </Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={(() => {
                                    const statusProgress: Record<string, number> = {
                                      'draft': 20,
                                      'submitted': 40,
                                      'under_review': 60,
                                      'approved': 80,
                                      'completed': 100,
                                    };
                                    return statusProgress[project.status] || 0;
                                  })()}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: alpha(theme.primary, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                              </Box>

                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {project.academic_year} • {project.semester}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {project.creator?.full_name || 'Unknown'}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Fade>
                  </Grid>
                ))}
              </Grid>

              {myProjects.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          background: `linear-gradient(135deg, ${alpha(theme.primary, 0.1)} 0%, ${alpha(theme.secondary, 0.1)} 100%)`,
                          mx: 'auto',
                          mb: 3,
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                      </Avatar>
                      <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700, mb: 2 }}>
                    No projects yet
                  </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                        Create your first graduation project to get started on your journey of innovation and learning.
                  </Typography>
                  <Button
                    variant="contained"
                        size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/create')}
                        sx={{
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          px: 6,
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          borderRadius: 3,
                          textTransform: 'none',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(theme.primary, 0.3)}`,
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        Create Your First Project
                  </Button>
                </Box>
              )}
                </Box>
              </Paper>
            </Slide>

            {/* Enhanced All Projects Section */}
            <Slide direction="up" in timeout={2200}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: `1px solid ${alpha(theme.primary, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.secondary} 0%, ${theme.accent} 100%)`,
                  },
                }}
              >
                <Box sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.accent} 100%)`,
                        }}
                      >
                        <GroupIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          Community Projects
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Discover innovative projects from fellow students
                        </Typography>
              </Box>
                    </Stack>
                    <Button
                      variant="contained"
                      endIcon={<OpenInNewIcon />}
                      onClick={() => navigate('/analytics')}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.accent} 100%)`,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.secondary, 0.3)}`,
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      View All Projects
                    </Button>
                  </Stack>

                  <Grid container spacing={4}>
                {(filteredProjects || [])
                  .filter(p => p.created_by_user_id !== user?.id && 
                    !(p.members || []).some(member => member.id === user?.id))
                  .slice(0, 6)
                      .map((project, index) => (
                      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`all-${project.id}`}>
                        <Fade in timeout={1000 + index * 200}>
                          <Card
                            sx={{
                              borderRadius: 4,
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                              border: `1px solid ${alpha(theme.secondary, 0.1)}`,
                              cursor: 'pointer',
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.02)',
                                boxShadow: `0 20px 40px ${alpha(theme.secondary, 0.2)}`,
                                borderColor: theme.secondary,
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: `linear-gradient(90deg, ${theme.secondary} 0%, ${theme.accent} 100%)`,
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                              },
                              '&:hover::before': {
                                opacity: 1,
                              },
                            }}
                            onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 700, 
                                      color: 'text.primary',
                                      mb: 1,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {project.title}
                                  </Typography>
                                  <Chip
                                    label={project.status.replace('_', ' ')}
                                    size="small"
                                    sx={{
                                      background: project.status === 'completed' 
                                        ? `linear-gradient(135deg, ${theme.secondary} 0%, ${alpha(theme.secondary, 0.8)} 100%)`
                                        : project.status === 'in_progress'
                                        ? `linear-gradient(135deg, ${theme.accent} 0%, ${alpha(theme.accent, 0.8)} 100%)`
                                        : `linear-gradient(135deg, ${theme.primary} 0%, ${alpha(theme.primary, 0.8)} 100%)`,
                                      color: 'white',
                                      fontWeight: 600,
                                      textTransform: 'capitalize',
                                    }}
                                  />
                                </Box>
                                <Tooltip title="View Project">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/dashboard/projects/${project.id}`);
                                    }}
                                    sx={{
                                      color: theme.secondary,
                                      '&:hover': {
                                        backgroundColor: alpha(theme.secondary, 0.1),
                                      },
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>

                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 3, 
                                  minHeight: 60,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: 1.5,
                                }}
                              >
                                {project.abstract}
                              </Typography>

                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {project.academic_year} • {project.semester}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {project.creator?.full_name || 'Unknown'}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Fade>
                  </Grid>
                ))}
              </Grid>

              {(filteredProjects || []).filter(p => p.created_by_user_id !== user?.id && 
                !(p.members || []).some(member => member.id === user?.id)).length === 0 && projects.length > 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          background: `linear-gradient(135deg, ${alpha(theme.secondary, 0.1)} 0%, ${alpha(theme.accent, 0.1)} 100%)`,
                          mx: 'auto',
                          mb: 3,
                        }}
                      >
                        <GroupIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                      </Avatar>
                      <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700, mb: 2 }}>
                        No matching projects found
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                        Try adjusting your search filters to discover more projects from the community.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<RefreshIcon />}
                        onClick={handleClearSearch}
                        sx={{
                          borderColor: theme.secondary,
                          color: theme.secondary,
                          px: 6,
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: 3,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: theme.secondary,
                            backgroundColor: alpha(theme.secondary, 0.05),
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        Clear Filters
                      </Button>
                </Box>
              )}

              {projects.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          background: `linear-gradient(135deg, ${alpha(theme.secondary, 0.1)} 0%, ${alpha(theme.accent, 0.1)} 100%)`,
                          mx: 'auto',
                          mb: 3,
                        }}
                      >
                        <GroupIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                      </Avatar>
                      <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700, mb: 2 }}>
                        No community projects yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                        Be the first to create a project and inspire others in the community!
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/projects/create')}
                        sx={{
                          background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.accent} 100%)`,
                          px: 6,
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          borderRadius: 3,
                          textTransform: 'none',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(theme.secondary, 0.3)}`,
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        Create First Project
                      </Button>
                </Box>
              )}
                </Box>
              </Paper>
            </Slide>
        </>
      )}
      </Container>
    </Box>
  );
};
