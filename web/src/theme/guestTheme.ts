import { createTheme, alpha } from '@mui/material/styles';
import { tvtcColors } from './tvtcTheme';

// TVTC-branded color scheme for guest-facing pages
export const guestColors = {
  // TVTC Official Brand Colors
  primary: tvtcColors.primary,        // TVTC Green #008a3e
  secondary: tvtcColors.secondary,    // TVTC Blue #3B7D98
  accent: tvtcColors.accent,          // TVTC Accent #f3b200
  
  // Background colors
  coolGray: tvtcColors.backgroundLight,  // TVTC Light background
  almostBlack: tvtcColors.textPrimary,   // TVTC Primary text
  deepPurple: tvtcColors.primary,         // TVTC Primary green
  mediumSlateGray: tvtcColors.textSecondary, // TVTC Secondary text
  lightSkyBlue: tvtcColors.secondary,     // TVTC Secondary blue
  
  // Supporting colors using TVTC palette
  white: tvtcColors.white,           // TVTC White
  lightGray: tvtcColors.backgroundLight,  // TVTC Light background
  mediumGray: tvtcColors.border,     // TVTC Border color
  darkGray: tvtcColors.textPrimary,  // TVTC Primary text
  textPrimary: tvtcColors.textPrimary,     // TVTC Primary text
  textSecondary: tvtcColors.textSecondary, // TVTC Secondary text
  
  // Legacy color mappings for compatibility using TVTC colors
  offWhite: tvtcColors.white,       // TVTC White
  darkBrown: tvtcColors.textPrimary,      // TVTC Primary text
  terracotta: tvtcColors.primary,     // TVTC Primary green
  lightBeige: tvtcColors.secondary,     // TVTC Secondary blue
  darkOlive: tvtcColors.textSecondary,      // TVTC Secondary text
  darkBlue: tvtcColors.secondary,       // TVTC Secondary blue
  charcoalGray: tvtcColors.textPrimary,   // TVTC Primary text
  oliveGreen: tvtcColors.textSecondary,     // TVTC Secondary text
  
  // Accent colors using TVTC palette
  softBlue: tvtcColors.secondary,      // TVTC Secondary blue
  softPurple: tvtcColors.primary,     // TVTC Primary green
  softOrange: tvtcColors.accent,     // TVTC Accent color
  success: tvtcColors.success,        // TVTC Success green
  warning: tvtcColors.warning,        // TVTC Warning orange
  error: tvtcColors.error,          // TVTC Error red
  
  // Gradient combinations with TVTC color scheme
  primaryGradient: `linear-gradient(135deg, ${tvtcColors.primary} 0%, ${tvtcColors.textPrimary} 100%)`,      // TVTC Green to Primary Text
  secondaryGradient: `linear-gradient(135deg, ${tvtcColors.secondary} 0%, ${tvtcColors.primary} 100%)`,   // TVTC Blue to Green
  accentGradient: `linear-gradient(135deg, ${tvtcColors.primary} 0%, ${tvtcColors.textSecondary} 100%)`,     // TVTC Green to Secondary Text
  backgroundGradient: `linear-gradient(135deg, ${tvtcColors.backgroundLight} 0%, ${tvtcColors.white} 50%, ${tvtcColors.backgroundLight} 100%)`,  // TVTC background gradient
  
  // Additional colors for compatibility using TVTC palette
  cream: tvtcColors.backgroundLight,         // TVTC Light background
  softYellow: tvtcColors.textSecondary,     // TVTC Secondary text
  mediumNavy: tvtcColors.textPrimary,     // TVTC Primary text
  
  // Legacy color mappings for compatibility
  text: tvtcColors.textPrimary,          // TVTC Primary text
};

// Decorative elements styles with TVTC color scheme
export const decorativeStyles = {
  // Transparent circles with TVTC color scheme
  transparentCircle: {
    position: 'absolute' as const,
    borderRadius: '50%',
    background: alpha(tvtcColors.primary, 0.08),  // TVTC Primary with low opacity
    pointerEvents: 'none' as const,
  },
  
  // Diagonal lines with TVTC gradients
  diagonalLine: {
    position: 'absolute' as const,
    background: `linear-gradient(45deg, transparent 30%, ${alpha(tvtcColors.primary, 0.06)} 50%, transparent 70%)`,
    pointerEvents: 'none' as const,
  },
  
  // Geometric patterns with TVTC color scheme
  geometricPattern: {
    position: 'absolute' as const,
    background: `
      radial-gradient(circle at 20% 80%, ${alpha(tvtcColors.primary, 0.06)} 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${alpha(tvtcColors.secondary, 0.05)} 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, ${alpha(tvtcColors.textPrimary, 0.04)} 0%, transparent 50%)
    `,
    pointerEvents: 'none' as const,
  },
  
  // Soft shadows for depth using TVTC colors
  softShadow: {
    boxShadow: `0 4px 20px ${alpha(tvtcColors.primary, 0.12)}, 0 2px 8px ${alpha(tvtcColors.textPrimary, 0.08)}`,
  },
  
  // Subtle border with TVTC colors
  subtleBorder: {
    border: `1px solid ${alpha(tvtcColors.textPrimary, 0.2)}`,
  },
  
  // Project box styling with TVTC colors
  projectBox: {
    borderRadius: '12px',
    boxShadow: `0 4px 16px ${alpha(tvtcColors.primary, 0.1)}, 0 2px 8px ${alpha(tvtcColors.textPrimary, 0.06)}`,
    border: `1px solid ${alpha(tvtcColors.textPrimary, 0.15)}`,
    background: tvtcColors.white,
  },
  
  // Button styling with TVTC colors
  buttonPrimary: {
    background: tvtcColors.primary,
    color: tvtcColors.white,
    borderRadius: '12px',
    fontWeight: 600,
    '&:hover': {
      background: tvtcColors.secondary,
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 20px ${alpha(tvtcColors.primary, 0.3)}`,
    },
  },
};

// Create the guest theme with TVTC color scheme
export const guestTheme = createTheme({
  palette: {
    primary: {
      main: tvtcColors.primary,
      light: tvtcColors.secondary,
      dark: tvtcColors.textPrimary,
      contrastText: tvtcColors.white,
    },
    secondary: {
      main: tvtcColors.secondary,
      light: tvtcColors.textSecondary,
      dark: tvtcColors.textPrimary,
      contrastText: tvtcColors.white,
    },
    background: {
      default: tvtcColors.backgroundDefault,
      paper: tvtcColors.white,
    },
    text: {
      primary: tvtcColors.textPrimary,
      secondary: tvtcColors.textSecondary,
    },
    success: {
      main: tvtcColors.success,
    },
    warning: {
      main: tvtcColors.warning,
    },
    error: {
      main: tvtcColors.error,
    },
  },
  typography: {
    fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: tvtcColors.textPrimary,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: tvtcColors.textPrimary,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: tvtcColors.textPrimary,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: tvtcColors.textPrimary,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: tvtcColors.textPrimary,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: tvtcColors.textSecondary,
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
          background: tvtcColors.primary,
          color: tvtcColors.white,
          boxShadow: `0 4px 12px ${alpha(tvtcColors.primary, 0.25)}`,
          '&:hover': {
            background: tvtcColors.secondary,
            boxShadow: `0 8px 20px ${alpha(tvtcColors.primary, 0.35)}`,
          },
        },
        outlined: {
          borderColor: tvtcColors.textPrimary,
          color: tvtcColors.textPrimary,
          '&:hover': {
            borderColor: tvtcColors.textPrimary,
            backgroundColor: alpha(tvtcColors.textPrimary, 0.1),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: `0 4px 16px ${alpha(tvtcColors.primary, 0.1)}, 0 2px 8px ${alpha(tvtcColors.textPrimary, 0.06)}`,
          border: `1px solid ${alpha(tvtcColors.textPrimary, 0.15)}`,
          background: tvtcColors.white,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(tvtcColors.primary, 0.15)}, 0 4px 12px ${alpha(tvtcColors.textPrimary, 0.1)}`,
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: tvtcColors.white,
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: `0 2px 8px ${alpha(tvtcColors.primary, 0.06)}`,
        },
        elevation2: {
          boxShadow: `0 4px 16px ${alpha(tvtcColors.primary, 0.08)}`,
        },
        elevation3: {
          boxShadow: `0 8px 24px ${alpha(tvtcColors.primary, 0.12)}`,
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
          background: tvtcColors.primary,
          color: tvtcColors.white,
        },
        outlined: {
          borderColor: tvtcColors.textPrimary,
          color: tvtcColors.textPrimary,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: tvtcColors.white,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tvtcColors.textPrimary,
              borderWidth: 2,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tvtcColors.textPrimary,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: tvtcColors.primary,
          boxShadow: `0 4px 20px ${alpha(tvtcColors.textPrimary, 0.3)}`,
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
  
  // Small triangles for depth with TVTC colors
  smallTriangle: {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `12px solid ${alpha(tvtcColors.primary, 0.12)}`,
    pointerEvents: 'none' as const,
  },
  
  // Medium triangle with TVTC colors
  mediumTriangle: {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderLeft: '12px solid transparent',
    borderRight: '12px solid transparent',
    borderBottom: `18px solid ${alpha(tvtcColors.textPrimary, 0.1)}`,
    pointerEvents: 'none' as const,
  },
});

  // Background patterns for different sections with TVTC color scheme
export const backgroundPatterns = {
  hero: {
    background: tvtcColors.backgroundDefault,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  
  content: {
    background: `linear-gradient(135deg, ${tvtcColors.white} 0%, ${tvtcColors.backgroundLight} 50%, ${tvtcColors.white} 100%)`,
    position: 'relative' as const,
  },
  
  card: {
    background: tvtcColors.white,
    borderRadius: '12px',
    boxShadow: `0 4px 16px ${alpha(tvtcColors.primary, 0.1)}, 0 2px 8px ${alpha(tvtcColors.textPrimary, 0.06)}`,
    border: `1px solid ${alpha(tvtcColors.textPrimary, 0.15)}`,
  },
};
