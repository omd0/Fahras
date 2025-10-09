# Component Architecture - Refactored Dashboard System

## Visual Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          MuiThemeProvider (Material-UI)               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              Router (React Router)              │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │    ThemeProvider (Custom Context)         │  │  │  │
│  │  │  │                                            │  │  │  │
│  │  │  │  ┌──────────────────────────────────┐     │  │  │  │
│  │  │  │  │         All Routes/Pages         │     │  │  │  │
│  │  │  │  │  (Have access to role theme)     │     │  │  │  │
│  │  │  │  └──────────────────────────────────┘     │  │  │  │
│  │  │  │                                            │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Dashboard Component Structure

```
┌────────────────────────────────────────────────────────────────┐
│                    DashboardPage.tsx                           │
│  (Routes to role-specific dashboard based on user role)       │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Admin     │  │   Faculty    │  │   Student    │  ...   │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ (All use shared components)
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                     Shared Components                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  DashboardContainer                                      │ │
│  │  ├─ Background gradient (role-specific)                 │ │
│  │  ├─ Padding & max-width                                 │ │
│  │  └─ Content wrapper                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  DashboardHeader                                         │ │
│  │  ├─ Role icon & greeting                                │ │
│  │  ├─ User name                                            │ │
│  │  ├─ Subtitle/description                                │ │
│  │  └─ Gradient background                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  StatsCard                                               │ │
│  │  ├─ Number value                                         │ │
│  │  ├─ Label text                                           │ │
│  │  ├─ Icon                                                 │ │
│  │  └─ Gradient background                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ProjectCard                                             │ │
│  │  ├─ Project title & status                              │ │
│  │  ├─ Abstract preview                                     │ │
│  │  ├─ Optional: Progress bar                              │ │
│  │  ├─ Optional: Edit button                               │ │
│  │  ├─ Optional: Approval status                           │ │
│  │  └─ View button                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  QuickActions                                            │ │
│  │  ├─ Action button 1 (with icon)                         │ │
│  │  ├─ Action button 2 (with icon)                         │ │
│  │  └─ Action button N (with icon)                         │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Login                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  AuthStore (Zustand)                         │
│  - user object with roles                                    │
│  - authentication state                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              ThemeContext Provider                           │
│  - Reads user.roles from AuthStore                          │
│  - Calls getDashboardTheme(user.roles)                      │
│  - Provides { theme, userRole } to all components           │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ↓               ↓               ↓
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Dashboard  │ │   Other     │ │   Other     │
│   Pages     │ │   Pages     │ │   Pages     │
│             │ │             │ │             │
│ useTheme()  │ │ useTheme()  │ │ useTheme()  │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Theme Resolution Flow

```
User Role → Theme Selection
─────────────────────────────

admin     →  Purple/Pink Theme
             - Primary: #7c3aed
             - Secondary: #ec4899
             - Icon: 🛡️

faculty   →  Cyan/Emerald Theme
             - Primary: #0891b2
             - Secondary: #10b981
             - Icon: 👨‍🏫

student   →  Blue/Violet Theme
             - Primary: #2563eb
             - Secondary: #8b5cf6
             - Icon: 🎓

reviewer  →  Green/Orange Theme
             - Primary: #059669
             - Secondary: #d97706
             - Icon: 📋

default   →  TVTC Blue/Green Theme
             - Primary: #1e3a8a
             - Secondary: #059669
             - Icon: 📊
```

## Component Import Pattern

### Before Refactoring ❌
```tsx
// Each dashboard had duplicated code
import { Box, Card, Typography, ... } from '@mui/material';

// Manual styling in each component
<Box sx={{
  background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
  borderRadius: 3,
  p: 4,
  mb: 4,
  color: 'white',
}}>
  <Typography variant="h3">Welcome</Typography>
  <Typography variant="h5">{user?.full_name}</Typography>
</Box>
```

### After Refactoring ✅
```tsx
// Import shared components
import {
  DashboardContainer,
  DashboardHeader,
  StatsCard,
  ProjectCard,
  QuickActions
} from '../shared';

// Use shared components
<DashboardContainer theme={theme}>
  <DashboardHeader
    theme={theme}
    icon={roleInfo.icon}
    greeting={roleInfo.greeting}
    userName={user?.full_name || ''}
    subtitle={roleInfo.subtitle}
  />
</DashboardContainer>
```

## Component Reusability Matrix

| Component           | Admin | Faculty | Student | Reviewer | Other Pages |
|---------------------|-------|---------|---------|----------|-------------|
| DashboardContainer  | ✅    | ✅      | ✅      | ✅       | ✅          |
| DashboardHeader     | ✅    | ✅      | ✅      | ✅       | ✅          |
| StatsCard           | ✅    | ✅      | ✅      | ✅       | ✅          |
| ProjectCard         | ✅    | ✅      | ✅      | ✅       | ✅          |
| QuickActions        | ✅    | ✅      | ⚪      | ⚪       | ✅          |

✅ Currently used
⚪ Not currently used but available

## Code Metrics

### Lines of Code Comparison

| Dashboard       | Before | After | Reduction |
|-----------------|--------|-------|-----------|
| AdminDashboard  | 220    | 180   | -40 (-18%)|
| FacultyDashboard| 230    | 160   | -70 (-30%)|
| StudentDashboard| 280    | 200   | -80 (-29%)|
| ReviewerDashboard| 240   | 170   | -70 (-29%)|
| **Total**       | **970**| **710**| **-260 (-27%)**|

### Shared Components
| Component             | Lines |
|-----------------------|-------|
| DashboardContainer    | 18    |
| DashboardHeader       | 34    |
| StatsCard             | 43    |
| ProjectCard           | 140   |
| QuickActions          | 70    |
| ThemeContext          | 48    |
| **Total New**         | **353** |

**Net Result**: 260 lines removed + 353 lines of shared components = **93 more lines total**, but with:
- ✅ Zero code duplication
- ✅ Easier maintenance
- ✅ Better consistency
- ✅ Higher reusability

## Directory Structure

```
web/src/
├── components/
│   ├── shared/                     # Shared reusable components
│   │   ├── index.ts               # Barrel export
│   │   ├── DashboardContainer.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── StatsCard.tsx
│   │   ├── ProjectCard.tsx
│   │   └── QuickActions.tsx
│   │
│   └── dashboards/                 # Role-specific dashboards
│       ├── AdminDashboard.tsx     # Uses shared components
│       ├── FacultyDashboard.tsx   # Uses shared components
│       ├── StudentDashboard.tsx   # Uses shared components
│       └── ReviewerDashboard.tsx  # Uses shared components
│
├── contexts/                       # React contexts
│   └── ThemeContext.tsx           # Global theme provider
│
├── config/                         # Configuration
│   └── dashboardThemes.ts         # Theme definitions
│
├── pages/                          # Page components
│   ├── DashboardPage.tsx          # Routes to role dashboards
│   └── PublicDashboardPage.tsx
│
└── App.tsx                         # App root with providers
```

## Extension Points

To add a new dashboard or themed page:

1. **Import the theme hook**:
```tsx
import { useTheme } from '../../contexts/ThemeContext';
```

2. **Use shared components**:
```tsx
import { DashboardContainer, DashboardHeader } from '../shared';
```

3. **Get theme and role info**:
```tsx
const { theme } = useTheme();
const roleInfo = getRoleInfo('your-role');
```

4. **Build your page**:
```tsx
<DashboardContainer theme={theme}>
  <DashboardHeader {...headerProps} />
  {/* Your custom content */}
</DashboardContainer>
```

## Best Practices

1. **Always use shared components** when building dashboard-like pages
2. **Access theme via useTheme()** instead of importing directly
3. **Follow the established pattern** for consistency
4. **Extend shared components** rather than duplicating code
5. **Add new shared components** when you find repeated patterns

---

**Architecture Status**: ✅ Fully refactored and optimized

