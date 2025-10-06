# Grid System

## Overview

The Fahras application uses Material-UI v7's Grid system for responsive layouts. The Grid component provides a flexible, mobile-first approach to creating consistent layouts across different screen sizes.

## Grid v2 API (Material-UI v7)

Material-UI v7 introduces the new Grid v2 API with improved performance and a more intuitive API. The key difference is the use of the `size` prop instead of the old `xs`, `sm`, `md`, `lg`, `xl` props.

### Basic Grid Structure

```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    Content 1
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    Content 2
  </Grid>
</Grid>
```

## Grid Components

### Container Grid

The `container` prop creates a flex container that holds grid items:

```typescript
<Grid container spacing={2}>
  {/* Grid items go here */}
</Grid>
```

### Grid Items

Individual grid items use the `size` prop to define their responsive behavior:

```typescript
<Grid size={{ xs: 12, md: 6 }}>
  Content
</Grid>
```

## Responsive Breakpoints

### Breakpoint System

Material-UI's responsive breakpoints:

```typescript
const breakpoints = {
  xs: 0,      // Extra small devices (phones)
  sm: 600,    // Small devices (tablets)
  md: 900,    // Medium devices (small laptops)
  lg: 1200,   // Large devices (laptops)
  xl: 1536,   // Extra large devices (desktops)
};
```

### Size Prop Usage

```typescript
// Mobile-first approach
<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
  {/* 
    xs: 12 columns (full width on mobile)
    sm: 6 columns (half width on tablets)
    md: 4 columns (one-third on laptops)
    lg: 3 columns (one-quarter on desktops)
  */}
</Grid>
```

## Common Layout Patterns

### Dashboard Layout

```typescript
<Grid container spacing={3}>
  {/* Sidebar */}
  <Grid size={{ xs: 12, md: 3 }}>
    <Sidebar />
  </Grid>
  
  {/* Main Content */}
  <Grid size={{ xs: 12, md: 9 }}>
    <MainContent />
  </Grid>
</Grid>
```

### Card Grid

```typescript
<Grid container spacing={2}>
  {projects.map((project) => (
    <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
      <ProjectCard project={project} />
    </Grid>
  ))}
</Grid>
```

### Form Layout

```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6 }}>
    <TextField label="First Name" fullWidth />
  </Grid>
  <Grid size={{ xs: 12, sm: 6 }}>
    <TextField label="Last Name" fullWidth />
  </Grid>
  <Grid size={{ xs: 12 }}>
    <TextField label="Email" fullWidth />
  </Grid>
</Grid>
```

### Search and Filters Layout

```typescript
<Grid container spacing={2}>
  {/* Search Input */}
  <Grid size={{ xs: 12, md: 6 }}>
    <TextField label="Search" fullWidth />
  </Grid>
  
  {/* Filters */}
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <FormControl fullWidth>
      <InputLabel>Status</InputLabel>
      <Select value={status}>
        {/* Options */}
      </Select>
    </FormControl>
  </Grid>
  
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <FormControl fullWidth>
      <InputLabel>Program</InputLabel>
      <Select value={program}>
        {/* Options */}
      </Select>
    </FormControl>
  </Grid>
</Grid>
```

## Spacing System

### Container Spacing

```typescript
// Standard spacing (8px * 2 = 16px)
<Grid container spacing={2}>

// Tight spacing (8px * 1 = 8px)
<Grid container spacing={1}>

// Loose spacing (8px * 3 = 24px)
<Grid container spacing={3}>

// No spacing
<Grid container spacing={0}>
```

### Responsive Spacing

```typescript
<Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
  {/* 
    xs: 8px spacing on mobile
    sm: 16px spacing on tablets
    md: 24px spacing on laptops and up
  */}
</Grid>
```

## Advanced Grid Patterns

### Nested Grids

```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 8 }}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card>Card 1</Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card>Card 2</Card>
      </Grid>
    </Grid>
  </Grid>
  <Grid size={{ xs: 12, md: 4 }}>
    <Sidebar />
  </Grid>
</Grid>
```

### Auto-sizing Columns

```typescript
<Grid container spacing={2}>
  <Grid size="auto">
    <Button>Fixed Width</Button>
  </Grid>
  <Grid size={1}>
    <Box>Flexible Content</Box>
  </Grid>
  <Grid size="auto">
    <Button>Fixed Width</Button>
  </Grid>
</Grid>
```

### Offset Columns

```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6, mdOffset: 3 }}>
    {/* Centered content on medium screens and up */}
    <CenteredContent />
  </Grid>
</Grid>
```

## Real-world Examples

### Project Search Component

```typescript
// From ProjectSearch.tsx
<Grid container spacing={2}>
  {/* Search Input */}
  <Grid size={{ xs: 12, md: 6 }}>
    <Autocomplete
      freeSolo
      options={suggestions || []}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search projects..."
          fullWidth
        />
      )}
    />
  </Grid>

  {/* Status Filter */}
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <FormControl fullWidth>
      <InputLabel>Status</InputLabel>
      <Select value={filters.status}>
        {/* Options */}
      </Select>
    </FormControl>
  </Grid>

  {/* Sort By */}
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <FormControl fullWidth>
      <InputLabel>Sort By</InputLabel>
      <Select value={filters.sort_by}>
        {/* Options */}
      </Select>
    </FormControl>
  </Grid>
</Grid>
```

### User Management Table Layout

```typescript
// From UserManagementPage.tsx
<Grid container spacing={3}>
  {/* Header with Actions */}
  <Grid size={{ xs: 12 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h4">User Management</Typography>
      <Button variant="contained" startIcon={<AddIcon />}>
        Add User
      </Button>
    </Box>
  </Grid>
  
  {/* Table Container */}
  <Grid size={{ xs: 12 }}>
    <TableContainer component={Paper}>
      <Table>
        {/* Table content */}
      </Table>
    </TableContainer>
  </Grid>
</Grid>
```

### Create Project Form Layout

```typescript
// From CreateProjectPage.tsx
<Grid container spacing={3}>
  {/* Program Selection */}
  <Grid size={{ xs: 12 }}>
    <FormControl fullWidth required>
      <InputLabel>Program</InputLabel>
      <Select value={formData.program_id}>
        {/* Options */}
      </Select>
    </FormControl>
  </Grid>

  {/* Title */}
  <Grid size={{ xs: 12 }}>
    <TextField
      fullWidth
      label="Project Title"
      value={formData.title}
      required
    />
  </Grid>

  {/* Abstract */}
  <Grid size={{ xs: 12 }}>
    <TextField
      fullWidth
      label="Abstract"
      multiline
      rows={4}
      value={formData.abstract}
      required
    />
  </Grid>

  {/* Academic Year and Semester */}
  <Grid size={{ xs: 12, sm: 6 }}>
    <TextField
      fullWidth
      label="Academic Year"
      value={formData.academic_year}
      required
    />
  </Grid>
  <Grid size={{ xs: 12, sm: 6 }}>
    <FormControl fullWidth required>
      <InputLabel>Semester</InputLabel>
      <Select value={formData.semester}>
        {/* Options */}
      </Select>
    </FormControl>
  </Grid>
</Grid>
```

## Best Practices

### Mobile-First Design
1. **Start with Mobile**: Define `xs` sizes first
2. **Progressive Enhancement**: Add larger breakpoints as needed
3. **Touch-Friendly**: Ensure adequate spacing for touch targets

### Performance
1. **Efficient Renders**: Use stable keys for dynamic grids
2. **Conditional Rendering**: Only render visible grid items when possible
3. **Memoization**: Use React.memo for expensive grid children

### Accessibility
1. **Logical Order**: Ensure grid items appear in logical order
2. **Screen Readers**: Use semantic HTML elements within grid items
3. **Keyboard Navigation**: Ensure proper tab order

### Code Organization
1. **Consistent Spacing**: Use consistent spacing values throughout
2. **Breakpoint Strategy**: Define a clear breakpoint strategy
3. **Component Reuse**: Extract common grid patterns into reusable components

## Migration from Grid v1

### Old API (v1)
```typescript
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    Content
  </Grid>
</Grid>
```

### New API (v2)
```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    Content
  </Grid>
</Grid>
```

### Key Changes
1. **Remove `item` prop**: No longer needed
2. **Use `size` prop**: Replace `xs`, `sm`, etc. with `size` object
3. **Simplified API**: More intuitive and performant

## Common Pitfalls

### Incorrect Sizing
```typescript
// ❌ Wrong - using old API
<Grid item xs={12} md={6}>

// ✅ Correct - using new API
<Grid size={{ xs: 12, md: 6 }}>
```

### Missing Container
```typescript
// ❌ Wrong - missing container
<Grid size={{ xs: 12 }}>Content</Grid>

// ✅ Correct - with container
<Grid container spacing={2}>
  <Grid size={{ xs: 12 }}>Content</Grid>
</Grid>
```

### Inconsistent Spacing
```typescript
// ❌ Wrong - inconsistent spacing
<Grid container spacing={2}>
  <Grid size={{ xs: 12 }} sx={{ marginBottom: 3 }}>
    Content
  </Grid>
</Grid>

// ✅ Correct - use container spacing
<Grid container spacing={3}>
  <Grid size={{ xs: 12 }}>
    Content
  </Grid>
</Grid>
```

## Debugging Tips

### Visual Debugging
```typescript
// Add temporary borders to see grid structure
<Grid 
  container 
  spacing={2}
  sx={{ border: '1px solid red' }}
>
  <Grid size={{ xs: 12, md: 6 }} sx={{ border: '1px solid blue' }}>
    Content
  </Grid>
</Grid>
```

### Responsive Testing
1. Use browser dev tools to test different breakpoints
2. Test on actual devices when possible
3. Verify touch targets are adequate on mobile

### Performance Monitoring
1. Monitor re-renders with React DevTools
2. Check bundle size impact of grid usage
3. Test scrolling performance with large grids
