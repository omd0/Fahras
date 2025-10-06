# Pages

## Overview

The Fahras application consists of multiple page components that provide different functionality for managing projects, users, and academic workflows. Each page follows consistent layout patterns and integrates with the application's routing system.

## Page Architecture

### Page Structure

```
web/src/pages/
├── DashboardPage.tsx          # Main dashboard with project overview
├── LoginPage.tsx              # User authentication
├── RegisterPage.tsx           # User registration
├── CreateProjectPage.tsx      # Project creation form
├── EditProjectPage.tsx        # Project editing form
├── ProjectDetailPage.tsx      # Project details view
├── AnalyticsPage.tsx          # Analytics and reporting
├── EvaluationsPage.tsx        # Project evaluation management
├── UserManagementPage.tsx     # User administration
├── ProfilePage.tsx            # User profile management
├── SettingsPage.tsx           # Application settings
└── ApprovalsPage.tsx          # Approval workflows
```

### Common Page Patterns

All pages follow consistent patterns for:
- **Layout Structure**: AppBar, Container, and content sections
- **Navigation**: Back buttons and breadcrumbs
- **User Menu**: Avatar and dropdown menu
- **Loading States**: Loading indicators and skeleton screens
- **Error Handling**: Error messages and retry mechanisms
- **Responsive Design**: Mobile-first layouts

## Page Components

### DashboardPage

The main dashboard providing an overview of projects and system status.

#### Features
- **Project Overview**: List of user's projects with status indicators
- **Search and Filters**: Integrated ProjectSearch component
- **Quick Actions**: Create project and other common actions
- **Statistics Cards**: Project counts and status summaries
- **Recent Activity**: Timeline of recent project activities
- **Notifications**: Access to notification center

#### Layout Structure
```typescript
<Box sx={{ flexGrow: 1 }}>
  <AppBar position="static">
    <Toolbar>
      {/* Navigation and user menu */}
    </Toolbar>
  </AppBar>
  
  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    <ProjectSearch onSearch={handleSearch} onClear={handleClear} />
    
    <Grid container spacing={3}>
      {/* Statistics cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard />
      </Grid>
      
      {/* Project list */}
      <Grid size={{ xs: 12 }}>
        <ProjectList projects={projects} />
      </Grid>
    </Grid>
  </Container>
</Box>
```

#### Key Components
- **ProjectSearch**: Advanced search and filtering
- **NotificationCenter**: Slide-out notification panel
- **Project Cards**: Individual project display
- **Status Chips**: Visual status indicators
- **Pagination**: Page navigation for large lists

### LoginPage

User authentication page with form validation and error handling.

#### Features
- **Email/Password Form**: Standard authentication inputs
- **Form Validation**: Client-side validation with error messages
- **Loading States**: Loading indicator during authentication
- **Error Handling**: Display authentication errors
- **Registration Link**: Link to registration page
- **Responsive Design**: Mobile-friendly layout

#### Layout Structure
```typescript
<Container component="main" maxWidth="sm">
  <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
      <Typography component="h1" variant="h4">Fahras</Typography>
      <Typography component="h2" variant="h5">Sign In</Typography>
      
      {error && <Alert severity="error">{error}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField /* email input */ />
        <TextField /* password input */ />
        <Button type="submit" fullWidth variant="contained">
          {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
      </Box>
    </Paper>
  </Box>
</Container>
```

#### Form Validation
```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!credentials.email) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
    newErrors.email = 'Email is invalid';
  }

  if (!credentials.password) {
    newErrors.password = 'Password is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### CreateProjectPage

Comprehensive form for creating new projects with team management.

#### Features
- **Project Information**: Title, abstract, academic details
- **Program Selection**: Dropdown for academic programs
- **Keyword Management**: Add/remove keywords with chips
- **Team Management**: Add/remove members and advisors
- **Role Assignment**: Assign roles to team members
- **Form Validation**: Comprehensive validation
- **Auto-save**: Draft saving functionality

#### Layout Structure
```typescript
<Box sx={{ flexGrow: 1 }}>
  <AppBar position="static">
    <Toolbar>
      <IconButton onClick={() => navigate('/dashboard')}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h6">Create New Project</Typography>
    </Toolbar>
  </AppBar>

  <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
    <Card>
      <CardContent>
        <Typography variant="h5">Project Information</Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Form fields */}
          </Grid>
        </form>
      </CardContent>
    </Card>
  </Container>
</Box>
```

#### Form Sections
1. **Basic Information**: Program, title, abstract
2. **Academic Details**: Year, semester
3. **Keywords**: Dynamic keyword management
4. **Team Members**: Member selection and role assignment
5. **Advisors**: Advisor selection and role assignment

#### Dynamic Content Management
```typescript
// Keyword management
const handleAddKeyword = () => {
  if (newKeyword.trim() && !formData.keywords?.includes(newKeyword.trim())) {
    setFormData(prev => ({
      ...prev,
      keywords: [...(prev.keywords || []), newKeyword.trim()]
    }));
    setNewKeyword('');
  }
};

// Member management
const handleAddMember = () => {
  if (newMember.user_id > 0) {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { ...newMember }]
    }));
    setNewMember({ user_id: 0, role: 'MEMBER' });
  }
};
```

### UserManagementPage

Administrative interface for managing users and their roles.

#### Features
- **User Table**: Comprehensive user listing with search
- **User Creation**: Modal form for creating new users
- **User Editing**: In-place editing of user details
- **Role Management**: Assign and modify user roles
- **Status Management**: Activate/deactivate users
- **Bulk Operations**: Bulk user operations
- **Export Functionality**: Export user data

#### Layout Structure
```typescript
<Box sx={{ flexGrow: 1 }}>
  <AppBar position="static">
    <Toolbar>
      {/* Navigation and user menu */}
    </Toolbar>
  </AppBar>

  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    {/* Header with actions */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Typography variant="h4">User Management</Typography>
      <Button variant="contained" startIcon={<AddIcon />}>
        Add User
      </Button>
    </Box>

    {/* Users table */}
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Login</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* User rows */}
        </TableBody>
      </Table>
    </TableContainer>
  </Container>
</Box>
```

#### User Dialog
```typescript
<Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>
    {editingUser ? 'Edit User' : 'Create New User'}
  </DialogTitle>
  <DialogContent>
    <TextField label="Full Name" fullWidth />
    <TextField label="Email" type="email" fullWidth />
    <TextField label="Password" type="password" fullWidth />
    <FormControl fullWidth>
      <InputLabel>Roles</InputLabel>
      <Select multiple>
        {/* Role options */}
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
    <Button variant="contained">Save</Button>
  </DialogActions>
</Dialog>
```

## Navigation Patterns

### AppBar Structure

Most pages use a consistent AppBar structure:

```typescript
<AppBar position="static">
  <Toolbar>
    {/* Back button */}
    <IconButton onClick={() => navigate('/dashboard')}>
      <ArrowBackIcon />
    </IconButton>
    
    {/* Page title */}
    <Typography variant="h6" sx={{ flexGrow: 1 }}>
      Page Title
    </Typography>
    
    {/* User menu */}
    <IconButton onClick={handleMenuOpen}>
      <Avatar>{user?.full_name?.charAt(0)}</Avatar>
    </IconButton>
    
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
      <MenuItem onClick={() => navigate('/profile')}>
        <AccountCircle sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ExitToApp sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  </Toolbar>
</AppBar>
```

### Breadcrumb Navigation

For complex workflows, pages implement breadcrumb navigation:

```typescript
<Breadcrumbs sx={{ mb: 2 }}>
  <Link underline="hover" color="inherit" href="/dashboard">
    Dashboard
  </Link>
  <Link underline="hover" color="inherit" href="/projects">
    Projects
  </Link>
  <Typography color="text.primary">Create Project</Typography>
</Breadcrumbs>
```

## State Management

### Page-Level State

Each page manages its own state for:
- **Form Data**: User input and form state
- **Loading States**: API call loading indicators
- **Error States**: Error messages and validation
- **UI State**: Modal states, menu states, etc.

```typescript
const [formData, setFormData] = useState<CreateProjectData>({
  program_id: 0,
  title: '',
  abstract: '',
  keywords: [],
  academic_year: '',
  semester: 'fall',
  members: [],
  advisors: [],
});

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Global State Integration

Pages integrate with global state for:
- **Authentication**: User information and login status
- **Navigation**: Route management and history
- **Notifications**: Global notification system

```typescript
const { user, isAuthenticated } = useAuthStore();
const navigate = useNavigate();
const location = useLocation();
```

## Error Handling

### Page-Level Error Handling

Each page implements comprehensive error handling:

```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    await apiService.createProject(projectData);
    navigate('/dashboard');
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to create project');
  } finally {
    setLoading(false);
  }
};

// In render
{error && (
  <Alert severity="error" sx={{ mb: 3 }}>
    {error}
  </Alert>
)}
```

### Form Validation

Pages implement client-side validation:

```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.title.trim()) {
    newErrors.title = 'Title is required';
  }

  if (!formData.abstract.trim()) {
    newErrors.abstract = 'Abstract is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## Loading States

### Page Loading

Pages show loading indicators during initial data fetching:

```typescript
if (loading) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress size={60} />
    </Box>
  );
}
```

### Form Submission Loading

Forms show loading states during submission:

```typescript
<Button
  type="submit"
  variant="contained"
  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
  disabled={loading}
>
  {loading ? 'Creating...' : 'Create Project'}
</Button>
```

### Skeleton Loading

For better UX, pages use skeleton loading for content:

```typescript
{loading ? (
  <Box>
    <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
    <Skeleton variant="text" height={40} />
    <Skeleton variant="text" height={40} />
    <Skeleton variant="text" height={40} />
  </Box>
) : (
  <Content />
)}
```

## Responsive Design

### Mobile-First Approach

All pages implement mobile-first responsive design:

```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Content />
  </Grid>
</Grid>
```

### Adaptive Navigation

Navigation adapts to screen size:

```typescript
// Mobile: Hamburger menu
<IconButton sx={{ display: { xs: 'block', md: 'none' } }}>
  <MenuIcon />
</IconButton>

// Desktop: Full navigation
<Box sx={{ display: { xs: 'none', md: 'flex' } }}>
  <NavigationItems />
</Box>
```

## Performance Optimization

### Code Splitting

Pages are lazy-loaded for better performance:

```typescript
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'));

// In routes
<Route path="/dashboard" element={
  <Suspense fallback={<LoadingSpinner />}>
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  </Suspense>
} />
```

### Memoization

Pages use memoization for expensive operations:

```typescript
const filteredProjects = useMemo(() => {
  return (projects || []).filter(project => 
    project.status === selectedStatus
  );
}, [projects, selectedStatus]);
```

## Testing Strategy

### Page Testing

Pages should be tested for:
1. **Rendering**: Basic page rendering
2. **Navigation**: Route navigation and breadcrumbs
3. **Forms**: Form submission and validation
4. **API Integration**: Mock API calls and responses
5. **Error States**: Error handling and display
6. **Loading States**: Loading indicators and disabled states
7. **Responsive Behavior**: Mobile and desktop layouts

### Test Structure

```typescript
describe('CreateProjectPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CreateProjectPage />
        </ThemeProvider>
      </BrowserRouter>
    );
  });

  it('renders the project creation form', () => {
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Title')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    fireEvent.click(screen.getByText('Create Project'));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });
});
```

## Best Practices

### Page Design
1. **Consistent Layout**: Use consistent AppBar and Container patterns
2. **Clear Navigation**: Provide clear navigation paths
3. **Progressive Disclosure**: Show information progressively
4. **Error Prevention**: Validate inputs before submission
5. **Feedback**: Provide clear feedback for all actions

### Performance
1. **Lazy Loading**: Use code splitting for large pages
2. **Memoization**: Memoize expensive calculations
3. **Debouncing**: Debounce search and filter inputs
4. **Pagination**: Implement pagination for large lists

### Accessibility
1. **Semantic HTML**: Use proper HTML semantics
2. **ARIA Labels**: Provide ARIA labels for interactive elements
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Screen Readers**: Test with screen readers

### Code Organization
1. **Separation of Concerns**: Separate UI, logic, and data
2. **Reusable Components**: Extract reusable components
3. **Custom Hooks**: Use custom hooks for shared logic
4. **Type Safety**: Use TypeScript for all props and state
