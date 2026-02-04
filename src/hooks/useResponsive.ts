'use client';

/**
 * Responsive design hook
 * Migrated from web/src/hooks/useResponsive.ts
 */
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const useResponsive = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isXLargeDesktop = useMediaQuery(theme.breakpoints.up('xl'));

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  const isRetina = useMediaQuery('(min-resolution: 2dppx)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const getResponsiveValue = <T,>(values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
  }): T | undefined => {
    if (isXLargeDesktop && values.xl !== undefined) return values.xl;
    if (isLargeDesktop && values.lg !== undefined) return values.lg;
    if (isDesktop && values.md !== undefined) return values.md;
    if (isTablet && values.sm !== undefined) return values.sm;
    if (isMobile && values.xs !== undefined) return values.xs;
    return values.xs ?? values.sm ?? values.md ?? values.lg ?? values.xl;
  };

  const getSpacing = (mobile: number, desktop?: number) => {
    return isMobile ? mobile : (desktop ?? mobile * 1.5);
  };

  const getFontSize = (mobile: string, desktop?: string) => {
    return isMobile ? mobile : (desktop ?? mobile);
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isXLargeDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isPortrait,
    isLandscape,
    isTouchDevice,
    isRetina,
    prefersReducedMotion,
    getResponsiveValue,
    getSpacing,
    getFontSize,
    theme,
  };
};

export const useNavigationMode = () => {
  const { isMobile, isTablet, isSmallScreen } = useResponsive();

  return {
    showMobileNav: isSmallScreen,
    showDesktopNav: !isSmallScreen,
    isMobile,
    isTablet,
  };
};

export const useFormResponsive = () => {
  const { isMobile, isTablet, isTouchDevice } = useResponsive();

  const minTouchTarget = 44;
  const inputSize = isMobile ? 'medium' : 'medium';
  const inputHeight = isTouchDevice ? minTouchTarget : 40;
  const inputPadding = isMobile ? '12px 14px' : '14px 16px';
  const buttonSize = isTouchDevice ? 'large' : 'medium';
  const buttonMinHeight = isTouchDevice ? minTouchTarget : 36;

  return {
    isMobile,
    isTablet,
    isTouchDevice,
    minTouchTarget,
    inputSize,
    inputHeight,
    inputPadding,
    buttonSize,
    buttonMinHeight,
  };
};
