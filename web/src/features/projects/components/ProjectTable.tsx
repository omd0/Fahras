import React from 'react';
import { colorPalette } from '@/styles/theme/colorPalette';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Box,
  Button,
  alpha,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Project } from '@/types';
import { useLanguage } from '@/providers/LanguageContext';

/**
 * Column configuration for the ProjectTable
 */
export interface ProjectTableColumn {
  /** Unique identifier for the column */
  id: string;
  /** Display label for the column header */
  label: string;
  /** Width of the column (optional) */
  width?: string | number;
  /** Whether to hide this column on mobile */
  hideOnMobile?: boolean;
  /** Whether to hide this column on tablet */
  hideOnTablet?: boolean;
  /** Custom render function for the column cells */
  render?: (project: Project) => React.ReactNode;
}

/**
 * Action button configuration for the ProjectTable
 */
export interface ProjectTableAction {
  /** Unique identifier for the action */
  id: string;
  /** Icon component to display */
  icon: React.ReactElement;
  /** Tooltip text for the action button */
  tooltip: string;
  /** Click handler for the action */
  onClick: (project: Project) => void;
  /** Color for the action button */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  /** Condition to show/hide the action button */
  show?: (project: Project) => boolean;
}

/**
 * Props for the ProjectTable component
 */
export interface ProjectTableProps {
  /** Array of projects to display */
  projects: Project[];
  /** Array of column configurations */
  columns: ProjectTableColumn[];
  /** Array of action configurations */
  actions?: ProjectTableAction[];
  /** Whether to show enhanced styling (gradients, shadows) */
  enhanced?: boolean;
  /** Custom theme colors */
  themeColors?: {
    primary?: string;
    _accent?: string;
  };
  /** Message to display when no projects are found */
  emptyMessage?: string;
  /** Description for empty state */
  emptyDescription?: string;
  /** Optional action button for empty state */
  emptyAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactElement;
  };
  /** Loading state */
  _loading?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  sx?: any;
}

/**
 * Utility function to get status color based on project status
 */
export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
  switch (status) {
    case 'submitted':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'under_review':
      return 'info';
    case 'draft':
      return 'default';
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'in_progress':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Utility function to get formatted status label
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'submitted':
      return 'Submitted';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'under_review':
      return 'Under Review';
    case 'draft':
      return 'Draft';
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending Review';
    case 'in_progress':
      return 'In Progress';
    default:
      return status.replace('_', ' ');
  }
};

/**
 * Default column configurations
 */
export const createDefaultColumns = (t: (key: string) => string): ProjectTableColumn[] => [
  {
    id: 'title',
    label: t('Project Title'),
    render: (project: Project) => (
      <Box>
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
          {project?.title || 'Untitled Project'}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {project?.abstract?.substring(0, 120) || 'No description available'}
          {project?.abstract && project.abstract.length > 120 && '...'}
        </Typography>
      </Box>
    ),
  },
  {
    id: 'status',
    label: t('Status'),
    hideOnMobile: true,
    render: (project: Project) => (
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
    ),
  },
  {
    id: 'academic_year',
    label: t('Academic Year'),
    hideOnMobile: true,
    hideOnTablet: true,
    render: (project: Project) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {project?.academic_year || 'N/A'}
      </Typography>
    ),
  },
  {
    id: 'semester',
    label: t('Semester'),
    hideOnMobile: true,
    hideOnTablet: true,
    render: (project: Project) => (
      <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
        {project?.semester || 'N/A'}
      </Typography>
    ),
  },
  {
    id: 'created_at',
    label: t('Created Date'),
    hideOnMobile: true,
    render: (project: Project) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
      </Typography>
    ),
  },
];

/**
 * ProjectTable Component
 * 
 * A reusable table component for displaying projects with customizable columns,
 * actions, and styling. Eliminates duplicate table implementations across the app.
 * 
 * @example
 * ```tsx
 * <ProjectTable
 *   projects={myProjects}
 *   columns={[
 *     { id: 'title', label: 'Project Title', render: (p) => <span>{p.title}</span> },
 *     { id: 'status', label: 'Status', render: (p) => <Chip label={p.status} /> },
 *   ]}
 *   actions={[
 *     {
 *       id: 'view',
 *       icon: <ViewIcon />,
 *       tooltip: 'View Details',
 *       onClick: (project) => navigate(`/projects/${project.id}`),
 *     },
 *   ]}
 *   enhanced={true}
 *   themeColors={{ primary: '#512DA8' }}
 * />
 * ```
 */
export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  columns,
  actions = [],
  enhanced = false,
  themeColors = {},
  emptyMessage = 'No projects found',
  emptyDescription = 'No projects match your current filters',
  emptyAction,
  _loading = false,
  className,
  sx = {},
}) => {
  const { t } = useLanguage();
  const { primary = colorPalette.secondary.dark, _accent = colorPalette.info.lighter } = themeColors;

  // Filter out null/undefined projects
  const validProjects = (projects || []).filter(project => project != null);

  // Enhanced table styling
  const enhancedTableStyles = enhanced ? {
    borderRadius: 2,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: `1px solid ${alpha(primary, 0.15)}`,
  } : {};

  const enhancedHeaderStyles = enhanced ? {
    background: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 100%)`,
  } : {};

  const enhancedCellStyles = enhanced ? {
    fontWeight: 700,
    color: 'text.primary',
    borderBottom: `2px solid ${alpha(primary, 0.3)}`,
  } : {
    fontWeight: 600,
  };

  const enhancedRowStyles = enhanced ? {
    '&:hover': {
      backgroundColor: `${alpha(primary, 0.08)}`,
      transform: 'scale(1.01)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderBottom: `1px solid ${alpha(primary, 0.1)}`,
  } : {
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.04)',
    },
  };

  return (
    <TableContainer 
      component={Paper} 
      className={className}
      sx={{ 
        ...enhancedTableStyles,
        ...sx,
      }}
    >
      <Table>
        <TableHead sx={enhancedHeaderStyles}>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                sx={{
                  ...enhancedCellStyles,
                  width: column.width,
                  display: {
                    xs: column.hideOnMobile ? 'none' : 'table-cell',
                    sm: column.hideOnTablet ? 'none' : 'table-cell',
                    md: 'table-cell',
                  },
                }}
              >
                {column.label}
              </TableCell>
            ))}
            {actions.length > 0 && (
              <TableCell sx={enhancedCellStyles}>
                {t('Actions')}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {validProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {emptyDescription}
                  </Typography>
                  {emptyAction && (
                    <Button
                      variant="contained"
                      startIcon={emptyAction.icon || <AddIcon />}
                      onClick={emptyAction.onClick}
                      sx={{ mt: 2 }}
                    >
                      {emptyAction.label}
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            validProjects.map((project) => (
              <TableRow
                key={project?.id || `project-${Math.random()}`}
                hover
                sx={enhancedRowStyles}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      py: 2,
                      display: {
                        xs: column.hideOnMobile ? 'none' : 'table-cell',
                        sm: column.hideOnTablet ? 'none' : 'table-cell',
                        md: 'table-cell',
                      },
                    }}
                  >
                    {column.render ? column.render(project) : null}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1}>
                      {actions
                        .filter(action => !action.show || action.show(project))
                        .map((action) => (
                          <Tooltip key={action.id} title={action.tooltip}>
                            <IconButton
                              size="small"
                              onClick={() => action.onClick(project)}
                              sx={
                                enhanced
                                  ? {
                                      color: action.color ? `${action.color}.main` : primary,
                                      backgroundColor: `${alpha(action.color ? `${action.color}.main` : primary, 0.1)}`,
                                      '&:hover': {
                                        backgroundColor: `${alpha(action.color ? `${action.color}.main` : primary, 0.2)}`,
                                        transform: 'scale(1.1)',
                                      },
                                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }
                                  : {
                                      color: action.color ? `${action.color}.main` : 'primary.main',
                                    }
                              }
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Default action configurations
 */
export const createDefaultActions = (
  onView: (project: Project) => void,
  onEdit?: (project: Project) => void,
  t: (key: string) => string = (key) => key
): ProjectTableAction[] => {
  const actions: ProjectTableAction[] = [
    {
      id: 'view',
      icon: <ViewIcon />,
      tooltip: t('View Details'),
      onClick: onView,
      color: 'primary',
    },
  ];

  if (onEdit) {
    actions.push({
      id: 'edit',
      icon: <EditIcon />,
      tooltip: t('Edit Project'),
      onClick: onEdit,
      color: 'secondary',
      show: (project: Project) => project?.status === 'draft',
    });
  }

  return actions;
};

export default ProjectTable;
