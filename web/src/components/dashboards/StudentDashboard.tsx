import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Button, CircularProgress, Alert, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
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
import { ProjectCard } from '../shared/ProjectCard';

interface StudentStats {
  myProjects: number;
  inProgress: number;
  completed: number;
  pendingApproval: number;
}

export const StudentDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
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

          {/* Create Project CTA */}
          <Card sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)`,
            border: `2px dashed ${theme.primary}60`,
          }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <SchoolIcon sx={{ fontSize: 64, color: theme.primary, mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: theme.primary }}>
                Ready to Start Your Project?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a new graduation project and start documenting your work
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

          {/* My Projects */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
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
        </>
      )}
    </DashboardContainer>
  );
};
