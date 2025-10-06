# Theme System

## Overview

The Fahras application uses Material-UI v7's theming system to provide consistent styling, branding, and customization across all components. The theme is configured in `App.tsx` and applied globally through the `ThemeProvider`.

## Theme Configuration

### Current Theme Setup

```typescript
// App.tsx
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

### Theme Structure

The Material-UI theme object contains several key sections:

#### Palette
- **Primary Colors**: Main brand colors for buttons, links, and highlights
- **Secondary Colors**: Accent colors for secondary actions
- **Background Colors**: Page and component backgrounds
- **Text Colors**: Text hierarchy and contrast
- **Error/Success/Warning**: Status colors

#### Typography
- **Font Family**: Primary font stack
- **Font Sizes**: Consistent text sizing scale
- **Font Weights**: Weight variations for emphasis
- **Line Heights**: Optimal readability spacing

#### Spacing
- **Base Unit**: 8px spacing unit (Material-UI default)
- **Component Spacing**: Consistent padding and margins
- **Grid Spacing**: Layout spacing between elements

#### Breakpoints
- **Responsive Design**: Mobile-first breakpoint system
- **Container Widths**: Max-width constraints for content

## Color Palette

### Primary Colors
```typescript
primary: {
  main: '#2196f3',      // Material Blue 500
  light: '#64b5f6',     // Material Blue 300
  dark: '#1976d2',      // Material Blue 700
  contrastText: '#ffffff'
}
```

### Secondary Colors
```typescript
secondary: {
  main: '#dc004e',      // Material Pink 500
  light: '#ff5983',     // Material Pink 300
  dark: '#9a0036',      // Material Pink 700
  contrastText: '#ffffff'
}
```

### Status Colors
```typescript
error: {
  main: '#f44336',      // Material Red 500
}
warning: {
  main: '#ff9800',      // Material Orange 500
}
info: {
  main: '#2196f3',      // Material Blue 500
}
success: {
  main: '#4caf50',      // Material Green 500
}
```

## Typography Scale

### Font Hierarchy

```typescript
typography: {
  h1: {
    fontSize: '2.125rem',    // 34px
    fontWeight: 300,
    lineHeight: 1.235,
  },
  h2: {
    fontSize: '1.5rem',      // 24px
    fontWeight: 300,
    lineHeight: 1.334,
  },
  h3: {
    fontSize: '1.25rem',     // 20px
    fontWeight: 400,
    lineHeight: 1.6,
  },
  h4: {
    fontSize: '1.125rem',    // 18px
    fontWeight: 400,
    lineHeight: 1.667,
  },
  h5: {
    fontSize: '1rem',        // 16px
    fontWeight: 400,
    lineHeight: 1.75,
  },
  h6: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',        // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 400,
    lineHeight: 1.43,
  },
  caption: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 400,
    lineHeight: 1.66,
  },
}
```

## Component Styling

### Using the `sx` Prop

The preferred method for styling components:

```typescript
<Box
  sx={{
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    padding: 2,
    borderRadius: 1,
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
  }}
>
  Styled Content
</Box>
```

### Theme Access in Components

Access theme values programmatically:

```typescript
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        color: theme.palette.primary.main,
        fontSize: theme.typography.h6.fontSize,
      }}
    >
      Theme-aware content
    </Box>
  );
};
```

## Responsive Design

### Breakpoint Usage

```typescript
<Box
  sx={{
    padding: { xs: 1, sm: 2, md: 3 },
    fontSize: { xs: '0.875rem', md: '1rem' },
    display: { xs: 'block', md: 'flex' },
  }}
>
  Responsive content
</Box>
```

### Container Widths

```typescript
<Container
  maxWidth="lg"  // max-width: 1200px
  sx={{
    paddingX: { xs: 2, sm: 3 },
  }}
>
  Content
</Container>
```

## Custom Theme Extensions

### Adding Custom Properties

```typescript
const theme = createTheme({
  palette: {
    // ... existing palette
  },
  custom: {
    shadows: {
      card: '0 2px 8px rgba(0,0,0,0.1)',
      elevated: '0 4px 16px rgba(0,0,0,0.15)',
    },
    gradients: {
      primary: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
      secondary: 'linear-gradient(45deg, #dc004e 30%, #ff6b9d 90%)',
    },
  },
});
```

### TypeScript Support

Extend the theme type for custom properties:

```typescript
// types/theme.d.ts
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      shadows: {
        card: string;
        elevated: string;
      };
      gradients: {
        primary: string;
        secondary: string;
      };
    };
  }
  
  interface ThemeOptions {
    custom?: {
      shadows?: {
        card?: string;
        elevated?: string;
      };
      gradients?: {
        primary?: string;
        secondary?: string;
      };
    };
  }
}
```

## Dark Mode Support

### Theme Toggle Implementation

```typescript
const [darkMode, setDarkMode] = useState(false);

const theme = createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: darkMode ? '#90caf9' : '#2196f3',
    },
    // ... other palette colors
  },
});
```

### Dark Mode Color Adjustments

```typescript
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});
```

## Component Theme Customization

### Button Variants

```typescript
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});
```

### Card Styling

```typescript
const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
```

## Best Practices

### Color Usage
1. **Primary Colors**: Use for main actions, links, and branding
2. **Secondary Colors**: Use for secondary actions and accents
3. **Status Colors**: Use consistently for success, error, warning, and info states
4. **Text Colors**: Follow the hierarchy for optimal readability

### Typography
1. **Consistency**: Use predefined typography variants
2. **Hierarchy**: Maintain clear visual hierarchy with heading sizes
3. **Readability**: Ensure sufficient contrast and line spacing
4. **Responsiveness**: Adjust font sizes for different screen sizes

### Spacing
1. **Consistency**: Use the 8px spacing unit consistently
2. **Padding**: Use consistent padding for similar components
3. **Margins**: Use margins for component separation
4. **Grid**: Use the grid system for layout spacing

### Theme Updates
1. **Incremental**: Make theme changes incrementally
2. **Testing**: Test changes across all components
3. **Documentation**: Update documentation when making theme changes
4. **Accessibility**: Ensure changes maintain accessibility standards

## Migration and Updates

### Updating Material-UI
1. Check breaking changes in the upgrade guide
2. Update theme configuration if needed
3. Test all components for visual regressions
4. Update custom theme extensions

### Adding New Theme Properties
1. Define the property in the theme configuration
2. Add TypeScript declarations if needed
3. Document the new property and its usage
4. Update components to use the new property
