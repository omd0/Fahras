import { createTheme, alpha } from '@mui/material/styles';
import { designTokens } from '@/styles/designTokens';

// Professor-specific color scheme - Clean and Professional
export const professorColors = {
  // Primary colors - Dark Blue/Navy for trust and professionalism
  primary: '#004AAD',        // Dark Blue/Navy - conveys trust and professionalism
  secondary: '#4ECDC4',      // Light Blue/Turquoise - adds vibrancy and draws attention
  accent: '#FF9800',         // Soft Orange - secondary accent for highlights
  
  // Supporting colors
  tertiary: '#00796B',       // Dark Green - alternative primary for calm
  quaternary: '#4CAF50',     // Calm Grass Green - success color
  
  // Background colors - Pure White and Light Ivory for cleanliness
  background: '#FFFFFF',      // Pure White - ensures cleanliness and clarity
  backgroundLight: '#F5F5F5', // Light Ivory White - subtle contrast
  backgroundDark: '#F8F9FA',  // Very light gray for subtle sections
  
  // Card and surface colors
  cardBackground: '#FFFFFF',
  surfaceBackground: '#FAFAFA',
  
  // Text colors - High contrast for readability
  textPrimary: '#212529',     // Dark Black - high contrast for readability
  textSecondary: '#495057',   // Charcoal Gray - secondary text
  textAccent: '#004AAD',      // Dark Blue for accent text
  
  // Border and divider colors
  border: '#E9ECEF',          // Light gray border
  borderLight: '#F8F9FA',     // Very light border
  borderDark: '#DEE2E6',      // Medium gray border
  
  // Status colors with the new scheme
  success: '#4CAF50',         // Calm Grass Green - represents achievement
  warning: '#FF5722',         // Burnt Orange - draws attention to delayed items
  error: '#B71C1C',          // Dark Red/Burgundy - for errors and notifications
  info: '#4ECDC4',           // Light Blue/Turquoise - for information
  
  // ⚠️ DEPRECATED: Gradient combinations - Use solid colors from designTokens instead
  // Kept for backward compatibility and headers only (per design.toon specifications)
  // For cards and UI elements, use: border: 2px solid designTokens.colors.primary[500]
  primaryGradient: 'linear-gradient(135deg, #004AAD 0%, #00796B 100%)',
  secondaryGradient: 'linear-gradient(135deg, #4ECDC4 0%, #FF9800 100%)',
  backgroundGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
  successGradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
  warningGradient: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
  errorGradient: 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%)',
  
  // Shadow colors with new theme
  shadowLight: 'rgba(0, 74, 173, 0.1)',
  shadowMedium: 'rgba(0, 74, 173, 0.2)',
  shadowDark: 'rgba(0, 74, 173, 0.3)',
};

// Professor typography - Clean and readable
export const professorTypography = {
  fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  fontFamilyHeadings: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  
  // Font sizes with academic proportions
  fontSize: {
    body: '16px',
    h1: '2.75rem',
    h2: '2.25rem',
    h3: '1.875rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1.125rem',
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
    extraBold: 800,
  },
  
  // Line heights for academic readability
  lineHeight: {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.6,
    loose: 1.8,
  },
};

// Professor layout and spacing - Clean and modern
export const professorLayout = {
  borderRadius: '8px',
  borderRadiusLarge: '16px',
  borderRadiusSmall: '4px',
  
  // Clean, modern shadows
  boxShadow: '0 2px 8px rgba(0, 74, 173, 0.1), 0 1px 3px rgba(0, 74, 173, 0.08)',
  boxShadowMedium: '0 4px 16px rgba(0, 74, 173, 0.15), 0 2px 8px rgba(0, 74, 173, 0.1)',
  boxShadowLarge: '0 8px 32px rgba(0, 74, 173, 0.2), 0 4px 16px rgba(0, 74, 173, 0.15)',
  
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

// Create the professor theme
export const professorTheme = createTheme({
  palette: {
    primary: {
      main: professorColors.primary,
      light: '#A0522D',
      dark: '#5D0000',
      contrastText: professorColors.backgroundLight,
    },
    secondary: {
      main: professorColors.secondary,
      light: '#FFD700',
      dark: '#B8860B',
      contrastText: professorColors.textPrimary,
    },
    background: {
      default: professorColors.background,
      paper: professorColors.cardBackground,
    },
    text: {
      primary: professorColors.textPrimary,
      secondary: professorColors.textSecondary,
      disabled: '#9E9E9E',
    },
    success: {
      main: professorColors.success,
    },
    warning: {
      main: professorColors.warning,
    },
    error: {
      main: professorColors.error,
    },
    info: {
      main: professorColors.info,
    },
    divider: professorColors.border,
  },
  
  typography: {
    fontFamily: professorTypography.fontFamily,
    h1: {
      fontFamily: professorTypography.fontFamilyHeadings,
      fontSize: professorTypography.fontSize.h1,
      fontWeight: professorTypography.fontWeight.bold,
      color: professorColors.textPrimary,
      lineHeight: professorTypography.lineHeight.tight,
    },
    h2: {
      fontFamily: professorTypography.fontFamilyHeadings,
      fontSize: professorTypography.fontSize.h2,
      fontWeight: professorTypography.fontWeight.semiBold,
      color: professorColors.textPrimary,
      lineHeight: professorTypography.lineHeight.tight,
    },
    h3: {
      fontFamily: professorTypography.fontFamilyHeadings,
      fontSize: professorTypography.fontSize.h3,
      fontWeight: professorTypography.fontWeight.semiBold,
      color: professorColors.textPrimary,
      lineHeight: professorTypography.lineHeight.normal,
    },
    h4: {
      fontFamily: professorTypography.fontFamilyHeadings,
      fontSize: professorTypography.fontSize.h4,
      fontWeight: professorTypography.fontWeight.medium,
      color: professorColors.textPrimary,
      lineHeight: professorTypography.lineHeight.normal,
    },
    h5: {
      fontFamily: professorTypography.fontFamilyHeadings,
      fontSize: professorTypography.fontSize.h5,
      fontWeight: professorTypography.fontWeight.medium,
      color: professorColors.textPrimary,
      lineHeight: professorTypography.lineHeight.normal,
    },
    h6: {
      fontFamily: professorTypography.fontFamilyHeadings,
      fontSize: professorTypography.fontSize.h6,
      fontWeight: professorTypography.fontWeight.medium,
      color: professorColors.textPrimary,
      lineHeight: professorTypography.lineHeight.normal,
    },
    body1: {
      fontSize: professorTypography.fontSize.body,
      fontWeight: professorTypography.fontWeight.regular,
      color: professorColors.textPrimary,
      lineHeight: professorTypography.lineHeight.relaxed,
    },
    body2: {
      fontSize: professorTypography.fontSize.small,
      fontWeight: professorTypography.fontWeight.regular,
      color: professorColors.textSecondary,
      lineHeight: professorTypography.lineHeight.normal,
    },
    caption: {
      fontSize: professorTypography.fontSize.caption,
      fontWeight: professorTypography.fontWeight.regular,
      color: professorColors.textSecondary,
      lineHeight: professorTypography.lineHeight.normal,
    },
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: professorLayout.borderRadius,
          textTransform: 'none',
          fontWeight: professorTypography.fontWeight.medium,
          padding: `${professorLayout.spacing.sm} ${professorLayout.spacing.md}`,
          fontSize: professorTypography.fontSize.small,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: professorLayout.boxShadow,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: professorLayout.boxShadowMedium,
          },
        },
        contained: {
          backgroundColor: professorColors.primary,
          color: professorColors.backgroundLight,
          '&:hover': {
            backgroundColor: '#A0522D',
            boxShadow: professorLayout.boxShadowMedium,
          },
        },
        outlined: {
          borderColor: professorColors.primary,
          color: professorColors.primary,
          '&:hover': {
            borderColor: '#A0522D',
            backgroundColor: alpha(professorColors.primary, 0.1),
          },
        },
        text: {
          color: professorColors.primary,
          '&:hover': {
            backgroundColor: alpha(professorColors.primary, 0.1),
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: professorLayout.borderRadiusLarge,
          boxShadow: professorLayout.boxShadow,
          border: `1px solid ${professorColors.border}`,
          backgroundColor: professorColors.cardBackground,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: professorLayout.boxShadowMedium,
            transform: 'translateY(-3px)',
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: professorColors.cardBackground,
          borderRadius: professorLayout.borderRadius,
        },
        elevation1: {
          boxShadow: professorLayout.boxShadow,
        },
        elevation2: {
          boxShadow: professorLayout.boxShadowMedium,
        },
        elevation3: {
          boxShadow: professorLayout.boxShadowLarge,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: professorLayout.borderRadius,
            backgroundColor: professorColors.cardBackground,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: professorColors.primary,
              borderWidth: 2,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: professorColors.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: professorColors.primary,
          boxShadow: professorLayout.boxShadow,
          color: professorColors.backgroundLight,
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: professorLayout.borderRadius,
          fontWeight: professorTypography.fontWeight.medium,
        },
        filled: {
          backgroundColor: professorColors.primary,
          color: professorColors.backgroundLight,
        },
        outlined: {
          borderColor: professorColors.primary,
          color: professorColors.primary,
        },
      },
    },
    
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: professorColors.border,
        },
      },
    },
    
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: professorLayout.borderRadius,
        },
        standardSuccess: {
          backgroundColor: alpha(professorColors.success, 0.1),
          color: professorColors.success,
        },
        standardWarning: {
          backgroundColor: alpha(professorColors.warning, 0.1),
          color: professorColors.warning,
        },
        standardError: {
          backgroundColor: alpha(professorColors.error, 0.1),
          color: professorColors.error,
        },
        standardInfo: {
          backgroundColor: alpha(professorColors.info, 0.1),
          color: professorColors.info,
        },
      },
    },
  },
});

// Professor-specific decorative styles - Clean and professional
export const professorDecorativeStyles = {
  // Clean border with primary accent
  cleanBorder: {
    position: 'relative' as const,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: professorColors.primaryGradient,
    },
  },
  
  // Professor badge styling
  professorBadge: {
    background: professorColors.primaryGradient,
    color: '#FFFFFF',
    borderRadius: professorLayout.borderRadius,
    padding: `${professorLayout.spacing.xs} ${professorLayout.spacing.sm}`,
    fontWeight: professorTypography.fontWeight.semiBold,
    fontSize: professorTypography.fontSize.small,
  },
  
  // Clean card styling
  cleanCard: {
    background: professorColors.cardBackground,
    borderRadius: professorLayout.borderRadiusLarge,
    boxShadow: professorLayout.boxShadow,
    border: `1px solid ${professorColors.border}`,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: professorColors.primaryGradient,
    },
  },
  
  // Professor header styling
  professorHeader: {
    background: professorColors.primaryGradient,
    color: '#FFFFFF',
    padding: professorLayout.spacing.lg,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '120px',
      height: '120px',
      background: `radial-gradient(circle, ${alpha(professorColors.secondary, 0.2)} 0%, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    },
  },
};

// Utility functions for professor theme
export const professorUtils = {
  // Get color with opacity
  getColorWithOpacity: (color: string, opacity: number) => alpha(color, opacity),
  
  // Get spacing value
  getSpacing: (multiplier: number) => `${parseInt(professorLayout.spacingUnit) * multiplier}px`,
  
  // Get shadow with color
  getShadow: (color: string = professorColors.primary, opacity: number = 0.15) => 
    `0 3px 6px ${alpha(color, opacity)}, 0 1px 3px ${alpha(color, opacity * 0.5)}`,
  
  // Get border radius
  getBorderRadius: (size: 'small' | 'medium' | 'large' = 'medium') => {
    switch (size) {
      case 'small': return professorLayout.borderRadiusSmall;
      case 'large': return professorLayout.borderRadiusLarge;
      default: return professorLayout.borderRadius;
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
export default professorTheme;
