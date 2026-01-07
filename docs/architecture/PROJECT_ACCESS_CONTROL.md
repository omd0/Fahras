# Project Access Control Documentation

## Overview

This document describes how access to projects is controlled in the application. The system implements a multi-layered access control mechanism based on user roles, project ownership, project approval status, and user relationships (members/advisors).

---

## 1. Project Visibility Rules

### Project Approval Status

Projects have an `admin_approval_status` field with three possible values:
- **`pending`** - Awaiting admin approval (default for new projects)
- **`approved`** - Approved by admin, visible to public
- **`hidden`** - Hidden from public view by admin

### Visibility Matrix

| User Type | Approved Projects | Pending Projects | Hidden Projects | Own Projects (Any Status) |
|-----------|------------------|------------------|-----------------|---------------------------|
| **Guest (Unauthenticated)** | ✅ Visible | ❌ Not Visible | ❌ Not Visible | N/A |
| **Student** | ✅ Visible | ❌ Not Visible | ❌ Not Visible | ✅ Always Visible |
| **Faculty** | ✅ Visible | ❌ Not Visible | ❌ Not Visible | ✅ Always Visible |
| **Admin** | ✅ Visible | ✅ Visible | ✅ Visible | ✅ Always Visible |
| **Reviewer** | ✅ Visible | ✅ Visible | ✅ Visible | ✅ Always Visible |

### Implementation

**Location**: `api/app/Http/Controllers/ProjectController.php`

```php
// Project listing (index)
if (!$user) {
    // Unauthenticated users: only see approved projects
    $query->where('admin_approval_status', 'approved');
} elseif ($user->hasRole('admin') || $user->hasRole('reviewer')) {
    // Admin and Reviewer: can see all projects (including hidden ones)
    // No additional filtering needed
} else {
    // Regular users: can see approved projects and their own projects
    $query->where(function ($q) use ($user) {
        $q->where('admin_approval_status', 'approved')
          ->orWhere('created_by_user_id', $user->id);
    });
}
```

**Special Case - "My Projects"**:
When requesting `?my_projects=true`, visibility rules are bypassed and users see all their own projects regardless of approval status.

---

## 2. Project Viewing (Read Access)

### Public Project Details

**Endpoint**: `GET /api/projects/{id}`

**Access Rules**:
- **Guests**: Can view approved projects only
- **Regular Users**: Can view approved projects + their own projects (any status)
- **Admin/Reviewer**: Can view all projects (any status)

**Implementation**:
```php
public function show(Project $project)
{
    $user = request()->user();
    
    if (!$user) {
        // Unauthenticated: only approved projects
        if ($project->admin_approval_status !== 'approved') {
            return response()->json(['message' => 'Project not found'], 404);
        }
    } elseif (!$user->hasRole('admin') && !$user->hasRole('reviewer')) {
        // Regular users: approved projects + their own
        if ($project->admin_approval_status !== 'approved' && 
            $project->created_by_user_id !== $user->id) {
            return response()->json(['message' => 'Project not found'], 404);
        }
    }
    // Admin/Reviewer: can see all projects
}
```

### Analytics Access

**Endpoint**: `GET /api/projects/analytics`

**Access Rules**:
- **Guests**: Only approved projects included in analytics
- **Regular Users**: Approved projects + their own projects + projects where they are members/advisors
- **Admin/Reviewer**: All projects included

**Implementation**:
```php
// Regular users can see analytics for:
$query->where(function ($q) use ($user) {
    $q->where('admin_approval_status', 'approved')
      ->orWhere('created_by_user_id', $user->id)
      ->orWhereHas('members', function ($memberQuery) use ($user) {
          $memberQuery->where('user_id', $user->id);
      })
      ->orWhereHas('advisors', function ($advisorQuery) use ($user) {
          $advisorQuery->where('user_id', $user->id);
      });
});
```

---

## 3. Project Creation

### Who Can Create Projects

**Endpoint**: `POST /api/projects`

**Access Rules**:
- ✅ **Students**: Can create projects
- ✅ **Faculty**: Can create projects
- ✅ **Admin**: Can create projects
- ❌ **Reviewers**: Cannot create projects (restricted in frontend)

**Frontend Protection**:
```tsx
<Route
  path="/projects/create"
  element={
    <RoleProtectedRoute restrictedRoles={['reviewer']}>
      <CreateProjectPage />
    </RoleProtectedRoute>
  }
/>
```

**Default Status**: New projects are created with `admin_approval_status = 'pending'`

---

## 4. Project Modification (Update/Delete)

### Update Access

**Endpoint**: `PUT /api/projects/{id}`

**Access Rules**:
- ✅ **Project Creator**: Can update their own projects
- ❌ **Project Members**: Cannot update (even if they are members)
- ❌ **Project Advisors**: Cannot update
- ❌ **Other Users**: Cannot update

**Implementation**:
```php
public function update(Request $request, Project $project)
{
    // Only project creator can update
    if ($project->created_by_user_id !== $request->user()->id) {
        return response()->json([
            'message' => 'Unauthorized to update this project'
        ], 403);
    }
    // ... update logic
}
```

**Frontend Protection**:
```tsx
const canEdit = user?.id === project.created_by_user_id && 
                !user?.roles?.some(role => role.name === 'reviewer');
```

### Delete Access

**Endpoint**: `DELETE /api/projects/{id}`

**Access Rules**:
- ✅ **Project Creator**: Can delete their own projects
- ❌ **All Others**: Cannot delete

**Implementation**:
```php
public function destroy(Project $project)
{
    // Only project creator can delete
    if ($project->created_by_user_id !== request()->user()->id) {
        return response()->json([
            'message' => 'Unauthorized to delete this project'
        ], 403);
    }
    $project->delete();
}
```

---

## 5. Project Approval (Admin Only)

### Approve Project

**Endpoint**: `POST /api/projects/{id}/approve`

**Access Rules**:
- ✅ **Admin Only**: Requires admin role
- **Effect**: Sets `admin_approval_status = 'approved'` and makes all project files public

**Implementation**:
```php
public function approveProject(Request $request, Project $project)
{
    if (!$request->user()->hasRole('admin')) {
        return response()->json([
            'message' => 'Unauthorized. Admin access required.'
        ], 403);
    }
    
    $project->update([
        'admin_approval_status' => 'approved',
        'approved_by_user_id' => $request->user()->id,
        'approved_at' => now(),
    ]);
    
    // Make all project files public
    $project->files()->update(['is_public' => true]);
}
```

### Hide Project

**Endpoint**: `POST /api/projects/{id}/hide`

**Access Rules**:
- ✅ **Admin Only**: Requires admin role
- **Effect**: Sets `admin_approval_status = 'hidden'` and makes all project files private

### Toggle Visibility

**Endpoint**: `POST /api/projects/{id}/toggle-visibility`

**Access Rules**:
- ✅ **Admin Only**: Requires admin role
- **Effect**: Toggles between `approved` and `hidden` status

---

## 6. Project Members Access

### Member Roles

Projects can have members with two roles:
- **`LEAD`** - Project lead/leader
- **`MEMBER`** - Regular project member

### Member Management

**Endpoints**:
- `GET /api/projects/{id}/members` - List members (authenticated users only)
- `POST /api/projects/{id}/members` - Add member (project creator only)
- `PUT /api/projects/{id}/members/{user}` - Update member role (project creator only)
- `DELETE /api/projects/{id}/members/{user}` - Remove member (project creator only)

**Access Rules**:
- ✅ **Project Creator**: Can add, update, and remove members
- ❌ **Members**: Cannot manage other members
- ❌ **Advisors**: Cannot manage members

**Note**: Members can view projects they're part of in analytics, but they cannot modify the project itself.

---

## 7. Project Advisors Access

### Advisor Roles

Projects can have advisors with three roles:
- **`MAIN`** - Main advisor/supervisor
- **`CO_ADVISOR`** - Co-advisor
- **`REVIEWER`** - Reviewer advisor

### Advisor Management

**Access Rules**:
- ✅ **Project Creator**: Can add, update, and remove advisors
- ❌ **Advisors**: Cannot manage other advisors or modify the project

**Note**: Advisors can view projects they're advising in analytics, but they cannot modify the project itself.

---

## 8. Project Files Access

### File Upload

**Endpoint**: `POST /api/projects/{id}/files`

**Access Rules**:
- ✅ **Project Creator**: Can upload files
- ✅ **Authenticated Users**: Can upload files to any project (if they have access to view it)
- **Note**: Files can be marked as `is_public` or private during upload

### File Listing

**Endpoint**: `GET /api/projects/{id}/files`

**Access Rules**:
- ✅ **Everyone**: Can list files (no access control)
- **Note**: File visibility is controlled at download time

### File Download

**Endpoint**: `GET /api/files/{id}/download`

**Access Rules**:
- ✅ **Everyone**: Can download files (no access control currently)
- **Note**: Files marked as `is_public = true` are accessible to all
- **Note**: When a project is approved, all its files become public automatically

### File Deletion

**Endpoint**: `DELETE /api/files/{id}`

**Access Rules**:
- ✅ **Project Creator**: Can delete any file in their project
- ✅ **File Uploader**: Can delete files they uploaded
- ❌ **Others**: Cannot delete files

**Implementation**:
```php
public function destroy(File $file)
{
    // Only project creator or file uploader can delete
    if ($file->project->created_by_user_id !== $user->id && 
        $file->uploaded_by_user_id !== $user->id) {
        return response()->json([
            'message' => 'Unauthorized to delete this file'
        ], 403);
    }
}
```

---

## 9. Project Interactions (Comments, Ratings, Bookmarks)

### Comments

**Read Access**:
- ✅ **Everyone**: Can view comments on approved projects
- ✅ **Project Creator**: Can view comments on their own projects

**Write Access**:
- ✅ **Authenticated Users**: Can add comments to projects they can view
- ❌ **Guests**: Cannot add comments

**Endpoints**:
- `GET /api/projects/{id}/comments` - Public (read-only for guests)
- `POST /api/projects/{id}/comments` - Requires authentication

### Ratings

**Read Access**:
- ✅ **Everyone**: Can view ratings on approved projects

**Write Access**:
- ✅ **Authenticated Users**: Can rate projects they can view
- ❌ **Guests**: Cannot rate projects

**Endpoints**:
- `GET /api/projects/{id}/ratings` - Public (read-only for guests)
- `POST /api/projects/{id}/rate` - Requires authentication

### Bookmarks

**Access Rules**:
- ✅ **Authenticated Users**: Can bookmark projects
- ✅ **Guests**: Can bookmark projects (stored in cookies, synced after login)
- **Note**: Bookmarks are personal and don't affect project visibility

---

## 10. Search and Filtering

### Global Search

**Endpoint**: `GET /api/projects/search/global`

**Access Rules**:
- ✅ **Authenticated Users Only**: Requires authentication
- **Visibility**: Same rules as project listing (approved + own projects for regular users)

### Project Suggestions

**Endpoint**: `GET /api/projects/suggestions`

**Access Rules**:
- ✅ **Authenticated Users Only**: Requires authentication
- **Visibility**: Same rules as project listing

---

## 11. Admin-Only Features

### Admin Project Management

**Endpoints**:
- `GET /api/admin/projects` - List all projects (admin only)
- `GET /api/admin/projects/pending` - List pending approvals (admin only)

**Access Rules**:
- ✅ **Admin Only**: Requires admin role

**Implementation**:
```php
public function adminProjects(Request $request)
{
    if (!$request->user()->hasRole('admin')) {
        return response()->json([
            'message' => 'Unauthorized. Admin access required.'
        ], 403);
    }
    // Return all projects without filtering
}
```

---

## 12. Access Control Summary Table

| Action | Guest | Student | Faculty | Admin | Reviewer | Project Creator | Project Member | Project Advisor |
|--------|-------|---------|---------|-------|----------|-----------------|----------------|-----------------|
| **View Approved Projects** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Own Projects** | N/A | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Pending Projects** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Hidden Projects** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create Project** | ❌ | ✅ | ✅ | ✅ | ❌ | N/A | N/A | N/A |
| **Update Project** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Delete Project** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Approve/Hide Project** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Members** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Manage Advisors** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Upload Files** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Delete Files** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅* | ✅* | ❌ |
| **Download Files** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Add Comments** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Rate Projects** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bookmark Projects** | ✅** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Can delete files they uploaded or files in projects they created
**Guest bookmarks stored in cookies, synced after login

---

## 13. Implementation Details

### Backend Location

**Main Controller**: `api/app/Http/Controllers/ProjectController.php`

**Key Methods**:
- `index()` - Project listing with visibility filtering
- `show()` - Project details with access control
- `store()` - Project creation
- `update()` - Project update (creator only)
- `destroy()` - Project deletion (creator only)
- `approveProject()` - Admin approval
- `hideProject()` - Admin hide
- `toggleProjectVisibility()` - Admin toggle visibility

### Frontend Location

**Route Protection**: `web/src/App.tsx`
**Component Checks**: `web/src/pages/ProjectDetailPage.tsx`

### Database Fields

**Projects Table**:
- `created_by_user_id` - Project creator (foreign key to users)
- `admin_approval_status` - Approval status (pending/approved/hidden)
- `approved_by_user_id` - Admin who approved (foreign key to users)
- `approved_at` - Approval timestamp
- `is_public` - Public visibility flag

**Pivot Tables**:
- `project_members` - Links users to projects with `role_in_project` (LEAD/MEMBER)
- `project_advisors` - Links users to projects with `advisor_role` (MAIN/CO_ADVISOR/REVIEWER)

---

## 14. Security Considerations

### Defense in Depth

1. **Route Protection**: API routes protected with `auth:sanctum` middleware
2. **Controller Checks**: Additional authorization checks in controller methods
3. **Frontend Guards**: Route guards prevent unauthorized access to UI
4. **Component Checks**: UI elements conditionally rendered based on permissions

### Important Notes

- ⚠️ **Frontend checks are for UX only** - All security must be enforced on the backend
- ⚠️ **File downloads currently have no access control** - Consider adding file-level permissions
- ⚠️ **Members and advisors cannot modify projects** - Only the creator can update/delete
- ⚠️ **Project approval is admin-only** - Regular users cannot approve their own projects

---

## 15. Common Scenarios

### Scenario 1: Student Creates Project

1. Student creates project → `admin_approval_status = 'pending'`
2. Project is visible only to:
   - The student (creator)
   - Admins
   - Reviewers
3. Student can edit/delete their project
4. Admin approves → `admin_approval_status = 'approved'`
5. Project becomes visible to everyone

### Scenario 2: Project Member Access

1. Project creator adds a member to the project
2. Member can:
   - View the project (if approved or if they're a member)
   - See project in analytics
   - Add comments and ratings
   - Download files
3. Member cannot:
   - Edit the project
   - Delete the project
   - Manage other members
   - Upload files (unless they have general upload permission)

### Scenario 3: Admin Hides Project

1. Admin hides a project → `admin_approval_status = 'hidden'`
2. Project is visible only to:
   - The project creator
   - Admins
   - Reviewers
3. All project files become private (`is_public = false`)
4. Regular users cannot see the project in listings

---

## Summary

The project access control system provides:

- ✅ **Role-based visibility** - Different users see different projects
- ✅ **Owner privileges** - Project creators have full control
- ✅ **Admin oversight** - Admins can approve/hide projects
- ✅ **Member/advisor relationships** - Special access for project participants
- ✅ **Public/private content** - Approved projects visible to all
- ✅ **Multi-layer security** - Protection at route, controller, and frontend levels

The system ensures that users can only access and modify projects they have permission to, while maintaining flexibility for collaboration through members and advisors.

