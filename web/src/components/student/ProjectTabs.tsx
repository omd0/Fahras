import React from 'react';
import { colorPalette } from '@/styles/theme/colorPalette';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Chip,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Project } from '@/types';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ProjectTabsProps {
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  tabFilteredProjects: Project[];
  currentProjects: Project[];
  indexOfFirstProject: number;
  indexOfLastProject: number;
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onCreateProject: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getTabFilteredProjects: (tabIndex: number) => Project[];
  dashboardTheme: Record<string, unknown>;
  t: (key: string) => string;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  tabValue,
  onTabChange,
  currentProjects: _currentProjects,
  indexOfFirstProject,
  indexOfLastProject,
  onViewProject,
  onEditProject,
  onCreateProject,
  getStatusColor,
  getStatusLabel,
  getTabFilteredProjects,
  dashboardTheme,
  t,
}) => {
  const renderTableRow = (project: Project, showStatus = false, showEditButton = false) => (
    <TableRow
      key={project?.id || `project-${Math.random()}`}
      hover
      sx={{
        '&:hover': {
          backgroundColor: `${dashboardTheme.primary}08`,
          transform: 'scale(1.01)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: `1px solid ${dashboardTheme.primary}10`,
      }}
    >
      <TableCell sx={{ py: 2 }}>
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
          {project?.title || 'Untitled Project'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}>
          {project?.abstract?.substring(0, 120) || 'No description available'}
          {project?.abstract && project.abstract.length > 120 && '...'}
        </Typography>
      </TableCell>
      {showStatus && (
        <TableCell sx={{ py: 2 }}>
          <Chip
            label={getStatusLabel(project?.status || 'draft')}
            color={getStatusColor(project?.status || 'draft')}
            size="small"
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'capitalize',
            }}
          />
        </TableCell>
      )}
      <TableCell sx={{ py: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {project?.academic_year || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell sx={{ py: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
          {project?.semester || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell sx={{ py: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {project?.created_at ? new Date(project.created_at).toLocaleDateString() :
           project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
        </Typography>
      </TableCell>
      <TableCell sx={{ py: 2 }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('View Details')}>
            <IconButton
              size="small"
              onClick={() => project && onViewProject(project)}
              sx={{
                color: dashboardTheme.primary,
                backgroundColor: `${dashboardTheme.primary}10`,
                '&:hover': {
                  backgroundColor: `${dashboardTheme.primary}20`,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              disabled={!project}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          {showEditButton && project?.status === 'draft' && (
            <Tooltip title="Edit Project">
              <IconButton
                size="small"
                onClick={() => project && onEditProject(project)}
                sx={{
                  color: dashboardTheme.accent,
                  backgroundColor: `${dashboardTheme.accent}10`,
                  '&:hover': {
                    backgroundColor: `${dashboardTheme.accent}20`,
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                disabled={!project}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );

  const renderEmptyState = (message: string, subtitle?: string) => (
    <TableRow>
      <TableCell colSpan={6} align="center">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {message}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
          {message === 'No projects found' && (
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Create Your First Project
              </Typography>
              <IconButton
                size="small"
                onClick={onCreateProject}
                sx={{
                  color: dashboardTheme.primary,
                  backgroundColor: `${dashboardTheme.primary}10`,
                  '&:hover': {
                    backgroundColor: `${dashboardTheme.primary}20`,
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Stack>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderTableContent = (tabIndex: number, showStatus = false, showEditButton = false, emptyMessage: string, emptySubtitle?: string) => {
    const projects = getTabFilteredProjects(tabIndex).slice(indexOfFirstProject, indexOfLastProject);

    return (
      <TableBody>
        {projects.length === 0 ? (
          renderEmptyState(emptyMessage, emptySubtitle)
        ) : (
          projects.filter(project => project != null).map((project) =>
            renderTableRow(project, showStatus, showEditButton)
          )
        )}
      </TableBody>
    );
  };

  return (
    <>
      <Box sx={{
        borderBottom: 1,
        borderColor: 'divider',
        background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)`,
      }}>
        <Tabs
          value={tabValue}
          onChange={onTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minHeight: 60,
              '&.Mui-selected': {
                color: dashboardTheme.primary,
                backgroundColor: 'rgba(255,255,255,0.8)',
              },
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: dashboardTheme.primary,
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab label={`All Projects (${getTabFilteredProjects(0).length})`} />
          <Tab label={`Drafts (${getTabFilteredProjects(1).length})`} />
          <Tab label={`In Progress (${getTabFilteredProjects(2).length})`} />
          <Tab label={`Pending Approval (${getTabFilteredProjects(3).length})`} />
          <Tab label={`Completed (${getTabFilteredProjects(4).length})`} />
          <Tab label={`Approved (${getTabFilteredProjects(5).length})`} />
        </Tabs>
      </Box>

      {/* All Projects Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${dashboardTheme.primary}15`,
          }}
        >
          <Table>
            <TableHead sx={{ background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)` }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            {renderTableContent(0, true, true, 'No projects found')}
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Drafts Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Title</TableCell>
                <TableCell>Academic Year</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            {renderTableContent(1, false, true, 'No draft projects')}
          </Table>
        </TableContainer>
      </TabPanel>

      {/* In Progress Tab */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${dashboardTheme.primary}15`,
          }}
        >
          <Table>
            <TableHead sx={{ background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)` }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Last Updated</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            {renderTableContent(2, true, false, 'No projects in progress', 'Projects that are submitted or under review will appear here')}
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Pending Approval Tab */}
      <TabPanel value={tabValue} index={3}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${dashboardTheme.primary}15`,
          }}
        >
          <Table>
            <TableHead sx={{ background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)` }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Submitted Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            {renderTableContent(3, false, false, 'No projects pending approval')}
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Completed Tab */}
      <TabPanel value={tabValue} index={4}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${dashboardTheme.primary}15`,
          }}
        >
          <Table>
            <TableHead sx={{ background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)` }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Completed Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            {renderTableContent(4, false, false, 'No completed projects')}
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Approved Tab */}
      <TabPanel value={tabValue} index={5}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${dashboardTheme.primary}15`,
          }}
        >
          <Table>
            <TableHead sx={{ background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)` }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Project Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Academic Year</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Semester</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Approved Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `2px solid ${dashboardTheme.primary}30` }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            {renderTableContent(5, false, false, 'No approved projects')}
          </Table>
        </TableContainer>
      </TabPanel>
    </>
  );
};
