# ProjectTable Component

A flexible, reusable table component for displaying projects with customizable columns, actions, and styling. This component eliminates ~700 lines of duplicate table implementations across multiple pages.

## Features

- ✨ **Fully Customizable**: Configure columns, actions, and styling to match your needs
- 📱 **Responsive**: Built-in support for hiding columns on mobile and tablet devices
- 🎨 **Enhanced Styling**: Optional enhanced mode with gradients, shadows, and animations
- 🔧 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- ♿ **Accessible**: Built with Material-UI components following accessibility best practices
- 🌍 **i18n Ready**: Integrated with the language context for internationalization

## Installation

The component is already part of the codebase. Simply import it:

```tsx
import { ProjectTable } from '../components/ProjectTable';
```

## Basic Usage

### Minimal Example

```tsx
import { ProjectTable, createDefaultColumns, createDefaultActions } from '../components/ProjectTable';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

function MyProjectsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  // Use default columns
  const columns = createDefaultColumns(t);

  // Use default actions
  const actions = createDefaultActions(
    (project) => navigate(`/projects/${project.id}`), // View action
    (project) => navigate(`/projects/${project.id}/edit`), // Edit action (optional)
    t
  );

  return (
    <ProjectTable
      projects={projects}
      columns={columns}
      actions={actions}
    />
  );
}
```

### Enhanced Styling Example

```tsx
import { ProjectTable } from '../components/ProjectTable';
import { getDashboardTheme } from '../config/dashboardThemes';
import { useAuthStore } from '../store/authStore';

function EnhancedProjectsPage() {
  const { user } = useAuthStore();
  const dashboardTheme = getDashboardTheme(user?.roles);
  const [projects, setProjects] = useState<Project[]>([]);

  return (
    <ProjectTable
      projects={projects}
      columns={createDefaultColumns(t)}
      actions={createDefaultActions(handleView, handleEdit, t)}
      enhanced={true}
      themeColors={{
        primary: dashboardTheme.primary,
        accent: dashboardTheme.accent,
      }}
    />
  );
}
```

## Custom Columns

### Creating Custom Columns

```tsx
import { ProjectTableColumn } from '../components/ProjectTable';

const customColumns: ProjectTableColumn[] = [
  {
    id: 'title',
    label: 'Project Title',
    render: (project) => (
      <Box>
        <Typography variant="h6">{project.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {project.abstract}
        </Typography>
      </Box>
    ),
  },
  {
    id: 'student',
    label: 'Student Name',
    hideOnMobile: true, // Hide on mobile devices
    render: (project) => (
      <Typography>{project.student?.full_name || 'Unknown'}</Typography>
    ),
  },
  {
    id: 'program',
    label: 'Program',
    hideOnTablet: true, // Hide on tablet and mobile
    render: (project) => (
      <Chip label={project.program?.name || 'N/A'} size="small" />
    ),
  },
  {
    id: 'status',
    label: 'Status',
    width: 150, // Set fixed column width
    render: (project) => (
      <Chip
        label={getStatusLabel(project.status)}
        color={getStatusColor(project.status)}
        size="small"
      />
    ),
  },
];
```

### Column Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the column |
| `label` | `string` | Yes | Display label for the column header |
| `render` | `(project: Project) => React.ReactNode` | No | Custom render function for column cells |
| `width` | `string \| number` | No | Width of the column |
| `hideOnMobile` | `boolean` | No | Hide column on mobile devices (xs breakpoint) |
| `hideOnTablet` | `boolean` | No | Hide column on tablet and mobile (xs-sm breakpoints) |

## Custom Actions

### Creating Custom Actions

```tsx
import { ProjectTableAction } from '../components/ProjectTable';
import { 
  Visibility as ViewIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
} from '@mui/icons-material';

const customActions: ProjectTableAction[] = [
  {
    id: 'view',
    icon: <ViewIcon />,
    tooltip: 'View Details',
    onClick: (project) => navigate(`/projects/${project.id}`),
    color: 'primary',
  },
  {
    id: 'edit',
    icon: <EditIcon />,
    tooltip: 'Edit Project',
    onClick: (project) => navigate(`/projects/${project.id}/edit`),
    color: 'secondary',
    show: (project) => project.status === 'draft', // Only show for draft projects
  },
  {
    id: 'approve',
    icon: <ApproveIcon />,
    tooltip: 'Approve Project',
    onClick: (project) => handleApprove(project),
    color: 'success',
    show: (project) => project.status === 'submitted', // Only show for submitted projects
  },
  {
    id: 'delete',
    icon: <DeleteIcon />,
    tooltip: 'Delete Project',
    onClick: (project) => handleDelete(project),
    color: 'error',
  },
];
```

### Action Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the action |
| `icon` | `React.ReactElement` | Yes | Icon component to display |
| `tooltip` | `string` | Yes | Tooltip text for the action button |
| `onClick` | `(project: Project) => void` | Yes | Click handler for the action |
| `color` | `'primary' \| 'secondary' \| 'error' \| 'warning' \| 'info' \| 'success'` | No | Color for the action button |
| `show` | `(project: Project) => boolean` | No | Condition to show/hide the action button |

## Utility Functions

### Status Utilities

```tsx
import { getStatusColor, getStatusLabel } from '../components/ProjectTable';

// Get Material-UI color for a status
const color = getStatusColor('approved'); // Returns: 'success'

// Get formatted label for a status
const label = getStatusLabel('under_review'); // Returns: 'Under Review'
```

Supported statuses:
- `draft` → default
- `submitted` → warning
- `under_review` → info
- `approved` → success
- `rejected` → error
- `completed` → success
- `pending` → warning
- `in_progress` → info

## Complete Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projects` | `Project[]` | Yes | - | Array of projects to display |
| `columns` | `ProjectTableColumn[]` | Yes | - | Array of column configurations |
| `actions` | `ProjectTableAction[]` | No | `[]` | Array of action configurations |
| `enhanced` | `boolean` | No | `false` | Enable enhanced styling (gradients, shadows, animations) |
| `themeColors` | `{ primary?: string; accent?: string }` | No | `{}` | Custom theme colors |
| `emptyMessage` | `string` | No | `'No projects found'` | Message to display when no projects |
| `emptyDescription` | `string` | No | `'No projects match your current filters'` | Description for empty state |
| `emptyAction` | `{ label: string; onClick: () => void; icon?: React.ReactElement }` | No | - | Optional action button for empty state |
| `loading` | `boolean` | No | `false` | Loading state (for future use) |
| `className` | `string` | No | - | Custom class name |
| `sx` | `SxProps` | No | `{}` | Custom Material-UI styles |

## Real-World Examples

### Example 1: ExplorePage (Guest Users)

```tsx
import { ProjectTable, createDefaultColumns } from '../components/ProjectTable';

export const ExplorePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  const columns = createDefaultColumns(t);
  
  const actions = [
    {
      id: 'view',
      icon: <ViewIcon />,
      tooltip: t('View Project'),
      onClick: (project: Project) => navigate(`/projects/${project.id}`),
      color: 'primary' as const,
    },
  ];

  return (
    <ProjectTable
      projects={projects}
      columns={columns}
      actions={actions}
      emptyMessage={t('No projects available yet')}
      emptyDescription={t('Check back later to discover amazing projects!')}
    />
  );
};
```

### Example 2: StudentMyProjectsPage

```tsx
import { ProjectTable, createDefaultColumns, createDefaultActions } from '../components/ProjectTable';

const StudentMyProjectsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dashboardTheme = getDashboardTheme(user?.roles);
  const [projects, setProjects] = useState<Project[]>([]);

  const columns = createDefaultColumns(t);
  
  const actions = createDefaultActions(
    (project) => handleViewProject(project),
    (project) => handleEditProject(project),
    t
  );

  return (
    <ProjectTable
      projects={projects}
      columns={columns}
      actions={actions}
      enhanced={true}
      themeColors={{
        primary: dashboardTheme.primary,
        accent: dashboardTheme.accent,
      }}
      emptyMessage={t('No projects found')}
      emptyDescription={t('You haven\'t created any projects yet')}
      emptyAction={{
        label: t('Create Your First Project'),
        onClick: handleCreateProject,
        icon: <AddIcon />,
      }}
    />
  );
};
```

### Example 3: ApprovalsPage (Admin)

```tsx
import { ProjectTable, ProjectTableColumn } from '../components/ProjectTable';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';

const ApprovalsPage: React.FC = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);

  const columns: ProjectTableColumn[] = [
    {
      id: 'title',
      label: t('Project Title'),
      render: (project) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="medium">
            {project.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {project.abstract?.substring(0, 100)}
            {project.abstract && project.abstract.length > 100 && '...'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'student',
      label: t('Student'),
      render: (project) => (
        <Typography>{project.creator?.full_name || 'Unknown'}</Typography>
      ),
    },
    {
      id: 'program',
      label: t('Program'),
      hideOnMobile: true,
      render: (project) => (
        <Typography>{project.program?.name || 'N/A'}</Typography>
      ),
    },
    {
      id: 'status',
      label: t('Status'),
      render: (project) => (
        <Chip
          label={getStatusLabel(project.status)}
          color={getStatusColor(project.status)}
          size="small"
        />
      ),
    },
  ];

  const actions = [
    {
      id: 'approve',
      icon: <CheckCircle />,
      tooltip: t('Approve'),
      onClick: (project: Project) => handleApprove(project),
      color: 'success' as const,
    },
    {
      id: 'reject',
      icon: <Cancel />,
      tooltip: t('Reject'),
      onClick: (project: Project) => handleReject(project),
      color: 'error' as const,
    },
    {
      id: 'view',
      icon: <Visibility />,
      tooltip: t('View Details'),
      onClick: (project: Project) => handleView(project),
      color: 'primary' as const,
    },
  ];

  return (
    <ProjectTable
      projects={projects}
      columns={columns}
      actions={actions}
      emptyMessage={t('No Pending Approvals')}
      emptyDescription={t('All projects have been reviewed')}
    />
  );
};
```

### Example 4: EvaluationsPage (Faculty)

```tsx
import { ProjectTable, ProjectTableColumn, getStatusColor, getStatusLabel } from '../components/ProjectTable';
import { Star, Visibility } from '@mui/icons-material';

const EvaluationsPage: React.FC = () => {
  const { t } = useLanguage();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const columns: ProjectTableColumn[] = [
    {
      id: 'project',
      label: t('Project'),
      render: (evaluation: any) => (
        <Box>
          <Typography variant="subtitle2">{evaluation.project_title}</Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {evaluation.project_id}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'due_date',
      label: t('Due Date'),
      hideOnMobile: true,
      render: (evaluation: any) => {
        const isOverdue = new Date(evaluation.due_date) < new Date();
        return (
          <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'}>
            {new Date(evaluation.due_date).toLocaleDateString()}
            {isOverdue && ' (Overdue)'}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: t('Status'),
      render: (evaluation: any) => (
        <Chip
          label={getStatusLabel(evaluation.status)}
          color={getStatusColor(evaluation.status)}
          size="small"
        />
      ),
    },
  ];

  const actions = [
    {
      id: 'evaluate',
      icon: <Star />,
      tooltip: t('Evaluate'),
      onClick: (evaluation: any) => handleEvaluate(evaluation),
      color: 'primary' as const,
      show: (evaluation: any) => evaluation.status === 'pending',
    },
    {
      id: 'view',
      icon: <Visibility />,
      tooltip: t('View'),
      onClick: (evaluation: any) => handleView(evaluation),
      color: 'primary' as const,
    },
  ];

  return (
    <ProjectTable
      projects={evaluations as any} // Cast to Project[] for compatibility
      columns={columns}
      actions={actions}
      emptyMessage={t('No Evaluations')}
      emptyDescription={t('You don\'t have any evaluations at the moment')}
    />
  );
};
```

### Example 5: FacultyPendingApprovalPage

```tsx
import { ProjectTable, ProjectTableColumn } from '../components/ProjectTable';

const FacultyPendingApprovalPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dashboardTheme = getDashboardTheme(user?.roles);
  const [projects, setProjects] = useState<Project[]>([]);

  const columns: ProjectTableColumn[] = [
    {
      id: 'title',
      label: t('Project Title'),
      render: (project) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="medium">
            {project.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {project.description?.substring(0, 100)}
            {project.description && project.description.length > 100 && '...'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'student',
      label: t('Student'),
      render: (project) => (
        <Typography variant="body2">
          {project.student?.full_name || 'Unknown'}
        </Typography>
      ),
    },
    {
      id: 'program',
      label: t('Program'),
      hideOnMobile: true,
      render: (project) => (
        <Typography variant="body2">{project.program?.name || 'N/A'}</Typography>
      ),
    },
    {
      id: 'department',
      label: t('Department'),
      hideOnTablet: true,
      render: (project) => (
        <Typography variant="body2">{project.department?.name || 'N/A'}</Typography>
      ),
    },
    {
      id: 'status',
      label: t('Status'),
      render: (project) => (
        <Chip
          label={getStatusLabel(project.status)}
          color={getStatusColor(project.status)}
          size="small"
        />
      ),
    },
    {
      id: 'submitted',
      label: t('Submitted Date'),
      hideOnMobile: true,
      render: (project) => (
        <Typography variant="body2">
          {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
        </Typography>
      ),
    },
  ];

  const actions = [
    {
      id: 'view',
      icon: <ViewIcon />,
      tooltip: t('View Details'),
      onClick: (project: Project) => handleViewProject(project),
      color: 'primary' as const,
    },
  ];

  return (
    <ProjectTable
      projects={projects}
      columns={columns}
      actions={actions}
      enhanced={true}
      themeColors={{
        primary: dashboardTheme.primary,
        accent: dashboardTheme.accent,
      }}
      emptyMessage={t('No pending projects')}
      emptyDescription={t('All projects have been reviewed')}
    />
  );
};
```

## Migration Guide

### Before (Duplicate Implementation)

```tsx
// ~150 lines of duplicate table code
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Project Title</TableCell>
        <TableCell>Status</TableCell>
        {/* ... more cells ... */}
      </TableRow>
    </TableHead>
    <TableBody>
      {projects.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} align="center">
            {/* Empty state */}
          </TableCell>
        </TableRow>
      ) : (
        projects.map((project) => (
          <TableRow key={project.id} hover>
            <TableCell>
              <Typography variant="subtitle2">{project.title}</Typography>
              {/* ... */}
            </TableCell>
            {/* ... more cells ... */}
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</TableContainer>
```

### After (Using ProjectTable)

```tsx
// ~10-30 lines using ProjectTable
<ProjectTable
  projects={projects}
  columns={createDefaultColumns(t)}
  actions={createDefaultActions(handleView, handleEdit, t)}
  enhanced={true}
  themeColors={{ primary: dashboardTheme.primary }}
  emptyMessage={t('No projects found')}
/>
```

## Benefits

1. **Code Reduction**: Eliminates ~700 lines of duplicate code across 6 implementations
2. **Consistency**: Ensures consistent table behavior and styling across all pages
3. **Maintainability**: Single source of truth for table logic
4. **Flexibility**: Highly customizable to meet different requirements
5. **Type Safety**: Full TypeScript support prevents common errors
6. **Responsive**: Built-in responsive behavior for mobile and tablet
7. **Accessible**: Material-UI components ensure accessibility compliance
8. **Performance**: Optimized rendering with React best practices

## Pages Using ProjectTable

- ✅ ExplorePage
- ✅ ApprovalsPage
- ✅ EvaluationsPage
- ✅ FacultyPendingApprovalPage
- ✅ StudentMyProjectsPage
- ✅ (Any new page that needs to display projects in a table)

## Support

For questions or issues with the ProjectTable component, please refer to:
- This documentation
- The component source code: `web/src/components/ProjectTable.tsx`
- Material-UI Table documentation: https://mui.com/material-ui/react-table/
