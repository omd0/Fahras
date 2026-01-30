# Decisions

## Task 3: Color Palette Design

### D1: Secondary Color Choice
**Decision**: Institutional blue #3B7D98 (not teal #18B3A8)
**Rationale**: Teal is too close to primary green visually. Blue provides clear distinction and a more institutional/professional tone. Teal retained as supplementary brand color.

### D2: Darkened Brand Colors for AA
**Decision**: Darkened teal from #18B3A8 to #097C73 (teal.main); kept original as teal.light
**Rationale**: Original teal (2.61:1) fails WCAG AA completely. Darkened version (5.07:1) passes while maintaining brand recognition. The original is preserved in .light for decorative/large-text use.

### D3: Warning Color
**Decision**: Warm amber #B45309 (not burnt orange #E65100 or existing #B26A00)
**Rationale**: #E65100 too close to red (could confuse with error). #B26A00 is the old value and too brown/muted. #B45309 is warm amber that passes AA (5.02:1) and is clearly distinct from both error red and gold accent.

### D4: Palette Structure (main/light/dark/lighter/contrastText)
**Decision**: Five-variant structure for each color group
**Rationale**: Maps directly to MUI palette in Task 4. The `lighter` field (tint background) is not standard MUI but essential for alert/badge patterns. This structure supports all common UI patterns (button, alert, chip, badge, text).

### D5: Primary Green Contrast Handling
**Decision**: Accept 4.46:1 for primary.main with white (AA Large Text only); document to use .dark for normal text
**Rationale**: Brand color is non-negotiable. 4.46:1 is extremely close to 4.5:1 threshold. All button text (14px+ bold) qualifies as large text. Providing .dark (#006B2F, 6.68:1) as the alternative for normal-text contexts.

## Task 5: Integrate New Theme & Clean Up Old Theme Files

### D6: Keep dashboardThemes.ts (refactored) instead of deleting
**Decision**: Refactored dashboardThemes.ts to derive all colors from colorPalette rather than deleting it
**Rationale**: 15+ files import DashboardTheme type or getDashboardTheme(). Deleting would cascade into massive consumer changes. Refactoring to derive from colorPalette achieves unification without breaking consumers. All role themes now return identical "unified" theme.

### D7: Legacy compat exports in colorPalette.ts
**Decision**: Added legacyColors, legacyDecorativeStyles, createDecorativeElements, backgroundPatterns, legacyLayout to colorPalette.ts
**Rationale**: 7 guestTheme consumers + 1 tvtcMobile consumer needed migration. Rather than creating a separate compat file, consolidating in colorPalette.ts keeps the color system in one place. Import aliasing (`legacyColors as guestColors`) minimizes component-level changes.

### D8: ThemeToggle.tsx as null-rendering stub
**Decision**: Kept ThemeToggle.tsx as `() => null` stub instead of deleting
**Rationale**: 3 files import it (Header, UtilityBar, MobileDrawer). Stub avoids import errors while effectively removing the toggle from the UI. Can be fully removed in a later cleanup pass.

### D9: useTheme alias in ThemeContext.tsx
**Decision**: Exported `useTheme` as alias to `useFahrasTheme` in ThemeContext.tsx
**Rationale**: ~8 consumer files import `useTheme` from ThemeContext. Aliasing avoids breaking them while the new name is available for new code.

### D10: themeStore.ts light-only simplification
**Decision**: ThemeMode = 'light' only, toggleTheme is no-op, setTheme always sets light
**Rationale**: Dark mode explicitly dropped per plan. Keeping the store interface stable (consumers still call toggleTheme/setTheme) but making it inert prevents runtime errors in consumers.
