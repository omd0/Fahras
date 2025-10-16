import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Button, CircularProgress, Alert, Typography, IconButton, Chip } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon,
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
import { UniversalSearchBox } from '../shared/UniversalSearchBox';

interface DashboardStats {
  totalProjects: number;
  pendingApprovals: number;
  approvedProjects: number;
  recentActivity: number;
}

export const AdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    pendingApprovals: 0,
    approvedProjects: 0,
    recentActivity: 0,
  });

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const roleInfo = getRoleInfo('admin');

  useEffect(() => {
    fetchDashboardData();
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
      const allProjectsData = Array.isArray(response) ? response : response.data || [];

      // Filter projects for Recent Projects section: only show approved projects added by users
      const recentProjectsData = allProjectsData.filter((p: Project) => 
        p.admin_approval_status === 'approved' && p.created_by_user_id
      );

      setProjects(recentProjectsData);
      setFilteredProjects(recentProjectsData);

      // Fetch pending approval count separately using the dedicated API endpoint
      let pendingApprovalsCount = 0;
      try {
        const pendingCountResponse = await apiService.getPendingApprovalCount();
        pendingApprovalsCount = pendingCountResponse.count;
      } catch (error) {
        console.warn('Failed to fetch pending approval count:', error);
        // Fallback to local calculation if API fails
        pendingApprovalsCount = allProjectsData.filter((p: Project) => p.admin_approval_status === 'pending').length;
      }

      setStats({
        totalProjects: allProjectsData.length,
        pendingApprovals: pendingApprovalsCount,
        approvedProjects: allProjectsData.filter((p: Project) => p.admin_approval_status === 'approved').length,
        recentActivity: allProjectsData.filter((p: Project) => {
          const createdDate = new Date(p.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdDate > sevenDaysAgo;
        }).length,
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
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
      if (filters.academic_year_filter) params.academic_year = filters.academic_year_filter;
      if (filters.semester) params.semester = filters.semester;
      if (filters.admin_approval_status) params.admin_approval_status = filters.admin_approval_status;
      if (filters.created_by_user_id) params.created_by_user_id = filters.created_by_user_id;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;
      if (filters.title_search) params.title_search = filters.title_search;
      if (filters.is_public !== null && filters.is_public !== undefined) params.is_public = filters.is_public;

      const response = await apiService.getProjects(params);
      const allProjectsData = Array.isArray(response) ? response : response.data || [];

      // Filter search results: only show approved projects added by users (unless specifically searching for other statuses)
      const filteredProjectsData = allProjectsData.filter((p: Project) => {
        // If admin is specifically searching for a different approval status, show those results
        if (filters.admin_approval_status && filters.admin_approval_status !== 'approved') {
          return p.admin_approval_status === filters.admin_approval_status;
        }
        // Otherwise, only show approved projects added by users
        return p.admin_approval_status === 'approved' && p.created_by_user_id;
      });

      setFilteredProjects(filteredProjectsData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'hidden': return 'error';
      default: return 'default';
    }
  };

  const actionIcons = [
    {
      icon: <GroupIcon />,
      tooltip: 'User Management',
      onClick: () => navigate('/users'),
    },
    {
      icon: <SettingsIcon />,
      tooltip: 'Settings',
      onClick: () => navigate('/settings'),
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
        actionIcons={actionIcons}
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
                onClick={() => navigate('/approvals')}
                clickable
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard
                value={stats.approvedProjects}
                label="Approved Projects"
                icon={CheckCircleIcon}
                gradient={`linear-gradient(135deg, ${theme.secondary} 0%, ${theme.secondary}dd 100%)`}
                onClick={() => navigate('/admin/projects?tab=1&approval_status=approved')}
                clickable
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

          {/* Search Section */}
          <Box sx={{ 
            '& .MuiPaper-root': {
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: `2px solid ${theme.primary}20`,
            },
            '& .MuiButton-contained': {
              background: theme.appBarGradient,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
            },
          }}>
            <UniversalSearchBox 
              onSearch={handleSearch}
              onClear={handleClearSearch}
              loading={isSearching}
              theme={theme}
              variant="default"
              showAdvancedFilters={true}
              roleSpecificFilters={{
                showAdminApproval: true,
                showCreatorFilter: true,
                showPublicFilter: true,
              }}
              placeholder="Search projects, creators, or content..."
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

          {/* My Projects */}
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>My Projects</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(filteredProjects || []).filter(p => p.created_by_user_id === user?.id).length} {(filteredProjects || []).filter(p => p.created_by_user_id === user?.id).length === 1 ? 'project' : 'projects'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(filteredProjects || [])
                  .filter(p => p.created_by_user_id === user?.id)
                  .slice(0, 5)
                  .map((project) => (
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
                      onClick={() => navigate(`/dashboard/projects/${project.id}`)}
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

              {(filteredProjects || []).filter(p => p.created_by_user_id === user?.id).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Alert severity="info">
                    No projects created yet. Create your first project to get started.
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* All Projects */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {filteredProjects.length !== projects.length ? 'Search Results' : 'All Projects'}
                </Typography>
                <Button variant="text" onClick={() => navigate('/admin/projects')} sx={{ color: theme.primary }}>
                  View All
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(filteredProjects || []).slice(0, 5).map((project) => (
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
                    onClick={() => navigate(`/projects/${project.id}`)}
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
