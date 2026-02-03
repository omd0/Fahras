export const designTokens = {
  colors: {
    primary: {
      600: '#008A3E',
      500: '#18B3A8',
      50: '#E7F7F5',
    },
    secondary: {
      700: '#1F6F8B',
      600: '#3B7D98',
      50: '#E9F3F7',
    },
    accent: {
      600: '#F3B200',
      50: '#FFF6D6',
    },
    text: {
      primary: '#0E2A35',
      secondary: '#4F6772',
      muted: '#7D929B',
    },
    border: {
      200: '#D7E3E8',
    },
    surface: {
      50: '#F7FAFB',
      100: '#EEF3F5',
    },
    status: {
      success: '#2E7D32',
      warning: '#B26A00',
      error: '#C62828',
      info: '#1E88E5',
    },
  },

  radii: {
    card: '14px',
    input: '10px',
    pill: '9999px',
    menu: '12px',
    circle: '50%',
  },

  shadows: {
    none: 'none',
    elevation1: '0 2px 10px rgba(14, 42, 53, 0.08)',
    elevation2: '0 6px 18px rgba(14, 42, 53, 0.12)',
    elevation3: '0 16px 48px rgba(14, 42, 53, 0.18)',
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
