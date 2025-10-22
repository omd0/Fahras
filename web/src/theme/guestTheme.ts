import { createTheme, alpha } from '@mui/material/styles';

// Updated color palette with darker, more vibrant shades
export const guestColors = {
  // Primary colors as specified by user - darker, more vibrant shades
  lightBlue: '#7BB0D8',      // Darker Light Blue for backgrounds - deeper and more vibrant
  mintGreen: '#9FE3C1',     // Darker Mint Green for highlights/buttons - more energetic
  cream: '#F5E9D8',         // Darker Cream for content sections - warmer and richer
  white: '#FFFFFF',         // White for main text and content - clear and readable
  
  // Supporting colors
  offWhite: '#F8F9FA',       // Off-white for content sections
  mediumGray: '#E5E7EB',     // Medium gray for borders
  darkGray: '#6B7280',       // Dark gray for muted text
  textPrimary: '#2C3E50',    // Dark text for readability
  textSecondary: '#6B7280',  // Medium gray for secondary text
  
  // Accent colors
  softBlue: '#3498DB',       // Soft blue accent
  softPurple: '#9B59B6',     // Soft purple accent
  softOrange: '#E67E22',     // Soft orange accent
  success: '#27AE60',        // Success green
  warning: '#F39C12',        // Warning orange
  error: '#E74C3C',          // Error red
  
  // Gradient combinations with darker color scheme
  primaryGradient: 'linear-gradient(135deg, #7BB0D8 0%, #9FE3C1 100%)',      // Darker Light Blue to Darker Mint Green
  secondaryGradient: 'linear-gradient(135deg, #9FE3C1 0%, #F5E9D8 100%)',    // Darker Mint Green to Darker Cream
  accentGradient: 'linear-gradient(135deg, #7BB0D8 0%, #3498DB 100%)',      // Darker Light Blue to Soft Blue
  backgroundGradient: 'linear-gradient(135deg, #7BB0D8 0%, #9FE3C1 50%, #F5E9D8 100%)',  // Main background gradient
  
  // Legacy color mappings for compatibility
  darkBlue: '#2C3E50',       // Dark blue for text
  charcoalGray: '#6B7280',   // Medium gray for secondary text
  oliveGreen: '#9FE3C1',     // Darker mint green for highlights
  text: '#2C3E50',           // Dark text for readability
};

// Decorative elements styles with new color scheme
export const decorativeStyles = {
  // Transparent circles with darker color scheme
  transparentCircle: {
    position: 'absolute' as const,
    borderRadius: '50%',
    background: 'rgba(123, 176, 216, 0.12)',  // Darker Light Blue with low opacity
    pointerEvents: 'none' as const,
  },
  
  // Diagonal lines with subtle gradients
  diagonalLine: {
    position: 'absolute' as const,
    background: 'linear-gradient(45deg, transparent 30%, rgba(123, 176, 216, 0.15) 50%, transparent 70%)',
    pointerEvents: 'none' as const,
  },
  
  // Geometric patterns with darker color scheme
  geometricPattern: {
    position: 'absolute' as const,
    background: `
      radial-gradient(circle at 20% 80%, rgba(123, 176, 216, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(159, 227, 193, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(245, 233, 216, 0.06) 0%, transparent 50%)
    `,
    pointerEvents: 'none' as const,
  },
  
  // Soft shadows for depth
  softShadow: {
    boxShadow: '0 4px 20px rgba(123, 176, 216, 0.18), 0 2px 8px rgba(159, 227, 193, 0.12)',
  },
  
  // Subtle border with darker colors
  subtleBorder: {
    border: '1px solid rgba(123, 176, 216, 0.3)',
  },
  
  // Project box styling
  projectBox: {
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(123, 176, 216, 0.15), 0 2px 8px rgba(159, 227, 193, 0.1)',
    border: '1px solid rgba(123, 176, 216, 0.25)',
    background: '#FFFFFF',
  },
  
  // Button styling
  buttonPrimary: {
    background: guestColors.mintGreen,
    color: guestColors.textPrimary,
    borderRadius: '12px',
    fontWeight: 600,
    '&:hover': {
      background: guestColors.cream,
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(159, 227, 193, 0.4)',
    },
  },
};

// Create the guest theme with new color scheme
export const guestTheme = createTheme({
  palette: {
    primary: {
      main: guestColors.lightBlue,
      light: guestColors.mintGreen,
      dark: guestColors.darkBlue,
      contrastText: guestColors.textPrimary,
    },
    secondary: {
      main: guestColors.mintGreen,
      light: guestColors.cream,
      dark: guestColors.softBlue,
      contrastText: guestColors.textPrimary,
    },
    background: {
      default: guestColors.backgroundGradient,
      paper: guestColors.white,
    },
    text: {
      primary: guestColors.textPrimary,
      secondary: guestColors.textSecondary,
    },
    success: {
      main: guestColors.success,
    },
    warning: {
      main: guestColors.warning,
    },
    error: {
      main: guestColors.error,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: guestColors.textPrimary,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: guestColors.textPrimary,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: guestColors.textPrimary,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: guestColors.textPrimary,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: guestColors.textPrimary,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: guestColors.textSecondary,
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: guestColors.mintGreen,
          color: guestColors.textPrimary,
          boxShadow: '0 4px 12px rgba(159, 227, 193, 0.35)',
          '&:hover': {
            background: guestColors.cream,
            boxShadow: '0 8px 20px rgba(159, 227, 193, 0.45)',
          },
        },
        outlined: {
          borderColor: guestColors.lightBlue,
          color: guestColors.lightBlue,
          '&:hover': {
            borderColor: guestColors.lightBlue,
            backgroundColor: alpha(guestColors.lightBlue, 0.1),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(123, 176, 216, 0.15), 0 2px 8px rgba(159, 227, 193, 0.1)',
          border: `1px solid ${alpha(guestColors.lightBlue, 0.25)}`,
          background: guestColors.white,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(123, 176, 216, 0.25), 0 4px 12px rgba(159, 227, 193, 0.18)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: guestColors.white,
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(44, 62, 80, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(44, 62, 80, 0.12)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(44, 62, 80, 0.16)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
        filled: {
          background: guestColors.mintGreen,
          color: guestColors.textPrimary,
        },
        outlined: {
          borderColor: guestColors.lightBlue,
          color: guestColors.lightBlue,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: guestColors.white,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: guestColors.lightBlue,
              borderWidth: 2,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: guestColors.lightBlue,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: guestColors.primaryGradient,
          boxShadow: '0 4px 20px rgba(44, 62, 80, 0.3)',
        },
      },
    },
  },
});

// Utility functions for decorative elements
export const createDecorativeElements = () => ({
  // Large transparent circle
  largeCircle: {
    ...decorativeStyles.transparentCircle,
    width: '300px',
    height: '300px',
    top: '-150px',
    right: '-150px',
  },
  
  // Medium transparent circle
  mediumCircle: {
    ...decorativeStyles.transparentCircle,
    width: '200px',
    height: '200px',
    bottom: '-100px',
    left: '-100px',
  },
  
  // Small transparent circle
  smallCircle: {
    ...decorativeStyles.transparentCircle,
    width: '100px',
    height: '100px',
    top: '20%',
    right: '10%',
  },
  
  // Diagonal line pattern
  diagonalPattern: {
    ...decorativeStyles.diagonalLine,
    width: '100%',
    height: '2px',
    top: '50%',
    left: 0,
  },
  
  // Geometric background
  geometricBackground: {
    ...decorativeStyles.geometricPattern,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  
  // Small triangles for depth
  smallTriangle: {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '12px solid rgba(159, 227, 193, 0.18)',
    pointerEvents: 'none' as const,
  },
  
  // Medium triangle
  mediumTriangle: {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderLeft: '12px solid transparent',
    borderRight: '12px solid transparent',
    borderBottom: '18px solid rgba(123, 176, 216, 0.15)',
    pointerEvents: 'none' as const,
  },
});

// Background patterns for different sections with darker color scheme
export const backgroundPatterns = {
  hero: {
    background: guestColors.backgroundGradient,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  
  content: {
    background: `linear-gradient(135deg, ${guestColors.lightBlue} 0%, ${guestColors.mintGreen} 50%, ${guestColors.cream} 100%)`,
    position: 'relative' as const,
  },
  
  card: {
    background: guestColors.white,
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(123, 176, 216, 0.15), 0 2px 8px rgba(159, 227, 193, 0.1)',
    border: `1px solid ${alpha(guestColors.lightBlue, 0.25)}`,
  },
};
