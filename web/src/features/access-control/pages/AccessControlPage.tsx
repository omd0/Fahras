import React, { useState } from 'react';
import { Box, Tabs, Tab, IconButton, Typography, Card, CardContent, Chip } from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Security as SecurityIcon,
  Badge as BadgeIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DashboardContainer } from '@/components/shared/DashboardContainer';
import { useTheme } from '@/providers/ThemeContext';
import { RolesTab } from '@/features/access-control/components/RolesTab';
import { UsersTab } from '@/features/access-control/components/UsersTab';
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
      id={`access-control-tabpanel-${index}`}
      aria-labelledby={`access-control-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const AccessControlPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Generate breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Admin', path: '/dashboard' },
    { label: 'Access Control', icon: <SecurityIcon fontSize="small" /> },
  ];

  return (
    <DashboardContainer>
      <Breadcrumb items={breadcrumbItems} />
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2, color: theme.primary }}
              aria-label="Back to dashboard"
            >
              <ArrowBackIcon />
            </IconButton>
            <SecurityIcon sx={{ color: theme.primary, mr: 1, fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: theme.primary }}>
                Access Control & Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage roles and permissions for system access
              </Typography>
            </Box>
          </Box>
          <Chip 
            label="Admin Only" 
            color="primary" 
            size="small" 
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Access Control tabs"
            variant="fullWidth"
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
              icon={<BadgeIcon />}
              iconPosition="start"
              label="Roles & Permissions" 
              id="access-control-tab-0" 
              aria-controls="access-control-tabpanel-0"
              sx={{
                '& .MuiTab-iconWrapper': {
                  fontSize: '1.25rem',
                },
              }}
            />
            <Tab 
              icon={<PeopleIcon />}
              iconPosition="start"
              label="Role Assignments" 
              id="access-control-tab-1" 
              aria-controls="access-control-tabpanel-1"
              sx={{
                '& .MuiTab-iconWrapper': {
                  fontSize: '1.25rem',
                },
              }}
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <TabPanel value={activeTab} index={0}>
            <RolesTab />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <UsersTab />
          </TabPanel>
        </CardContent>
      </Card>
    </DashboardContainer>
  );
};

