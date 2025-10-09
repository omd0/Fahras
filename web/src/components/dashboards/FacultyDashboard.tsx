import React, { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Alert } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  RateReview as RateReviewIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
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
import { QuickActions, QuickAction } from '../shared/QuickActions';
import { ProjectCard } from '../shared/ProjectCard';

interface FacultyStats {
  advisingProjects: number;
  underReview: number;
  completed: number;
  thisMonth: number;
}

export const FacultyDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FacultyStats>({
    advisingProjects: 0,
    underReview: 0,
    completed: 0,
    thisMonth: 0,
  });

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const roleInfo = getRoleInfo('faculty');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects('per_page=20');
      const projectsData = Array.isArray(response) ? response : response.data || [];

      setProjects(projectsData);

      const advisingProjects = projectsData.filter((p: Project) => 
        (p.advisors || []).some(advisor => advisor.id === user?.id)
      );

      setStats({
        advisingProjects: advisingProjects.length,
        underReview: advisingProjects.filter((p: Project) => p.status === 'under_review').length,
        completed: advisingProjects.filter((p: Project) => p.status === 'completed').length,
        thisMonth: advisingProjects.filter((p: Project) => {
          const createdDate = new Date(p.created_at);
          const now = new Date();
          return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        }).length,
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const myAdvisingProjects = (projects || []).filter(p => 
    (p.advisors || []).some(advisor => advisor.id === user?.id)
  );

  const quickActions: QuickAction[] = [
    {
      label: 'Evaluate Projects',
      icon: RateReviewIcon,
      onClick: () => navigate('/evaluations'),
    },
    {
      label: 'View Analytics',
      icon: AssignmentIcon,
      onClick: () => navigate('/analytics'),
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: theme.primary }} />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.advisingProjects}
                label="Advising Projects"
                icon={SchoolIcon}
                gradient={`linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.underReview}
                label="Under Review"
                icon={RateReviewIcon}
                gradient={`linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.completed}
                label="Completed"
                icon={AssignmentIcon}
                gradient={`linear-gradient(135deg, ${theme.secondary} 0%, ${theme.secondary}dd 100%)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.thisMonth}
                label="This Month"
                icon={TrendingUpIcon}
                gradient="linear-gradient(135deg, #10b981 0%, #10b981dd 100%)"
              />
            </Grid>
          </Grid>

          <QuickActions theme={theme} actions={quickActions} />

          <Grid container spacing={3}>
            {myAdvisingProjects.slice(0, 6).map((project) => (
              <Grid size={{ xs: 12, md: 6 }} key={project.id}>
                <ProjectCard project={project} theme={theme} />
              </Grid>
            ))}
          </Grid>

          {myAdvisingProjects.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Alert severity="info">
                No advising projects yet. You will see projects here once students add you as their advisor.
              </Alert>
            </Box>
          )}
        </>
      )}
    </DashboardContainer>
  );
};
