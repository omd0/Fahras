/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FAHRAS COLOR PALETTE — TVTC-Inspired Cohesive Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for ALL colors in the Fahras application.
 * Built upon TVTC brand identity with full WCAG AA compliance.
 *
 * BRAND FOUNDATION:
 *   Primary Green  #008A3E — TVTC institutional green (non-negotiable)
 *   Institutional Blue #3B7D98 — Secondary brand color
 *   Teal #097C73 — Interactive/accent (darkened from brand #18B3A8 for AA)
 *   Gold #D4960A — Sparingly used highlight accent
 *
 * WCAG AA COMPLIANCE:
 *   ✅ All text.* colors pass 4.5:1 on white (#FFFFFF) backgrounds
 *   ✅ All semantic .main colors pass 4.5:1 with their contrastText
 *   ✅ All .dark variants pass 4.5:1 with white text
 *   ✅ All .dark text on .lighter backgrounds pass 4.5:1
 *   ⚠️  primary.main (#008A3E) = 4.46:1 with white — AA Large Text only
 *       (Use primary.dark for normal-size text; buttons at 14px+ bold qualify as large)
 *
 * USAGE NOTES:
 *   - .main     → Primary usage (buttons, badges, icons)
 *   - .light    → Decorative, hover states, large text only
 *   - .dark     → Text on white, emphasis, pressed states
 *   - .lighter  → Tinted backgrounds (alerts, badges, chips)
 *   - contrastText → Text color guaranteed to pass AA on .main
 *
 * @version 1.0.0
 * @see WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
 */

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

export const colorPalette = {

  // ═══════════════════════════════════════════════════════════════════════════
  // BRAND COLORS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * PRIMARY — TVTC Institutional Green
   * The cornerstone of the brand. Used for primary CTAs, navigation highlights,
   * active states, and brand-identifying elements.
   */
  primary: {
    main: '#008A3E',         // TVTC brand green
    light: '#33A165',        // Lighter green (hover/decorative)
    dark: '#006B2F',         // Darker green (pressed state, text usage)
    lighter: '#E6F4EC',      // Tint background (chips, badges, alerts)
    contrastText: '#FFFFFF', // White text on green
    // ── WCAG Contrast Ratios ──
    // #FFFFFF on #008A3E → 4.46:1 (AA Large Text ✅ | Normal Text ⚠️ use .dark)
    // #FFFFFF on #006B2F → 6.68:1 (AA ✅)
    // #FFFFFF on #33A165 → 3.27:1 (Large Text only ⚠️)
    // #006B2F on #E6F4EC → 5.89:1 (AA ✅ — use .dark text on .lighter bg)
  },

  /**
   * SECONDARY — Institutional Blue
   * Used for secondary actions, informational elements, and supporting UI.
   * Provides strong visual distinction from primary green.
   */
  secondary: {
    main: '#3B7D98',         // Institutional blue
    light: '#5E97AE',        // Lighter blue (hover/decorative)
    dark: '#1F6F8B',         // Darker blue (pressed, text)
    lighter: '#E9F3F7',      // Tint background
    contrastText: '#FFFFFF', // White text on blue
    // ── WCAG Contrast Ratios ──
    // #FFFFFF on #3B7D98 → 4.59:1 (AA ✅)
    // #FFFFFF on #1F6F8B → 5.67:1 (AA ✅)
    // #FFFFFF on #5E97AE → 3.22:1 (Large Text only ⚠️)
    // #1F6F8B on #E9F3F7 → 5.03:1 (AA ✅)
  },

  /**
   * ACCENT — Gold
   * Used sparingly for highlights, awards, featured content, and special CTAs.
   * Always pair with dark text (contrastText) — gold is too light for white text.
   */
  accent: {
    main: '#D4960A',         // Refined gold (slightly darker for contrast)
    light: '#F3B200',        // Original TVTC bright gold
    dark: '#8B6200',         // Deep gold (for text or dark backgrounds)
    lighter: '#FFF8E1',      // Light gold tint background
    contrastText: '#0E2A35', // Dark text on gold
    // ── WCAG Contrast Ratios ──
    // #0E2A35 on #D4960A → 5.83:1 (AA ✅)
    // #0E2A35 on #F3B200 → 7.98:1 (AA ✅)
    // #FFFFFF on #8B6200 → 5.46:1 (AA ✅)
    // #8B6200 on #FFF8E1 → 5.14:1 (AA ✅)
  },

  /**
   * TEAL — Brand Supplementary
   * Originally #18B3A8 from TVTC brand. Darkened to #097C73 for AA compliance.
   * Used for interactive elements, links in colored contexts, and decorative accents.
   */
  teal: {
    main: '#097C73',         // Darkened teal (AA-compliant)
    light: '#18B3A8',        // Original TVTC teal (decorative/large text only)
    dark: '#065B54',         // Deep teal
    lighter: '#E0F7F5',      // Light teal tint background
    contrastText: '#FFFFFF', // White text on teal
    // ── WCAG Contrast Ratios ──
    // #FFFFFF on #097C73 → 5.07:1 (AA ✅)
    // #FFFFFF on #065B54 → 7.98:1 (AA ✅)
    // #FFFFFF on #18B3A8 → 2.61:1 (❌ decorative only)
    // #097C73 on #E0F7F5 → 4.54:1 (AA ✅)
    // #097C73 on #FFFFFF → 5.07:1 (AA ✅ — usable as link text)
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // SEMANTIC COLORS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * SUCCESS — Forest Green
   * Distinct from primary green (more muted/blue-shifted).
   * Used for success states, confirmations, positive feedback.
   */
  success: {
    main: '#2E7D32',         // Forest green
    light: '#4CAF50',        // Bright green (decorative/large text)
    dark: '#1B5E20',         // Deep green (text on lighter bg)
    lighter: '#E8F5E9',      // Success tint background
    contrastText: '#FFFFFF', // White text on green
    // ── WCAG Contrast Ratios ──
    // #FFFFFF on #2E7D32 → 5.13:1 (AA ✅)
    // #FFFFFF on #1B5E20 → 7.87:1 (AA ✅)
    // #1B5E20 on #E8F5E9 → 7.00:1 (AA ✅)
    // #2E7D32 on #E8F5E9 → 4.56:1 (AA ✅)
  },

  /**
   * WARNING — Warm Amber
   * Rich, warm amber tone. Clearly distinct from gold accent and error red.
   * Used for caution states, pending actions, attention-needed indicators.
   */
  warning: {
    main: '#B45309',         // Warm dark amber
    light: '#FB8C00',        // Bright amber (decorative/backgrounds)
    dark: '#7A3600',         // Deep brown-amber (text on lighter bg)
    lighter: '#FFF3E0',      // Warning tint background
    contrastText: '#FFFFFF', // White text on amber
    // ── WCAG Contrast Ratios ──
    // #FFFFFF on #B45309 → 5.02:1 (AA ✅)
    // #FFFFFF on #7A3600 → 8.92:1 (AA ✅)
    // #7A3600 on #FFF3E0 → 8.13:1 (AA ✅)
    // #B45309 on #FFF3E0 → 4.58:1 (AA ✅)
  },

  /**
   * ERROR — Crimson Red
   * Clear, unmistakable error indicator.
   * Used for error states, destructive actions, validation failures.
   */
  error: {
    main: '#C62828',         // Crimson red
    light: '#EF5350',        // Bright red (decorative/large text)
    dark: '#B71C1C',         // Deep red (text on lighter bg)
    lighter: '#FFEBEE',      // Error tint background
    contrastText: '#FFFFFF', // White text on red
    // ── WCAG Contrast Ratios ──
    // #FFFFFF on #C62828 → 5.62:1 (AA ✅)
    // #FFFFFF on #B71C1C → 6.57:1 (AA ✅)
    // #B71C1C on #FFEBEE → 5.75:1 (AA ✅)
    // #C62828 on #FFEBEE → 4.92:1 (AA ✅)
  },

  /**
   * INFO — Deep Blue
   * Neutral informational color, darker than typical blues for AA compliance.
   * Used for informational banners, help text, neutral status indicators.
   */
  info: {
    main: '#1565C0',         // Deep blue
    light: '#42A5F5',        // Bright blue (decorative/large text)
    dark: '#0D47A1',         // Navy blue (text on lighter bg)
    lighter: '#E3F2FD',      // Info tint background
    contrastText: '#FFFFFF', // White text on blue
    // ── WCAG Contrast Ratios ──
    // #FFFFFF on #1565C0 → 5.75:1 (AA ✅)
    // #FFFFFF on #0D47A1 → 8.63:1 (AA ✅)
    // #0D47A1 on #E3F2FD → 7.56:1 (AA ✅)
    // #1565C0 on #E3F2FD → 5.03:1 (AA ✅)
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL SCALE (Blue-gray tinted)
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Cool blue-gray neutrals that complement the TVTC brand.
  // Tinted with a subtle blue undertone from the institutional palette,
  // avoiding the sterility of pure grays.
  //

  neutral: {
    50:  '#F7FAFB',    // Lightest surface, elevated backgrounds
    100: '#EEF3F5',    // Light surface, sunken areas, subtle backgrounds
    200: '#D7E3E8',    // Default borders, dividers
    300: '#B8C8D1',    // Medium borders, emphasized dividers
    400: '#8FA3AE',    // Disabled text, placeholder icons
    500: '#6B8693',    // Muted text (use sparingly, check context)
    600: '#4F6772',    // Secondary text
    700: '#38505C',    // Emphasized secondary, sub-headings
    800: '#233C47',    // Strong emphasis
    900: '#0E2A35',    // Primary text (deep blue-gray, NOT pure black)
    950: '#071920',    // Maximum emphasis, near-black
    // ── WCAG Contrast Ratios (on #FFFFFF) ──
    // neutral.900 #0E2A35 → 14.99:1 (AA ✅)
    // neutral.800 #233C47 → 11.73:1 (AA ✅)
    // neutral.700 #38505C →  8.72:1 (AA ✅)
    // neutral.600 #4F6772 →  5.97:1 (AA ✅)
    // neutral.500 #6B8693 →  3.85:1 (Large Text only ⚠️)
    // neutral.400 #8FA3AE →  2.62:1 (Disabled — exempt from WCAG)
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // SURFACE COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Background colors for different elevation levels and contexts.
  //

  surface: {
    background: '#FFFFFF',                  // Page background
    paper: '#FFFFFF',                       // Cards, dialogs, menus
    elevated: '#F7FAFB',                    // Elevated cards, hover state backgrounds
    sunken: '#EEF3F5',                      // Recessed areas, sidebars, table headers
    overlay: 'rgba(14, 42, 53, 0.50)',      // Modal/drawer backdrop
    scrim: 'rgba(14, 42, 53, 0.32)',        // Lighter overlay (tooltips, popovers)
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // All text colors verified for WCAG AA against white (#FFFFFF) and
  // elevated (#F7FAFB) backgrounds. Disabled text is exempt per WCAG.
  //

  text: {
    primary: '#0E2A35',      // neutral.900 — Headings, body text, labels
    secondary: '#4F6772',    // neutral.600 — Descriptions, captions, meta info
    disabled: '#8FA3AE',     // neutral.400 — Disabled form fields, inactive labels
    hint: '#5A7482',         // Custom shade — Placeholder text, hint labels
    inverse: '#FFFFFF',      // White — Text on dark/colored backgrounds
    link: '#1565C0',         // info.main — Hyperlinks, interactive text
    // ── WCAG Contrast Ratios (on #FFFFFF) ──
    // text.primary  #0E2A35 → 14.99:1 (AA ✅)
    // text.secondary #4F6772 →  5.97:1 (AA ✅)
    // text.hint     #5A7482 →  4.94:1 (AA ✅)
    // text.disabled #8FA3AE →  2.62:1 (Exempt — disabled elements)
    // text.link     #1565C0 →  5.75:1 (AA ✅)
    //
    // ── On Elevated Surface (#F7FAFB) ──
    // text.primary           → 14.29:1 (AA ✅)
    // text.secondary         →  5.70:1 (AA ✅)
    // text.hint              →  4.71:1 (AA ✅)
    //
    // ── On Sunken Surface (#EEF3F5) ──
    // text.primary           → 13.40:1 (AA ✅)
    // text.secondary         →  5.34:1 (AA ✅)
    // text.hint              →  4.41:1 (⚠️ Near-AA; use text.secondary on sunken)
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // BORDER COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Borders are non-text UI elements. WCAG 1.4.11 requires 3:1 for
  // UI component boundaries that are the sole visual indicator.
  // For decorative borders alongside other cues (shadows, bg changes),
  // lower contrast is acceptable.
  //

  border: {
    light: '#EEF3F5',       // neutral.100 — Subtle separators between similar surfaces
    default: '#D7E3E8',     // neutral.200 — Standard card borders, dividers
    medium: '#B8C8D1',      // neutral.300 — Emphasized borders, form field borders
    dark: '#8FA3AE',        // neutral.400 — Strong borders, active outlines
    focus: '#008A3E',       // primary.main — Focus rings (3px outline)
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  common: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // SHADOW COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Blue-gray tinted shadows (using neutral.900 #0E2A35 as base)
  // for warmth and cohesion with the neutral scale.
  //

  shadow: {
    light:  'rgba(14, 42, 53, 0.08)',    // Subtle elevation (cards at rest)
    medium: 'rgba(14, 42, 53, 0.12)',    // Medium elevation (hover, dropdowns)
    heavy:  'rgba(14, 42, 53, 0.18)',    // Strong elevation (modals, popovers)
  },

} as const;


// ─────────────────────────────────────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

/** Full palette type — mirrors the const object structure */
export type ColorPalette = typeof colorPalette;

/** Individual color group types */
export type BrandColor = typeof colorPalette.primary;
export type SemanticColor = typeof colorPalette.success;
export type NeutralScale = typeof colorPalette.neutral;
export type SurfaceColors = typeof colorPalette.surface;
export type TextColors = typeof colorPalette.text;
export type BorderColors = typeof colorPalette.border;


// ─────────────────────────────────────────────────────────────────────────────
// LEGACY COMPAT — Flat color map for components migrating from old themes
// ─────────────────────────────────────────────────────────────────────────────

export const legacyColors = {
  primary: colorPalette.primary.main,
  secondary: colorPalette.secondary.main,
  accent: colorPalette.accent.main,
  white: colorPalette.common.white,
  black: colorPalette.common.black,
  textPrimary: colorPalette.text.primary,
  textSecondary: colorPalette.text.secondary,
  background: colorPalette.surface.background,
  backgroundLight: colorPalette.surface.elevated,
  backgroundDefault: colorPalette.surface.background,
  border: colorPalette.border.default,
  borderLight: colorPalette.border.light,
  success: colorPalette.success.main,
  warning: colorPalette.warning.main,
  error: colorPalette.error.main,
  info: colorPalette.info.main,
  coolGray: colorPalette.surface.elevated,
  almostBlack: colorPalette.text.primary,
  deepPurple: colorPalette.primary.main,
  mediumSlateGray: colorPalette.text.secondary,
  lightSkyBlue: colorPalette.secondary.main,
  lightGray: colorPalette.surface.elevated,
  mediumGray: colorPalette.border.default,
  darkGray: colorPalette.text.primary,
  offWhite: colorPalette.common.white,
  darkBrown: colorPalette.text.primary,
  terracotta: colorPalette.primary.main,
  lightBeige: colorPalette.secondary.main,
  darkOlive: colorPalette.text.secondary,
  darkBlue: colorPalette.secondary.main,
  charcoalGray: colorPalette.text.primary,
  oliveGreen: colorPalette.text.secondary,
  softBlue: colorPalette.secondary.main,
  softPurple: colorPalette.primary.main,
  softOrange: colorPalette.accent.main,
  cream: colorPalette.surface.elevated,
  softYellow: colorPalette.text.secondary,
  mediumNavy: colorPalette.text.primary,
  text: colorPalette.text.primary,
  primaryGradient: `linear-gradient(135deg, ${colorPalette.primary.main} 0%, ${colorPalette.text.primary} 100%)`,
  secondaryGradient: `linear-gradient(135deg, ${colorPalette.secondary.main} 0%, ${colorPalette.primary.main} 100%)`,
  accentGradient: `linear-gradient(135deg, ${colorPalette.primary.main} 0%, ${colorPalette.text.secondary} 100%)`,
  backgroundGradient: `linear-gradient(135deg, ${colorPalette.surface.elevated} 0%, ${colorPalette.common.white} 50%, ${colorPalette.surface.elevated} 100%)`,
} as const;

export const legacyDecorativeStyles = {
  transparentCircle: {
    position: 'absolute' as const,
    borderRadius: '50%',
    background: `rgba(0, 138, 62, 0.08)`,
    pointerEvents: 'none' as const,
  },
  diagonalLine: {
    position: 'absolute' as const,
    background: `linear-gradient(45deg, transparent 30%, rgba(0, 138, 62, 0.06) 50%, transparent 70%)`,
    pointerEvents: 'none' as const,
  },
  geometricPattern: {
    position: 'absolute' as const,
    background: `
      radial-gradient(circle at 20% 80%, rgba(0, 138, 62, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(59, 125, 152, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(14, 42, 53, 0.04) 0%, transparent 50%)
    `,
    pointerEvents: 'none' as const,
  },
  softShadow: {
    boxShadow: `0 4px 20px rgba(0, 138, 62, 0.12), 0 2px 8px rgba(14, 42, 53, 0.08)`,
  },
  subtleBorder: {
    border: `1px solid rgba(14, 42, 53, 0.2)`,
  },
  projectBox: {
    borderRadius: '12px',
    boxShadow: `0 4px 16px rgba(0, 138, 62, 0.1), 0 2px 8px rgba(14, 42, 53, 0.06)`,
    border: `1px solid rgba(14, 42, 53, 0.15)`,
    background: colorPalette.common.white,
  },
  buttonPrimary: {
    background: colorPalette.primary.main,
    color: colorPalette.common.white,
    borderRadius: '12px',
    fontWeight: 600,
    '&:hover': {
      background: colorPalette.secondary.main,
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 20px rgba(0, 138, 62, 0.3)`,
    },
  },
};

export const createDecorativeElements = () => ({
  largeCircle: {
    ...legacyDecorativeStyles.transparentCircle,
    width: '300px',
    height: '300px',
    top: '-150px',
    right: '-150px',
  },
  mediumCircle: {
    ...legacyDecorativeStyles.transparentCircle,
    width: '200px',
    height: '200px',
    bottom: '-100px',
    left: '-100px',
  },
  smallCircle: {
    ...legacyDecorativeStyles.transparentCircle,
    width: '100px',
    height: '100px',
    top: '20%',
    right: '10%',
  },
  diagonalPattern: {
    ...legacyDecorativeStyles.diagonalLine,
    width: '100%',
    height: '2px',
    top: '50%',
    left: 0,
  },
  geometricBackground: {
    ...legacyDecorativeStyles.geometricPattern,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  smallTriangle: {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `12px solid rgba(0, 138, 62, 0.12)`,
    pointerEvents: 'none' as const,
  },
  mediumTriangle: {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderLeft: '12px solid transparent',
    borderRight: '12px solid transparent',
    borderBottom: `18px solid rgba(14, 42, 53, 0.1)`,
    pointerEvents: 'none' as const,
  },
});

export const backgroundPatterns = {
  hero: {
    background: colorPalette.surface.background,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  content: {
    background: `linear-gradient(135deg, ${colorPalette.common.white} 0%, ${colorPalette.surface.elevated} 50%, ${colorPalette.common.white} 100%)`,
    position: 'relative' as const,
  },
  card: {
    background: colorPalette.common.white,
    borderRadius: '12px',
    boxShadow: `0 4px 16px rgba(0, 138, 62, 0.1), 0 2px 8px rgba(14, 42, 53, 0.06)`,
    border: `1px solid rgba(14, 42, 53, 0.15)`,
  },
};

export const legacyLayout = {
  touchTarget: {
    minimum: 44,
    comfortable: 48,
    large: 56,
  },
  drawerWidth: {
    mobile: '80%',
    tablet: 320,
    desktop: 280,
  },
  navHeight: {
    mobile: 56,
    tablet: 64,
    desktop: 72,
  },
};
