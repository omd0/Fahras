'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { designTokens } from '@/styles/designTokens';
import { colorPalette } from '@/styles/theme/colorPalette';
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
  Badge,
  Container,
  useTheme,
  alpha,
  Skeleton,
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
  Rocket as RocketIcon,
  Group as GroupIcon,
  AutoAwesome as AutoAwesomeIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getProjectDetailUrl, projectRoutes } from '@/utils/projectRoutes';
import type { Project } from '@/types';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';
import { getErrorMessage } from '@/utils/errorHandling';
import { ProjectCard } from '@/components/shared/ProjectCard';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    myProjects: 0,
    inProgress: 0,
    completed: 0,
    pendingApproval: 0,
  });

  const { user } = useAuthStore();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const myProjectsRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects({
        per_page: 20,
        sort_by: 'updated_at',
        sort_order: 'desc',
      });
      const projectsData = Array.isArray(response) ? response : (response as { data: Project[] }).data || [];

      setProjects(projectsData);

      const myProjectsList = projectsData.filter(
        (p: Project) =>
          p.created_by_user_id === user?.id ||
          (p.members || []).some((member) => member.id === user?.id),
      );

      setStats({
        myProjects: myProjectsList.length,
        inProgress: myProjectsList.filter((p: Project) =>
          ['submitted', 'under_review'].includes(p.status),
        ).length,
        completed: myProjectsList.filter((p: Project) => p.status === 'completed').length,
        pendingApproval: myProjectsList.filter(
          (p: Project) => p.admin_approval_status === 'pending',
        ).length,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await apiService.getNotifications({ per_page: 5 });
      setNotifications(response.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, [fetchDashboardData]);

  const handleMarkNotificationRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
      );
    } catch {
      /* noop */
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <CommentIcon sx={{ color: 'info.main' }} />;
      case 'rating':
        return <StarIcon sx={{ color: 'warning.main' }} />;
      case 'project_status':
        return <AssignmentIcon sx={{ color: 'success.main' }} />;
      default:
        return <InfoIcon sx={{ color: 'text.secondary' }} />;
    }
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

  const myProjects = (projects || []).filter(
    (p) =>
      p.created_by_user_id === user?.id ||
      (p.members || []).some((member) => member.id === user?.id),
  );

  const handleMyProjectsClick = () => {
    if (myProjectsRef.current) {
      myProjectsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInProgressClick = () => router.push('/student/my-projects?section=in-progress');
  const handleCompletedClick = () => router.push('/student/my-projects?section=completed');
  const handlePendingApprovalClick = () =>
    router.push('/student/my-projects?section=pending-approval');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: designTokens.colors.primary[500],
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%), 
                      radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: 4,
              borderRadius: 4,
              background: designTokens.colors.surface[50],
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
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={3}
              sx={{ position: 'relative', zIndex: 1 }}
            >
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
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: 'white',
                  }}
                >
                  {t('Welcome back')}, {user?.full_name?.split(' ')[0] || t('Student')}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  {t("Ready to build something amazing? Let's explore your projects.")}
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
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {loading ? (
          <Box>
            <Grid container spacing={3} sx={{ mb: 5 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Skeleton variant="text" width={60} height={50} />
                          <Skeleton variant="text" width={120} height={30} />
                        </Box>
                        <Skeleton variant="circular" width={60} height={60} />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="up" in timeout={600}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      background: designTokens.colors.primary[500],
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
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
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: 'white' }}>
                            {stats.myProjects}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ opacity: 0.9, fontWeight: 500, color: 'white' }}
                          >
                            {t('My Projects')}
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
                      background: designTokens.colors.primary[500],
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.3)}`,
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
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: 'white' }}>
                            {stats.inProgress}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ opacity: 0.9, fontWeight: 500, color: 'white' }}
                          >
                            {t('In Progress')}
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
                      background: designTokens.colors.primary[500],
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.3)}`,
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
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: 'white' }}>
                            {stats.completed}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ opacity: 0.9, fontWeight: 500, color: 'white' }}
                          >
                            {t('Completed')}
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
                      background: designTokens.colors.surface[50],
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
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: 'white' }}>
                            {stats.pendingApproval}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ opacity: 0.9, fontWeight: 500, color: 'white' }}
                          >
                            {t('Pending Approval')}
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

            <Grid container spacing={4} sx={{ mb: 5 }}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Slide direction="up" in timeout={1400}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      background: designTokens.colors.surface[50],
                      border: `1px solid ${alpha(colorPalette.secondary.main, 0.15)}`,
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
                        background: designTokens.colors.surface[50],
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 3 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              background: designTokens.colors.surface[50],
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            }}
                          >
                            <NotificationsIcon
                              sx={{ fontSize: 24, color: colorPalette.warning.main }}
                            />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: 'text.primary' }}
                            >
                              {t('Recent Activity')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('Stay updated with your projects')}
                            </Typography>
                          </Box>
                        </Stack>
                        <Badge
                          badgeContent={notifications.filter((n) => !n.is_read).length}
                          color="error"
                        >
                          <Chip
                            label={t('Live')}
                            size="small"
                            sx={{
                              background: designTokens.colors.surface[50],
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Badge>
                      </Stack>

                      {notificationsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                          <CircularProgress size={40} />
                        </Box>
                      ) : (notifications || []).length > 0 ? (
                        <>
                          <List sx={{ p: 0 }}>
                            {(notifications || []).map((notification, index) => (
                              <Fade in timeout={600 + index * 100} key={notification.id}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    mb: 2,
                                    borderRadius: 3,
                                    border: `1px solid ${alpha(colorPalette.secondary.main, 0.12)}`,
                                    background: notification.is_read
                                      ? 'transparent'
                                      : `linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)',
                                    },
                                  }}
                                  onClick={() => {
                                    if (!notification.is_read) {
                                      handleMarkNotificationRead(notification.id);
                                    }
                                    if (notification.project?.id) {
                                      router.push(getProjectDetailUrl(notification.project));
                                    }
                                  }}
                                >
                                  <ListItem sx={{ p: 2 }}>
                                    <ListItemIcon sx={{ minWidth: 48 }}>
                                      <Avatar
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          background: designTokens.colors.surface[50],
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
                                            sx={{ display: 'block', mb: 1 }}
                                          >
                                            {notification.message}
                                          </Typography>
                                          <Stack direction="row" alignItems="center" spacing={1}>
                                            <AccessTimeIcon
                                              sx={{ fontSize: 14, color: 'text.secondary' }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                              {formatTimeAgo(notification.created_at)}
                                            </Typography>
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
                            onClick={() => router.push('/notifications')}
                            sx={{
                              background: designTokens.colors.surface[50],
                              borderRadius: 2,
                              py: 1.5,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            {t('View All Notifications')}
                          </Button>
                        </>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              background: designTokens.colors.surface[50],
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <NotificationsIcon
                              sx={{ fontSize: 40, color: colorPalette.warning.main }}
                            />
                          </Avatar>
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            {t('No recent activity')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("You're all caught up! Check back later for updates.")}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>

              <Grid size={{ xs: 12, lg: 8 }}>
                <Slide direction="up" in timeout={1600}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      background: designTokens.colors.primary[500],
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <CardContent
                      sx={{
                        textAlign: 'center',
                        py: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          background: designTokens.colors.primary[500],
                          mx: 'auto',
                          mb: 3,
                          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        <RocketIcon sx={{ fontSize: 60 }} />
                      </Avatar>

                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          mb: 2,
                          background: designTokens.colors.primary[500],
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {t('Ready to Build Something Amazing?')}
                      </Typography>

                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 4, maxWidth: 600, mx: 'auto', fontWeight: 400 }}
                      >
                        {t(
                          'Create a new graduation project and start documenting your work. Share your innovations with the community.',
                        )}
                      </Typography>

                      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 3 }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<AddIcon />}
                          onClick={() => router.push(projectRoutes.create())}
                          sx={{
                            background: designTokens.colors.primary[500],
                            px: 6,
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            borderRadius: 3,
                            textTransform: 'none',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                            },
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {t('Create New Project')}
                        </Button>
                      </Stack>

                      <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AutoAwesomeIcon
                            sx={{ color: theme.palette.primary.main, fontSize: 20 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {t('Innovation Ready')}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <GroupIcon
                            sx={{ color: theme.palette.secondary.main, fontSize: 20 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {t('Community Driven')}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmojiEventsIcon
                            sx={{ color: theme.palette.secondary.main, fontSize: 20 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {t('Excellence Focused')}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            </Grid>

            <Slide direction="up" in timeout={2000}>
              <Paper
                ref={myProjectsRef}
                elevation={0}
                sx={{
                  mb: 5,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  background: designTokens.colors.surface[50],
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: designTokens.colors.primary[500],
                  },
                }}
              >
                <Box sx={{ p: 4 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 4 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: designTokens.colors.primary[500],
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {t('My Projects')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {myProjects.length}{' '}
                          {myProjects.length === 1 ? t('project') : t('projects')}{' '}
                          {t('in your portfolio')}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      variant="text"
                      onClick={() => router.push('/student/my-projects')}
                      sx={{ color: theme.palette.primary.main }}
                    >
                      {t('View All')}
                    </Button>
                  </Stack>

                  <Grid container spacing={3}>
                    {(myProjects || []).slice(0, 6).map((project) => (
                      <Grid size={{ xs: 12, md: 6 }} key={project.id}>
                        <ProjectCard project={project} />
                      </Grid>
                    ))}
                  </Grid>

                  {myProjects.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <SchoolIcon
                        sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        {t('No projects yet. Create your first project to get started!')}
                      </Typography>
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
