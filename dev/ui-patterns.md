# UI Patterns

## Overview

This document outlines the common UI patterns, best practices, and design principles used throughout the Fahras application. These patterns ensure consistency, maintainability, and a great user experience across all components and pages.

## Design Principles

### 1. Consistency
- Use Material-UI components consistently
- Follow established color and typography scales
- Maintain consistent spacing and layout patterns
- Use standard interaction patterns across the application

### 2. Accessibility First
- Follow WCAG 2.1 AA guidelines
- Ensure keyboard navigation works properly
- Provide proper ARIA labels and descriptions
- Test with screen readers and assistive technologies

### 3. Mobile-First Responsive Design
- Design for mobile devices first
- Use responsive breakpoints effectively
- Ensure touch targets are appropriately sized
- Test on various device sizes

### 4. Performance
- Optimize for fast loading and smooth interactions
- Use code splitting and lazy loading
- Implement proper memoization
- Minimize bundle size

## Layout Patterns

### Page Structure Pattern

Every page follows a consistent structure:

```typescript
<Box sx={{ flexGrow: 1 }}>
  {/* AppBar with navigation */}
  <AppBar position="static">
    <Toolbar>
      {/* Back button, title, user menu */}
    </Toolbar>
  </AppBar>

  {/* Main content */}
  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    {/* Page content */}
  </Container>
</Box>
```

### Card-Based Layout

Use cards to group related content:

```typescript
<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Section Title
    </Typography>
    {/* Card content */}
  </CardContent>
</Card>
```

### Grid Layout Pattern

Use the Grid system for responsive layouts:

```typescript
<Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 8 }}>
    {/* Main content */}
  </Grid>
  <Grid size={{ xs: 12, md: 4 }}>
    {/* Sidebar content */}
  </Grid>
</Grid>
```

## Form Patterns

### Standard Form Structure

```typescript
<form onSubmit={handleSubmit}>
  <Grid container spacing={3}>
    {/* Form fields */}
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        label="Field Label"
        value={value}
        onChange={handleChange}
        error={!!errors.field}
        helperText={errors.field}
        required
      />
    </Grid>
    
    {/* Submit button */}
    <Grid size={{ xs: 12 }}>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Grid>
  </Grid>
</form>
```

### Form Validation Pattern

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.field.trim()) {
    newErrors.field = 'Field is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  // Submit logic
};
```

### Dynamic Form Fields

For forms with dynamic content (like adding/removing items):

```typescript
// Add item
const handleAddItem = () => {
  setFormData(prev => ({
    ...prev,
    items: [...prev.items, { id: Date.now(), value: '' }]
  }));
};

// Remove item
const handleRemoveItem = (index: number) => {
  setFormData(prev => ({
    ...prev,
    items: prev.items.filter((_, i) => i !== index)
  }));
};

// Render dynamic fields
{formData.items.map((item, index) => (
  <Box key={item.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <TextField
      fullWidth
      value={item.value}
      onChange={(e) => handleItemChange(index, e.target.value)}
    />
    <IconButton onClick={() => handleRemoveItem(index)}>
      <DeleteIcon />
    </IconButton>
  </Box>
))}
```

## Data Display Patterns

### Table Pattern

```typescript
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Column 1</TableCell>
        <TableCell>Column 2</TableCell>
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {(items || []).map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.status}</TableCell>
          <TableCell align="right">
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

### Card List Pattern

```typescript
<Grid container spacing={2}>
  {(items || []).map((item) => (
    <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.description}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Chip label={item.status} color="primary" size="small" />
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
```

### Status Display Pattern

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'approved':
      return 'success';
    case 'pending':
    case 'under_review':
      return 'warning';
    case 'inactive':
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

// Usage
<Chip
  label={status}
  color={getStatusColor(status) as any}
  size="small"
/>
```

## Loading and Error Patterns

### Loading State Pattern

```typescript
const [loading, setLoading] = useState(false);

// In async operations
const handleAsyncOperation = async () => {
  setLoading(true);
  try {
    await apiCall();
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};

// In render
{loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
) : (
  <Content />
)}
```

### Error Handling Pattern

```typescript
const [error, setError] = useState<string | null>(null);

// Display error
{error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
)}

// Clear error on user action
const handleUserAction = () => {
  setError(null);
  // Perform action
};
```

### Empty State Pattern

```typescript
{items.length === 0 ? (
  <Paper sx={{ p: 4, textAlign: 'center' }}>
    <Icon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}>
      <InboxIcon />
    </Icon>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No items found
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Get started by creating your first item.
    </Typography>
    <Button variant="contained" sx={{ mt: 2 }}>
      Create Item
    </Button>
  </Paper>
) : (
  <ItemList items={items} />
)}
```

## Navigation Patterns

### AppBar Pattern

```typescript
<AppBar position="static">
  <Toolbar>
    {/* Back button for sub-pages */}
    {showBackButton && (
      <IconButton
        edge="start"
        color="inherit"
        onClick={() => navigate(-1)}
        sx={{ mr: 2 }}
      >
        <ArrowBackIcon />
      </IconButton>
    )}
    
    {/* Page title */}
    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
      Page Title
    </Typography>
    
    {/* Action buttons */}
    <IconButton color="inherit" sx={{ mr: 1 }}>
      <NotificationsIcon />
    </IconButton>
    
    {/* User menu */}
    <IconButton onClick={handleMenuOpen}>
      <Avatar sx={{ width: 32, height: 32 }}>
        {user?.name?.charAt(0)}
      </Avatar>
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

### Breadcrumb Pattern

```typescript
<Breadcrumbs sx={{ mb: 2 }}>
  <Link underline="hover" color="inherit" href="/dashboard">
    Dashboard
  </Link>
  <Link underline="hover" color="inherit" href="/projects">
    Projects
  </Link>
  <Typography color="text.primary">Current Page</Typography>
</Breadcrumbs>
```

## Modal and Dialog Patterns

### Confirmation Dialog Pattern

```typescript
const [confirmDialog, setConfirmDialog] = useState<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}>({
  open: false,
  title: '',
  message: '',
  onConfirm: () => {},
});

const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
  setConfirmDialog({ open: true, title, message, onConfirm });
};

// Dialog component
<Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
  <DialogTitle>{confirmDialog.title}</DialogTitle>
  <DialogContent>
    <Typography>{confirmDialog.message}</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
      Cancel
    </Button>
    <Button onClick={confirmDialog.onConfirm} variant="contained" color="error">
      Confirm
    </Button>
  </DialogActions>
</Dialog>
```

### Form Dialog Pattern

```typescript
const [formDialog, setFormDialog] = useState<{
  open: boolean;
  mode: 'create' | 'edit';
  data?: any;
}>({
  open: false,
  mode: 'create',
});

<Dialog open={formDialog.open} onClose={() => setFormDialog(prev => ({ ...prev, open: false }))} maxWidth="md" fullWidth>
  <DialogTitle>
    {formDialog.mode === 'create' ? 'Create New Item' : 'Edit Item'}
  </DialogTitle>
  <DialogContent>
    <FormComponent
      mode={formDialog.mode}
      data={formDialog.data}
      onSave={handleSave}
      onCancel={() => setFormDialog(prev => ({ ...prev, open: false }))}
    />
  </DialogContent>
</Dialog>
```

## Search and Filter Patterns

### Search Input Pattern

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearchTerm) {
    performSearch(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);

<TextField
  fullWidth
  placeholder="Search items..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
    endAdornment: searchTerm && (
      <InputAdornment position="end">
        <IconButton onClick={() => setSearchTerm('')}>
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    ),
  }}
/>
```

### Filter Panel Pattern

```typescript
const [filters, setFilters] = useState({
  status: '',
  category: '',
  dateRange: null,
});

const [showFilters, setShowFilters] = useState(false);

<Box sx={{ mb: 2 }}>
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
    <TextField
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <IconButton onClick={() => setShowFilters(!showFilters)}>
      <FilterListIcon />
    </IconButton>
  </Box>
  
  <Collapse in={showFilters}>
    <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {/* More filter fields */}
      </Grid>
    </Box>
  </Collapse>
</Box>
```

## Data Management Patterns

### Safe Array Handling

Always use safe array handling to prevent runtime errors:

```typescript
// ✅ Safe array mapping
{(items || []).map(item => <ItemComponent key={item.id} item={item} />)}

// ✅ Safe array filtering
const activeItems = (items || []).filter(item => item.active);

// ✅ Safe array length check
{items?.length > 0 ? <ItemList items={items} /> : <EmptyState />}
```

### API Response Handling

Handle various API response structures safely:

```typescript
const fetchData = async () => {
  try {
    const response = await apiService.getData();
    // Handle various response structures
    return response.data || response || [];
  } catch (error) {
    console.error('API Error:', error);
    return []; // Fallback on error
  }
};
```

### Optimistic Updates

For better UX, implement optimistic updates:

```typescript
const handleUpdateItem = async (itemId: number, updates: any) => {
  // Optimistic update
  setItems(prev => prev.map(item => 
    item.id === itemId ? { ...item, ...updates } : item
  ));
  
  try {
    await apiService.updateItem(itemId, updates);
  } catch (error) {
    // Revert on error
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...originalData } : item
    ));
    setError('Failed to update item');
  }
};
```

## Performance Patterns

### Memoization Pattern

Use memoization for expensive calculations:

```typescript
const expensiveValue = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);

const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

### Debouncing Pattern

Debounce user input for search and filters:

```typescript
import { useDebounce } from 'use-debounce';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearchTerm) {
    performSearch(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);
```

### Lazy Loading Pattern

Lazy load components and routes:

```typescript
const LazyComponent = lazy(() => import('./LazyComponent'));

<Suspense fallback={<CircularProgress />}>
  <LazyComponent />
</Suspense>
```

## Accessibility Patterns

### Focus Management

Manage focus for modals and dynamic content:

```typescript
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (open && modalRef.current) {
    modalRef.current.focus();
  }
}, [open]);

<Dialog ref={modalRef} tabIndex={-1}>
  {/* Modal content */}
</Dialog>
```

### ARIA Labels

Provide proper ARIA labels:

```typescript
<Button
  aria-label="Delete item"
  aria-describedby="delete-help-text"
  onClick={handleDelete}
>
  <DeleteIcon />
</Button>
<Typography id="delete-help-text" variant="srOnly">
  This action cannot be undone
</Typography>
```

### Keyboard Navigation

Ensure proper keyboard navigation:

```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    handleAction();
  }
};

<div
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleAction}
  role="button"
  aria-label="Clickable item"
>
  Content
</div>
```

## Best Practices Summary

### Code Organization
1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Use composition to build complex components
3. **Props Interface**: Define clear TypeScript interfaces for all props
4. **Custom Hooks**: Extract reusable logic into custom hooks

### Performance
1. **Memoization**: Use React.memo, useMemo, and useCallback appropriately
2. **Lazy Loading**: Implement code splitting for large components
3. **Bundle Size**: Monitor and optimize bundle size
4. **Re-renders**: Minimize unnecessary re-renders

### Accessibility
1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Support**: Provide ARIA labels and descriptions
3. **Keyboard Navigation**: Ensure all interactions work with keyboard
4. **Screen Readers**: Test with screen readers

### User Experience
1. **Loading States**: Show loading indicators for async operations
2. **Error Handling**: Provide clear error messages and recovery options
3. **Empty States**: Design helpful empty states
4. **Progressive Disclosure**: Show information progressively

### Testing
1. **Unit Tests**: Test component logic and behavior
2. **Integration Tests**: Test component interactions
3. **Accessibility Tests**: Test with accessibility tools
4. **Visual Tests**: Test responsive behavior and visual consistency
