import React from 'react';
import { Box, Tabs, Tab, Badge } from '@mui/material';
import {
  Code as CodeIcon,
  BugReport as IssuesIcon,
  CompareArrows as ReviewRequestsIcon,
  PlayArrow as ActionsIcon,
  Folder as ProjectsIcon,
  MenuBook as WikiIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getProjectDetailUrl, getProjectEditUrl, getProjectFollowUrl, getProjectCodeUrl, projectRoutes, getProjectSlug } from '../../utils/projectRoutes';

interface TabConfig {
  value: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const tabs: TabConfig[] = [
  { value: 'code', label: 'Code', icon: <CodeIcon /> },
  { value: 'issues', label: 'Issues', icon: <IssuesIcon />, badge: 0 },
  {
    value: 'review-requests',
    label: 'Review Requests',
    icon: <ReviewRequestsIcon />,
    badge: 0,
  },
  { value: 'actions', label: 'Actions', icon: <ActionsIcon /> },
  { value: 'projects', label: 'Projects', icon: <ProjectsIcon /> },
  { value: 'wiki', label: 'Wiki', icon: <WikiIcon /> },
];

interface RepositoryTabsProps {
  projectId: number;
  defaultTab?: string;
}

export const RepositoryTabs: React.FC<RepositoryTabsProps> = ({
  projectId,
  defaultTab = 'code',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { '*': pathMatch } = useParams<{ '*': string }>();

  // Extract current tab from URL
  // URL format: /projects/:id/code or /projects/:id/issues, etc.
  const currentPath = location.pathname;
  const pathParts = currentPath.split('/').filter(Boolean);
  
  // Find the tab value from the path
  // If we're at /projects/:id, default to 'code'
  // If we're at /projects/:id/code/..., use 'code'
  let currentTab = defaultTab;
  if (pathParts.length >= 3) {
    const tabValue = pathParts[2];
    const tabExists = tabs.find((t) => t.value === tabValue);
    if (tabExists) {
      currentTab = tabValue;
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    // Navigate to the tab route
    navigate(`/projects/${projectId}/${newValue}`);
  };

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 500,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge badgeContent={tab.badge} color="error" />
                )}
              </Box>
            }
            sx={{ minWidth: 'auto', px: 2 }}
          />
        ))}
      </Tabs>
    </Box>
  );
};



