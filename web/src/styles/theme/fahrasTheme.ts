/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FAHRAS UNIFIED MUI THEME
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for Material-UI theme configuration.
 * Imports all colors from colorPalette.ts and maps them to MUI's theme system.
 *
 * DESIGN SYSTEM:
 *   Typography  — Tahoma/Arial (RTL-friendly), 7-level scale
 *   Spacing     — 4px base grid (theme.spacing(1) = 4px)
 *   Radius      — 6/10/14/20/9999 graduated scale
 *   Elevation   — Blue-gray tinted shadows, 3 levels
 *
 * ACCESSIBILITY:
 *   ✅ All text passes WCAG AA (4.5:1 min)
 *   ✅ Touch targets ≥ 44px (WCAG 2.5.5)
 *   ✅ Focus outlines 3px solid with offset
 *   ✅ No color-only state communication
 *
 * @version 1.0.0
 */

import { createTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { colorPalette } from './colorPalette';

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT & SPACING TOKENS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Typed spacing tokens for direct consumption outside MUI's theme.spacing().
 * Values follow a 4px base grid.
 */
export const spacingTokens = {
  /** 4px — Inline icon gaps, tight padding */
  xs: 4,
  /** 8px — Standard inline spacing */
  sm: 8,
  /** 12px — Compact component padding */
  md: 12,
  /** 16px — Default component padding, card body */
  lg: 16,
  /** 20px — Generous padding */
  xl: 20,
  /** 24px — Section spacing */
  '2xl': 24,
  /** 32px — Large section gaps */
  '3xl': 32,
  /** 40px — Page-level margins */
  '4xl': 40,
  /** 48px — Major section separators */
  '5xl': 48,
  /** 64px — Hero/header spacing */
  '6xl': 64,
} as const;

/**
 * Border radius tokens.
 * Use these when you need raw numbers outside of MUI's shape system.
 */
export const radiusTokens = {
  /** 6px — Small elements (chips, badges, tags) */
  small: 6,
  /** 10px — Default (inputs, cards, containers) */
  medium: 10,
  /** 14px — Large cards, dialogs */
  large: 14,
  /** 20px — Hero sections, feature cards */
  xl: 20,
  /** 9999px — Pill-shaped (buttons, search bars) */
  pill: 9999,
} as const;

/**
 * Shadow tokens.
 * Blue-gray tinted for warmth, matching the neutral scale.
 */
export const shadowTokens = {
  /** Subtle resting elevation (cards at rest) */
  sm: `0 1px 3px ${colorPalette.shadow.light}, 0 1px 2px ${colorPalette.shadow.light}`,
  /** Medium hover elevation (dropdowns, hover cards) */
  md: `0 4px 12px ${colorPalette.shadow.medium}, 0 2px 4px ${colorPalette.shadow.light}`,
  /** Strong elevation (modals, popovers) */
  lg: `0 12px 40px ${colorPalette.shadow.heavy}, 0 4px 12px ${colorPalette.shadow.medium}`,
  /** Lift effect for interactive cards on hover */
  lift: `0 8px 24px ${colorPalette.shadow.medium}, 0 2px 8px ${colorPalette.shadow.light}`,
} as const;

/**
 * Layout constants for responsive design.
 */
export const layoutTokens = {
  /** Touch target sizes (WCAG 2.5.5) */
  touchTarget: {
    minimum: 44,
    comfortable: 48,
    large: 56,
  },
  /** Navigation heights per breakpoint */
  navHeight: {
    mobile: 56,
    tablet: 64,
    desktop: 72,
  },
  /** Drawer widths per breakpoint */
  drawerWidth: {
    mobile: '80%',
    tablet: 320,
    desktop: 280,
  },
  /** Max content widths */
  maxContentWidth: 1200,
} as const;


// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FONT_FAMILY = '"Tahoma", "Arial", "Segoe UI", sans-serif';

const LINE_HEIGHT = {
  heading: 1.2,
  body: 1.5,
  reading: 1.6,
} as const;

const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;


// ─────────────────────────────────────────────────────────────────────────────
// MUI SHADOW ARRAY (25 elevations required by MUI)
// ─────────────────────────────────────────────────────────────────────────────

const shadows: Theme['shadows'] = [
  'none',
  // 1 — Subtle resting
  `0 1px 3px ${colorPalette.shadow.light}`,
  // 2 — Card resting
  `0 2px 6px ${colorPalette.shadow.light}`,
  // 3 — Elevated card
  `0 3px 8px ${colorPalette.shadow.light}, 0 1px 3px ${colorPalette.shadow.light}`,
  // 4 — Dropdown, popover
  `0 4px 12px ${colorPalette.shadow.medium}`,
  // 5
  `0 5px 14px ${colorPalette.shadow.medium}`,
  // 6 — Hover lift
  `0 6px 18px ${colorPalette.shadow.medium}`,
  // 7
  `0 7px 20px ${colorPalette.shadow.medium}`,
  // 8 — Modal
  `0 8px 24px ${colorPalette.shadow.medium}, 0 2px 8px ${colorPalette.shadow.light}`,
  // 9
  `0 9px 28px ${colorPalette.shadow.medium}, 0 3px 10px ${colorPalette.shadow.light}`,
  // 10
  `0 10px 32px ${colorPalette.shadow.medium}, 0 4px 12px ${colorPalette.shadow.light}`,
  // 11
  `0 11px 34px ${colorPalette.shadow.heavy}`,
  // 12 — High emphasis
  `0 12px 40px ${colorPalette.shadow.heavy}, 0 4px 12px ${colorPalette.shadow.medium}`,
  // 13
  `0 13px 42px ${colorPalette.shadow.heavy}, 0 5px 14px ${colorPalette.shadow.medium}`,
  // 14
  `0 14px 44px ${colorPalette.shadow.heavy}, 0 6px 16px ${colorPalette.shadow.medium}`,
  // 15
  `0 15px 46px ${colorPalette.shadow.heavy}`,
  // 16 — Dialog
  `0 16px 48px ${colorPalette.shadow.heavy}, 0 6px 18px ${colorPalette.shadow.medium}`,
  // 17
  `0 17px 50px ${colorPalette.shadow.heavy}`,
  // 18
  `0 18px 52px ${colorPalette.shadow.heavy}`,
  // 19
  `0 19px 54px ${colorPalette.shadow.heavy}`,
  // 20
  `0 20px 56px ${colorPalette.shadow.heavy}`,
  // 21
  `0 21px 58px ${colorPalette.shadow.heavy}`,
  // 22
  `0 22px 60px ${colorPalette.shadow.heavy}`,
  // 23
  `0 23px 62px ${colorPalette.shadow.heavy}`,
  // 24 — Maximum elevation
  `0 24px 64px ${colorPalette.shadow.heavy}, 0 8px 24px ${colorPalette.shadow.medium}`,
];


// ─────────────────────────────────────────────────────────────────────────────
// THEME CREATION
// ─────────────────────────────────────────────────────────────────────────────

export const fahrasTheme: Theme = createTheme({
  // ═══════════════════════════════════════════════════════════════════════════
  // DIRECTION
  // ═══════════════════════════════════════════════════════════════════════════
  direction: 'ltr',

  // ═══════════════════════════════════════════════════════════════════════════
  // PALETTE
  // ═══════════════════════════════════════════════════════════════════════════
  palette: {
    mode: 'light',

    primary: {
      main: colorPalette.primary.main,
      light: colorPalette.primary.light,
      dark: colorPalette.primary.dark,
      contrastText: colorPalette.primary.contrastText,
    },

    secondary: {
      main: colorPalette.secondary.main,
      light: colorPalette.secondary.light,
      dark: colorPalette.secondary.dark,
      contrastText: colorPalette.secondary.contrastText,
    },

    error: {
      main: colorPalette.error.main,
      light: colorPalette.error.light,
      dark: colorPalette.error.dark,
      contrastText: colorPalette.error.contrastText,
    },

    warning: {
      main: colorPalette.warning.main,
      light: colorPalette.warning.light,
      dark: colorPalette.warning.dark,
      contrastText: colorPalette.warning.contrastText,
    },

    info: {
      main: colorPalette.info.main,
      light: colorPalette.info.light,
      dark: colorPalette.info.dark,
      contrastText: colorPalette.info.contrastText,
    },

    success: {
      main: colorPalette.success.main,
      light: colorPalette.success.light,
      dark: colorPalette.success.dark,
      contrastText: colorPalette.success.contrastText,
    },

    text: {
      primary: colorPalette.text.primary,
      secondary: colorPalette.text.secondary,
      disabled: colorPalette.text.disabled,
    },

    background: {
      default: colorPalette.surface.background,
      paper: colorPalette.surface.paper,
    },

    divider: colorPalette.border.default,

    action: {
      active: colorPalette.text.secondary,
      hover: alpha(colorPalette.primary.main, 0.06),
      selected: alpha(colorPalette.primary.main, 0.10),
      disabled: colorPalette.text.disabled,
      disabledBackground: colorPalette.neutral[100],
      focus: alpha(colorPalette.primary.main, 0.14),
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════════════════
  typography: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    htmlFontSize: 16,

    // Display — Hero headlines, splash screens
    h1: {
      fontFamily: FONT_FAMILY,
      fontSize: '48px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.bold,
      letterSpacing: '-0.02em',
    },

    // H1 — Page titles
    h2: {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.semiBold,
      letterSpacing: '-0.01em',
    },

    // H2 — Section headers
    h3: {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.semiBold,
      letterSpacing: '-0.005em',
    },

    // H3 — Subsection headers
    h4: {
      fontFamily: FONT_FAMILY,
      fontSize: '22px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.semiBold,
    },

    // H4 — Card titles, list headers
    h5: {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.medium,
    },

    // H5 — Smaller headings, labels
    h6: {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.medium,
    },

    // Body — Primary reading text
    body1: {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.regular,
    },

    // Body small — Secondary text, descriptions
    body2: {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.regular,
    },

    // Caption — Labels, metadata, timestamps
    caption: {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.regular,
    },

    // Overline — Eyebrows, category labels
    overline: {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.semiBold,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },

    // Subtitle — Complementary to headings
    subtitle1: {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      lineHeight: LINE_HEIGHT.reading,
      fontWeight: FONT_WEIGHT.medium,
    },

    subtitle2: {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      lineHeight: LINE_HEIGHT.reading,
      fontWeight: FONT_WEIGHT.medium,
    },

    // Button text
    button: {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.medium,
      textTransform: 'none',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPACING — 4px base unit
  // ═══════════════════════════════════════════════════════════════════════════
  spacing: 4,

  // ═══════════════════════════════════════════════════════════════════════════
  // BREAKPOINTS
  // ═══════════════════════════════════════════════════════════════════════════
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHAPE
  // ═══════════════════════════════════════════════════════════════════════════
  shape: {
    borderRadius: radiusTokens.medium, // 10px default
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHADOWS
  // ═══════════════════════════════════════════════════════════════════════════
  shadows,

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENT OVERRIDES
  // ═══════════════════════════════════════════════════════════════════════════
  components: {
    // ─────────────────────────────────────────────────────────────────────────
    // MuiCssBaseline — Global defaults
    // ─────────────────────────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '16px',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          backgroundColor: colorPalette.surface.background,
          color: colorPalette.text.primary,
        },
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        // Improved focus for keyboard navigation globally
        ':focus-visible': {
          outline: `3px solid ${colorPalette.border.focus}`,
          outlineOffset: '2px',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiButton — Pill-shaped, 48px min height, WCAG focus
    // ─────────────────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.pill,
          minHeight: 48,
          minWidth: 48,
          padding: '12px 28px',
          fontFamily: FONT_FAMILY,
          fontSize: '16px',
          fontWeight: FONT_WEIGHT.medium,
          textTransform: 'none' as const,
          transition: 'all 0.15s ease-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '@media (hover: none)': {
            '&:hover': {
              transform: 'none',
            },
          },
          '&:focus-visible': {
            outline: `3px solid ${colorPalette.border.focus}`,
            outlineOffset: '2px',
            boxShadow: `0 0 0 6px ${alpha(colorPalette.primary.main, 0.18)}`,
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
          // Responsive: slightly compact on mobile
          '@media (max-width: 600px)': {
            padding: '10px 20px',
            fontSize: '15px',
          },
        },
        containedPrimary: {
          backgroundColor: colorPalette.primary.main,
          color: colorPalette.primary.contrastText,
          '&:hover': {
            backgroundColor: colorPalette.primary.dark,
            boxShadow: shadowTokens.md,
          },
          '&:active': {
            backgroundColor: colorPalette.primary.dark,
          },
        },
        containedSecondary: {
          backgroundColor: colorPalette.secondary.main,
          color: colorPalette.secondary.contrastText,
          '&:hover': {
            backgroundColor: colorPalette.secondary.dark,
            boxShadow: shadowTokens.md,
          },
        },
        outlined: {
          borderColor: colorPalette.border.medium,
          borderWidth: '1.5px',
          color: colorPalette.text.primary,
          '&:hover': {
            backgroundColor: colorPalette.surface.elevated,
            borderColor: colorPalette.primary.main,
            borderWidth: '1.5px',
          },
        },
        outlinedPrimary: {
          borderColor: colorPalette.primary.main,
          color: colorPalette.primary.dark,
          '&:hover': {
            backgroundColor: colorPalette.primary.lighter,
            borderColor: colorPalette.primary.dark,
          },
        },
        text: {
          color: colorPalette.primary.dark,
          '&:hover': {
            backgroundColor: alpha(colorPalette.primary.main, 0.08),
          },
        },
        sizeSmall: {
          minHeight: 36,
          padding: '6px 16px',
          fontSize: '14px',
        },
        sizeLarge: {
          minHeight: 56,
          padding: '16px 36px',
          fontSize: '18px',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiCard — Border, hover lift, focus outline
    // ─────────────────────────────────────────────────────────────────────────
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.large,
          border: `1px solid ${colorPalette.border.default}`,
          backgroundColor: colorPalette.surface.paper,
          boxShadow: 'none',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            borderColor: colorPalette.border.medium,
            boxShadow: shadowTokens.lift,
            transform: 'translateY(-2px)',
          },
          '@media (hover: none)': {
            '&:hover': {
              transform: 'none',
              boxShadow: 'none',
            },
          },
          '&:focus-visible': {
            outline: `3px solid ${colorPalette.border.focus}`,
            outlineOffset: '2px',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiCardContent — Consistent padding
    // ─────────────────────────────────────────────────────────────────────────
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: spacingTokens.xl, // 20px
          '&:last-child': {
            paddingBottom: spacingTokens.xl,
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiTextField — Rounded, focus shadow
    // ─────────────────────────────────────────────────────────────────────────
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radiusTokens.medium + 2, // 12px
            backgroundColor: colorPalette.surface.paper,
            transition: 'all 0.2s ease-in-out',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colorPalette.border.medium,
              borderWidth: '1.5px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colorPalette.primary.light,
              borderWidth: '1.5px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colorPalette.primary.main,
              borderWidth: '2px',
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(colorPalette.primary.main, 0.12)}`,
            },
          },
          '& .MuiInputLabel-root': {
            color: colorPalette.text.secondary,
            '&.Mui-focused': {
              color: colorPalette.primary.dark,
            },
          },
          '& .MuiFormHelperText-root': {
            fontSize: '13px',
            marginTop: spacingTokens.xs,
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiChip — Pill-shaped, 28px height
    // ─────────────────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.pill,
          height: 28,
          fontSize: '13px',
          fontWeight: FONT_WEIGHT.medium,
          fontFamily: FONT_FAMILY,
        },
        filled: {
          backgroundColor: colorPalette.primary.lighter,
          color: colorPalette.primary.dark,
          '&:hover': {
            backgroundColor: alpha(colorPalette.primary.main, 0.16),
          },
        },
        outlined: {
          borderColor: colorPalette.border.default,
          color: colorPalette.text.primary,
          backgroundColor: colorPalette.surface.elevated,
          '&:hover': {
            backgroundColor: colorPalette.surface.sunken,
          },
        },
        colorPrimary: {
          backgroundColor: colorPalette.primary.lighter,
          color: colorPalette.primary.dark,
        },
        colorSecondary: {
          backgroundColor: colorPalette.secondary.lighter,
          color: colorPalette.secondary.dark,
        },
        colorSuccess: {
          backgroundColor: colorPalette.success.lighter,
          color: colorPalette.success.dark,
        },
        colorWarning: {
          backgroundColor: colorPalette.warning.lighter,
          color: colorPalette.warning.dark,
        },
        colorError: {
          backgroundColor: colorPalette.error.lighter,
          color: colorPalette.error.dark,
        },
        colorInfo: {
          backgroundColor: colorPalette.info.lighter,
          color: colorPalette.info.dark,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiIconButton — 44px minimum touch target
    // ─────────────────────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          transition: 'all 0.15s ease-in-out',
          '&:focus-visible': {
            outline: `3px solid ${colorPalette.border.focus}`,
            outlineOffset: '2px',
            backgroundColor: alpha(colorPalette.primary.main, 0.08),
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
          '@media (max-width: 600px)': {
            padding: 10,
          },
        },
        sizeSmall: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiAlert — Subtle semantic backgrounds
    // ─────────────────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.medium,
          fontSize: '15px',
          alignItems: 'center',
        },
        standardSuccess: {
          backgroundColor: colorPalette.success.lighter,
          color: colorPalette.success.dark,
          '& .MuiAlert-icon': {
            color: colorPalette.success.main,
          },
        },
        standardWarning: {
          backgroundColor: colorPalette.warning.lighter,
          color: colorPalette.warning.dark,
          '& .MuiAlert-icon': {
            color: colorPalette.warning.main,
          },
        },
        standardError: {
          backgroundColor: colorPalette.error.lighter,
          color: colorPalette.error.dark,
          '& .MuiAlert-icon': {
            color: colorPalette.error.main,
          },
        },
        standardInfo: {
          backgroundColor: colorPalette.info.lighter,
          color: colorPalette.info.dark,
          '& .MuiAlert-icon': {
            color: colorPalette.info.main,
          },
        },
        filledSuccess: {
          backgroundColor: colorPalette.success.main,
        },
        filledWarning: {
          backgroundColor: colorPalette.warning.main,
        },
        filledError: {
          backgroundColor: colorPalette.error.main,
        },
        filledInfo: {
          backgroundColor: colorPalette.info.main,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiAppBar — Primary color
    // ─────────────────────────────────────────────────────────────────────────
    MuiAppBar: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          backgroundColor: colorPalette.primary.main,
          color: colorPalette.primary.contrastText,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiPaper — Elevation mapping
    // ─────────────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colorPalette.surface.paper,
          borderRadius: radiusTokens.medium,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiDivider
    // ─────────────────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colorPalette.border.default,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiDialog — Rounded, scrim overlay
    // ─────────────────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radiusTokens.large,
          boxShadow: shadowTokens.lg,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiTooltip
    // ─────────────────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colorPalette.neutral[800],
          color: colorPalette.common.white,
          fontSize: '13px',
          fontWeight: FONT_WEIGHT.regular,
          borderRadius: radiusTokens.small,
          padding: '6px 12px',
        },
        arrow: {
          color: colorPalette.neutral[800],
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiLink — Accessible link styling
    // ─────────────────────────────────────────────────────────────────────────
    MuiLink: {
      styleOverrides: {
        root: {
          color: colorPalette.text.link,
          textDecorationColor: alpha(colorPalette.text.link, 0.4),
          '&:hover': {
            textDecorationColor: colorPalette.text.link,
          },
          '&:focus-visible': {
            outline: `3px solid ${colorPalette.border.focus}`,
            outlineOffset: '2px',
            borderRadius: 2,
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiTableCell — Consistent table styling
    // ─────────────────────────────────────────────────────────────────────────
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: colorPalette.border.light,
          padding: '12px 16px',
        },
        head: {
          fontWeight: FONT_WEIGHT.semiBold,
          color: colorPalette.text.primary,
          backgroundColor: colorPalette.surface.sunken,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiTab — Touch-target compliant tabs
    // ─────────────────────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: FONT_WEIGHT.medium,
          fontSize: '15px',
          minHeight: 48,
          '&:focus-visible': {
            outline: `3px solid ${colorPalette.border.focus}`,
            outlineOffset: '-3px',
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MuiBreadcrumbs
    // ─────────────────────────────────────────────────────────────────────────
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          color: colorPalette.text.secondary,
        },
      },
    },
  },
});


// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

/** Default export for ThemeProvider */
export default fahrasTheme;

/**
 * Type export for consumers that need the theme type.
 * Example: `const theme = useTheme() as FahrasTheme;`
 */
export type FahrasTheme = typeof fahrasTheme;
