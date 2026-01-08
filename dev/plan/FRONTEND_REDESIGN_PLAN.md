# Frontend Redesign Plan: TVTC Portal Hub Design System

## Overview

This plan outlines the complete frontend redesign of Fahras to match the "TVTC Portal Hub" design system specified in `design.toon`. The redesign focuses on creating an institutional, airy, RTL-first portal with thin-bordered cards, teal/green accents, and a signature blue hero overlay.

---

## Current State Analysis

### What Exists:
- **Theme System**: `tvtcTheme.ts` with existing TVTC colors (close to target but needs adjustment)
- **Components**: MUI v7 components with custom overrides
- **Layout**: AppLayout with Header, Footer, MobileDrawer
- **Styling**: Emotion CSS-in-JS with RTL support
- **Accessibility**: Comprehensive a11y utilities already in place

### Gap Analysis (Current vs. Target):

| Aspect | Current | Target (design.toon) |
|--------|---------|---------------------|
| Primary Color | `#008a3e` | `#008A3E` (primary.600) + `#18B3A8` (primary.500 teal) |
| Secondary | `#3B7D98` | `#1F6F8B` (secondary.700) / `#3B7D98` (secondary.600) |
| Text Color | `#212121` | `#0E2A35` (deep blue-gray) |
| Card Style | Shadow-based | Thin-border outlined (teal 1.5-2px) |
| Border Radius | 4-8px | 12-14px (cards), 9999px (pills) |
| Hero | Blue gradient | Photo + rgba(27,125,153,0.55-0.75) overlay |
| Header | Single tier | Two-tier (utility bar + primary nav) |

---

## Phase 1: Design Tokens & Theme Foundation

### 1.1 Update Color Palette (`tvtcTheme.ts`)

**Primary Colors (TVTC green/teal family):**
```typescript
primary: {
  main: '#008A3E',      // primary.600 - deep green
  light: '#18B3A8',     // primary.500 - teal (for buttons/controls)
  tint: '#E7F7F5',      // primary.050
}
```

**Secondary Colors (institutional blue family):**
```typescript
secondary: {
  dark: '#1F6F8B',      // secondary.700
  main: '#3B7D98',      // secondary.600
  tint: '#E9F3F7',      // secondary.050
}
```

**Accent (gold - use sparingly):**
```typescript
accent: {
  main: '#F3B200',      // accent.600
  tint: '#FFF6D6',      // accent.050
}
```

**Neutrals:**
```typescript
background: {
  default: '#FFFFFF',
  paper: '#FFFFFF',
  surface50: '#F7FAFB',
  surface100: '#EEF3F5',
}
border: '#D7E3E8'       // cool, slightly blue
```

**Text:**
```typescript
text: {
  primary: '#0E2A35',   // deep blue-gray (NOT pure black)
  secondary: '#4F6772',
  muted: '#7D929B',
}
```

**Status (quiet, no neon):**
```typescript
success: '#2E7D32',
warning: '#B26A00',
error: '#C62828',
info: '#1E88E5',
```

### 1.2 Update Typography

```typescript
fontFamily: '"Tahoma", "Arial", "Segoe UI", system-ui, sans-serif'

typography: {
  display: { fontSize: '40-52px', fontWeight: 700, lineHeight: 1.1-1.2 },
  h1: { fontSize: '32-36px', fontWeight: 700, lineHeight: 1.15-1.25 },
  h2: { fontSize: '24-28px', fontWeight: 700, lineHeight: 1.2-1.3 },
  h3: { fontSize: '18-20px', fontWeight: 700, lineHeight: 1.25-1.35 },
  body1: { fontSize: '14-16px', fontWeight: 400-500, lineHeight: 1.5-1.7 },
  caption: { fontSize: '12-13px', fontWeight: 500, lineHeight: 1.3-1.5 },
}
```

### 1.3 Update Spacing & Sizing Tokens

```typescript
spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64]

shape: {
  borderRadiusCircle: 9999,    // pill buttons
  borderRadiusCard: 12-14,     // service cards
  borderRadiusInput: 10-12,    // inputs/selects
  borderRadiusMenu: 12,        // menus/popovers
}
```

### 1.4 Update Shadows (Restrained)

```typescript
shadows: {
  elevation1: '0 2px 10px rgba(14, 42, 53, 0.08)',   // optional
  elevation2: '0 6px 18px rgba(14, 42, 53, 0.12)',   // hover
  elevation3: '0 16px 48px rgba(14, 42, 53, 0.18)', // overlay
}
```

---

## Phase 2: App Shell Redesign

### 2.1 Two-Tier Header

**Files to modify:**
- [Header.tsx](web/src/components/layout/Header.tsx) (major rewrite)
- Create: `UtilityBar.tsx`, `PrimaryNav.tsx`

**Tier 1 - Utility Bar (48-56px):**
- Background: white
- Logo lockup on far right (RTL)
- Utilities with thin vertical separators:
  - Accessibility/size toggles
  - Language toggle (EN)
  - Account, mail, phone, print icons
  - Circular teal search button (primary.500 fill, white icon)
- 1px bottom border (border.200)

**Tier 2 - Primary Nav (44-56px):**
- Background: white
- RTL nav links with dropdown carets
- Hover: shift to secondary.600
- Active: 2px underline in primary.600
- Flat and clean (no heavy shadows)

### 2.2 Hero Section (Full-bleed Carousel)

**Files to modify:**
- [HomePage.tsx](web/src/pages/HomePage.tsx) (hero section)
- Create: `HeroCarousel.tsx`

**Structure:**
- Full-width background photo
- Cool blue overlay: `rgba(27, 125, 153, 0.55)` → `rgba(27, 125, 153, 0.75)`
- Centered Arabic headline + supporting line (white text)
- Carousel dots (semi-transparent inactive, solid white active)
- Optional section header card overlay near bottom

### 2.3 Floating Assist Buttons

**Create:** `FloatingAssist.tsx`

- Position: fixed, left side, vertically centered
- 3 circular teal buttons (48-56px), white icons
- Hover: subtle brightening
- Focus: primary focus ring

### 2.4 Footer Bar

**Files to modify:**
- [AppLayout.tsx](web/src/components/layout/AppLayout.tsx) (footer section)
- [HeaderLogo.tsx](web/src/components/layout/HeaderLogo.tsx)

**Structure:**
- Background: surface.050 or surface.100
- Thin top border (border.200)
- Left: brand mark
- Right: legal + utility links
- Links: text.secondary, hover primary.600

---

## Phase 3: Component Library Updates

### 3.1 Buttons

**Primary Button (Pill CTA):**
```typescript
MuiButton: {
  styleOverrides: {
    containedPrimary: {
      borderRadius: 9999,
      backgroundColor: '#18B3A8', // primary.500 teal
      padding: '14-18px',
      height: '40-44px',
      '&:hover': {
        backgroundColor: darken('#18B3A8', 0.1),
        transform: 'translateY(-1px)',
      },
    },
  },
}
```

**Secondary Button (Outline Pill):**
```typescript
outlined: {
  borderRadius: 9999,
  border: '1px solid #D7E3E8',
  '&:hover': {
    backgroundColor: '#F7FAFB',
  },
}
```

### 3.2 Portal Service Cards (Outlined)

**Files to modify:**
- [ProjectCard.tsx](web/src/components/shared/ProjectCard.tsx)

**New Style:**
```typescript
{
  backgroundColor: '#FFFFFF',
  borderRadius: '12-14px',
  border: '1.5-2px solid #18B3A8', // teal outline
  boxShadow: 'none', // NO shadow - border is separator
  '&:hover': {
    borderWidth: '2px',
    transform: 'translateY(-1px)',
  },
}
```

**Layout (centered):**
- Top: emblem/icon in soft circular badge (secondary.050 bg)
- Middle: Arabic title (2 lines max), weight 600-700
- Bottom: rating row (stars in primary.500)

### 3.3 Section Band (Deep Teal/Blue Panel)

**Create:** `SectionBand.tsx`

```typescript
{
  background: 'linear-gradient(to right, #1F6F8B, #3B7D98)',
  // Right-aligned section title in white
  // Small emblem icon
  // Outline button on left (white border, white text)
}
```

### 3.4 Form Controls

**Search Field:**
```typescript
{
  borderRadius: '10-12px',
  border: '1px solid #D7E3E8',
  '&:focus': {
    outline: '3px solid #008A3E',
    outlineOffset: '2px',
  },
}
```

**Select/Dropdown:**
- Same height and radius as inputs
- Menu: white, radius 12px, shadow elevation3
- Menu items: 10-12px vertical padding

### 3.5 Category Navigation

**Create:** `CategoryChips.tsx`

- Icon above/left of label
- Default: text.secondary
- Active: primary.600 + optional underline
- Hit area: 56px minimum
- Horizontal scroll on mobile with subtle affordance arrows

### 3.6 Badges/Tags/Chips

```typescript
{
  borderRadius: 9999, // pill
  height: '24-28px',
  default: { backgroundColor: '#F7FAFB', color: '#4F6772' },
  emphasis: { backgroundColor: '#E7F7F5', color: '#008A3E' },
}
```

---

## Phase 4: Page-Specific Updates

### 4.1 HomePage
- Replace current blue gradient hero with photo + blue overlay
- Add carousel functionality
- Add floating assist buttons
- Update service cards to outlined style
- Add section bands for content separation

### 4.2 ExplorePage
- Update filter bar styling (rounded inputs, selects)
- Update project grid with outlined cards
- Add category chip navigation
- Update pagination to minimal icon-forward style

### 4.3 ProjectDetailPage
- Update sidebar cards with proper header gradients
- Update tab navigation (underlined style)
- Ensure RTL text alignment

### 4.4 Dashboard Pages
- Apply section bands for visual hierarchy
- Update stats cards with outlined style
- Maintain role-based color accents

---

## Phase 5: Accessibility & Polish

### 5.1 Focus States
```typescript
{
  outline: '3px solid #008A3E',
  boxShadow: '0 0 0 3px rgba(0, 138, 62, 0.25)',
}
```

### 5.2 Motion
- Micro-interactions: 150-200ms
- Surface transitions: 200-300ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Hover lift: max 2px translateY

### 5.3 RTL Compliance
- Default text direction: RTL for Arabic
- Right-aligned headings and nav
- LTR only for utility bar controls

---

## Implementation Order (Incremental Rollout)

### Sprint 1: Foundation (Theme Tokens)
**Goal:** Update design tokens without breaking existing UI

1. Update `tvtcTheme.ts` with new color palette
2. Update typography settings
3. Update spacing and sizing tokens
4. Update shadow definitions
5. Update `index.css` CSS variables
6. Update `accessibility.css` focus ring colors

**Deliverable:** New design tokens applied globally, subtle visual refresh

---

### Sprint 2: App Shell (Header + Footer)
**Goal:** Implement two-tier header and updated footer

1. Create `UtilityBar.tsx` (Tier 1: logo, utilities, search)
2. Create `PrimaryNav.tsx` (Tier 2: main navigation)
3. Refactor `Header.tsx` to compose both tiers
4. Update footer in `AppLayout.tsx`
5. Update `MobileDrawer.tsx` with new styling

**Deliverable:** New two-tier header matching TVTC portal style

---

### Sprint 3: Hero Carousel
**Goal:** Implement full-bleed hero with carousel

1. Create `HeroCarousel.tsx` with:
   - Photo background with blue overlay
   - Centered Arabic headline + subtitle
   - Carousel dots navigation
   - Auto-play with pause on hover
2. Update `HomePage.tsx` to use HeroCarousel
3. Add placeholder hero images

**Deliverable:** Dynamic hero section with rotating content

---

### Sprint 4: Component Updates
**Goal:** Update core components to new design language

1. Update button styles (pill shape, teal primary)
2. Create `PortalServiceCard.tsx` (outlined style)
3. Update `ProjectCard.tsx` to use outlined style
4. Update form controls (search, select, inputs)
5. Create `SectionBand.tsx` for content separation
6. Update badges/chips to pill shape

**Deliverable:** Cohesive component library matching design.toon

---

### Sprint 5: Page-Specific Updates
**Goal:** Apply new design to all pages

1. HomePage: Section bands, updated layout
2. ExplorePage: Category chips, filter bar, outlined cards
3. ProjectDetailPage: Updated sidebar, tabs
4. Dashboard pages: Section bands, stats cards

**Deliverable:** Complete visual redesign across all pages

---

### Sprint 6: Polish & Accessibility
**Goal:** Final refinements and a11y audit

1. Motion tuning (timing, easing)
2. Focus state verification
3. RTL compliance check
4. Touch target audit
5. Performance optimization

**Deliverable:** Production-ready, accessible design

---

## Files to Create

| File | Sprint | Purpose |
|------|--------|---------|
| `UtilityBar.tsx` | 2 | Tier 1 header utilities |
| `PrimaryNav.tsx` | 2 | Tier 2 main navigation |
| `HeroCarousel.tsx` | 3 | Full-bleed hero with carousel |
| `SectionBand.tsx` | 4 | Deep teal/blue section divider |
| `CategoryChips.tsx` | 5 | Icon + label category navigation |
| `PortalServiceCard.tsx` | 4 | Outlined service card style |

## Files to Modify

| File | Sprint | Changes |
|------|--------|---------|
| `tvtcTheme.ts` | 1 | Complete color/typography/spacing update |
| `index.css` | 1 | Update CSS variables |
| `accessibility.css` | 1, 6 | Update focus ring colors |
| `Header.tsx` | 2 | Split into two-tier structure |
| `MobileDrawer.tsx` | 2 | New styling |
| `AppLayout.tsx` | 2 | New footer |
| `HomePage.tsx` | 3, 5 | Hero carousel, section bands |
| `ProjectCard.tsx` | 4 | Outlined card style |
| `ExplorePage.tsx` | 5 | Updated filters, cards |

---

## Design Decisions (User Confirmed)

| Decision | Choice |
|----------|--------|
| Rollout Strategy | Incremental (sprint-by-sprint) |
| Floating Assist Buttons | Skip for now |
| Hero Style | Carousel with blue overlay |
| Header Style | Two-tier (utility bar + primary nav) |

---

## Notes

- **Floating assist buttons**: Deferred to future iteration
- **Hero images**: Will use placeholder images; can be swapped later
- **Carousel content**: Will implement with configurable slides (title, subtitle, CTA)
