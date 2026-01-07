import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Button, CircularProgress, Alert, Typography, IconButton, Chip, Skeleton } from '@mui/material';
import { getErrorMessage } from '@/utils/errorHandling';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getProjectDetailUrl, getProjectEditUrl, getProjectFollowUrl, getProjectCodeUrl, projectRoutes, getProjectSlug } from '@/utils/projectRoutes';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { getRoleInfo } from '@/config/dashboardThemes';
import { useAuthStore } from '@/features/auth/store';
import { useTheme } from '@/providers/ThemeContext';
import { useLanguage } from '@/providers/LanguageContext';
import { DashboardContainer } from '@/components/shared/DashboardContainer';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { QuickActions, QuickAction } from '@/components/shared/QuickActions';

interface DashboardStats {
  totalProjects: number;
  pendingApprovals: number;
  approvedProjects: number;
  recentActivity: number;
}

export const AdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    pendingApprovals: 0,
    approvedProjects: 0,
    recentActivity: 0,
  });

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const roleInfo = getRoleInfo('admin', user?.full_name, t);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects('per_page=10');
      const projectsData = Array.isArray(response) ? response : response.data || [];

      setProjects(projectsData);

      setStats({
        totalProjects: projectsData.length,
        pendingApprovals: projectsData.filter((p: Project) => p.admin_approval_status === 'pending').length,
        approvedProjects: projectsData.filter((p: Project) => p.admin_approval_status === 'approved').length,
        recentActivity: projectsData.filter((p: Project) => {
          const createdDate = new Date(p.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdDate > sevenDaysAgo;
        }).length,
      });
    } catch (error: any) {
      setError(getErrorMessage(error, 'Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'hidden': return 'error';
      default: return 'default';
    }
  };

  const quickActions: QuickAction[] = [
    {
      label: 'Project Approvals',
      icon: AssignmentIcon,
      onClick: () => navigate('/admin/projects'),
    },
    {
      label: 'User Management',
      icon: GroupIcon,
      onClick: () => navigate('/users'),
      gradient: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.secondary}dd 100%)`,
    },
    {
      label: 'Program',
      icon: TimelineIcon,
      onClick: () => navigate('/admin/milestone-templates'),
      gradient: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`,
    },
    {
      label: 'Access Control',
      icon: SecurityIcon,
      onClick: () => navigate('/admin/access-control'),
      gradient: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`,
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      onClick: () => navigate('/settings'),
      variant: 'outlined',
    },
  ];

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
        <Box>
          {/* Stats Cards Skeleton */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Skeleton variant="text" width={60} height={48} />
                        <Skeleton variant="text" width={120} height={24} />
                      </Box>
                      <Skeleton variant="circular" width={56} height={56} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions Skeleton */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 'grow' }} key={index}>
                    <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Projects Skeleton */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={100} height={32} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Card
                    key={index}
                    sx={{
                      border: '1px solid',
                      borderColor: theme.borderColor,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width="60%" height={32} />
                          </Box>
                          <Skeleton variant="text" width="90%" />
                          <Skeleton variant="text" width="70%" />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Skeleton variant="rounded" width={80} height={24} />
                            <Skeleton variant="text" width={150} />
                          </Box>
                        </Box>
                        <Skeleton variant="circular" width={40} height={40} />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.totalProjects}
                label="Total Projects"
                icon={AssignmentIcon}
                gradient={`linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.pendingApprovals}
                label="Pending Approvals"
                icon={PendingIcon}
                gradient={`linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.approvedProjects}
                label="Approved Projects"
                icon={CheckCircleIcon}
                gradient={`linear-gradient(135deg, ${theme.secondary} 0%, ${theme.secondary}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.recentActivity}
                label="Recent Activity (7d)"
                icon={TrendingUpIcon}
                gradient="linear-gradient(135deg, #10b981 0%, #10b981dd 100%)"
              />
            </Grid>
          </Grid>

          <QuickActions theme={theme} actions={quickActions} />

          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Projects</Typography>
                <Button variant="text" onClick={() => navigate('/admin/projects')} sx={{ color: theme.primary }}>
                  View All
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(projects || []).slice(0, 5).map((project) => (
                  <Card
                    key={project.id}
                    sx={{
                      border: `1px solid ${theme.borderColor}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        transform: 'translateY(-2px)',
                        borderColor: theme.primary,
                      },
                    }}
                    onClick={() => navigate(getProjectDetailUrl(project))}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SchoolIcon sx={{ color: theme.primary, mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {project.abstract.substring(0, 120)}...
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={project.admin_approval_status}
                              color={getStatusColor(project.admin_approval_status) as any}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              by {project.creator?.full_name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              • {project.academic_year}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" sx={{ color: theme.primary }}>
                          <VisibilityIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {projects.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No projects to display</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardContainer>
  );
};
