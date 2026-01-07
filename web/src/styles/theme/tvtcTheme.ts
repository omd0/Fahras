import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// TVTC Official Brand Colors based on the provided JSON instructions
export const tvtcColors = {
  // Primary brand colors from TVTC logo and portals
  primary: '#008a3e',        // Main brand green from TVTC logo
  secondary: '#3B7D98',     // Secondary brand blue for portals and links
  accent: '#f3b200',        // Accent color for special call-to-actions
  
  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Grayscale colors for text and backgrounds (WCAG AA compliant)
  textPrimary: '#212121',     // For headings and primary text (contrast ratio 16:1)
  textSecondary: '#424242',   // For subheadings and body copy (contrast ratio 12:1)
  border: '#E0E0E0',         // For card borders and dividers
  backgroundLight: '#F9F9F9', // For light page backgrounds or cards
  
  // Additional TVTC brand colors for enhanced theming
  primaryLight: '#4CAF50',    // Lighter green for hover states
  primaryDark: '#2E7D32',     // Darker green for active states
  secondaryLight: '#5DADE2',  // Lighter blue for hover states
  secondaryDark: '#2E86AB',   // Darker blue for active states
  accentLight: '#FFC107',     // Lighter accent for hover states
  accentDark: '#FF8F00',      // Darker accent for active states
  
  // Status colors (WCAG AA compliant on white background)
  success: '#2E7D32',         // Darker success green (4.5:1 contrast)
  warning: '#E65100',         // Darker warning orange (4.5:1 contrast)
  error: '#C62828',           // Darker error red (4.5:1 contrast)
  info: '#1565C0',            // Darker info blue (4.5:1 contrast)
  
  // Background variations
  backgroundDefault: '#F9F9F9',
  backgroundPaper: '#FFFFFF',
  backgroundElevated: '#FFFFFF',
  
  // Text variations (improved contrast)
  textDisabled: '#9E9E9E',  // Better contrast for disabled text
  textHint: '#757575',       // Better contrast for hint text
  
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

// Dark mode color overrides
export const tvtcColorsDark = {
  // Primary brand colors remain consistent
  primary: '#008a3e',
  secondary: '#3B7D98',
  accent: '#f3b200',
  
  // Dark mode specific colors
  white: '#1a1a1a',           // Inverted for dark backgrounds
  black: '#FFFFFF',            // Inverted for dark text
  
  // Grayscale colors for dark mode
  textPrimary: '#E0E0E0',      // Light text on dark background
  textSecondary: '#B0B0B0',    // Secondary text
  border: '#404040',           // Darker borders
  backgroundLight: '#242424',   // Slightly lighter than default
  
  // Additional brand colors (consistent across themes)
  primaryLight: '#4CAF50',
  primaryDark: '#2E7D32',
  secondaryLight: '#5DADE2',
  secondaryDark: '#2E86AB',
  accentLight: '#FFC107',
  accentDark: '#FF8F00',
  
  // Status colors (consistent)
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Dark mode backgrounds
  backgroundDefault: '#1a1a1a',
  backgroundPaper: '#242424',
  backgroundElevated: '#2a2a2a',
  
  // Dark mode text variations
  textDisabled: '#606060',
  textHint: '#808080',
  
  // Dark mode border variations
  borderLight: '#303030',
  borderMedium: '#404040',
  borderDark: '#505050',
  
  // Shadow colors for dark mode
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowDark: 'rgba(0, 0, 0, 0.7)',
};

const createThemeOptions = (mode: 'light' | 'dark' = 'light'): ThemeOptions => {
  const colors = mode === 'dark' ? tvtcColorsDark : tvtcColors;
  
  return {
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: colors.primaryLight,
        dark: colors.primaryDark,
        contrastText: mode === 'dark' ? colors.black : colors.white,
      },
      secondary: {
        main: colors.secondary,
        light: colors.secondaryLight,
        dark: colors.secondaryDark,
        contrastText: mode === 'dark' ? colors.black : colors.white,
      },
      background: {
        default: colors.backgroundDefault,
        paper: colors.backgroundPaper,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
        disabled: colors.textDisabled,
      },
      success: {
        main: colors.success,
      },
      warning: {
        main: colors.warning,
      },
      error: {
        main: colors.error,
      },
      info: {
        main: colors.info,
      },
      divider: colors.border,
    },
    
    typography: {
      fontFamily: tvtcTypography.fontFamily,
      h1: {
        fontFamily: tvtcTypography.fontFamilyHeadings,
        fontSize: tvtcTypography.fontSize.h1,
        fontWeight: tvtcTypography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: tvtcTypography.lineHeight.tight,
      },
      h2: {
        fontFamily: tvtcTypography.fontFamilyHeadings,
        fontSize: tvtcTypography.fontSize.h2,
        fontWeight: tvtcTypography.fontWeight.semiBold,
        color: colors.textPrimary,
        lineHeight: tvtcTypography.lineHeight.tight,
      },
      h3: {
        fontFamily: tvtcTypography.fontFamilyHeadings,
        fontSize: tvtcTypography.fontSize.h3,
        fontWeight: tvtcTypography.fontWeight.semiBold,
        color: colors.textPrimary,
        lineHeight: tvtcTypography.lineHeight.normal,
      },
      h4: {
        fontFamily: tvtcTypography.fontFamilyHeadings,
        fontSize: tvtcTypography.fontSize.h4,
        fontWeight: tvtcTypography.fontWeight.medium,
        color: colors.textPrimary,
        lineHeight: tvtcTypography.lineHeight.normal,
      },
      h5: {
        fontFamily: tvtcTypography.fontFamilyHeadings,
        fontSize: tvtcTypography.fontSize.h5,
        fontWeight: tvtcTypography.fontWeight.medium,
        color: colors.textPrimary,
        lineHeight: tvtcTypography.lineHeight.normal,
      },
      h6: {
        fontFamily: tvtcTypography.fontFamilyHeadings,
        fontSize: tvtcTypography.fontSize.h6,
        fontWeight: tvtcTypography.fontWeight.medium,
        color: colors.textPrimary,
        lineHeight: tvtcTypography.lineHeight.normal,
      },
      body1: {
        fontSize: tvtcTypography.fontSize.body,
        fontWeight: tvtcTypography.fontWeight.regular,
        color: colors.textPrimary,
        lineHeight: tvtcTypography.lineHeight.relaxed,
      },
      body2: {
        fontSize: tvtcTypography.fontSize.small,
        fontWeight: tvtcTypography.fontWeight.regular,
        color: colors.textSecondary,
        lineHeight: tvtcTypography.lineHeight.normal,
      },
      caption: {
        fontSize: tvtcTypography.fontSize.caption,
        fontWeight: tvtcTypography.fontWeight.regular,
        color: colors.textSecondary,
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
            '&:focus': {
              outline: `3px solid ${colors.primary}`,
              outlineOffset: '2px',
            },
            '&:focus:not(:focus-visible)': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: `3px solid ${colors.primary}`,
              outlineOffset: '2px',
              boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.25)}`,
            },
          },
          contained: {
            backgroundColor: colors.primary,
            color: mode === 'dark' ? colors.black : colors.white,
            '&:hover': {
              backgroundColor: colors.primaryDark,
              boxShadow: tvtcLayout.boxShadowMedium,
            },
          },
          outlined: {
            borderColor: colors.primary,
            color: colors.primary,
            '&:hover': {
              borderColor: colors.primaryDark,
              backgroundColor: alpha(colors.primary, 0.1),
            },
          },
          text: {
            color: colors.primary,
            '&:hover': {
              backgroundColor: alpha(colors.primary, 0.1),
            },
          },
        },
      },
      
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: tvtcLayout.borderRadiusLarge,
            boxShadow: tvtcLayout.boxShadow,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.backgroundPaper,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: tvtcLayout.boxShadowMedium,
              transform: 'translateY(-2px)',
            },
            '&:focus': {
              outline: `3px solid ${colors.primary}`,
              outlineOffset: '2px',
            },
            '&:focus:not(:focus-visible)': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: `3px solid ${colors.primary}`,
              outlineOffset: '2px',
            },
          },
        },
      },
      
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors.backgroundPaper,
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
              backgroundColor: colors.backgroundPaper,
              transition: 'all 0.2s ease-in-out',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary,
                borderWidth: 2,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary,
                borderWidth: 2,
                boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.25)}`,
              },
              '&:focus-within': {
                boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.25)}`,
              },
            },
          },
        },
      },
      
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.primary,
            boxShadow: tvtcLayout.boxShadow,
            color: mode === 'dark' ? colors.black : colors.white,
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
            backgroundColor: colors.primary,
            color: mode === 'dark' ? colors.black : colors.white,
          },
          outlined: {
            borderColor: colors.primary,
            color: colors.primary,
          },
        },
      },
      
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border,
          },
        },
      },
      
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease-in-out',
            '&:focus': {
              outline: `3px solid ${colors.primary}`,
              outlineOffset: '2px',
            },
            '&:focus:not(:focus-visible)': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: `3px solid ${colors.primary}`,
              outlineOffset: '2px',
              backgroundColor: alpha(colors.primary, 0.1),
            },
          },
        },
      },
      
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: tvtcLayout.borderRadius,
          },
          standardSuccess: {
            backgroundColor: alpha(colors.success, mode === 'dark' ? 0.2 : 0.1),
            color: colors.success,
          },
          standardWarning: {
            backgroundColor: alpha(colors.warning, mode === 'dark' ? 0.2 : 0.1),
            color: colors.warning,
          },
          standardError: {
            backgroundColor: alpha(colors.error, mode === 'dark' ? 0.2 : 0.1),
            color: colors.error,
          },
          standardInfo: {
            backgroundColor: alpha(colors.info, mode === 'dark' ? 0.2 : 0.1),
            color: colors.info,
          },
        },
      },
    },
  };
};

export const createTvtcTheme = (direction: 'ltr' | 'rtl' = 'ltr', mode: 'light' | 'dark' = 'light') =>
  createTheme({
    ...createThemeOptions(mode),
    direction,
  });

// Create the main TVTC theme
export const tvtcTheme = createTvtcTheme();

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
