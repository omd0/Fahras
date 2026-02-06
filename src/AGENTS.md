# src/ — FRONTEND & SHARED CODE

React 19 + Next.js 16 App Router + MUI v7 + Zustand. All pages are `'use client'`. Feature-based architecture.

## STRUCTURE

```
src/
├── app/                # Next.js App Router pages + API routes
│   ├── api/            # 52 API route handlers (SEE api/AGENTS.md)
│   ├── pr/[slug]/      # Project detail (page, edit, follow, code)
│   ├── dashboard/      # Main dashboard
│   ├── explore/        # Project discovery with search + filters
│   ├── access-control/ # RBAC admin
│   ├── analytics/      # Stats dashboards
│   ├── login/          # Auth pages (login, register, forgot-password, verify-email)
│   └── ...             # 20+ page routes
├── features/           # Domain modules — self-contained
│   ├── auth/           # store.ts (Zustand), components/ (ProtectedRoute, OTP, etc.)
│   ├── projects/       # components/ (ProjectFiles, ProjectSidebar, MemberManagement)
│   ├── dashboards/     # components/ (StudentDashboard, AdminDashboard, FacultyDashboard)
│   ├── milestones/     # components/ (TemplateEditor, TemplateList)
│   ├── notifications/  # hooks/ (useNotifications)
│   └── bookmarks/      # hooks/ (useBookmark), components/ (BookmarkButton)
├── components/         # Shared UI
│   ├── layout/         # AppLayout, Header, PrimaryNav, MobileDrawer, ThemeToggle
│   ├── explore/        # ProjectCard, SmartProjectGrid, SavedSearches
│   └── shared/         # Breadcrumb, CommandPalette, ConfirmDialog, DragDropFileUpload,
│                       # ErrorBoundary, HeroCarousel, SkipLink, StatsCard, TVTCBranding
├── lib/                # Core services
│   ├── api.ts          # Centralized API client (50+ typed endpoints via fetch)
│   ├── auth.ts         # NextAuth v5 config (Credentials provider + Prisma)
│   ├── auth-helpers.ts # requireAuth(), requireRole(), hashPassword()
│   ├── api-utils.ts    # userWithRolesInclude, formatUserResponse(), handleApiError()
│   ├── prisma.ts       # PrismaClient singleton
│   └── s3.ts           # S3/MinIO upload/download/presign, RFC 5987 filenames
├── middleware/         # auth.ts (withAuth/withRole/withOptionalAuth), rbac.ts
├── hooks/             # useResponsive, useUnsavedChanges, useVirtualization,
│                      # useKeyboardNavigation, useFocusTrap, useSwipeGesture
├── providers/         # Providers.tsx chains: Language → Emotion → MUI → Theme
├── constants/         # permissions.ts, project-status.ts, approval-status.ts, member-role.ts
├── config/            # organization.ts (loads YAML branding), dashboardThemes.ts
├── styles/            # theme/ (fahrasTheme.ts, colorPalette.ts), designTokens.ts, accessibility.css
├── store/             # themeStore.ts (Zustand + persist)
├── types/             # index.ts (all domain types), organization-config.ts
├── utils/             # projectRoutes.ts, errorHandling.ts, projectHelpers.ts, bookmarkCookies.ts
└── i18n/              # translations.ts
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add page route | `app/{path}/page.tsx` | Add `'use client'` directive |
| Add feature | `features/{name}/` | Create `components/`, optionally `hooks/`, `store.ts` |
| Add shared component | `components/shared/` | Or `layout/` / `explore/` by domain |
| Add API endpoint call | `lib/api.ts` | Add to `apiService` or domain-specific export |
| Add hook | `hooks/` | Export via `hooks/index.ts` barrel |
| Add permission code | `constants/permissions.ts` | Format: `{domain}.{action}` |
| Modify auth | `lib/auth.ts` + `middleware/auth.ts` | Auth config vs route wrappers |
| Modify theme | `styles/theme/fahrasTheme.ts` | MUI v7 `createTheme` |
| Add type | `types/index.ts` | All domain types live here |

## FEATURE MODULE PATTERN

Each feature mirrors this structure (not all dirs required):

```
features/{name}/
├── components/     # Feature-specific React components
├── hooks/          # Feature-specific custom hooks
└── store.ts        # Zustand store (only auth has one currently)
```

Features import from `@/lib/api.ts` for backend calls, `@/types` for interfaces, `@/constants/` for enums.

## CONVENTIONS

**All pages are `'use client'`** — No Server Components currently. Every page.tsx starts with `'use client'`.

**API calls** — Use `apiService` from `@/lib/api.ts`, never raw `fetch`:
```tsx
import { apiService } from '@/lib/api';
const projects = await apiService.getProjects(filters);
```

**Auth state** — Zustand store persisted to `localStorage` key `auth-storage`:
```tsx
import { useAuthStore } from '@/features/auth/store';
const { user, isAuthenticated, login, logout } = useAuthStore();
```

**Route protection** — Client-side via feature components:
```tsx
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/features/auth/components/RoleProtectedRoute';
```

**Error handling** — `getErrorMessage()` from `@/utils/errorHandling`:
```tsx
import { getErrorMessage } from '@/utils/errorHandling';
catch (error) { setError(getErrorMessage(error)); }
```

**Hooks barrel** — Import shared hooks from `@/hooks`:
```tsx
import { useResponsive, useUnsavedChanges } from '@/hooks';
```

## ANTI-PATTERNS

- **NEVER add Server Components** — Current architecture is fully client-rendered
- **NEVER create Zustand stores outside `features/` or `store/`** — Centralized state only
- **NEVER call raw `fetch`** — Use `apiService` from `@/lib/api.ts`
- See root AGENTS.md for project-wide anti-patterns (Grid syntax, imports, fallbacks)
