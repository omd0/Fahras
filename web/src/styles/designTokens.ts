/**
 * Design Tokens from design.toon
 * TVTC Portal Hub Design System v1.1
 *
 * These tokens provide the foundation for the Portal Service Card (Outlined) pattern
 * and ensure consistency across all card components.
 */

export const designTokens = {
  colors: {
    primary: {
      600: '#008A3E',  // deep green - focus/brand accents
      500: '#18B3A8',  // teal - buttons/controls/borders
      50: '#E7F7F5',   // tint - backgrounds
    },
    secondary: {
      700: '#1F6F8B',  // institutional blue dark
      600: '#3B7D98',  // institutional blue
      50: '#E9F3F7',   // icon badge background
    },
    accent: {
      600: '#F3B200',  // gold highlight (use sparingly)
      50: '#FFF6D6',
    },
    text: {
      primary: '#0E2A35',    // deep blue-gray (NOT pure black)
      secondary: '#4F6772',  // secondary text
      muted: '#7D929B',      // muted text
    },
    border: {
      200: '#D7E3E8',  // cool, slightly blue border
    },
    surface: {
      50: '#F7FAFB',   // subtle panel background
      100: '#EEF3F5',  // panel background
    },
    status: {
      success: '#2E7D32',
      warning: '#B26A00',
      error: '#C62828',
      info: '#1E88E5',
    },
  },

  radii: {
    card: '14px',      // service/portal cards
    input: '10px',     // inputs/selects
    pill: '9999px',    // buttons (true circles)
    menu: '12px',      // menus/popovers
    circle: '50%',     // circular elements
  },

  shadows: {
    none: 'none',
    elevation1: '0 2px 10px rgba(14, 42, 53, 0.08)',   // optional
    elevation2: '0 6px 18px rgba(14, 42, 53, 0.12)',   // hover
    elevation3: '0 16px 48px rgba(14, 42, 53, 0.18)',  // overlay
  },

  transitions: {
    hover: 'all 0.2s ease-out',
    micro: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    surface: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },

  iconBadge: {
    small: {
      width: '48px',
      height: '48px',
      iconSize: '24px',
    },
    medium: {
      width: '64px',
      height: '64px',
      iconSize: '32px',
    },
    large: {
      width: '80px',
      height: '80px',
      iconSize: '40px',
    },
  },

  typography: {
    cardTitle: {
      fontSize: { xs: '16px', sm: '18px' },
      fontWeight: 600,
      lineHeight: 1.3,
    },
    cardDescription: {
      fontSize: { xs: '13px', sm: '14px' },
      lineHeight: 1.4,
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
