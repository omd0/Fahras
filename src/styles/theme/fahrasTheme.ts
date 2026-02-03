import { createTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { colorPalette } from './colorPalette';

export const spacingTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const radiusTokens = {
  small: 6,
  medium: 10,
  large: 14,
  xl: 20,
  pill: 9999,
} as const;

export const shadowTokens = {
  sm: `0 1px 3px ${colorPalette.shadow.light}, 0 1px 2px ${colorPalette.shadow.light}`,
  md: `0 4px 12px ${colorPalette.shadow.medium}, 0 2px 4px ${colorPalette.shadow.light}`,
  lg: `0 12px 40px ${colorPalette.shadow.heavy}, 0 4px 12px ${colorPalette.shadow.medium}`,
  lift: `0 8px 24px ${colorPalette.shadow.medium}, 0 2px 8px ${colorPalette.shadow.light}`,
} as const;

export const layoutTokens = {
  touchTarget: {
    minimum: 44,
    comfortable: 48,
    large: 56,
  },
  navHeight: {
    mobile: 56,
    tablet: 64,
    desktop: 72,
  },
  drawerWidth: {
    mobile: '80%',
    tablet: 320,
    desktop: 280,
  },
  maxContentWidth: 1200,
} as const;

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

const shadows: Theme['shadows'] = [
  'none',
  `0 1px 3px ${colorPalette.shadow.light}`,
  `0 2px 6px ${colorPalette.shadow.light}`,
  `0 3px 8px ${colorPalette.shadow.light}, 0 1px 3px ${colorPalette.shadow.light}`,
  `0 4px 12px ${colorPalette.shadow.medium}`,
  `0 5px 14px ${colorPalette.shadow.medium}`,
  `0 6px 18px ${colorPalette.shadow.medium}`,
  `0 7px 20px ${colorPalette.shadow.medium}`,
  `0 8px 24px ${colorPalette.shadow.medium}, 0 2px 8px ${colorPalette.shadow.light}`,
  `0 9px 28px ${colorPalette.shadow.medium}, 0 3px 10px ${colorPalette.shadow.light}`,
  `0 10px 32px ${colorPalette.shadow.medium}, 0 4px 12px ${colorPalette.shadow.light}`,
  `0 11px 34px ${colorPalette.shadow.heavy}`,
  `0 12px 40px ${colorPalette.shadow.heavy}, 0 4px 12px ${colorPalette.shadow.medium}`,
  `0 13px 42px ${colorPalette.shadow.heavy}, 0 5px 14px ${colorPalette.shadow.medium}`,
  `0 14px 44px ${colorPalette.shadow.heavy}, 0 6px 16px ${colorPalette.shadow.medium}`,
  `0 15px 46px ${colorPalette.shadow.heavy}`,
  `0 16px 48px ${colorPalette.shadow.heavy}, 0 6px 18px ${colorPalette.shadow.medium}`,
  `0 17px 50px ${colorPalette.shadow.heavy}`,
  `0 18px 52px ${colorPalette.shadow.heavy}`,
  `0 19px 54px ${colorPalette.shadow.heavy}`,
  `0 20px 56px ${colorPalette.shadow.heavy}`,
  `0 21px 58px ${colorPalette.shadow.heavy}`,
  `0 22px 60px ${colorPalette.shadow.heavy}`,
  `0 23px 62px ${colorPalette.shadow.heavy}`,
  `0 24px 64px ${colorPalette.shadow.heavy}, 0 8px 24px ${colorPalette.shadow.medium}`,
];

export const fahrasTheme: Theme = createTheme({
  direction: 'ltr',

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

  typography: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    htmlFontSize: 16,

    h1: {
      fontFamily: FONT_FAMILY,
      fontSize: '48px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.bold,
      letterSpacing: '-0.02em',
    },

    h2: {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.semiBold,
      letterSpacing: '-0.01em',
    },

    h3: {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.semiBold,
      letterSpacing: '-0.005em',
    },

    h4: {
      fontFamily: FONT_FAMILY,
      fontSize: '22px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.semiBold,
    },

    h5: {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.medium,
    },

    h6: {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      lineHeight: LINE_HEIGHT.heading,
      fontWeight: FONT_WEIGHT.medium,
    },

    body1: {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.regular,
    },

    body2: {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.regular,
    },

    caption: {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.regular,
    },

    overline: {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.semiBold,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },

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

    button: {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      lineHeight: LINE_HEIGHT.body,
      fontWeight: FONT_WEIGHT.medium,
      textTransform: 'none',
    },
  },

  spacing: 4,

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  shape: {
    borderRadius: radiusTokens.medium,
  },

  shadows,

  components: {
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
        ':focus-visible': {
          outline: `3px solid ${colorPalette.border.focus}`,
          outlineOffset: '2px',
        },
      },
    },

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

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: spacingTokens.xl,
          '&:last-child': {
            paddingBottom: spacingTokens.xl,
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radiusTokens.medium + 2,
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
          '& .MuiAlert-icon': { color: colorPalette.success.main },
        },
        standardWarning: {
          backgroundColor: colorPalette.warning.lighter,
          color: colorPalette.warning.dark,
          '& .MuiAlert-icon': { color: colorPalette.warning.main },
        },
        standardError: {
          backgroundColor: colorPalette.error.lighter,
          color: colorPalette.error.dark,
          '& .MuiAlert-icon': { color: colorPalette.error.main },
        },
        standardInfo: {
          backgroundColor: colorPalette.info.lighter,
          color: colorPalette.info.dark,
          '& .MuiAlert-icon': { color: colorPalette.info.main },
        },
        filledSuccess: { backgroundColor: colorPalette.success.main },
        filledWarning: { backgroundColor: colorPalette.warning.main },
        filledError: { backgroundColor: colorPalette.error.main },
        filledInfo: { backgroundColor: colorPalette.info.main },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: {
          backgroundColor: colorPalette.primary.main,
          color: colorPalette.primary.contrastText,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colorPalette.surface.paper,
          borderRadius: radiusTokens.medium,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colorPalette.border.default },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radiusTokens.large,
          boxShadow: shadowTokens.lg,
        },
      },
    },

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
        arrow: { color: colorPalette.neutral[800] },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          color: colorPalette.text.link,
          textDecorationColor: alpha(colorPalette.text.link, 0.4),
          '&:hover': { textDecorationColor: colorPalette.text.link },
          '&:focus-visible': {
            outline: `3px solid ${colorPalette.border.focus}`,
            outlineOffset: '2px',
            borderRadius: 2,
          },
        },
      },
    },

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

export const createFahrasTheme = (direction: 'ltr' | 'rtl' = 'ltr'): Theme =>
  createTheme({
    ...fahrasTheme,
    direction,
  });

export default fahrasTheme;

export type FahrasTheme = typeof fahrasTheme;
