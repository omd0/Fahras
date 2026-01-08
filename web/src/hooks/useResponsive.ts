import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Custom hook for responsive design utilities
 * Provides easy-to-use breakpoint detection and device type checks
 * 
 * @example
 * const { isMobile, isTablet, isDesktop, isSmallScreen } = useResponsive();
 * 
 * return (
 *   <Box sx={{ padding: isMobile ? 2 : 4 }}>
 *     {isMobile ? <MobileNav /> : <DesktopNav />}
 *   </Box>
 * );
 */
export const useResponsive = () => {
  const theme = useTheme();

  // Breakpoint checks
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= 900px
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
  const isXLargeDesktop = useMediaQuery(theme.breakpoints.up('xl')); // >= 1536px

  // Combined checks
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // < 900px (mobile + tablet)
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900px - 1200px
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px

  // Orientation checks
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  // Touch device detection
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  
  // High DPI / Retina display
  const isRetina = useMediaQuery('(min-resolution: 2dppx)');

  // Reduced motion preference (accessibility)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  /**
   * Get responsive value based on current breakpoint
   * @param values Object with breakpoint keys and values
   * @returns Value for current breakpoint
   * 
   * @example
   * const padding = getResponsiveValue({ xs: 2, sm: 3, md: 4 });
   */
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
    
    // Fallback to smallest defined value
    return values.xs ?? values.sm ?? values.md ?? values.lg ?? values.xl;
  };

  /**
   * Get spacing value optimized for current device
   * Mobile: Smaller spacing, Desktop: Larger spacing
   */
  const getSpacing = (mobile: number, desktop?: number) => {
    return isMobile ? mobile : (desktop ?? mobile * 1.5);
  };

  /**
   * Get font size optimized for current device
   */
  const getFontSize = (mobile: string, desktop?: string) => {
    return isMobile ? mobile : (desktop ?? mobile);
  };

  return {
    // Device type
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isXLargeDesktop,
    
    // Screen size groups
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    
    // Orientation
    isPortrait,
    isLandscape,
    
    // Device capabilities
    isTouchDevice,
    isRetina,
    
    // Accessibility
    prefersReducedMotion,
    
    // Utility functions
    getResponsiveValue,
    getSpacing,
    getFontSize,
    
    // Direct theme access for custom queries
    theme,
  };
};

/**
 * Hook specifically for navigation responsiveness
 * Determines when to show mobile navigation vs desktop navigation
 */
export const useNavigationMode = () => {
  const { isMobile, isTablet, isSmallScreen } = useResponsive();

  return {
    showMobileNav: isSmallScreen, // Show hamburger menu on mobile + tablet
    showDesktopNav: !isSmallScreen, // Show full navigation on desktop
    isMobile,
    isTablet,
  };
};

/**
 * Hook for form field responsiveness
 * Provides optimal sizing for form inputs on different devices
 */
export const useFormResponsive = () => {
  const { isMobile, isTablet, isTouchDevice } = useResponsive();

  // Minimum touch target size (WCAG 2.1 guideline: 44x44 CSS pixels)
  const minTouchTarget = 44;

  // Input size based on device
  const inputSize = isMobile ? 'medium' : 'medium'; // Can be 'small' | 'medium' | 'large'
  
  // Input height in pixels
  const inputHeight = isTouchDevice ? minTouchTarget : 40;
  
  // Padding for form fields
  const inputPadding = isMobile ? '12px 14px' : '14px 16px';
  
  // Button size
  const buttonSize = isTouchDevice ? 'large' : 'medium';
  
  // Button min height
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
