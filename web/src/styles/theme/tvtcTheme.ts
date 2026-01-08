import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// TVTC Official Brand Colors - Portal Hub Design System
export const tvtcColors = {
  // Primary brand colors (TVTC green/teal family)
  primary: '#008A3E',        // primary.600 - deep green
  primaryTeal: '#18B3A8',    // primary.500 - teal (buttons, controls)
  primaryTint: '#E7F7F5',    // primary.050 - light tint

  // Secondary colors (institutional blue family)
  secondary: '#3B7D98',      // secondary.600 - main secondary
  secondaryDark: '#1F6F8B',  // secondary.700 - darker blue
  secondaryTint: '#E9F3F7',  // secondary.050 - light tint

  // Accent (gold - use sparingly)
  accent: '#F3B200',         // accent.600
  accentTint: '#FFF6D6',     // accent.050

  // Common colors
  white: '#FFFFFF',
  black: '#000000',

  // Text colors (deep blue-gray, NOT pure black)
  textPrimary: '#0E2A35',    // deep blue-gray (NOT #212121)
  textSecondary: '#4F6772',  // secondary gray
  textMuted: '#7D929B',      // muted gray
  textDisabled: '#9E9E9E',   // disabled state
  textHint: '#A8B5BC',       // hint text

  // Background variations
  backgroundDefault: '#FFFFFF',
  backgroundPaper: '#FFFFFF',
  backgroundElevated: '#FFFFFF',
  surface50: '#F7FAFB',      // light surface
  surface100: '#EEF3F5',     // slightly darker surface

  // Border - cool, slightly blue-tinted
  border: '#D7E3E8',         // main border color
  borderLight: '#EBF0F3',    // light border
  borderMedium: '#D7E3E8',   // medium border
  borderDark: '#B8C8D1',     // dark border

  // Status colors (quiet, no neon)
  success: '#2E7D32',        // success green
  warning: '#B26A00',        // warning orange (not neon)
  error: '#C62828',          // error red
  info: '#1E88E5',           // info blue

  // Shadow colors (restrained)
  shadowLight: 'rgba(14, 42, 53, 0.08)',
  shadowMedium: 'rgba(14, 42, 53, 0.12)',
  shadowDark: 'rgba(14, 42, 53, 0.18)',
};

// TVTC Typography - Tahoma-based with RTL support
export const tvtcTypography = {
  fontFamily: '"Tahoma", "Arial", "Segoe UI", system-ui, sans-serif',
  fontFamilyHeadings: '"Tahoma", "Arial", "Segoe UI", system-ui, sans-serif',

  // Font sizes (portal hub design system)
  fontSize: {
    display: '52px',      // Large display text
    h1: '36px',           // Heading 1
    h2: '28px',           // Heading 2
    h3: '20px',           // Heading 3
    h4: '16px',           // Heading 4
    h5: '14px',           // Heading 5
    h6: '12px',           // Heading 6
    body: '16px',         // Body text
    bodySmall: '14px',    // Small body
    small: '13px',        // Small text
    caption: '12px',      // Caption text
  },

  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },

  // Line heights (portal hub design system)
  lineHeight: {
    tight: 1.1,       // 1.1-1.2
    normal: 1.25,     // 1.25-1.35
    relaxed: 1.5,     // 1.5-1.7
    loose: 1.8,       // Generous spacing
  },
};

// TVTC Layout and spacing - Portal Hub Design System
export const tvtcLayout = {
  // Border radius values
  borderRadiusCircle: 9999,     // pill buttons (border-radius: 9999px)
  borderRadiusCard: '14px',     // service cards
  borderRadiusInput: '12px',    // inputs/selects
  borderRadiusMenu: '12px',     // menus/popovers
  borderRadius: '10px',         // default
  borderRadiusSmall: '6px',     // small elements

  // Shadows (restrained)
  boxShadow: '0 2px 10px rgba(14, 42, 53, 0.08)',    // elevation1
  boxShadowMedium: '0 6px 18px rgba(14, 42, 53, 0.12)',   // elevation2
  boxShadowLarge: '0 16px 48px rgba(14, 42, 53, 0.18)',   // elevation3

  // Spacing (8px base unit)
  spacingUnit: '4px',
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    '32px': '32px',
    '40px': '40px',
    '48px': '48px',
    '56px': '56px',
    '64px': '64px',
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

// Mobile-First Responsive Design Constants
export const tvtcMobile = {
  // Touch target sizes (WCAG 2.1 Level AAA: 44x44 CSS pixels minimum)
  touchTarget: {
    minimum: 44,      // Minimum size for any interactive element
    comfortable: 48,  // Comfortable size for primary actions
    large: 56,        // Large size for important CTAs
  },
  
  // Breakpoint values (matches MUI default breakpoints)
  breakpoints: {
    xs: 0,      // Mobile phones (portrait)
    sm: 600,    // Mobile phones (landscape) & small tablets
    md: 900,    // Tablets (portrait) & small laptops
    lg: 1200,   // Desktop & tablets (landscape)
    xl: 1536,   // Large desktop
  },
  
  // Responsive spacing multipliers
  spacingMultiplier: {
    mobile: 0.75,   // Reduce spacing by 25% on mobile
    tablet: 1,      // Normal spacing on tablets
    desktop: 1.25,  // Increase spacing by 25% on desktop
  },
  
  // Responsive font size scales
  fontSizeScale: {
    mobile: 0.875,   // 87.5% of base size on mobile
    tablet: 0.9375,  // 93.75% of base size on tablet
    desktop: 1,      // 100% of base size on desktop
  },
  
  // Container max widths for different breakpoints
  containerMaxWidth: {
    xs: '100%',
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140,
  },
  
  // Navigation heights
  navHeight: {
    mobile: 56,
    tablet: 64,
    desktop: 72,
  },
  
  // Drawer widths
  drawerWidth: {
    mobile: '80%',    // Mobile drawer takes 80% of screen
    tablet: 320,      // Fixed width on tablet
    desktop: 280,     // Fixed width on desktop
  },
  
  // Card spacing
  cardSpacing: {
    mobile: 2,    // MUI spacing units
    tablet: 2.5,
    desktop: 3,
  },
  
  // Grid gaps
  gridGap: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
};

// Dark mode color overrides - Portal Hub Design System
export const tvtcColorsDark = {
  // Primary brand colors remain consistent
  primary: '#008A3E',        // primary.600
  primaryTeal: '#18B3A8',    // primary.500
  primaryTint: '#1A4D45',    // dark mode tint

  // Secondary colors (adjusted for dark mode)
  secondary: '#3B7D98',      // secondary.600
  secondaryDark: '#1F6F8B',  // secondary.700
  secondaryTint: '#254555',  // dark mode tint

  // Accent
  accent: '#F3B200',
  accentTint: '#8B5F00',     // dark mode tint

  // Common colors (inverted)
  white: '#1a1a1a',
  black: '#FFFFFF',

  // Text colors for dark mode
  textPrimary: '#E8F1F5',       // light text on dark
  textSecondary: '#B0C4CE',     // secondary text
  textMuted: '#7D929B',         // muted gray
  textDisabled: '#606060',      // disabled state
  textHint: '#808080',          // hint text

  // Background variations (dark mode)
  backgroundDefault: '#1a1a1a',
  backgroundPaper: '#242424',
  backgroundElevated: '#2a2a2a',
  surface50: '#2a2a2a',         // light surface
  surface100: '#303030',        // darker surface

  // Border colors (dark mode)
  border: '#404040',
  borderLight: '#303030',
  borderMedium: '#404040',
  borderDark: '#505050',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

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
            textTransform: 'none',
            fontWeight: tvtcTypography.fontWeight.medium,
            // Ensure minimum touch target size on mobile
            minHeight: tvtcMobile.touchTarget.comfortable,
            minWidth: tvtcMobile.touchTarget.comfortable,
            transition: 'all 0.15s ease-out',
            // Responsive padding
            '@media (max-width: 600px)': {
              padding: '14px 18px',
              fontSize: '0.95rem',
              minHeight: 40,
            },
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            // Remove hover transform on touch devices
            '@media (hover: none)': {
              '&:hover': {
                transform: 'none',
              },
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
          containedPrimary: {
            borderRadius: tvtcLayout.borderRadiusCircle,
            backgroundColor: colors.primaryTeal,
            color: colors.white,
            padding: '14px 32px',
            height: '44px',
            '&:hover': {
              backgroundColor: colors.primary,
              boxShadow: tvtcLayout.boxShadowMedium,
            },
          },
          outlined: {
            borderRadius: tvtcLayout.borderRadiusCircle,
            borderColor: colors.border,
            borderWidth: '1px',
            color: colors.textPrimary,
            padding: '14px 32px',
            height: '44px',
            '&:hover': {
              backgroundColor: colors.surface50,
              borderColor: colors.primary,
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
            borderRadius: tvtcLayout.borderRadiusCard,
            boxShadow: 'none',
            border: `2px solid ${colors.primaryTeal}`,
            backgroundColor: colors.backgroundPaper,
            transition: 'all 0.2s ease-out',
            '&:hover': {
              borderWidth: '2px',
              transform: 'translateY(-1px)',
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
              borderRadius: tvtcLayout.borderRadiusInput,
              backgroundColor: colors.backgroundPaper,
              transition: 'all 0.2s ease-in-out',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primaryTeal,
                borderWidth: '1.5px',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary,
                borderWidth: '2px',
                boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
              },
              '&:focus-within': {
                boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border,
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
            borderRadius: tvtcLayout.borderRadiusCircle,
            fontWeight: tvtcTypography.fontWeight.medium,
            height: '28px',
            fontSize: '13px',
          },
          filled: {
            backgroundColor: colors.primaryTint,
            color: colors.primary,
          },
          outlined: {
            borderColor: colors.border,
            color: colors.textPrimary,
            backgroundColor: colors.surface50,
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
            // Ensure minimum touch target size
            minWidth: tvtcMobile.touchTarget.minimum,
            minHeight: tvtcMobile.touchTarget.minimum,
            // Increase padding on mobile for easier tapping
            '@media (max-width: 600px)': {
              padding: 12,
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
  
  // Get responsive spacing (mobile-first)
  getResponsiveSpacing: (device: 'mobile' | 'tablet' | 'desktop', baseSpacing: number) => {
    const multiplier = tvtcMobile.spacingMultiplier[device];
    return baseSpacing * multiplier;
  },
  
  // Get minimum touch target for interactive elements
  getTouchTarget: (size: 'minimum' | 'comfortable' | 'large' = 'minimum') => {
    return tvtcMobile.touchTarget[size];
  },
  
  // Create responsive sx prop
  createResponsiveSx: (mobileProps: any, desktopProps?: any) => ({
    ...mobileProps,
    '@media (min-width: 900px)': desktopProps || {},
  }),
};

// Export the main theme as default
export default tvtcTheme;
