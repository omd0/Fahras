# Mobile-First Responsive Design Guide

This document outlines the mobile-first responsive design patterns and best practices implemented in the Fahras application.

## Table of Contents
- [Overview](#overview)
- [Breakpoints](#breakpoints)
- [Custom Hooks](#custom-hooks)
- [Theme Constants](#theme-constants)
- [Component Patterns](#component-patterns)
- [Touch Targets](#touch-targets)
- [Testing Guidelines](#testing-guidelines)

## Overview

The Fahras application follows a **mobile-first** approach to responsive design, ensuring an optimal experience across all devices:
- 📱 Mobile phones (portrait & landscape)
- 📱 Tablets (portrait & landscape)
- 💻 Desktop computers
- 🖥️ Large desktop displays

### Key Principles
1. **Mobile-First**: Design for mobile first, then enhance for larger screens
2. **Touch-Friendly**: All interactive elements meet minimum 44x44 CSS pixel touch target size
3. **Progressive Enhancement**: Add features for larger screens without breaking mobile
4. **Performance**: Optimize for mobile network conditions and device capabilities

## Breakpoints

The application uses Material-UI's default breakpoint system:

```typescript
{
  xs: 0,      // Mobile phones (portrait)
  sm: 600,    // Mobile phones (landscape) & small tablets
  md: 900,    // Tablets (portrait) & small laptops
  lg: 1200,   // Desktop & tablets (landscape)
  xl: 1536,   // Large desktop
}
```

### Usage Examples

#### In sx Prop
```tsx
<Box
  sx={{
    padding: { xs: 2, sm: 3, md: 4 },        // Responsive padding
    fontSize: { xs: '1rem', md: '1.25rem' }, // Responsive font size
    display: { xs: 'block', md: 'flex' },    // Responsive layout
  }}
/>
```

#### In Grid v7
```tsx
<Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <Card>Content</Card>
</Grid>
```

## Custom Hooks

### useResponsive

The primary hook for responsive behavior:

```typescript
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const {
    isMobile,          // < 600px
    isTablet,          // 600px - 900px
    isDesktop,         // >= 900px
    isSmallScreen,     // < 900px (mobile + tablet)
    isTouchDevice,     // Touch capability detection
    getSpacing,        // Get responsive spacing
    getFontSize,       // Get responsive font size
  } = useResponsive();

  return (
    <Box sx={{ padding: isMobile ? 2 : 4 }}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </Box>
  );
}
```

### useNavigationMode

Specifically for navigation components:

```typescript
import { useNavigationMode } from '@/hooks/useResponsive';

function Navigation() {
  const { showMobileNav, showDesktopNav } = useNavigationMode();

  return (
    <>
      {showMobileNav && <MobileNavigation />}
      {showDesktopNav && <DesktopNavigation />}
    </>
  );
}
```

### useFormResponsive

For form components with touch-optimized inputs:

```typescript
import { useFormResponsive } from '@/hooks/useResponsive';

function MyForm() {
  const {
    minTouchTarget,    // 44px minimum
    inputHeight,       // Optimized input height
    buttonSize,        // 'small' | 'medium' | 'large'
    isTouchDevice,     // Touch capability
  } = useFormResponsive();

  return (
    <Button
      size={buttonSize}
      sx={{ minHeight: minTouchTarget }}
    >
      Submit
    </Button>
  );
}
```

### useSwipeGesture

For touch gesture support:

```typescript
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

function ImageCarousel() {
  const handleNext = () => setIndex(i => i + 1);
  const handlePrev = () => setIndex(i => i - 1);

  const swipeRef = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrev,
  }, {
    minSwipeDistance: 50,
    maxSwipeTime: 300,
  });

  return <div ref={swipeRef}>Swipeable content</div>;
}
```

## Theme Constants

### Mobile Constants (tvtcMobile)

Access mobile-specific constants from the theme:

```typescript
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

// Touch targets (WCAG 2.1 Level AAA)
tvtcMobile.touchTarget.minimum      // 44px
tvtcMobile.touchTarget.comfortable  // 48px
tvtcMobile.touchTarget.large        // 56px

// Navigation heights
tvtcMobile.navHeight.mobile    // 56px
tvtcMobile.navHeight.tablet    // 64px
tvtcMobile.navHeight.desktop   // 72px

// Drawer widths
tvtcMobile.drawerWidth.mobile    // '80%'
tvtcMobile.drawerWidth.tablet    // 320px
tvtcMobile.drawerWidth.desktop   // 280px

// Responsive spacing multipliers
tvtcMobile.spacingMultiplier.mobile    // 0.75
tvtcMobile.spacingMultiplier.tablet    // 1
tvtcMobile.spacingMultiplier.desktop   // 1.25
```

### Usage in Components

```tsx
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

<Button
  sx={{
    minHeight: tvtcMobile.touchTarget.minimum,
    minWidth: tvtcMobile.touchTarget.minimum,
  }}
>
  Tap Me
</Button>
```

## Component Patterns

### Responsive Navigation

The Header component implements a responsive pattern:
- **Mobile/Tablet** (< 900px): Hamburger menu with drawer
- **Desktop** (>= 900px): Full horizontal navigation

```tsx
// Header.tsx pattern
const { showMobileNav } = useNavigationMode();

return (
  <>
    {showMobileNav && <IconButton onClick={openDrawer}>☰</IconButton>}
    {!showMobileNav && <DesktopNav />}
  </>
);
```

### Responsive Cards

```tsx
<Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
  <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
    <Card
      sx={{
        p: { xs: 2, md: 3 },
        '&:hover': {
          // Disable transform on touch devices
          '@media (hover: none)': {
            transform: 'none',
          },
        },
      }}
    >
      <CardContent />
    </Card>
  </Grid>
</Grid>
```

### Responsive Typography

```tsx
<Typography
  variant="h1"
  sx={{
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
    lineHeight: { xs: 1.2, md: 1.3 },
    mb: { xs: 2, md: 3 },
  }}
>
  Responsive Heading
</Typography>
```

### Responsive Buttons

```tsx
<Button
  variant="contained"
  sx={{
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 1, sm: 1.5 },
    fontSize: { xs: '0.875rem', md: '1rem' },
    minHeight: 44, // Touch target
    minWidth: 44,  // Touch target
  }}
>
  Action
</Button>
```

### Responsive Stack/Flex

```tsx
<Stack
  direction={{ xs: 'column', md: 'row' }}
  spacing={{ xs: 2, md: 3 }}
  alignItems={{ xs: 'stretch', md: 'center' }}
>
  <Box />
  <Box />
</Stack>
```

## Touch Targets

### WCAG 2.1 Compliance

All interactive elements MUST meet minimum touch target sizes:
- **Minimum**: 44x44 CSS pixels (WCAG Level AAA)
- **Comfortable**: 48x48 CSS pixels (recommended for primary actions)
- **Large**: 56x56 CSS pixels (recommended for CTAs)

### Implementation

```tsx
// ✅ Correct - Meets minimum touch target
<IconButton
  sx={{
    minWidth: 44,
    minHeight: 44,
  }}
>
  <MenuIcon />
</IconButton>

// ✅ Correct - Using theme constant
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

<IconButton
  sx={{
    minWidth: tvtcMobile.touchTarget.minimum,
    minHeight: tvtcMobile.touchTarget.minimum,
  }}
>
  <MenuIcon />
</IconButton>

// ❌ Wrong - Too small for touch
<IconButton sx={{ width: 32, height: 32 }}>
  <MenuIcon />
</IconButton>
```

### Spacing Between Touch Targets

Maintain at least 8px spacing between adjacent touch targets:

```tsx
<Stack direction="row" spacing={1}>
  <IconButton>Icon 1</IconButton>
  <IconButton>Icon 2</IconButton>
</Stack>
```

## Best Practices

### 1. Mobile-First CSS

Always write mobile styles first, then add breakpoints:

```tsx
// ✅ Correct - Mobile first
<Box
  sx={{
    // Mobile base styles
    padding: 2,
    fontSize: '1rem',
    display: 'block',
    
    // Tablet enhancement
    '@media (min-width: 600px)': {
      padding: 3,
    },
    
    // Desktop enhancement
    '@media (min-width: 900px)': {
      padding: 4,
      fontSize: '1.25rem',
      display: 'flex',
    },
  }}
/>

// ❌ Wrong - Desktop first
<Box
  sx={{
    padding: 4,
    '@media (max-width: 900px)': {
      padding: 2,
    },
  }}
/>
```

### 2. Disable Hover Effects on Touch Devices

Prevent sticky hover states on mobile:

```tsx
<Button
  sx={{
    '&:hover': {
      transform: 'translateY(-2px)',
    },
    // Disable on touch devices
    '@media (hover: none)': {
      '&:hover': {
        transform: 'none',
      },
    },
  }}
>
  Hover Me
</Button>
```

### 3. Responsive Images

```tsx
<Box
  component="img"
  src="/image.jpg"
  sx={{
    width: '100%',
    height: 'auto',
    maxWidth: { xs: '100%', md: 600 },
    objectFit: 'cover',
  }}
/>
```

### 4. Conditional Rendering vs. CSS

Choose based on complexity:

```tsx
// Simple hide/show - use CSS
<Box sx={{ display: { xs: 'none', md: 'block' } }}>
  Desktop only content
</Box>

// Different components - use conditional rendering
{isMobile ? <MobileComponent /> : <DesktopComponent />}
```

## Testing Guidelines

### Manual Testing Checklist

Test on these viewports:
- [ ] 375x667 (iPhone SE)
- [ ] 390x844 (iPhone 12/13/14)
- [ ] 414x896 (iPhone 11 Pro Max)
- [ ] 768x1024 (iPad)
- [ ] 1024x768 (iPad Landscape)
- [ ] 1280x720 (Small desktop)
- [ ] 1920x1080 (Full HD desktop)

### Chrome DevTools Testing

1. Open DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Test various devices from the dropdown
4. Test in both portrait and landscape orientations
5. Enable "Show media queries" to see breakpoints

### Touch Testing

Test all interactive elements:
- [ ] All buttons are tappable (min 44x44px)
- [ ] Adequate spacing between touch targets
- [ ] No accidental taps on adjacent elements
- [ ] Forms are easy to fill on mobile
- [ ] Swipe gestures work smoothly

### Performance Testing

- [ ] Images are optimized for mobile bandwidth
- [ ] No layout shifts (CLS)
- [ ] Smooth scrolling
- [ ] Fast tap response times

## Common Patterns

### Responsive Container

```tsx
<Container
  maxWidth="lg"
  sx={{
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 3, md: 6 },
  }}
>
  Content
</Container>
```

### Responsive Grid Layout

```tsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Card />
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Card />
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Card />
  </Grid>
</Grid>
```

### Responsive Modal/Dialog

```tsx
<Dialog
  fullScreen={isMobile}
  maxWidth="md"
  fullWidth
  sx={{
    '& .MuiDialog-paper': {
      m: { xs: 0, sm: 2 },
      borderRadius: { xs: 0, sm: 2 },
    },
  }}
>
  <DialogContent />
</Dialog>
```

## Accessibility Considerations

### Focus Management

Ensure keyboard navigation works on all devices:

```tsx
<Button
  sx={{
    '&:focus-visible': {
      outline: '3px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2,
    },
  }}
>
  Accessible Button
</Button>
```

### Screen Reader Support

Always include ARIA labels for icon-only buttons:

```tsx
<IconButton aria-label="Open menu">
  <MenuIcon />
</IconButton>
```

### Reduced Motion

Respect user's motion preferences:

```tsx
const { prefersReducedMotion } = useResponsive();

<Box
  sx={{
    transition: prefersReducedMotion 
      ? 'none' 
      : 'all 0.3s ease',
  }}
/>
```

## Resources

- [Material-UI Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev: Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)

## Migration Guide

When updating existing components to be mobile-responsive:

1. **Add responsive breakpoints** to sx props
2. **Use custom hooks** (useResponsive, useNavigationMode)
3. **Ensure touch targets** meet 44x44px minimum
4. **Test on multiple** viewport sizes
5. **Disable hover effects** on touch devices
6. **Add swipe gestures** where appropriate

Example migration:

```tsx
// Before
<Box sx={{ padding: 4, fontSize: '1.5rem' }}>
  <Button onClick={handleClick}>
    Click Me
  </Button>
</Box>

// After
<Box 
  sx={{ 
    padding: { xs: 2, md: 4 }, 
    fontSize: { xs: '1rem', md: '1.5rem' } 
  }}
>
  <Button 
    onClick={handleClick}
    sx={{
      minHeight: 44,
      minWidth: 44,
      px: { xs: 2, md: 3 },
    }}
  >
    Click Me
  </Button>
</Box>
```

---

**Last Updated**: Phase 4 - Mobile-First Responsive Overhaul
**Maintained By**: Development Team
