import { createTheme, alpha } from '@mui/material/styles';

// TVTC Official Brand Colors based on the provided JSON instructions
export const tvtcColors = {
  // Primary brand colors from TVTC logo and portals
  primary: '#008a3e',        // Main brand green from TVTC logo
  secondary: '#3B7D98',     // Secondary brand blue for portals and links
  accent: '#f3b200',        // Accent color for special call-to-actions
  
  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Grayscale colors for text and backgrounds
  textPrimary: '#333333',     // For headings and primary text
  textSecondary: '#555555',   // For subheadings and body copy
  border: '#E0E0E0',         // For card borders and dividers
  backgroundLight: '#F9F9F9', // For light page backgrounds or cards
  
  // Additional TVTC brand colors for enhanced theming
  primaryLight: '#4CAF50',    // Lighter green for hover states
  primaryDark: '#2E7D32',     // Darker green for active states
  secondaryLight: '#5DADE2',  // Lighter blue for hover states
  secondaryDark: '#2E86AB',   // Darker blue for active states
  accentLight: '#FFC107',     // Lighter accent for hover states
  accentDark: '#FF8F00',      // Darker accent for active states
  
  // Status colors
  success: '#4CAF50',         // Success green
  warning: '#FF9800',         // Warning orange
  error: '#F44336',           // Error red
  info: '#2196F3',            // Info blue
  
  // Background variations
  backgroundDefault: '#F9F9F9',
  backgroundPaper: '#FFFFFF',
  backgroundElevated: '#FFFFFF',
  
  // Text variations
  textDisabled: '#BDBDBD',
  textHint: '#9E9E9E',
  
  // Border variations
  borderLight: '#F5F5F5',
  borderMedium: '#E0E0E0',
  borderDark: '#BDBDBD',
  
  // Shadow colors
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

// TVTC Typography based on Arial font family
export const tvtcTypography = {
  fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
  fontFamilyHeadings: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
  
  // Font sizes
  fontSize: {
    body: '16px',
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.75rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1rem',
    small: '0.875rem',
    caption: '0.75rem',
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};

// TVTC Layout and spacing
export const tvtcLayout = {
  borderRadius: '4px',
  borderRadiusLarge: '8px',
  borderRadiusSmall: '2px',
  
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  boxShadowMedium: '0 4px 8px rgba(0, 0, 0, 0.1)',
  boxShadowLarge: '0 8px 16px rgba(0, 0, 0, 0.15)',
  
  spacingUnit: '8px',
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Create the main TVTC theme
export const tvtcTheme = createTheme({
  palette: {
    primary: {
      main: tvtcColors.primary,
      light: tvtcColors.primaryLight,
      dark: tvtcColors.primaryDark,
      contrastText: tvtcColors.white,
    },
    secondary: {
      main: tvtcColors.secondary,
      light: tvtcColors.secondaryLight,
      dark: tvtcColors.secondaryDark,
      contrastText: tvtcColors.white,
    },
    background: {
      default: tvtcColors.backgroundDefault,
      paper: tvtcColors.backgroundPaper,
    },
    text: {
      primary: tvtcColors.textPrimary,
      secondary: tvtcColors.textSecondary,
      disabled: tvtcColors.textDisabled,
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
    info: {
      main: tvtcColors.info,
    },
    divider: tvtcColors.border,
  },
  
  typography: {
    fontFamily: tvtcTypography.fontFamily,
    h1: {
      fontFamily: tvtcTypography.fontFamilyHeadings,
      fontSize: tvtcTypography.fontSize.h1,
      fontWeight: tvtcTypography.fontWeight.bold,
      color: tvtcColors.textPrimary,
      lineHeight: tvtcTypography.lineHeight.tight,
    },
    h2: {
      fontFamily: tvtcTypography.fontFamilyHeadings,
      fontSize: tvtcTypography.fontSize.h2,
      fontWeight: tvtcTypography.fontWeight.semiBold,
      color: tvtcColors.textPrimary,
      lineHeight: tvtcTypography.lineHeight.tight,
    },
    h3: {
      fontFamily: tvtcTypography.fontFamilyHeadings,
      fontSize: tvtcTypography.fontSize.h3,
      fontWeight: tvtcTypography.fontWeight.semiBold,
      color: tvtcColors.textPrimary,
      lineHeight: tvtcTypography.lineHeight.normal,
    },
    h4: {
      fontFamily: tvtcTypography.fontFamilyHeadings,
      fontSize: tvtcTypography.fontSize.h4,
      fontWeight: tvtcTypography.fontWeight.medium,
      color: tvtcColors.textPrimary,
      lineHeight: tvtcTypography.lineHeight.normal,
    },
    h5: {
      fontFamily: tvtcTypography.fontFamilyHeadings,
      fontSize: tvtcTypography.fontSize.h5,
      fontWeight: tvtcTypography.fontWeight.medium,
      color: tvtcColors.textPrimary,
      lineHeight: tvtcTypography.lineHeight.normal,
    },
    h6: {
      fontFamily: tvtcTypography.fontFamilyHeadings,
      fontSize: tvtcTypography.fontSize.h6,
      fontWeight: tvtcTypography.fontWeight.medium,
      color: tvtcColors.textPrimary,
      lineHeight: tvtcTypography.lineHeight.normal,
    },
    body1: {
      fontSize: tvtcTypography.fontSize.body,
      fontWeight: tvtcTypography.fontWeight.regular,
      color: tvtcColors.textPrimary,
      lineHeight: tvtcTypography.lineHeight.relaxed,
    },
    body2: {
      fontSize: tvtcTypography.fontSize.small,
      fontWeight: tvtcTypography.fontWeight.regular,
      color: tvtcColors.textSecondary,
      lineHeight: tvtcTypography.lineHeight.normal,
    },
    caption: {
      fontSize: tvtcTypography.fontSize.caption,
      fontWeight: tvtcTypography.fontWeight.regular,
      color: tvtcColors.textSecondary,
      lineHeight: tvtcTypography.lineHeight.normal,
    },
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tvtcLayout.borderRadius,
          textTransform: 'none',
          fontWeight: tvtcTypography.fontWeight.medium,
          padding: `${tvtcLayout.spacing.sm} ${tvtcLayout.spacing.md}`,
          fontSize: tvtcTypography.fontSize.small,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: tvtcLayout.boxShadow,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: tvtcLayout.boxShadowMedium,
          },
        },
        contained: {
          backgroundColor: tvtcColors.primary,
          color: tvtcColors.white,
          '&:hover': {
            backgroundColor: tvtcColors.primaryDark,
            boxShadow: tvtcLayout.boxShadowMedium,
          },
        },
        outlined: {
          borderColor: tvtcColors.primary,
          color: tvtcColors.primary,
          '&:hover': {
            borderColor: tvtcColors.primaryDark,
            backgroundColor: alpha(tvtcColors.primary, 0.1),
          },
        },
        text: {
          color: tvtcColors.primary,
          '&:hover': {
            backgroundColor: alpha(tvtcColors.primary, 0.1),
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tvtcLayout.borderRadiusLarge,
          boxShadow: tvtcLayout.boxShadow,
          border: `1px solid ${tvtcColors.border}`,
          backgroundColor: tvtcColors.backgroundPaper,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: tvtcLayout.boxShadowMedium,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: tvtcColors.backgroundPaper,
          borderRadius: tvtcLayout.borderRadius,
        },
        elevation1: {
          boxShadow: tvtcLayout.boxShadow,
        },
        elevation2: {
          boxShadow: tvtcLayout.boxShadowMedium,
        },
        elevation3: {
          boxShadow: tvtcLayout.boxShadowLarge,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tvtcLayout.borderRadius,
            backgroundColor: tvtcColors.backgroundPaper,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tvtcColors.primary,
              borderWidth: 2,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tvtcColors.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tvtcColors.primary,
          boxShadow: tvtcLayout.boxShadow,
          color: tvtcColors.white,
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tvtcLayout.borderRadius,
          fontWeight: tvtcTypography.fontWeight.medium,
        },
        filled: {
          backgroundColor: tvtcColors.primary,
          color: tvtcColors.white,
        },
        outlined: {
          borderColor: tvtcColors.primary,
          color: tvtcColors.primary,
        },
      },
    },
    
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: tvtcColors.border,
        },
      },
    },
    
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tvtcLayout.borderRadius,
        },
        standardSuccess: {
          backgroundColor: alpha(tvtcColors.success, 0.1),
          color: tvtcColors.success,
        },
        standardWarning: {
          backgroundColor: alpha(tvtcColors.warning, 0.1),
          color: tvtcColors.warning,
        },
        standardError: {
          backgroundColor: alpha(tvtcColors.error, 0.1),
          color: tvtcColors.error,
        },
        standardInfo: {
          backgroundColor: alpha(tvtcColors.info, 0.1),
          color: tvtcColors.info,
        },
      },
    },
  },
});

// TVTC CSS Variables for global styling
export const tvtcCSSVariables = `
  :root {
    /* TVTC Palette */
    --tvtc-primary: ${tvtcColors.primary};
    --tvtc-secondary: ${tvtcColors.secondary};
    --tvtc-accent: ${tvtcColors.accent};
    --tvtc-white: ${tvtcColors.white};
    --tvtc-black: ${tvtcColors.black};
    
    /* Text Colors */
    --tvtc-text-primary: ${tvtcColors.textPrimary};
    --tvtc-text-secondary: ${tvtcColors.textSecondary};
    --tvtc-text-disabled: ${tvtcColors.textDisabled};
    
    /* Background Colors */
    --tvtc-bg-default: ${tvtcColors.backgroundDefault};
    --tvtc-bg-paper: ${tvtcColors.backgroundPaper};
    --tvtc-bg-light: ${tvtcColors.backgroundLight};
    
    /* Border Colors */
    --tvtc-border: ${tvtcColors.border};
    --tvtc-border-light: ${tvtcColors.borderLight};
    --tvtc-border-medium: ${tvtcColors.borderMedium};
    
    /* Typography */
    --tvtc-font-family: ${tvtcTypography.fontFamily};
    --tvtc-font-size-body: ${tvtcTypography.fontSize.body};
    --tvtc-font-size-h1: ${tvtcTypography.fontSize.h1};
    --tvtc-font-size-h2: ${tvtcTypography.fontSize.h2};
    --tvtc-font-size-h3: ${tvtcTypography.fontSize.h3};
    --tvtc-font-size-small: ${tvtcTypography.fontSize.small};
    
    /* Layout */
    --tvtc-border-radius: ${tvtcLayout.borderRadius};
    --tvtc-border-radius-large: ${tvtcLayout.borderRadiusLarge};
    --tvtc-box-shadow: ${tvtcLayout.boxShadow};
    --tvtc-box-shadow-medium: ${tvtcLayout.boxShadowMedium};
    --tvtc-spacing-unit: ${tvtcLayout.spacingUnit};
    --tvtc-spacing-xs: ${tvtcLayout.spacing.xs};
    --tvtc-spacing-sm: ${tvtcLayout.spacing.sm};
    --tvtc-spacing-md: ${tvtcLayout.spacing.md};
    --tvtc-spacing-lg: ${tvtcLayout.spacing.lg};
    --tvtc-spacing-xl: ${tvtcLayout.spacing.xl};
  }
`;

// Utility functions for TVTC theme
export const tvtcUtils = {
  // Get color with opacity
  getColorWithOpacity: (color: string, opacity: number) => alpha(color, opacity),
  
  // Get spacing value
  getSpacing: (multiplier: number) => `${parseInt(tvtcLayout.spacingUnit) * multiplier}px`,
  
  // Get shadow with color
  getShadow: (color: string = tvtcColors.black, opacity: number = 0.1) => 
    `0 2px 4px ${alpha(color, opacity)}`,
  
  // Get border radius
  getBorderRadius: (size: 'small' | 'medium' | 'large' = 'medium') => {
    switch (size) {
      case 'small': return tvtcLayout.borderRadiusSmall;
      case 'large': return tvtcLayout.borderRadiusLarge;
      default: return tvtcLayout.borderRadius;
    }
  },
  
  // Get responsive breakpoints
  getBreakpoints: () => ({
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  }),
};

// Export the main theme as default
export default tvtcTheme;
