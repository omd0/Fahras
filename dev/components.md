# Components

## Overview

The Fahras application includes several custom components that extend Material-UI's functionality and provide consistent, reusable UI patterns. These components are located in the `web/src/components/` directory.

## Component Architecture

### Component Structure

```
web/src/components/
├── NotificationCenter.tsx    # Slide-out notification panel
├── ProjectSearch.tsx         # Advanced search with filters
└── ProtectedRoute.tsx        # Authentication wrapper
```

### Design Principles

1. **Reusability**: Components are designed for reuse across the application
2. **Composition**: Components compose well with Material-UI components
3. **Type Safety**: All components use TypeScript for type safety
4. **Accessibility**: Components follow Material-UI's accessibility guidelines
5. **Responsiveness**: Components adapt to different screen sizes

## Core Components

### ProtectedRoute

A wrapper component that handles authentication and route protection.

#### Usage
```typescript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

#### Props
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

#### Implementation
```typescript
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

#### Features
- **Authentication Check**: Verifies user authentication status
- **Redirect Handling**: Redirects to login with return URL
- **Route Protection**: Prevents access to protected routes

### ProjectSearch

A comprehensive search component with advanced filtering capabilities.

#### Usage
```typescript
<ProjectSearch
  onSearch={handleSearch}
  onClear={handleClear}
  loading={isLoading}
/>
```

#### Props
```typescript
interface SearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

interface SearchFilters {
  search: string;
  status: string;
  program_id: string;
  department_id: string;
  academic_year: string;
  semester: string;
  is_public: boolean | null;
  sort_by: string;
  sort_order: string;
}
```

#### Features
- **Autocomplete Search**: Smart search with suggestions
- **Advanced Filters**: Collapsible filter section
- **Status Filtering**: Filter by project status
- **Program/Department**: Filter by academic structure
- **Academic Year/Semester**: Time-based filtering
- **Visibility Filter**: Public/private project filtering
- **Sorting Options**: Multiple sort criteria
- **Filter Indicators**: Visual feedback for active filters

#### Implementation Highlights

```typescript
// Autocomplete with suggestions
<Autocomplete
  freeSolo
  options={suggestions || []}
  getOptionLabel={(option) => 
    typeof option === 'string' ? option : option.title
  }
  renderInput={(params) => (
    <TextField
      {...params}
      label="Search projects..."
      placeholder="Enter title, abstract, or keywords"
      fullWidth
    />
  )}
/>

// Collapsible advanced filters
<Collapse in={showAdvanced} timeout="auto" unmountOnExit>
  <Grid container spacing={2} sx={{ mt: 1 }}>
    {/* Advanced filter controls */}
  </Grid>
</Collapse>

// Active filter indicator
{getActiveFiltersCount() > 0 && (
  <Chip
    icon={<FilterIcon />}
    label={`${getActiveFiltersCount()} filters active`}
    color="primary"
    variant="outlined"
  />
)}
```

### NotificationCenter

A slide-out panel for displaying and managing notifications.

#### Usage
```typescript
<NotificationCenter
  open={notificationOpen}
  onClose={() => setNotificationOpen(false)}
/>
```

#### Props
```typescript
interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
```

#### Features
- **Slide-out Drawer**: Right-side drawer for notifications
- **Notification Types**: Different icons and colors for notification types
- **Read/Unread States**: Visual distinction between read and unread
- **Mark as Read**: Individual and bulk mark-as-read functionality
- **Time Formatting**: Relative time display (e.g., "2h ago")
- **Empty State**: Friendly empty state when no notifications
- **Loading States**: Loading indicator while fetching

#### Implementation Highlights

```typescript
// Drawer with custom styling
<Drawer
  anchor="right"
  open={open}
  onClose={onClose}
  sx={{
    '& .MuiDrawer-paper': {
      width: 400,
      maxWidth: '90vw',
    },
  }}
>

// Notification type icons
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'evaluation_due':
      return <AssignmentIcon color="warning" />;
    case 'approval_required':
      return <WarningIcon color="error" />;
    case 'project_updated':
      return <InfoIcon color="info" />;
    default:
      return <InfoIcon color="action" />;
  }
};

// Relative time formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};
```

## Component Patterns

### Error Handling

All components implement consistent error handling:

```typescript
const [error, setError] = useState<string | null>(null);

try {
  await apiCall();
} catch (error: any) {
  setError(error.response?.data?.message || 'An error occurred');
}
```

### Loading States

Components show loading indicators during async operations:

```typescript
const [loading, setLoading] = useState(false);

// In async functions
setLoading(true);
try {
  await apiCall();
} finally {
  setLoading(false);
}

// In render
{loading ? <CircularProgress /> : <Content />}
```

### Safe Array Handling

Components use safe array handling patterns:

```typescript
// Safe array mapping
{(items || []).map(item => <ItemComponent key={item.id} item={item} />)}

// Safe array filtering
const filteredItems = (items || []).filter(item => item.active);
```

### Responsive Design

Components adapt to different screen sizes:

```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    <Component />
  </Grid>
</Grid>
```

## Component Composition

### Material-UI Integration

Components are built using Material-UI components as building blocks:

```typescript
// ProjectSearch combines multiple MUI components
<Paper sx={{ p: 3, mb: 3 }}>
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <SearchIcon sx={{ mr: 1 }} />
    <Typography variant="h6">Search Projects</Typography>
  </Box>
  
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
      <Autocomplete /* ... */ />
    </Grid>
  </Grid>
</Paper>
```

### Custom Styling

Components use the `sx` prop for custom styling:

```typescript
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  }}
>
  Content
</Box>
```

## State Management

### Local State

Components manage their own local state for UI interactions:

```typescript
const [filters, setFilters] = useState<SearchFilters>({
  search: '',
  status: '',
  // ... other filter properties
});
```

### Global State Integration

Components integrate with global state when needed:

```typescript
const { user, isAuthenticated } = useAuthStore();
const navigate = useNavigate();
```

## Accessibility Features

### ARIA Support

Components include proper ARIA attributes:

```typescript
<Button
  aria-label="Search projects"
  aria-describedby="search-help-text"
  disabled={loading}
>
  Search
</Button>
```

### Keyboard Navigation

Components support keyboard navigation:

```typescript
<Autocomplete
  onKeyDown={(event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }}
/>
```

### Screen Reader Support

Components provide screen reader friendly content:

```typescript
<Typography variant="srOnly">
  Loading notifications, please wait
</Typography>
```

## Testing Considerations

### Component Testing

Components should be tested for:

1. **Rendering**: Basic rendering without errors
2. **Props**: Correct prop handling and validation
3. **User Interactions**: Click, input, and keyboard events
4. **State Changes**: Local state updates
5. **API Integration**: Mock API calls and responses
6. **Error States**: Error handling and display
7. **Loading States**: Loading indicators and disabled states

### Test Structure

```typescript
describe('ProjectSearch', () => {
  it('renders without crashing', () => {
    render(<ProjectSearch onSearch={jest.fn()} onClear={jest.fn()} />);
  });

  it('calls onSearch when search button is clicked', () => {
    const mockOnSearch = jest.fn();
    render(<ProjectSearch onSearch={mockOnSearch} onClear={jest.fn()} />);
    
    fireEvent.click(screen.getByText('Search'));
    expect(mockOnSearch).toHaveBeenCalled();
  });
});
```

## Performance Optimization

### Memoization

Use React.memo for components that receive stable props:

```typescript
export const ProjectSearch = React.memo<SearchProps>(({ onSearch, onClear, loading }) => {
  // Component implementation
});
```

### Callback Optimization

Use useCallback for event handlers passed as props:

```typescript
const handleSearch = useCallback(() => {
  onSearch(filters);
}, [filters, onSearch]);
```

### Debouncing

Implement debouncing for search inputs:

```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    fetchSuggestions(query);
  }, 300),
  []
);
```

## Future Enhancements

### Planned Features

1. **Advanced Filtering**: More sophisticated filter combinations
2. **Saved Searches**: Ability to save and reuse search configurations
3. **Export Functionality**: Export search results to various formats
4. **Real-time Updates**: WebSocket integration for real-time notifications
5. **Customizable Layout**: User-configurable component layouts

### Component Library

Consider creating a dedicated component library for:
- Common form components
- Data display components
- Navigation components
- Feedback components

## Best Practices

### Component Design
1. **Single Responsibility**: Each component should have a clear, single purpose
2. **Prop Validation**: Use TypeScript interfaces for prop validation
3. **Default Props**: Provide sensible defaults for optional props
4. **Error Boundaries**: Wrap components in error boundaries when appropriate

### Code Organization
1. **File Structure**: Keep component files focused and well-organized
2. **Import Organization**: Group imports logically (React, MUI, local)
3. **Export Strategy**: Use named exports for better tree-shaking
4. **Documentation**: Document complex components with JSDoc comments

### Performance
1. **Lazy Loading**: Use React.lazy for code splitting when appropriate
2. **Bundle Size**: Monitor and optimize bundle size impact
3. **Re-renders**: Minimize unnecessary re-renders with proper memoization
4. **Memory Leaks**: Clean up subscriptions and timers in useEffect
