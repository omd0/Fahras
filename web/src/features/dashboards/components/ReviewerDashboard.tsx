import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Button, CircularProgress, Alert, Typography, Chip } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  RateReview as RateReviewIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Clear as ClearIcon,
  FilterAlt as FilterAltIcon,
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
import { StatsCard } from '@/components/shared/StatsCard';
import { designTokens } from '@/styles/designTokens';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { ProjectSearch } from '@/features/projects/components/ProjectSearch';

interface ReviewerStats {
  totalProjects: number;
  reviewed: number;
  thisWeek: number;
  approvedProjects: number;
}

export const ReviewerDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<ReviewerStats>({
    totalProjects: 0,
    reviewed: 0,
    thisWeek: 0,
    approvedProjects: 0,
  });

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();
  const roleInfo = getRoleInfo('reviewer', user?.full_name, t);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects('per_page=100');
      const projectsData = Array.isArray(response) ? response : response.data || [];

      const approvedProjects = projectsData.filter((p: Project) => 
        p.admin_approval_status === 'approved'
      );

      setProjects(approvedProjects);
      setFilteredProjects(approvedProjects);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      setStats({
        totalProjects: approvedProjects.length,
        reviewed: approvedProjects.filter((p: Project) => p.status === 'under_review').length,
        thisWeek: approvedProjects.filter((p: Project) => {
          const createdDate = new Date(p.created_at);
          return createdDate > weekAgo;
        }).length,
        approvedProjects: approvedProjects.filter((p: Project) => p.status === 'approved').length,
      });
    } catch (error: any) {
      // Error logged in development only
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
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
      if (filters.semester) params.semester = filters.semester;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;

      const response = await apiService.getProjects(params);
      const projectsData = Array.isArray(response) ? response : response.data || [];

      // Filter for approved projects only (reviewers should only see approved projects)
      const approvedProjects = projectsData.filter((p: Project) => 
        p.admin_approval_status === 'approved'
      );

      setFilteredProjects(approvedProjects);
    } catch (error: any) {
      // Error logged in development only
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

  const needsReview = filteredProjects.filter(p => p.status === 'submitted' || p.status === 'under_review');
  const displayProjects = filteredProjects.slice(0, 6);

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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.totalProjects}
                label="Total Projects"
                icon={AssignmentIcon}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.reviewed}
                label="Under Review"
                icon={RateReviewIcon}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.approvedProjects}
                label="Approved"
                icon={CheckCircleIcon}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.thisWeek}
                label="This Week"
                icon={TrendingUpIcon}
              />
            </Grid>
          </Grid>

          {/* Search Section */}
          <Box sx={{ 
            '& .MuiPaper-root': {
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: `2px solid ${theme.palette.primary.main}20`,
            },
            '& .MuiButton-contained': {
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
            },
            '& .MuiChip-colorPrimary': {
              background: theme.palette.primary.main,
              color: 'white',
            },
          }}>
            <ProjectSearch 
              onSearch={handleSearch}
              onClear={handleClearSearch}
              loading={isSearching}
            />
          </Box>

          {/* Search Results Summary and Clear Button */}
          {filteredProjects.length !== projects.length && (
            <Box sx={{ mb: 3 }}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  background: `${theme.palette.primary.main}10`,
                  border: `1px solid ${theme.palette.primary.main}40`,
                  '& .MuiAlert-icon': {
                    color: theme.palette.primary.main,
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
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
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

          {/* Projects Needing Review */}
          {needsReview.length > 0 && (
            <Card sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              background: designTokens.colors.surface[50],
              border: `2px solid ${theme.palette.secondary.main}40`,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                    ⚠️ Projects Needing Review
                  </Typography>
                  <Chip label={`${needsReview.length} pending`} color="warning" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  These projects are awaiting review and evaluation
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RateReviewIcon />}
                  onClick={() => navigate('/analytics')}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  View Projects
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Projects Display */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {filteredProjects.length !== projects.length ? 'Search Results' : 'Recent Projects'}
                </Typography>
                <Button variant="text" onClick={() => navigate('/analytics')} sx={{ color: theme.palette.primary.main }}>
                  View All
                </Button>
              </Box>

              <Grid container spacing={3}>
                {(displayProjects || []).map((project) => (
                  <Grid size={{ xs: 12, md: 6 }} key={project.id}>
                    <ProjectCard project={project} />
                  </Grid>
                ))}
              </Grid>

              {filteredProjects.length === 0 && projects.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Alert severity="info">
                    No projects match your search criteria. Try adjusting your filters.
                  </Alert>
                </Box>
              )}

              {projects.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Alert severity="info">
                    No projects available. Projects will appear here once they are approved by administrators.
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
