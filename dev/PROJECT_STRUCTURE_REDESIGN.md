# Project Structure Redesign Plan

## Executive Summary

This document outlines a comprehensive file structure redesign for the Fahras project (Laravel 11 API + React 18 TypeScript frontend). The redesign focuses on improving maintainability, scalability, and developer experience through better organization.

## Current Structure Analysis

### Issues Identified

1. **Root Level Clutter**: 30+ markdown documentation files scattered at root
2. **Test Scripts**: Test utilities scattered in `api/test/` instead of proper test structure
3. **Component Organization**: React components could be more feature-based
4. **Backend Services**: Services could be better organized by domain
5. **Utility Scripts**: Various utility scripts at root level need organization
6. **Documentation**: No clear documentation hierarchy

## Recommended New Structure

```
.
├── api/                                    # Laravel 11 API Backend
│   ├── app/
│   │   ├── Domains/                        # Domain-Driven Design structure
│   │   │   ├── Auth/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── AuthController.php
│   │   │   │   ├── Requests/
│   │   │   │   ├── Resources/
│   │   │   │   └── Services/
│   │   │   ├── Projects/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── ProjectController.php
│   │   │   │   │   ├── ProjectFollowController.php
│   │   │   │   │   └── ProjectApprovalController.php
│   │   │   │   ├── Models/
│   │   │   │   │   ├── Project.php
│   │   │   │   │   ├── ProjectActivity.php
│   │   │   │   │   ├── ProjectFlag.php
│   │   │   │   │   ├── ProjectFollower.php
│   │   │   │   │   └── ProjectMilestone.php
│   │   │   │   ├── Requests/
│   │   │   │   ├── Resources/
│   │   │   │   ├── Services/
│   │   │   │   │   ├── ProjectService.php
│   │   │   │   │   ├── ProjectMemberService.php
│   │   │   │   │   ├── ProjectVisibilityService.php
│   │   │   │   │   └── ProjectActivityService.php
│   │   │   │   └── Policies/
│   │   │   ├── Files/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── FileController.php
│   │   │   │   ├── Models/
│   │   │   │   │   └── File.php
│   │   │   │   └── Services/
│   │   │   ├── Milestones/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── MilestoneController.php
│   │   │   │   │   └── MilestoneTemplateController.php
│   │   │   │   ├── Models/
│   │   │   │   │   ├── MilestoneTemplate.php
│   │   │   │   │   ├── MilestoneTemplateItem.php
│   │   │   │   │   └── ProjectMilestone.php
│   │   │   │   └── Services/
│   │   │   │       └── MilestoneTemplateService.php
│   │   │   ├── Users/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── UserController.php
│   │   │   │   ├── Models/
│   │   │   │   │   ├── User.php
│   │   │   │   │   ├── Student.php
│   │   │   │   │   └── Faculty.php
│   │   │   │   └── Services/
│   │   │   ├── AccessControl/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── RoleController.php
│   │   │   │   ├── Models/
│   │   │   │   │   ├── Role.php
│   │   │   │   │   └── Permission.php
│   │   │   │   └── Services/
│   │   │   │       └── PermissionService.php
│   │   │   └── Notifications/
│   │   │       ├── Controllers/
│   │   │       │   └── NotificationController.php
│   │   │       ├── Models/
│   │   │       │   ├── Notification.php
│   │   │       │   └── Bookmark.php
│   │   │       └── Services/
│   │   ├── Http/
│   │   │   ├── Middleware/
│   │   │   │   └── OptionalAuthSanctum.php
│   │   │   └── Kernel.php
│   │   ├── Models/                        # Shared/base models (if any)
│   │   │   ├── Department.php
│   │   │   ├── Program.php
│   │   │   ├── Comment.php
│   │   │   └── Rating.php
│   │   ├── Providers/
│   │   ├── Constants/
│   │   │   ├── AdvisorRole.php
│   │   │   ├── ApprovalStatus.php
│   │   │   ├── MemberRole.php
│   │   │   └── ProjectStatus.php
│   │   └── Common/                        # Shared utilities
│   │       ├── Exceptions/
│   │       ├── Traits/
│   │       └── Helpers/
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php                       # Main API routes
│   │   └── domains/                      # Domain-specific route files (optional)
│   │       ├── projects.php
│   │       ├── auth.php
│   │       └── ...
│   ├── config/
│   ├── tests/                            # Proper test directory
│   │   ├── Feature/
│   │   └── Unit/
│   └── scripts/                          # Backend utility scripts
│       ├── add_faculty_users.php
│       ├── create_user.php
│       ├── cleanup_incomplete_users.php
│       └── ...
│
├── web/                                    # React 18 + TypeScript Frontend
│   └── src/
│       ├── assets/                         # Images, fonts, static files
│       │   └── images/
│       ├── components/
│       │   ├── ui/                         # Reusable UI primitives
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.tsx
│       │   │   └── ...
│       │   └── layout/                     # Layout components
│       │       ├── Header.tsx
│       │       ├── HeaderLogo.tsx
│       │       ├── LanguageSwitcher.tsx
│       │       └── PageTransition.tsx
│       ├── features/                       # Feature-based modules
│       │   ├── auth/
│       │   │   ├── api/
│       │   │   │   └── authApi.ts
│       │   │   ├── components/
│       │   │   │   └── ProtectedRoute.tsx
│       │   │   ├── hooks/
│       │   │   ├── pages/
│       │   │   │   ├── LoginPage.tsx
│       │   │   │   └── RegisterPage.tsx
│       │   │   ├── store.ts                # Auth store slice
│       │   │   └── types.ts
│       │   ├── projects/
│       │   │   ├── api/
│       │   │   │   └── projectApi.ts
│       │   │   ├── components/
│       │   │   │   ├── ProjectCard.tsx
│       │   │   │   ├── ProjectHeader.tsx
│       │   │   │   ├── ProjectSidebar.tsx
│       │   │   │   ├── ProjectFiles.tsx
│       │   │   │   ├── ProjectMetadata.tsx
│       │   │   │   ├── ProjectApprovalActions.tsx
│       │   │   │   ├── ProjectVisibilityToggle.tsx
│       │   │   │   ├── ProjectInteractions.tsx
│       │   │   │   ├── ProjectSearch.tsx
│       │   │   │   ├── ProjectTable.tsx
│       │   │   │   └── ProjectExportDialog.tsx
│       │   │   ├── hooks/
│       │   │   ├── pages/
│       │   │   │   ├── ProjectDetailPage.tsx
│       │   │   │   ├── CreateProjectPage.tsx
│       │   │   │   ├── EditProjectPage.tsx
│       │   │   │   ├── ExplorePage.tsx
│       │   │   │   └── GuestProjectDetailPage.tsx
│       │   │   ├── store.ts
│       │   │   └── types.ts
│       │   ├── project-follow/
│       │   │   ├── api/
│       │   │   ├── components/
│       │   │   │   ├── ActivityFeed.tsx
│       │   │   │   ├── ActivityItem.tsx
│       │   │   │   ├── MilestoneTimeline.tsx
│       │   │   │   ├── MilestoneTimelineItem.tsx
│       │   │   │   ├── ProgressTimeline.tsx
│       │   │   │   ├── ProjectFlags.tsx
│       │   │   │   ├── ProjectFlagDialog.tsx
│       │   │   │   ├── ProjectFollowers.tsx
│       │   │   │   ├── ProjectHealthScore.tsx
│       │   │   │   └── MilestoneDetailDialog.tsx
│       │   │   ├── pages/
│       │   │   │   └── ProjectFollowPage.tsx
│       │   │   └── types.ts
│       │   ├── repository/
│       │   │   ├── api/
│       │   │   │   └── repositoryApi.ts
│       │   │   ├── components/
│       │   │   │   ├── FileBrowser.tsx
│       │   │   │   ├── FileContentViewer.tsx
│       │   │   │   ├── RepositoryHeader.tsx
│       │   │   │   ├── RepositoryLayout.tsx
│       │   │   │   └── RepositoryTabs.tsx
│       │   │   ├── pages/
│       │   │   │   └── RepositoryPage.tsx
│       │   │   └── store.ts
│       │   ├── dashboards/
│       │   │   ├── components/
│       │   │   │   ├── AdminDashboard.tsx
│       │   │   │   ├── FacultyDashboard.tsx
│       │   │   │   ├── FacultyHomeDashboard.tsx
│       │   │   │   ├── ReviewerDashboard.tsx
│       │   │   │   └── StudentDashboard.tsx
│       │   │   └── pages/
│       │   │       └── DashboardPage.tsx
│       │   ├── access-control/
│       │   │   ├── components/
│       │   │   │   ├── AnalyticsTab.tsx
│       │   │   │   ├── PermissionSelector.tsx
│       │   │   │   ├── PermissionsTab.tsx
│       │   │   │   ├── RoleCard.tsx
│       │   │   │   ├── RoleDialog.tsx
│       │   │   │   ├── RolesTab.tsx
│       │   │   │   └── UsersTab.tsx
│       │   │   └── pages/
│       │   │       └── AccessControlPage.tsx
│       │   ├── milestones/
│       │   │   ├── components/
│       │   │   │   ├── ProgramTemplateSelector.tsx
│       │   │   │   ├── TemplateEditor.tsx
│       │   │   │   └── TemplateList.tsx
│       │   │   └── pages/
│       │   │       └── MilestoneTemplateConfigPage.tsx
│       │   ├── notifications/
│       │   │   ├── components/
│       │   │   │   └── NotificationCenter.tsx
│       │   │   ├── hooks/
│       │   │   │   └── useNotifications.ts
│       │   │   └── pages/
│       │   │       └── NotificationsPage.tsx
│       │   └── bookmarks/
│       │       ├── components/
│       │       │   └── BookmarkButton.tsx
│       │       ├── hooks/
│       │       │   └── useBookmark.ts
│       │       └── pages/
│       │           └── MyBookmarksPage.tsx
│       ├── lib/                            # Core libraries
│       │   ├── api.ts                      # Axios instance & interceptors
│       │   ├── i18n.ts                     # i18n setup
│       │   └── ...
│       ├── providers/                      # Global context providers
│       │   ├── LanguageProvider.tsx
│       │   ├── ThemeProvider.tsx
│       │   └── AppProviders.tsx
│       ├── store/                          # Global Zustand store
│       │   ├── index.ts                    # Store setup
│       │   ├── authStore.ts
│       │   └── repositoryStore.ts
│       ├── styles/                         # Global styles
│       │   ├── index.css
│       │   └── theme/
│       │       ├── guestTheme.ts
│       │       ├── professorTheme.ts
│       │       └── tvtcTheme.ts
│       ├── types/                          # Global/shared types
│       │   ├── index.ts
│       │   ├── milestones.ts
│       │   └── organization-config.ts
│       ├── utils/                          # Global utilities
│       │   ├── bookmarkCookies.ts
│       │   ├── errorHandling.ts
│       │   ├── projectHelpers.ts
│       │   └── projectRoutes.ts
│       ├── config/                         # Configuration files
│       │   ├── dashboardThemes.ts
│       │   └── organization.ts
│       ├── App.tsx
│       ├── index.tsx
│       └── vite-env.d.ts
│
├── docs/                                   # All documentation
│   ├── architecture/
│   │   ├── PROJECT_STRUCTURE.md
│   │   ├── API_DEBUG_GUIDE.md
│   │   └── FILE_DEBUG_GUIDE.md
│   ├── deployment/
│   │   ├── DOCKER.md
│   │   ├── PRODUCTION_DEPLOYMENT.md
│   │   ├── VITE_DEPLOYMENT_SUCCESS.md
│   │   └── FORGEJO_IMPLEMENTATION_GUIDE.md
│   ├── features/
│   │   ├── ADMIN_DASHBOARD.md
│   │   ├── PROJECT_STATUS_FEATURE.md
│   │   ├── MILESTONE_TEMPLATE_USER_FLOW.md
│   │   └── ...
│   ├── guides/
│   │   ├── CLAUDE.md
│   │   ├── QUICK_START.md
│   │   └── ...
│   ├── plans/
│   │   ├── UI-UX-Improvement-Plan.md
│   │   ├── FRONTEND_IMPLEMENTATION_PLAN.md
│   │   └── ...
│   └── screenshots/
│       └── ...
│
├── scripts/                                # Utility scripts
│   ├── backend/
│   │   ├── add_faculty_users.php
│   │   ├── create_user.php
│   │   └── ...
│   ├── frontend/
│   ├── docker/
│   │   ├── init-minio.sh
│   │   ├── install-cloud-storage.sh
│   │   └── ...
│   ├── deployment/
│   │   ├── deploy.sh
│   │   └── deploy.bat
│   └── setup/
│       ├── setup.sh
│       └── setup.bat
│
├── .docker/                                # Docker configuration
│   ├── api/
│   │   └── Dockerfile
│   ├── web/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── nginx.production.conf
│   └── docker-compose.yml
│
├── .github/                                 # GitHub workflows
│   └── workflows/
│       └── ci-cd.yml
│
├── .plan/                                  # Planning documents
│   ├── Project-Viewer-Layouts.md
│   └── routing-redesign-plan.md
│
├── docker-compose.yml
├── README.md                                # Main README
├── .gitignore
└── package.json                             # Root package.json (if monorepo)
```

## Migration Plan

### Phase 1: Root Level Reorganization (Low Risk)

**Estimated Time**: 1-2 hours

1. **Create new directories:**
   ```bash
   mkdir -p docs/{architecture,deployment,features,guides,plans,screenshots}
   mkdir -p scripts/{backend,frontend,docker,deployment,setup}
   mkdir -p .docker/{api,web,nginx}
   ```

2. **Move documentation files:**
   ```bash
   # Architecture docs
   mv API_DEBUG_GUIDE.md docs/architecture/
   mv FILE_DEBUG_GUIDE.md docs/architecture/
   mv PROJECT_ACCESS_CONTROL.md docs/architecture/
   
   # Deployment docs
   mv DOCKER.md docs/deployment/
   mv PRODUCTION_DEPLOYMENT.md docs/deployment/
   mv VITE_DEPLOYMENT_SUCCESS.md docs/deployment/
   mv FORGEJO_*.md docs/deployment/
   
   # Feature docs
   mv ADMIN_DASHBOARD*.md docs/features/
   mv PROJECT_STATUS_FEATURE.md docs/features/
   mv MILESTONE_TEMPLATE_USER_FLOW.md docs/features/
   
   # Plans
   mv UI-UX-Improvement-Plan.md docs/plans/
   mv FRONTEND_IMPLEMENTATION_PLAN.md docs/plans/
   mv GITHUB_LIKE_IMPLEMENTATION_PLAN.plan.md docs/plans/
   
   # Screenshots
   mv screenshots docs/screenshots/
   ```

3. **Move scripts:**
   ```bash
   # Backend scripts
   mv api/add_faculty_users.php scripts/backend/
   mv api/create_user.php scripts/backend/
   mv api/cleanup_incomplete_users.php scripts/backend/
   mv api/fix_user_passwords.php scripts/backend/
   
   # Docker scripts
   mv api/init-minio.* scripts/docker/
   mv api/install-cloud-storage.* scripts/docker/
   mv scripts/*.sh scripts/docker/  # Existing scripts
   
   # Deployment scripts
   mv deploy.* scripts/deployment/
   mv dev.* scripts/setup/
   ```

4. **Move Docker files:**
   ```bash
   mv api/Dockerfile .docker/api/
   mv Dockerfile.production .docker/
   mv nginx*.conf .docker/nginx/
   mv docker-entrypoint.sh .docker/
   ```

5. **Update references:**
   - Update `docker-compose.yml` to reference new Dockerfile locations
   - Update any scripts that reference moved files

### Phase 2: Backend Reorganization (Medium Risk)

**Estimated Time**: 4-6 hours

1. **Reorganize test directory:**
   ```bash
   # Move test scripts to proper test structure
   mkdir -p api/tests/Feature api/tests/Unit api/tests/Utilities
   mv api/test/* api/tests/Utilities/  # Keep test scripts for now
   ```

2. **Create domain structure (incremental):**
   ```bash
   # Start with one domain (Projects) as a pilot
   mkdir -p api/app/Domains/Projects/{Controllers,Models,Requests,Resources,Services,Policies}
   ```

3. **Migrate Projects domain:**
   - Move `ProjectController.php`, `ProjectFollowController.php` to `Domains/Projects/Controllers/`
   - Move Project-related models to `Domains/Projects/Models/`
   - Move Project services to `Domains/Projects/Services/`
   - Update namespaces in all moved files
   - Update `routes/api.php` to use new controller paths

4. **Repeat for other domains:**
   - Auth
   - Files
   - Milestones
   - Users
   - AccessControl
   - Notifications

5. **Update autoloading:**
   - Verify `composer.json` PSR-4 autoloading works with new structure
   - Run `composer dump-autoload`

### Phase 3: Frontend Reorganization (Medium-High Risk)

**Estimated Time**: 6-8 hours

1. **Create new base structure:**
   ```bash
   cd web/src
   mkdir -p components/{ui,layout}
   mkdir -p features/{auth,projects,project-follow,repository,dashboards,access-control,milestones,notifications,bookmarks}
   mkdir -p lib providers styles/theme
   ```

2. **Organize shared components:**
   - Move reusable UI components to `components/ui/`
   - Move layout components to `components/layout/`

3. **Migrate features incrementally:**
   - Start with one feature (e.g., `projects`)
   - Move feature-specific components, pages, API calls, hooks, and types
   - Update all import paths
   - Test thoroughly before moving to next feature

4. **Update TypeScript paths:**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"],
         "@/components/*": ["src/components/*"],
         "@/features/*": ["src/features/*"],
         "@/lib/*": ["src/lib/*"],
         "@/utils/*": ["src/utils/*"]
       }
     }
   }
   ```

5. **Update Vite config:**
   ```typescript
   // vite.config.ts
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     }
   }
   ```

### Phase 4: Cleanup and Documentation

**Estimated Time**: 2-3 hours

1. **Remove old directories** (after verification)
2. **Update all documentation** with new paths
3. **Update CI/CD pipelines** if they reference old paths
4. **Create migration guide** for team members

## Benefits of New Structure

### Backend Benefits

1. **Domain-Driven Design**: Code organized by business domain makes it easier to understand and maintain
2. **Better Testability**: Clear separation allows for better unit and integration testing
3. **Scalability**: Easy to add new domains without affecting existing code
4. **Team Collaboration**: Different developers can work on different domains with minimal conflicts

### Frontend Benefits

1. **Feature-Based Organization**: All code for a feature is co-located, making it easier to find and modify
2. **Clear Separation**: UI components, layout, and features are clearly separated
3. **Better Code Reuse**: Shared components are easily identifiable
4. **Improved Developer Experience**: Path aliases make imports cleaner and more maintainable

### Overall Benefits

1. **Reduced Cognitive Load**: Developers can focus on one feature/domain at a time
2. **Easier Onboarding**: New developers can understand the structure quickly
3. **Better Maintainability**: Changes are localized to specific features/domains
4. **Improved Documentation**: Documentation is organized and easy to find

## Breaking Changes and Considerations

### Critical Breaking Changes

1. **Backend Namespaces**: All moved classes need namespace updates and all `use` statements must be updated
2. **Frontend Imports**: All import paths will break and need updating
3. **Docker Configuration**: `docker-compose.yml` needs updates for new Dockerfile locations
4. **CI/CD Pipelines**: Any scripts referencing old paths need updates

### Migration Strategy

1. **Create a feature branch**: `git checkout -b refactor/project-structure`
2. **Incremental migration**: Do one phase at a time, test thoroughly
3. **Update tests first**: Ensure tests pass before and after each phase
4. **Document changes**: Keep a log of all moved files and updated paths
5. **Team communication**: Coordinate with team to avoid conflicts

### Rollback Plan

1. Keep old structure in git history
2. Tag current state before migration: `git tag pre-refactor`
3. Each phase should be a separate commit for easy rollback
4. Test each phase before proceeding

## Implementation Checklist

### Phase 1: Root Level
- [ ] Create new directory structure
- [ ] Move documentation files
- [ ] Move utility scripts
- [ ] Move Docker files
- [ ] Update docker-compose.yml
- [ ] Test Docker setup

### Phase 2: Backend
- [ ] Reorganize test directory
- [ ] Create domain structure
- [ ] Migrate Projects domain
- [ ] Update namespaces
- [ ] Update routes
- [ ] Run tests
- [ ] Migrate remaining domains

### Phase 3: Frontend
- [ ] Create new base structure
- [ ] Organize shared components
- [ ] Migrate features incrementally
- [ ] Update TypeScript paths
- [ ] Update Vite config
- [ ] Test each feature migration
- [ ] Update all imports

### Phase 4: Cleanup
- [ ] Remove old directories
- [ ] Update documentation
- [ ] Update CI/CD
- [ ] Create migration guide
- [ ] Final testing
- [ ] Code review
- [ ] Merge to main

## Timeline Estimate

- **Phase 1**: 1-2 hours
- **Phase 2**: 4-6 hours
- **Phase 3**: 6-8 hours
- **Phase 4**: 2-3 hours
- **Total**: 13-19 hours

## Next Steps

1. Review this plan with the team
2. Create feature branch
3. Start with Phase 1 (lowest risk)
4. Test thoroughly after each phase
5. Document any deviations from plan
6. Merge when all phases complete and tested
