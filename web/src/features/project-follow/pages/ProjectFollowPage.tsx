import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Timeline as TimelineIcon,
  Feed as FeedIcon,
  Assessment as AssessmentIcon,
  Flag as FlagIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectDetailUrl, getProjectEditUrl, getProjectFollowUrl, getProjectCodeUrl, projectRoutes, getProjectSlug } from '@/utils/projectRoutes';
import { DashboardContainer } from '@/components/shared/DashboardContainer';
import { useTheme } from '@/providers/ThemeContext';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import { Project, ProjectMilestone, TimelineData, ProjectActivity } from '@/types';
import { MilestoneTimeline } from '@/features/project-follow/components/MilestoneTimeline';
import { ActivityFeed } from '@/features/project-follow/components/ActivityFeed';
import { ProjectHealthScore } from '@/features/project-follow/components/ProjectHealthScore';
import { ProjectFlags } from '@/features/project-follow/components/ProjectFlags';
import { ProjectFollowers } from '@/features/project-follow/components/ProjectFollowers';
import { Breadcrumb, BreadcrumbItem } from '@/components/shared/Breadcrumb';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-follow-tabpanel-${index}`}
      aria-labelledby={`project-follow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProjectFollowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState({
    overall: 0,
    activity: 0,
    milestones: 0,
    timeliness: 0,
    engagement: 0,
    files: 0,
    recommendations: [] as string[],
  });

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const projectId = id ? parseInt(id) : 0;
  const canEdit = project?.created_by_user_id === user?.id || 
                  user?.roles?.some(r => r.name === 'admin' || r.name === 'faculty');

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load project
      const projectResponse = await apiService.getProject(projectId);
      setProject(projectResponse.project);

      // Load milestones and timeline
      const milestonesResponse = await apiService.getProjectMilestones(projectId);
      setMilestones(milestonesResponse.milestones);

      const timelineResponse = await apiService.getMilestoneTimeline(projectId);
      setTimelineData(timelineResponse);

      // Load activities
      const activitiesResponse = await apiService.getProjectActivities(projectId, { per_page: 50 });
      setActivities(activitiesResponse.activities);

      // Check if following
      const followersResponse = await apiService.getProjectFollowers(projectId);
      setIsFollowing(followersResponse.followers.some(f => f.user_id === user?.id));

      // TODO: Load health score (will be implemented in backend)
      // For now, calculate a simple score
      calculateHealthScore(milestonesResponse.milestones, activitiesResponse.activities);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = (milestones: ProjectMilestone[], activities: ProjectActivity[]) => {
    // Simple calculation - will be replaced with backend service
    const completed = milestones.filter(m => m.status === 'completed').length;
    const total = milestones.length;
    const milestoneScore = total > 0 ? (completed / total) * 30 : 0;

    const recentActivities = activities.filter(a => {
      const daysSince = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });
    const activityScore = Math.min(25, (recentActivities.length / 10) * 25);

    const overall = Math.round(milestoneScore + activityScore + 20 + 15 + 10); // Placeholder
    setHealthScore({
      overall: Math.min(100, overall),
      activity: Math.round(activityScore),
      milestones: Math.round(milestoneScore),
      timeliness: 20,
      engagement: 15,
      files: 10,
      recommendations: [],
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await apiService.unfollowProject(projectId);
        setIsFollowing(false);
      } else {
        await apiService.followProject(projectId);
        setIsFollowing(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update follow status');
    }
  };

  const handleMilestoneStart = async (milestoneId: number) => {
    await apiService.startMilestone(milestoneId);
    await loadProjectData();
  };

  const handleMilestoneComplete = async (milestoneId: number, notes?: string) => {
    await apiService.completeMilestone(milestoneId, notes);
    await loadProjectData();
  };

  const handleMilestoneUpdate = async (milestoneId: number, data: Partial<ProjectMilestone>) => {
    await apiService.updateMilestone(milestoneId, data);
    await loadProjectData();
  };

  const handleMilestoneDelete = async (milestoneId: number) => {
    await apiService.deleteMilestone(milestoneId);
    await loadProjectData();
  };

  if (loading) {
    return (
      <DashboardContainer theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  if (error || !project) {
    return (
      <DashboardContainer theme={theme}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Project not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </DashboardContainer>
    );
  }

  // Generate breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Projects', path: '/explore' },
    { label: project.title, path: getProjectDetailUrl(project) },
    { label: 'Follow Manager', icon: <TimelineIcon fontSize="small" /> },
  ];

  return (
    <DashboardContainer theme={theme}>
      <Breadcrumb items={breadcrumbItems} />
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate(`/projects/${projectId}`)}
              sx={{ mr: 2, color: theme.primary }}
              aria-label="Back to project"
            >
              <ArrowBackIcon />
            </IconButton>
            <TimelineIcon sx={{ color: theme.primary, mr: 1, fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: theme.primary }}>
                Project Follow Manager
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {project.title}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant={isFollowing ? 'outlined' : 'contained'}
              startIcon={isFollowing ? <NotificationsOffIcon /> : <NotificationsIcon />}
              onClick={handleFollow}
              size="small"
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Project Follow tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 72,
                fontSize: '1rem',
                gap: 1,
                '&.Mui-selected': {
                  color: theme.primary,
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                backgroundColor: theme.primary,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              icon={<TimelineIcon />}
              iconPosition="start"
              label="Timeline"
              id="project-follow-tab-0"
              aria-controls="project-follow-tabpanel-0"
            />
            <Tab
              icon={<FeedIcon />}
              iconPosition="start"
              label="Activity Feed"
              id="project-follow-tab-1"
              aria-controls="project-follow-tabpanel-1"
            />
            <Tab
              icon={<AssessmentIcon />}
              iconPosition="start"
              label="Health Score"
              id="project-follow-tab-2"
              aria-controls="project-follow-tabpanel-2"
            />
            <Tab
              icon={<FlagIcon />}
              iconPosition="start"
              label="Flags"
              id="project-follow-tab-3"
              aria-controls="project-follow-tabpanel-3"
            />
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label="Followers"
              id="project-follow-tab-4"
              aria-controls="project-follow-tabpanel-4"
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <TabPanel value={activeTab} index={0}>
            {timelineData && (
              <MilestoneTimeline
                projectId={projectId}
                milestones={timelineData.milestones}
                links={timelineData.links}
                onStart={handleMilestoneStart}
                onComplete={handleMilestoneComplete}
                onUpdate={handleMilestoneUpdate}
                onDelete={handleMilestoneDelete}
                onRefresh={loadProjectData}
                canEdit={canEdit || false}
              />
            )}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <ActivityFeed projectId={projectId} initialActivities={activities} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <ProjectHealthScore score={healthScore} />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <ProjectFlags projectId={projectId} canResolve={canEdit || false} />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <ProjectFollowers projectId={projectId} />
          </TabPanel>
        </CardContent>
      </Card>
    </DashboardContainer>
  );
};

