# Draft: React-to-Next.js Full Migration

## Requirements (confirmed)
- **Motivation**: Full benefits — SEO, performance, modern architecture, ecosystem
- **Strategy**: Full Rewrite — fresh Next.js app, port features systematically
- **Version**: Next.js 15 + App Router (latest stable with RSC, streaming)

## Current Architecture (researched)
- **Frontend**: React 19 + Vite 6 + MUI v7 + Zustand 5 + React Router v7 + Axios + Emotion
- **Backend**: Laravel 11 API + Sanctum + PostgreSQL 16 + Redis 7 + MinIO
- **Docker**: Nginx reverse proxy, PHP-FPM, Node, PostgreSQL, Redis, MinIO
- **Scale**: 134 TSX files, 35 pages, 9 feature domains, ~45K lines, 865-line API service
- **i18n**: Custom English/Arabic with RTL support (Emotion RTL plugin)
- **Auth**: Sanctum Bearer tokens, Zustand persist to localStorage, Axios interceptors
- **Routing**: React Router v7, slug-based project URLs (/pr/:slug)

## Codebase Inventory
### Pages (35 total)
- Public: 11 pages (explore, home, login, register, forgot-password, reset-password, verify-email, terms, privacy, project detail, test-auth)
- Protected: 8 pages (dashboard, bookmarks, profile, settings, notifications, project follow, repository, analytics)
- Role-protected: 11 pages (create project, edit project, evaluations, advisor projects, user mgmt, approvals, admin approvals, faculty pending, student projects, access control, milestone templates)

### Feature Domains (9)
- auth (11 components)
- projects (20 components)
- project-follow (11 components)
- repository (6 components)
- dashboards (6 components)
- bookmarks (2 components)
- notifications (2 components)
- milestones (4 components)
- access-control (8 components)

### Shared Infrastructure
- Layout: AppLayout, Header, PrimaryNav, MobileDrawer, etc. (9 files)
- Shared Components: ProjectCard, ProjectTable, ConfirmDialog, etc. (16 files)
- Custom Hooks: useVirtualization, useResponsive, useKeyboardNavigation, etc. (5 hooks)
- Zustand Stores: auth, repository, theme (3 stores)
- API Service: 865-line Axios singleton with all endpoints
- Types: Comprehensive TypeScript interfaces
- Utils: projectRoutes, projectHelpers, bookmarkCookies, errorHandling, accessibility

## Technical Decisions
- (pending) Project location — replace /web/ or create /web-next/?
- (pending) Rendering strategy per page type
- (pending) Keep Laravel API only vs add Next.js API routes
- (pending) MUI v7 + App Router setup (emotion/RSC)
- (pending) Docker infrastructure changes
- (pending) i18n approach (next-intl vs keep custom)
- (pending) Test strategy

## Open Questions
- Where to place the Next.js project?
- Rendering strategy preferences?
- API architecture decision?
- i18n strategy?
- Test infrastructure?

## Scope Boundaries
- INCLUDE: Full frontend rewrite to Next.js
- EXCLUDE: (pending) Backend changes? Docker changes?
