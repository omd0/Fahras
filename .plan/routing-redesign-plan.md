# Project Routing System Redesign Plan

## Overview
Redesign the Fahras routing system to use alphanumeric slugs instead of numeric IDs for project URLs.

**Current URLs:**
- `/projects/:id` (guest view)
- `/dashboard/projects/:id` (authenticated view)
- `/projects/:id/edit`
- `/projects/:id/follow`
- `/projects/:id/code`

**New URLs:**
- `/pr/:slug` (unified view for both guest and authenticated)
- `/pr/:slug/edit`
- `/pr/:slug/follow`
- `/pr/:slug/code`
- `/explore` (remains unchanged)

## Goals
1. Generate unique alphanumeric slugs for all projects (format: e.g., "244k3n")
2. Change all project routes from `/projects/:id` to `/pr/:slug`
3. Support both guest and authenticated users on the same `/pr/:slug` route
4. Update all frontend components that generate project URLs
5. Update backend API to accept and resolve slugs
6. Maintain backward compatibility during migration

---

## Implementation Steps

### Phase 1: Backend - Database & Model Changes

#### 1.1. Create Database Migration
**File:** `api/database/migrations/YYYY_MM_DD_HHMMSS_add_slug_to_projects_table.php`

```php
public function up()
{
    Schema::table('projects', function (Blueprint $table) {
        $table->string('slug', 20)->nullable()->after('id');
        $table->unique('slug');
        $table->index('slug'); // For faster lookups
    });
}
```

#### 1.2. Generate Slugs for Existing Projects
**File:** `api/database/migrations/YYYY_MM_DD_HHMMSS_populate_project_slugs.php`

Create a data migration to generate slugs for all existing projects using the slug generation algorithm.

#### 1.3. Update Project Model
**File:** `api/app/Models/Project.php`

Add slug generation logic:
- Add `slug` to `$fillable` array
- Create `generateSlug()` method to generate unique alphanumeric slugs
- Override `creating` event to auto-generate slug on project creation
- Add `getRouteKeyName()` method to return 'slug' for route model binding
- Add `resolveRouteBinding()` method to resolve by slug instead of ID

**Slug Generation Algorithm:**
- Use project ID + random characters to create unique 6-character alphanumeric slug
- Example format: base36 encoding of ID + random suffix
- Ensure uniqueness by checking database before saving

#### 1.4. Update Route Model Binding
**File:** `api/routes/api.php`

Laravel's implicit route model binding will automatically use `getRouteKeyName()` from the Project model, so routes like:
```php
Route::get('/projects/{project}', ...)
```

Will now resolve projects by slug instead of ID. No route changes needed in this file for model binding behavior.

However, we should update route paths to use the new `/pr/` prefix where applicable, but this depends on whether we want to maintain `/projects/` endpoints for API consistency or change them to `/pr/`. For the API, it's recommended to keep `/projects/` as the resource name and only change frontend routes to `/pr/`.

---

### Phase 2: Backend - API Endpoint Updates

#### 2.1. No Controller Changes Needed
**File:** `api/app/Http/Controllers/ProjectController.php`

Since we're using route model binding, all methods like:
```php
public function show(Project $project)
```

Will automatically receive the project resolved by slug. No changes needed to controller methods.

#### 2.2. API Response Updates
Ensure all API responses include the `slug` field in project data:
- The `slug` field should be included in JSON responses
- Frontend will use this slug for generating URLs

---

### Phase 3: Frontend - Utility Function Creation

#### 3.1. Create Project URL Utility
**File:** `web/src/utils/projectRoutes.ts` (new file)

Create a centralized utility for generating project URLs:

```typescript
export const projectRoutes = {
  // Main project view (unified for guest and authenticated users)
  detail: (slug: string) => `/pr/${slug}`,

  // Project subroutes
  edit: (slug: string) => `/pr/${slug}/edit`,
  follow: (slug: string) => `/pr/${slug}/follow`,
  code: (slug: string) => `/pr/${slug}/code`,
  codeFile: (slug: string, filePath: string) => `/pr/${slug}/code/${encodeURIComponent(filePath)}`,

  // Other routes
  explore: () => '/explore',
  create: () => '/pr/create',
};

// Helper to get slug from project object
export const getProjectSlug = (project: { slug?: string; id?: number }): string => {
  return project.slug || String(project.id); // Fallback to ID during migration
};
```

#### 3.2. Update Type Definitions
**File:** `web/src/types/index.ts`

Add `slug` field to the Project interface:

```typescript
export interface Project {
  id: number;
  slug: string; // Add this field
  // ... rest of fields
}
```

---

### Phase 4: Frontend - Route Configuration Updates

#### 4.1. Update App.tsx Routes
**File:** `web/src/App.tsx`

Replace project routes:

```typescript
// OLD:
<Route path="/projects/:id" element={<GuestProjectDetailPage />} />
<Route path="/dashboard/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
<Route path="/projects/:id/edit" element={...} />
<Route path="/projects/:id/follow" element={...} />
<Route path="/projects/:id/code/*" element={...} />

// NEW:
<Route path="/pr/create" element={<RoleProtectedRoute restrictedRoles={['reviewer']}><CreateProjectPage /></RoleProtectedRoute>} />
<Route path="/pr/:slug" element={<ProjectDetailPage />} /> {/* Unified route */}
<Route path="/pr/:slug/edit" element={<RoleProtectedRoute restrictedRoles={['reviewer']}><EditProjectPage /></RoleProtectedRoute>} />
<Route path="/pr/:slug/follow" element={<ProtectedRoute><ProjectFollowPage /></ProtectedRoute>} />
<Route path="/pr/:slug/code/*" element={<ProtectedRoute><RepositoryPage /></ProtectedRoute>} />
<Route path="/pr/:slug/code" element={<ProtectedRoute><RepositoryPage /></ProtectedRoute>} />
```

**Key Changes:**
- Unified `/pr/:slug` route for both guests and authenticated users (removes `/dashboard/projects/:slug`)
- ProjectDetailPage will handle authentication state internally
- Parameter name changes from `:id` to `:slug`
- Move `/projects/create` to `/pr/create`

#### 4.2. Update ProjectDetailPage
**File:** `web/src/pages/ProjectDetailPage.tsx`

Update to:
- Use `slug` parameter instead of `id`
- Handle both authenticated and guest users on same route
- Call API with slug instead of numeric ID
- Remove dependency on `/dashboard/projects/` route

```typescript
const { slug } = useParams<{ slug: string }>();

useEffect(() => {
  if (slug) {
    fetchProject(slug); // API call with slug, not parseInt(id)
  }
}, [slug]);
```

#### 4.3. Remove GuestProjectDetailPage
**File:** `web/src/pages/GuestProjectDetailPage.tsx`

This page becomes redundant since ProjectDetailPage will handle both cases. Can be deleted or archived.

---

### Phase 5: Frontend - Component URL Generation Updates

Update all components that generate project URLs to use the new utility function.

#### 5.1. ProjectCard Component
**File:** `web/src/components/shared/ProjectCard.tsx`

```typescript
import { projectRoutes, getProjectSlug } from '../../utils/projectRoutes';

// OLD:
const getProjectRoute = () => {
  if (user) {
    return `/dashboard/projects/${project.id}`;
  }
  return `/projects/${project.id}`;
};

// NEW:
const getProjectRoute = () => {
  return projectRoutes.detail(getProjectSlug(project));
};
```

#### 5.2. ProjectGrid Component
**File:** `web/src/components/explore/ProjectGrid.tsx`

```typescript
import { projectRoutes, getProjectSlug } from '../../utils/projectRoutes';

// OLD:
onClick={() => navigate(`/projects/${project.id}`)}

// NEW:
onClick={() => navigate(projectRoutes.detail(getProjectSlug(project)))}
```

#### 5.3. ProjectHeader Component
**File:** `web/src/components/project/ProjectHeader.tsx`

```typescript
import { projectRoutes, getProjectSlug } from '../../utils/projectRoutes';

// Update navigation links:
navigate(projectRoutes.edit(getProjectSlug(project)))
navigate(projectRoutes.follow(getProjectSlug(project)))
```

#### 5.4. NotificationCenter Component
**File:** `web/src/components/NotificationCenter.tsx`

```typescript
import { projectRoutes, getProjectSlug } from '../../utils/projectRoutes';

// OLD:
navigate(`/dashboard/projects/${notification.project.id}`)

// NEW:
navigate(projectRoutes.detail(getProjectSlug(notification.project)))
```

#### 5.5. Dashboard Components
**Files:**
- `web/src/components/dashboards/StudentDashboard.tsx`
- `web/src/components/dashboards/FacultyDashboard.tsx`
- `web/src/components/dashboards/AdminDashboard.tsx`

Update all project link generation to use the utility function.

#### 5.6. Other Components
**Files to update:**
- `web/src/components/repository/RepositoryTabs.tsx`
- `web/src/pages/EditProjectPage.tsx`
- `web/src/pages/RepositoryPage.tsx`
- `web/src/pages/ProjectFollowPage.tsx`
- `web/src/pages/HomePage.tsx`
- `web/src/pages/NotificationsPage.tsx`

---

### Phase 6: Frontend - API Service Updates

#### 6.1. Update API Service Methods
**File:** `web/src/services/api.ts`

Update methods to accept slug parameter instead of ID:

```typescript
// OLD:
async getProject(id: number): Promise<{ project: Project }> {
  const response: AxiosResponse = await this.api.get(`/projects/${id}`);
  return response.data;
}

// NEW:
async getProject(slugOrId: string | number): Promise<{ project: Project }> {
  const response: AxiosResponse = await this.api.get(`/projects/${slugOrId}`);
  return response.data;
}

// Similar updates for:
// - getProjectFiles(slugOrId)
// - deleteProject(slugOrId)
// - updateProject(slugOrId, data)
// - All other project-related methods
```

**Note:** The API will accept both slugs and IDs during migration period for backward compatibility.

---

### Phase 7: Testing & Migration

#### 7.1. Database Migration Order
1. Run migration to add `slug` column (nullable)
2. Run data migration to populate slugs for existing projects
3. Verify all projects have unique slugs
4. (Optional in future) Make `slug` column NOT NULL

#### 7.2. API Backward Compatibility
During migration, the API should accept both numeric IDs and slugs:
```php
public function resolveRouteBinding($value, $field = null)
{
    // Try slug first
    $project = $this->where('slug', $value)->first();

    // Fallback to ID if numeric
    if (!$project && is_numeric($value)) {
        $project = $this->find($value);
    }

    return $project ?: abort(404);
}
```

#### 7.3. Frontend Deployment Strategy
1. Deploy backend with slug support first
2. Verify API endpoints work with slugs
3. Deploy frontend with new routing
4. Monitor for errors and fix edge cases
5. Update any external links/bookmarks

#### 7.4. Testing Checklist
- [ ] All projects have unique slugs generated
- [ ] API resolves projects by slug correctly
- [ ] API fallback to ID works during migration
- [ ] Frontend navigates to correct project pages
- [ ] Guest users can view public projects via `/pr/:slug`
- [ ] Authenticated users see enhanced features on `/pr/:slug`
- [ ] Edit, Follow, and Code routes work with slugs
- [ ] Repository file paths work correctly
- [ ] Notifications link to correct project pages
- [ ] Bookmarks work with new URLs
- [ ] All dashboard links use new routing
- [ ] Browser back button works correctly
- [ ] Search and explore pages link correctly

---

## File Modification Summary

### Backend Files to Create/Modify:
1. **CREATE**: `api/database/migrations/YYYY_MM_DD_HHMMSS_add_slug_to_projects_table.php`
2. **CREATE**: `api/database/migrations/YYYY_MM_DD_HHMMSS_populate_project_slugs.php`
3. **MODIFY**: `api/app/Models/Project.php` (add slug generation and route binding)

### Frontend Files to Create/Modify:
1. **CREATE**: `web/src/utils/projectRoutes.ts` (new utility)
2. **MODIFY**: `web/src/types/index.ts` (add slug to Project interface)
3. **MODIFY**: `web/src/App.tsx` (update route configuration)
4. **MODIFY**: `web/src/pages/ProjectDetailPage.tsx` (use slug, handle both guest/auth)
5. **DELETE**: `web/src/pages/GuestProjectDetailPage.tsx` (no longer needed)
6. **MODIFY**: `web/src/services/api.ts` (accept slugs in methods)
7. **MODIFY**: Components with project URL generation (15+ files)

### Total Files: ~25 files to create/modify/delete

---

## Slug Generation Algorithm Details

**Format:** 6-character alphanumeric string
**Example:** "244k3n", "1a2b3c", "xyz123"

**Algorithm:**
```php
protected function generateSlug(): string
{
    do {
        // Combine base36-encoded ID with random suffix
        $base = base_convert($this->id, 10, 36);
        $random = substr(md5(uniqid(rand(), true)), 0, 6 - strlen($base));
        $slug = strtolower($base . $random);

        // Ensure exactly 6 characters
        $slug = substr(str_pad($slug, 6, '0'), 0, 6);

        // Check uniqueness
        $exists = static::where('slug', $slug)->exists();
    } while ($exists);

    return $slug;
}
```

**Properties:**
- Short and memorable
- URL-safe characters only
- Unique constraint enforced at database level
- Collision detection with retry logic

---

## Benefits of This Design

1. **Clean URLs**: `/pr/244k3n` instead of `/dashboard/projects/123`
2. **Unified Route**: Same URL for guest and authenticated users
3. **Better UX**: Shorter, more shareable URLs
4. **Future-proof**: Easy to change slug algorithm without breaking URLs
5. **SEO-friendly**: More readable than numeric IDs
6. **Consistency**: All project routes under `/pr/` prefix

---

## Potential Issues & Solutions

### Issue 1: Slug Collision
**Solution:** Database unique constraint + retry logic in generation algorithm

### Issue 2: Old URLs in bookmarks/links
**Solution:** Maintain backward compatibility in API to accept numeric IDs

### Issue 3: SEO impact from URL change
**Solution:** Implement 301 redirects from old URLs to new URLs (optional)

### Issue 4: Slug generation for existing projects
**Solution:** Data migration script with verification step

---

## Next Steps

1. **User Approval**: Get confirmation on slug format and routing structure
2. **Implementation**: Follow phases 1-7 in order
3. **Testing**: Thorough testing after each phase
4. **Deployment**: Backend first, then frontend
5. **Monitoring**: Watch for errors and user feedback

---

## Questions for User (if any)

1. Should we implement 301 redirects from old URLs to new ones?
2. Do you want a different slug format (longer, shorter, different characters)?
3. Should the create project route be `/pr/create` or `/pr/new`?
4. Any specific concerns about backward compatibility?
