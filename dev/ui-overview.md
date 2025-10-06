# UI Overview

## Architecture

The Fahras project uses a modern React-based UI architecture built on Material-UI v7. The application follows a component-based architecture with clear separation of concerns.

### Core Structure

```
web/src/
├── components/          # Reusable UI components
│   ├── NotificationCenter.tsx
│   ├── ProjectSearch.tsx
│   └── ProtectedRoute.tsx
├── pages/              # Page-level components
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── CreateProjectPage.tsx
│   └── ...
├── store/              # State management
│   └── authStore.ts
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx             # Main application component
```

## Design System

### Material-UI v7 Integration

The application uses Material-UI v7 as the foundation for its design system. Key features:

- **Component Library**: Pre-built, accessible components
- **Theme System**: Centralized styling and customization
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: Built-in ARIA support and keyboard navigation
- **TypeScript Support**: Full type safety for all components

### Theme Configuration

Located in `App.tsx`, the theme provides:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',    // Blue primary color
    },
    secondary: {
      main: '#dc004e',    // Pink secondary color
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

## Component Hierarchy

### Layout Components

1. **App** - Root application component with routing
2. **ProtectedRoute** - Authentication wrapper
3. **AppBar** - Navigation header (used in pages)
4. **Container** - Content wrapper with max-width

### Page Components

Each page follows a consistent structure:
- **AppBar** with navigation and user menu
- **Container** for content layout
- **Card** components for content sections
- **Grid** system for responsive layouts

### Reusable Components

1. **ProjectSearch** - Advanced search with filters
2. **NotificationCenter** - Slide-out notification panel
3. **Form Components** - Standardized form elements

## State Management

### Zustand Store

The application uses Zustand for state management:

```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
```

### API Integration

All API calls are centralized in `services/api.ts`:

```typescript
class ApiService {
  // Authentication
  login(credentials: LoginCredentials): Promise<AuthResponse>
  logout(): Promise<void>
  
  // Projects
  getProjects(filters?: ProjectFilters): Promise<Project[]>
  createProject(data: CreateProjectData): Promise<Project>
  
  // Users
  getUsers(): Promise<User[]>
  createUser(data: CreateUserData): Promise<User>
}
```

## Routing Structure

### Public Routes
- `/login` - User authentication
- `/register` - User registration

### Protected Routes
- `/dashboard` - Main dashboard
- `/projects/create` - Create new project
- `/projects/:id` - View project details
- `/projects/:id/edit` - Edit project
- `/analytics` - Analytics dashboard
- `/evaluations` - Project evaluations
- `/users` - User management
- `/profile` - User profile
- `/settings` - Application settings
- `/approvals` - Approval workflows

## Responsive Design

### Breakpoints

Material-UI's default breakpoints:
- `xs`: 0px (extra-small devices)
- `sm`: 600px (small devices)
- `md`: 900px (medium devices)
- `lg`: 1200px (large devices)
- `xl`: 1536px (extra-large devices)

### Grid System Usage

```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    {/* Content takes full width on mobile, half on desktop */}
  </Grid>
</Grid>
```

## Performance Considerations

### Code Splitting
- Routes are lazy-loaded where appropriate
- Components are imported dynamically when needed

### Bundle Optimization
- Tree-shaking enabled for Material-UI
- Unused imports are removed via linting

### State Optimization
- Zustand provides efficient state updates
- API responses are cached appropriately

## Accessibility

### ARIA Support
- All Material-UI components include proper ARIA attributes
- Custom components follow ARIA guidelines
- Screen reader support for all interactive elements

### Keyboard Navigation
- Tab order is logical and intuitive
- Keyboard shortcuts for common actions
- Focus management for modals and dropdowns

### Color Contrast
- Material-UI theme ensures WCAG compliance
- High contrast mode support
- Color-blind friendly palette

## Development Guidelines

### Component Development
1. Use TypeScript for all components
2. Follow Material-UI naming conventions
3. Implement proper error boundaries
4. Add loading states for async operations
5. Include accessibility attributes

### Styling Guidelines
1. Use Material-UI's `sx` prop for styling
2. Leverage theme values for consistency
3. Follow responsive design principles
4. Use semantic color tokens
5. Implement dark mode support where applicable

### Testing Strategy
1. Unit tests for component logic
2. Integration tests for user flows
3. Accessibility testing with automated tools
4. Visual regression testing for UI changes
