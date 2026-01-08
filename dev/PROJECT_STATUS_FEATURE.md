# Project Status Selection Feature

## Overview
This document describes the new project status selection feature that allows faculty, students, and administrators to manage project statuses throughout the project lifecycle.

## What's New

### 1. **Status Selection for Faculty and Students**
Project owners (faculty and students) can now change the project status in two ways:

#### A. Via Project Detail Page
- Navigate to any project you own
- Click on the status chip (e.g., "draft") at the top right of the project details
- A dialog will appear allowing you to select a new status:
  - **Draft**: Project is still being drafted
  - **Submitted**: Project has been submitted for review
  - **Under Review**: Project is being reviewed
  - **Approved**: Project has been approved
  - **Rejected**: Project has been rejected
  - **Completed**: Project has been completed
- Click "Update Status" to save your changes

#### B. Via Edit Project Page
- Navigate to the project edit page
- Find the "Project Status" dropdown field (below Academic Year and Semester)
- Select the desired status from the dropdown
- Save the project to update the status

### 2. **Admin Approval with Status Selection**
Administrators can now set the project status when approving or hiding projects:

#### Accessing the Approvals Page
- Navigate to **Dashboard → Approvals** (visible only to admins)
- View all pending project approvals

#### Approving a Project
1. Click the **"Approve"** button on any pending project
2. A dialog appears with:
   - **Set Project Status**: Dropdown to select the project's new status
   - **Approval Notes**: Optional field for feedback to the project creator
3. Select the appropriate status (defaults to the current status)
4. Add any notes if needed
5. Click **"Approve Project"** to confirm

#### Hiding a Project
1. Click the **"Hide"** button on any pending project
2. A dialog appears with:
   - **Hide Reason**: Optional field to explain why the project is being hidden
3. Add a reason if needed
4. Click **"Hide Project"** to confirm

### 3. **Visual Indicators**
- **Clickable Status Chips**: Project owners see a hover effect on status chips, indicating they're clickable
- **Color-Coded Statuses**: Each status has a distinct color for quick identification:
  - Draft: Orange/Warning
  - Submitted: Blue/Info
  - Under Review: Purple/Primary
  - Approved: Green/Success
  - Rejected: Red/Error
  - Completed: Green/Success

## Technical Changes

### Frontend Components

#### New Component: `StatusSelector`
- Location: `web/src/components/StatusSelector.tsx`
- Purpose: Reusable dialog component for changing project status
- Features:
  - Shows current status
  - Dropdown with all available statuses
  - Each status includes a description
  - Handles save operations with error handling
  - Loading states during updates

#### Updated: `ProjectDetailPage`
- Location: `web/src/pages/ProjectDetailPage.tsx`
- Changes:
  - Status chip is now clickable for project owners
  - Hover effects on clickable status chips
  - Integrated StatusSelector dialog
  - Automatic refresh after status change

#### Updated: `EditProjectPage`
- Location: `web/src/pages/EditProjectPage.tsx`
- Changes:
  - Added "Project Status" dropdown field
  - Status is loaded from and saved to the project
  - Full Material-UI Select component with all status options

#### New: `ApprovalsPage`
- Location: `web/src/pages/ApprovalsPage.tsx`
- Purpose: Comprehensive admin interface for project approvals
- Features:
  - List of all pending projects
  - Approve/Hide actions with dialogs
  - Status selection when approving
  - Admin notes field
  - Project details preview
  - View details button for full project view

### Backend Changes

#### Updated: `ProjectController.php`
- Location: `api/app/Http/Controllers/ProjectController.php`
- Changes:
  - `approveProject()` method now accepts `status` parameter
  - When admin approves a project, they can also set its status
  - Validation added for status field

#### API Endpoints

##### Existing Endpoints (Updated)
- `POST /api/projects/{id}/approve`
  - Now accepts: `{ admin_notes?: string, status?: string }`
  - Admin can set project status during approval

##### Existing Endpoints (Unchanged)
- `PUT /api/projects/{id}`
  - Accepts `status` field in update payload
  - Project owners can update their project status

### Type Definitions

#### Updated: `CreateProjectData`
- Location: `web/src/types/index.ts`
- Added optional `status` field
```typescript
status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
```

### API Service

#### Updated Methods
- `approveProject(projectId, data)`: Now accepts `{ admin_notes?, status? }`
- `hideProject(projectId, data)`: Accepts `{ admin_notes? }`
- `getPendingApprovals()`: Returns list of projects pending approval

## User Roles and Permissions

### Faculty/Students
- ✅ Can change status of their own projects
- ✅ Can change status via project detail page (clicking status chip)
- ✅ Can change status via edit project page
- ❌ Cannot change status of other users' projects

### Admins
- ✅ Can approve/hide any project
- ✅ Can set project status when approving
- ✅ Can add approval notes visible to project creators
- ✅ Access to dedicated Approvals page
- ✅ Can change status of any project via edit page

### Reviewers
- ❌ Cannot edit projects (including status changes)
- ✅ Can view projects and their statuses

## Workflow Examples

### Example 1: Student Creating and Submitting a Project
1. Student creates a new project (status: "draft")
2. Student completes the project details
3. Student clicks on "draft" status chip or goes to edit page
4. Student changes status to "submitted"
5. Admin sees project in Approvals page
6. Admin approves and sets status to "under_review"

### Example 2: Faculty Updating Project Status
1. Faculty navigates to their project
2. Faculty clicks on current status chip (e.g., "under_review")
3. Dialog opens with status options
4. Faculty selects "completed"
5. Project status updates immediately

### Example 3: Admin Approval Process
1. Admin navigates to Approvals page
2. Admin reviews pending project
3. Admin clicks "View Details" to see full project
4. Admin clicks "Approve"
5. Admin selects appropriate status (e.g., "approved")
6. Admin adds optional notes
7. Admin clicks "Approve Project"
8. Project creator receives notification with status update

## Benefits

1. **Clear Project Lifecycle**: Status changes make it easy to track project progress
2. **Intuitive Interface**: Clicking on the status chip is a natural way to change it
3. **Admin Control**: Admins can set appropriate status during approval
4. **Flexibility**: Multiple ways to change status (detail page, edit page)
5. **Transparency**: Status changes are visible to all stakeholders
6. **Better Workflow**: Clear states help organize and manage projects effectively

## Future Enhancements (Optional)

- Status change history/audit log
- Email notifications on status changes
- Status-based filters in project search
- Custom statuses for specific departments
- Workflow rules (e.g., can't go from "rejected" to "approved" without admin)
- Status change permissions based on current status

## Notes

- The project status is separate from `admin_approval_status` (pending/approved/hidden)
- Both statuses serve different purposes:
  - `status`: Project workflow stage
  - `admin_approval_status`: Visibility and approval by admin
- Status changes are immediate and don't require separate approval
- Project owners maintain control over their project's status
- Admins have the ability to set status when approving to ensure proper workflow

