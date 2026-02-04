'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
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
import { useRouter } from 'next/navigation';
import { getProjectDetailUrl } from '@/utils/projectRoutes';
import type { Project } from '@/types';
import { apiService } from '@/lib/api';
import { getRoleInfo } from '@/config/dashboardThemes';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';
import { DashboardContainer } from '@/components/shared/DashboardContainer';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { QuickActions } from '@/components/shared/QuickActions';
import type { QuickAction } from '@/components/shared/QuickActions';
import { getErrorMessage } from '@/utils/errorHandling';

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
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const roleInfo = getRoleInfo('admin', user?.full_name, t);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects({ per_page: 10 });
      const projectsData = Array.isArray(response)
        ? response
        : (response as { data: Project[] }).data || [];

      setProjects(projectsData);

      setStats({
        totalProjects: projectsData.length,
        pendingApprovals: projectsData.filter(
          (p: Project) => p.admin_approval_status === 'pending',
        ).length,
        approvedProjects: projectsData.filter(
          (p: Project) => p.admin_approval_status === 'approved',
        ).length,
        recentActivity: projectsData.filter((p: Project) => {
          const createdDate = new Date(p.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdDate > sevenDaysAgo;
        }).length,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'hidden':
        return 'error';
      default:
        return 'default';
    }
  };

  const quickActions: QuickAction[] = [
    {
      label: 'Project Approvals',
      icon: AssignmentIcon,
      onClick: () => router.push('/admin/projects'),
    },
    {
      label: 'User Management',
      icon: GroupIcon,
      onClick: () => router.push('/users'),
    },
    {
      label: 'Program',
      icon: TimelineIcon,
      onClick: () => router.push('/admin/milestone-templates'),
    },
    {
      label: 'Access Control',
      icon: SecurityIcon,
      onClick: () => router.push('/admin/access-control'),
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      onClick: () => router.push('/settings'),
      variant: 'outlined',
    },
  ];

  return (
    <DashboardContainer>
      <DashboardHeader
        icon={roleInfo.icon}
        greeting={roleInfo.greeting}
        userName={user?.full_name || ''}
        subtitle={roleInfo.subtitle}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
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
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard value={stats.totalProjects} label="Total Projects" icon={AssignmentIcon} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.pendingApprovals}
                label="Pending Approvals"
                icon={PendingIcon}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.approvedProjects}
                label="Approved Projects"
                icon={CheckCircleIcon}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.recentActivity}
                label="Recent Activity (7d)"
                icon={TrendingUpIcon}
              />
            </Grid>
          </Grid>

          <QuickActions actions={quickActions} />

          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Projects
                </Typography>
                <Button
                  variant="text"
                  onClick={() => router.push('/admin/projects')}
                  sx={{ color: theme.palette.primary.main }}
                >
                  View All
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(projects || []).slice(0, 5).map((project) => (
                  <Card
                    key={project.id}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        transform: 'translateY(-2px)',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                    onClick={() => router.push(getProjectDetailUrl(project))}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SchoolIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {project.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {(project.abstract || '').substring(0, 120)}...
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Chip
                              label={project.admin_approval_status}
                              color={getApprovalColor(project.admin_approval_status) as 'success' | 'warning' | 'error' | 'default'}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              by {project.creator?.full_name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {project.academic_year}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                          <VisibilityIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {(projects || []).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No projects to display
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardContainer>
  );
};
