import React, { useState, useEffect } from 'react';
import { designTokens } from '@/styles/designTokens';
import { Box, Card, CardContent, Grid, Button, CircularProgress, Alert, Typography } from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  School as SchoolIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { apiService } from '@/lib/api';
import { getRoleInfo } from '@/config/dashboardThemes';
import { useAuthStore } from '@/features/auth/store';
import { useTheme } from '@mui/material';
import { useLanguage } from '@/providers/LanguageContext';
import { DashboardContainer } from '@/components/shared/DashboardContainer';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { ProjectCard } from '@/components/shared/ProjectCard';

interface FacultyStats {
  advisingProjects: number;
  underReview: number;
  completed: number;
  thisMonth: number;
}

export const FacultyHomeDashboard: React.FC = () => {
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
  const theme = useTheme();
  const { t } = useLanguage();
  const roleInfo = getRoleInfo('faculty', user?.full_name, t);
  const userIsFaculty = (user?.roles || []).some(role => role.name === 'faculty');

  const isMyAdvisingProject = (project: Project) => {
    const advisors = project.advisors || [];
    const isAdvisor = advisors.some(advisor => advisor?.id === user?.id);
    const createdByCurrentFaculty = userIsFaculty && (
      project.created_by_user_id === user?.id ||
      project.creator?.id === user?.id
    );

    return isAdvisor || createdByCurrentFaculty;
  };

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

      const advisingProjects = projectsData.filter(isMyAdvisingProject);

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
    } catch (error: unknown) {
      // Error logged in development only
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader
        icon={roleInfo.icon}
        greeting={roleInfo.greeting}
        userName={user?.full_name || ''}
        subtitle={roleInfo.subtitle}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : (
        <>
          {/* Main Action Buttons */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  background: designTokens.colors.primary[500],
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }
                }}
                onClick={() => navigate('/analytics')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <AnalyticsIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('View Analytics')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('Leadership insights with filters for specialization and year')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  background: designTokens.colors.primary[500],
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }
                }}
                onClick={() => navigate('/advisor-projects')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SchoolIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('My Advising Projects')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('Manage and filter your advising projects')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  background: designTokens.colors.surface[50],
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }
                }}
                onClick={() => navigate('/pr/create')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <ArchiveIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('Archive/Add Project')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('Administrative project management')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* My Advising Projects Section */}
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('My Advising Projects')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.advisingProjects} {stats.advisingProjects === 1 ? t('project') : t('projects')}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {(projects || [])
                  .filter(isMyAdvisingProject)
                  .slice(0, 6)
                  .map((project) => (
                    <Grid size={{ xs: 12, md: 6 }} key={project.id}>
                      <ProjectCard project={project} />
                    </Grid>
                  ))}
              </Grid>

              {stats.advisingProjects === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Alert severity="info">
                    {t('No advising projects yet. You will see projects here once students add you as their advisor.')}
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* All Projects Section */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('All Projects')}</Typography>
                <Button variant="text" onClick={() => navigate('/analytics')} sx={{ color: theme.palette.primary.main }}>
                  {t('View All')}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {(projects || []).slice(0, 6).map((project) => (
                  <Grid size={{ xs: 12, md: 6 }} key={project.id}>
                    <ProjectCard project={project} />
                  </Grid>
                ))}
              </Grid>

              {projects.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Alert severity="info">
                    {t('No projects available yet.')}
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
