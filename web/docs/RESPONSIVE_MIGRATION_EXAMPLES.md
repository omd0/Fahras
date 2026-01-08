# Responsive Design Migration Examples

This guide provides before/after examples for migrating existing components to be mobile-responsive.

## Table of Contents
- [Basic Component](#basic-component)
- [Navigation Component](#navigation-component)
- [Form Component](#form-component)
- [Card Grid](#card-grid)
- [Modal/Dialog](#modaldialog)
- [Data Table](#data-table)

---

## Basic Component

### ❌ Before (Not Responsive)
```tsx
import { Box, Typography, Button } from '@mui/material';

export const MyComponent = () => {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h3" sx={{ marginBottom: 3 }}>
        Page Title
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
        Some content here...
      </Typography>
      <Button variant="contained" onClick={handleClick}>
        Click Me
      </Button>
    </Box>
  );
};
```

### ✅ After (Mobile-Responsive)
```tsx
import { Box, Typography, Button } from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

export const MyComponent = () => {
  const { isMobile } = useResponsive();
  
  return (
    <Box 
      sx={{ 
        padding: { xs: 2, sm: 3, md: 4 }, // Mobile-first padding
      }}
    >
      <Typography 
        variant="h3" 
        sx={{ 
          marginBottom: { xs: 2, md: 3 },
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, // Responsive font size
        }}
      >
        Page Title
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          fontSize: { xs: '1rem', md: '1.25rem' },
          lineHeight: { xs: 1.5, md: 1.6 },
        }}
      >
        Some content here...
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleClick}
        sx={{
          minHeight: tvtcMobile.touchTarget.minimum, // Touch-friendly
          minWidth: tvtcMobile.touchTarget.minimum,
          px: { xs: 2, md: 3 },
          py: { xs: 1, md: 1.5 },
          mt: { xs: 2, md: 3 },
        }}
      >
        Click Me
      </Button>
    </Box>
  );
};
```

**Key Changes:**
- Added responsive padding, margins, and font sizes
- Used `tvtcMobile.touchTarget.minimum` for button touch targets
- Used MUI's responsive `sx` prop with breakpoints

---

## Navigation Component

### ❌ Before (Desktop Only)
```tsx
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Navigation = () => {
  const navigate = useNavigate();
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          My App
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button color="inherit" onClick={() => navigate('/home')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate('/about')}>
            About
          </Button>
          <Button color="inherit" onClick={() => navigate('/contact')}>
            Contact
          </Button>
          <Button variant="outlined" color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
```

### ✅ After (Mobile + Desktop)
```tsx
import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Stack, 
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNavigationMode } from '@/hooks/useResponsive';
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

export const Navigation = () => {
  const navigate = useNavigate();
  const { showMobileNav, showDesktopNav } = useNavigationMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const menuItems = [
    { label: 'Home', path: '/home' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };
  
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ minHeight: tvtcMobile.navHeight.mobile }}>
          {/* Mobile Menu Button */}
          {showMobileNav && (
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{
                minWidth: tvtcMobile.touchTarget.minimum,
                minHeight: tvtcMobile.touchTarget.minimum,
                mr: 2,
              }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            My App
          </Typography>
          
          {/* Desktop Navigation */}
          {showDesktopNav && (
            <Stack direction="row" spacing={2}>
              {menuItems.map(item => (
                <Button 
                  key={item.path}
                  color="inherit" 
                  onClick={() => navigate(item.path)}
                  sx={{ minHeight: tvtcMobile.touchTarget.minimum }}
                >
                  {item.label}
                </Button>
              ))}
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ minHeight: tvtcMobile.touchTarget.minimum }}
              >
                Login
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: tvtcMobile.drawerWidth.mobile },
        }}
      >
        <List>
          {menuItems.map(item => (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{ minHeight: tvtcMobile.touchTarget.comfortable }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
          <ListItemButton
            onClick={() => handleNavigation('/login')}
            sx={{ 
              minHeight: tvtcMobile.touchTarget.comfortable,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              mt: 2,
            }}
          >
            <ListItemText primary="Login" />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};
```

**Key Changes:**
- Added hamburger menu for mobile (< 900px)
- Created mobile drawer navigation
- Used `useNavigationMode` hook for conditional rendering
- Proper touch targets throughout

---

## Form Component

### ❌ Before (Not Touch-Optimized)
```tsx
import { Box, TextField, Button, Stack } from '@mui/material';

export const LoginForm = () => {
  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 4 }}>
      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
        />
        <Button variant="contained" type="submit">
          Login
        </Button>
      </Stack>
    </Box>
  );
};
```

### ✅ After (Touch-Optimized)
```tsx
import { Box, TextField, Button, Stack } from '@mui/material';
import { useFormResponsive } from '@/hooks/useResponsive';
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

export const LoginForm = () => {
  const { 
    buttonSize, 
    buttonMinHeight, 
    isMobile,
  } = useFormResponsive();
  
  return (
    <Box 
      sx={{ 
        maxWidth: { xs: '100%', sm: 400 },
        margin: 'auto',
        padding: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Stack spacing={{ xs: 2, md: 2.5 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          size={isMobile ? 'medium' : 'medium'}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: tvtcMobile.touchTarget.minimum,
            },
          }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          size={isMobile ? 'medium' : 'medium'}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: tvtcMobile.touchTarget.minimum,
            },
          }}
        />
        <Button 
          variant="contained" 
          type="submit"
          size={buttonSize}
          sx={{
            minHeight: buttonMinHeight,
            py: { xs: 1.5, md: 1.75 },
            fontSize: { xs: '1rem', md: '1.1rem' },
          }}
        >
          Login
        </Button>
      </Stack>
    </Box>
  );
};
```

**Key Changes:**
- Used `useFormResponsive` hook for optimal sizing
- Added minimum touch target heights to inputs
- Responsive padding and spacing
- Larger button on touch devices

---

## Card Grid

### ❌ Before (Fixed Columns)
```tsx
import { Grid, Card, CardContent, Typography } from '@mui/material';

export const ProjectGrid = ({ projects }) => {
  return (
    <Grid container spacing={3}>
      {projects.map(project => (
        <Grid item xs={4} key={project.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{project.title}</Typography>
              <Typography variant="body2">{project.description}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
```

### ✅ After (Responsive Columns)
```tsx
import { Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

export const ProjectGrid = ({ projects }) => {
  return (
    <Grid 
      container 
      spacing={{ 
        xs: tvtcMobile.gridGap.mobile,
        sm: tvtcMobile.gridGap.tablet,
        md: tvtcMobile.gridGap.desktop,
      }}
    >
      {projects.map(project => (
        <Grid 
          size={{ 
            xs: 12,  // 1 column on mobile
            sm: 6,   // 2 columns on tablet
            md: 4,   // 3 columns on desktop
            lg: 3,   // 4 columns on large desktop
          }} 
          key={project.id}
        >
          <Card
            sx={{
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
              // Disable hover transform on touch devices
              '@media (hover: none)': {
                '&:hover': {
                  transform: 'none',
                },
              },
            }}
          >
            <CardActionArea
              sx={{
                minHeight: tvtcMobile.touchTarget.comfortable,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    mb: { xs: 1, md: 1.5 },
                  }}
                >
                  {project.title}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                  }}
                >
                  {project.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
```

**Key Changes:**
- Responsive grid columns (1 → 2 → 3 → 4 columns)
- Responsive spacing between cards
- Disabled hover transforms on touch devices
- Touch-friendly card action areas
- Responsive typography

---

## Modal/Dialog

### ❌ Before (Fixed Size)
```tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export const MyDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        Content goes here...
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};
```

### ✅ After (Mobile-Optimized)
```tsx
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useResponsive } from '@/hooks/useResponsive';
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

export const MyDialog = ({ open, onClose }) => {
  const { isMobile } = useResponsive();
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"
      fullWidth
      fullScreen={isMobile} // Full screen on mobile
      sx={{
        '& .MuiDialog-paper': {
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: { xs: tvtcMobile.navHeight.mobile, sm: 'auto' },
          px: { xs: 2, sm: 3 },
        }}
      >
        <span>Dialog Title</span>
        {isMobile && (
          <IconButton
            onClick={onClose}
            sx={{
              minWidth: tvtcMobile.touchTarget.minimum,
              minHeight: tvtcMobile.touchTarget.minimum,
            }}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
        }}
      >
        Content goes here...
      </DialogContent>
      
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2 },
          gap: { xs: 1, sm: 1.5 },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}
      >
        <Button 
          onClick={onClose}
          fullWidth={isMobile}
          sx={{
            minHeight: tvtcMobile.touchTarget.minimum,
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          fullWidth={isMobile}
          sx={{
            minHeight: tvtcMobile.touchTarget.minimum,
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

**Key Changes:**
- Full screen on mobile for better UX
- Added close button in header for mobile
- Stacked buttons vertically on mobile
- Responsive padding throughout
- Touch-friendly button sizes

---

## Data Table

### ❌ Before (Desktop Only)
```tsx
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export const DataTable = ({ data }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

### ✅ After (Mobile Card View)
```tsx
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';

export const DataTable = ({ data }) => {
  const { isMobile } = useResponsive();
  
  // Mobile: Show as cards
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {data.map(row => (
          <Card key={row.id}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {row.name}
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2">{row.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body2">{row.role}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={row.status} 
                    size="small" 
                    color={row.status === 'Active' ? 'success' : 'default'}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }
  
  // Desktop: Show as table
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell>
              <Chip 
                label={row.status} 
                size="small" 
                color={row.status === 'Active' ? 'success' : 'default'}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

**Key Changes:**
- Conditional rendering: cards on mobile, table on desktop
- Better mobile UX with card-based layout
- Maintains all information in both views
- Touch-friendly card targets

---

## Quick Reference Checklist

When making a component responsive, ensure you:

- [ ] Use responsive breakpoints in `sx` props
- [ ] Apply minimum touch target sizes (44x44px)
- [ ] Test on mobile, tablet, and desktop viewports
- [ ] Use `useResponsive` or `useNavigationMode` hooks
- [ ] Disable hover effects on touch devices
- [ ] Add responsive padding, margins, font sizes
- [ ] Consider mobile-specific layouts (cards vs tables)
- [ ] Ensure proper ARIA labels for accessibility
- [ ] Test with keyboard navigation
- [ ] Review on actual mobile devices if possible

---

**See also:**
- [MOBILE_RESPONSIVENESS.md](./MOBILE_RESPONSIVENESS.md) - Full documentation
- [PHASE_4_SUMMARY.md](./PHASE_4_SUMMARY.md) - Implementation summary
