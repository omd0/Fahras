import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Button, CircularProgress, Alert, Typography, Divider, Chip, IconButton, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
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
  const navigate = useNavigate();
  const { theme } = useTheme();
  const roleInfo = getRoleInfo('student');

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects('per_page=20');
      const projectsData = Array.isArray(response) ? response : response.data || [];

      setProjects(projectsData);

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

  return (
    <DashboardContainer theme={theme}>
      <DashboardHeader
        theme={theme}
        icon={roleInfo.icon}
        greeting={roleInfo.greeting}
        userName={user?.full_name || ''}
        subtitle={roleInfo.subtitle}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: theme.primary }} />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.myProjects}
                label="My Projects"
                icon={SchoolIcon}
                gradient={`linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.inProgress}
                label="In Progress"
                icon={TrendingUpIcon}
                gradient={`linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.completed}
                label="Completed"
                icon={CheckCircleIcon}
                gradient={`linear-gradient(135deg, ${theme.secondary} 0%, ${theme.secondary}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.pendingApproval}
                label="Pending Approval"
                icon={PendingIcon}
                gradient="linear-gradient(135deg, #f59e0b 0%, #f59e0bdd 100%)"
              />
            </Grid>
          </Grid>

          {/* Activity Feed and Notifications Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Recent Activity / Notifications Widget */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotificationsIcon sx={{ color: theme.primary }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Recent Activity
                      </Typography>
                    </Box>
                    <Chip
                      label={notifications.filter(n => !n.is_read).length}
                      size="small"
                      sx={{
                        bgcolor: theme.primary,
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {notificationsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress size={40} sx={{ color: theme.primary }} />
                    </Box>
                  ) : notifications.length > 0 ? (
                    <>
                      <List sx={{ p: 0 }}>
                        {notifications.map((notification) => (
                          <ListItem
                            key={notification.id}
                            sx={{
                              px: 0,
                              py: 1.5,
                              cursor: 'pointer',
                              borderRadius: 2,
                              bgcolor: notification.is_read ? 'transparent' : `${theme.primary}08`,
                              '&:hover': {
                                bgcolor: `${theme.primary}15`,
                              },
                              mb: 1,
                            }}
                            onClick={() => {
                              if (!notification.is_read) {
                                handleMarkNotificationRead(notification.id);
                              }
                              if (notification.project?.id) {
                                navigate(`/projects/${notification.project.id}`);
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {getNotificationIcon(notification.type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: notification.is_read ? 400 : 600 }}>
                                  {notification.title}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    {notification.message}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTimeAgo(notification.created_at)}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <Button
                        fullWidth
                        variant="text"
                        endIcon={<OpenInNewIcon />}
                        onClick={() => navigate('/dashboard')}
                        sx={{
                          color: theme.primary,
                          textTransform: 'none',
                          fontWeight: 500,
                        }}
                      >
                        View All Notifications
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No recent activity
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)`,
                border: `2px dashed ${theme.primary}60`,
                height: '100%',
              }}>
                <CardContent sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                  <SchoolIcon sx={{ fontSize: 64, color: theme.primary, mb: 2, mx: 'auto' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: theme.primary }}>
                    Ready to Start Your Project?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                    Create a new graduation project and start documenting your work. Share your innovations with the TVTC community.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/create')}
                    sx={{
                      background: theme.appBarGradient,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      mx: 'auto',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Create New Project
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* My Projects */}
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>My Projects</Typography>
                <Typography variant="body2" color="text.secondary">
                  {myProjects.length} {myProjects.length === 1 ? 'project' : 'projects'}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {myProjects.map((project) => (
                  <Grid size={{ xs: 12, md: 6 }} key={project.id}>
                    <ProjectCard
                      project={project}
                      theme={theme}
                      showProgress={true}
                      showEdit={true}
                      showApprovalStatus={true}
                      currentUserId={user?.id}
                    />
                  </Grid>
                ))}
              </Grid>

              {myProjects.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No projects yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first graduation project to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/create')}
                    sx={{ background: theme.appBarGradient }}
                  >
                    Create Project
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* All Projects */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>All Projects</Typography>
                <Button variant="text" onClick={() => navigate('/analytics')} sx={{ color: theme.primary }}>
                  View All
                </Button>
              </Box>

              <Grid container spacing={3}>
                {(projects || []).slice(0, 6).map((project) => (
                  <Grid size={{ xs: 12, md: 6 }} key={`all-${project.id}`}>
                    <ProjectCard
                      project={project}
                      theme={theme}
                    />
                  </Grid>
                ))}
              </Grid>

              {projects.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Alert severity="info">
                    No projects available yet.
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardContainer>
  );
};
