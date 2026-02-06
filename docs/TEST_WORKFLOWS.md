# Fahras — Test Workflows

> **System:** Fahras — Graduation Project Archiving System (TVTC)  
> **Generated:** 2026-02-06  
> **Roles:** Guest, Student, Faculty, Admin, Reviewer

This document defines manual test workflows for every action available in Fahras, organized by user role. Each workflow specifies **preconditions**, **steps**, and **expected results**.

---

## Table of Contents

- [1. Guest (Unauthenticated)](#1-guest-unauthenticated)
- [2. Student](#2-student)
- [3. Faculty](#3-faculty)
- [4. Admin](#4-admin)
- [5. Reviewer](#5-reviewer)
- [6. Cross-Role Workflows](#6-cross-role-workflows)
- [7. Error & Edge Case Workflows](#7-error--edge-case-workflows)
- [8. Browser Click & Navigate Tests](#8-browser-click--navigate-tests)

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fahras.edu` | `password` |
| Faculty | `sarah.johnson@fahras.edu` | `password` |
| Student | `ahmed.almansouri@student.fahras.edu` | `password` |
| Reviewer | `reviewer@fahras.edu` | `password` |

---

## 1. Guest (Unauthenticated)

### 1.1 Browse Landing Page

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/` | Landing page loads with hero carousel and featured projects |
| 2 | Scroll down | Featured projects section visible with project cards |
| 3 | Click a featured project card | Navigates to `/pr/{slug}` — project detail page loads |

### 1.2 Explore Projects

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/explore` | Explore page loads with search bar, category filters, and project grid |
| 2 | Type a keyword in search bar | Autocomplete suggestions appear |
| 3 | Press Enter or click Search | Project list filters to matching results |
| 4 | Select a department filter | Results narrow to selected department |
| 5 | Select an academic year filter | Results narrow to selected year |
| 6 | Change sort order (e.g., "Newest First") | Results reorder accordingly |
| 7 | Click pagination "Next" | Next page of results loads |

### 1.3 View Project Detail (Public)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/pr/{slug}` for an approved public project | Project detail page loads |
| 2 | Verify project info | Title, abstract, keywords, academic year, semester, department visible |
| 3 | View sidebar | Team members, advisor(s), status, tags displayed |
| 4 | Scroll to files section | Public files listed with download buttons |
| 5 | Click "Download" on a file | File downloads with correct filename (including Arabic names) |
| 6 | Scroll to comments section | Existing comments visible (read-only for guests) |
| 7 | Attempt to post a comment | Login prompt or redirect to `/login` |

### 1.4 Guest Bookmarks (Cookie-Based)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On project detail page, click the bookmark/heart icon | Bookmark icon fills/toggles ON |
| 2 | Navigate to `/bookmarks` | Bookmarked project appears in list |
| 3 | Click bookmark icon again on the same project | Bookmark toggles OFF |
| 4 | Navigate to `/bookmarks` | Project no longer in list |

### 1.5 View Code/Repository

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/pr/{slug}/code` for a project with a repository URL | Code viewer or repository link page loads |
| 2 | Verify repository link is displayed | External link to GitHub/Forgejo visible |

### 1.6 Access Restricted Pages

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/dashboard` | Redirect to `/login` |
| 2 | Navigate to `/pr/create` | Redirect to `/login` |
| 3 | Navigate to `/admin/approvals` | Redirect to `/login` |
| 4 | Navigate to `/student/my-projects` | Redirect to `/login` |

### 1.7 Static Pages

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/terms` | Terms of Service page loads |
| 2 | Navigate to `/privacy` | Privacy Policy page loads |

---

## 2. Student

### 2.1 Authentication

#### 2.1.1 Registration

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/register` | Registration form loads |
| 2 | Fill in full name, email, password, confirm password | Fields accept input |
| 3 | Select role as "Student" | Student role selected |
| 4 | Click "Register" | Success — redirect to email verification page |
| 5 | Check email for OTP | OTP received |
| 6 | Enter OTP on `/verify-email` | Account verified — redirect to `/login` |

#### 2.1.2 Login

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/login` | Login form loads |
| 2 | Enter student email and password | Fields accept input |
| 3 | Click "Login" | Success — redirect to `/dashboard` with Student Dashboard view |
| 4 | Verify dashboard | Shows "My Projects", "In Progress", "Completed", "Pending Approval" cards |

#### 2.1.3 Forgot / Reset Password

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/forgot-password` | Form loads with email field |
| 2 | Enter registered email, click Submit | Success message — check email for reset link |
| 3 | Click reset link → `/reset-password?token=...` | Reset form loads |
| 4 | Enter new password and confirm | Password updated — redirect to `/login` |
| 5 | Login with new password | Login successful |

#### 2.1.4 Logout

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click logout button/menu item | Session cleared — redirect to `/login` |
| 2 | Navigate to `/dashboard` | Redirect to `/login` (session expired) |

### 2.2 Dashboard

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/dashboard` as student | Student Dashboard loads |
| 2 | Verify stat cards | "My Projects" count, "In Progress", "Completed", "Pending Approval" visible |
| 3 | Click "My Projects" quick action | Navigates to `/student/my-projects` |
| 4 | Click "Create Project" quick action | Navigates to `/pr/create` |
| 5 | Verify recent notifications section | Recent notifications about own projects displayed |

### 2.3 Create Project (3-Step Wizard)

#### Step 1 — Basic Info

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/pr/create` | Project creation wizard loads on Step 1 |
| 2 | Enter project title | Field accepts input |
| 3 | Enter abstract (description) | Field accepts input |
| 4 | Add keywords/tags | Tags added as chips |
| 5 | Select academic year | Dropdown shows available years |
| 6 | Select semester (Fall/Spring/Summer) | Semester selected |
| 7 | Select department | Department dropdown populated |
| 8 | Select program | Program dropdown populated (filtered by department) |
| 9 | Click "Next" | Wizard advances to Step 2 — Team |

#### Step 2 — Team Members

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Current user shown as LEAD member | Creator auto-listed as team lead |
| 2 | Search for another student to add | Autocomplete shows matching students |
| 3 | Select a student and set role (MEMBER) | Student added to team list |
| 4 | Select faculty advisor (MAIN) | Advisor added |
| 5 | Optionally add CO_ADVISOR | Co-advisor added |
| 6 | Click "Next" | Wizard advances to Step 3 — Files |

#### Step 3 — Files & Submit

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Upload File" | File picker opens |
| 2 | Select one or more files | Files listed with name, size, type |
| 3 | Files show upload progress | Progress bar per file |
| 4 | Click "Create Project" (as Draft) | Project created with status `draft` — redirect to project detail |
| 5 | Verify project on `/pr/{slug}` | All entered info correct, status shows "Draft" |

### 2.4 Edit Project

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/pr/{slug}/edit` for own project | Edit form loads pre-populated |
| 2 | Modify title | Title field updates |
| 3 | Modify abstract | Abstract field updates |
| 4 | Add/remove tags | Tags update |
| 5 | Click "Save" | Changes saved — success notification |
| 6 | Verify on project detail page | Changes reflected |

### 2.5 Submit Project for Review

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open own project in `draft` status | Project detail loads |
| 2 | Click "Submit for Review" button | Confirmation dialog appears |
| 3 | Confirm submission | Status changes to `submitted` |
| 4 | Verify status badge | Shows "Submitted" |
| 5 | Notification sent to advisor/admin | Notification visible in advisor's notification list |

### 2.6 File Management

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open own project | Project detail page loads |
| 2 | Navigate to files section | File list displayed |
| 3 | Click "Upload" | File picker opens |
| 4 | Upload a new file | File uploaded — appears in list |
| 5 | Click "Download" on own file | File downloads correctly |
| 6 | Click "Delete" on own file | Confirmation dialog → file removed from list |
| 7 | Attempt to delete another user's file | Action not available (button hidden or 403 error) |

### 2.7 Toggle Project Visibility

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open own project | Project detail loads |
| 2 | Click visibility toggle (Public/Private) | Toggle switches |
| 3 | Set to Private | Project no longer visible in `/explore` for non-team members |
| 4 | Set back to Public | Project visible in `/explore` again |

### 2.8 View My Projects

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/student/my-projects` | List of own projects loads |
| 2 | Verify projects shown | All projects created by or with student as member |
| 3 | Filter by status | Filters work correctly |
| 4 | Click a project | Navigates to project detail |

### 2.9 Bookmarks (Authenticated)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to any public project `/pr/{slug}` | Project detail loads |
| 2 | Click bookmark icon | Bookmark saved to database — icon fills |
| 3 | Navigate to `/bookmarks` | Bookmarked project appears in list |
| 4 | Click bookmark icon again | Bookmark removed |
| 5 | Verify `/bookmarks` | Project no longer listed |

### 2.10 Bookmark Sync (Guest → Authenticated)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | As guest, bookmark 2-3 projects | Bookmarks stored in cookies |
| 2 | Login as student | Redirect to dashboard |
| 3 | Navigate to `/bookmarks` | All guest bookmarks synced to account and displayed |

### 2.11 Follow / Unfollow Project

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open a public project | Project detail loads |
| 2 | Click "Follow" button | Following state toggled ON — confirmation shown |
| 3 | Navigate to `/pr/{slug}/follow` | Follow management page loads — user listed as follower |
| 4 | Click "Unfollow" | Following state toggled OFF |

### 2.12 Comments

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open an approved project | Project detail loads |
| 2 | Scroll to comments section | Comment form visible (authenticated) |
| 3 | Type a comment and submit | Comment appears in the list immediately |
| 4 | Reply to an existing comment | Threaded reply appears under parent comment |

### 2.13 Ratings

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open an approved project (not own) | Project detail loads |
| 2 | Click star rating (1-5) | Star rating UI highlights selected stars |
| 3 | Optionally add review text | Text field accepts input |
| 4 | Submit rating | Rating saved — average rating updates |

### 2.14 Notifications

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/notifications` | Notification list loads |
| 2 | Verify notification badge | Unread count shown in header/sidebar |
| 3 | Click a notification | Marked as read — navigates to related resource |
| 4 | Click "Mark All as Read" | All notifications marked as read — badge clears |
| 5 | Click delete on a notification | Notification removed |
| 6 | Click "Delete All" | All notifications removed |

### 2.15 Profile & Settings

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/profile` | Profile page loads with current info |
| 2 | Edit full name | Field updates |
| 3 | Upload new avatar | Avatar image changes |
| 4 | Click "Save" | Profile updated — success notification |
| 5 | Navigate to `/settings` | Settings page loads |
| 6 | Toggle language (EN ↔ AR) | UI switches language and RTL/LTR direction |
| 7 | Toggle theme (Light ↔ Dark) | Theme changes throughout the app |

### 2.16 Change Password

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/profile` or `/settings` | Change password form visible |
| 2 | Enter current password | Field accepts input |
| 3 | Enter new password and confirm | Fields accept input |
| 4 | Click "Change Password" | Password updated — success notification |
| 5 | Logout and login with new password | Login successful |

### 2.17 Saved Searches

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/explore` | Explore page loads |
| 2 | Apply filters (department, year, keyword) | Results filter |
| 3 | Click "Save Search" | Name prompt appears |
| 4 | Enter name and save | Search saved — appears in saved searches list |
| 5 | Clear filters, then load saved search | Filters restored — results match |
| 6 | Delete a saved search | Search removed from list |

### 2.18 Access Denied — Student Restrictions

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/admin/approvals` | Redirect to `/dashboard` or 403 page |
| 2 | Navigate to `/access-control` | Redirect or 403 |
| 3 | Navigate to `/milestone-templates` | Redirect or 403 |
| 4 | Navigate to `/evaluations` | Redirect or 403 |
| 5 | `PUT /api/projects/{slug}` for another user's project | 403 Forbidden |
| 6 | `DELETE /api/projects/{slug}` for another user's project | 403 Forbidden |
| 7 | `POST /api/projects/{slug}/approve` | 403 Forbidden |

---

## 3. Faculty

### 3.1 Login & Dashboard

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Login as faculty | Redirect to `/dashboard` |
| 2 | Verify Faculty Dashboard | Shows "Advisee Projects", "Pending Reviews", "Ratings" cards |
| 3 | Verify advisee project list | Projects where user is advisor listed |
| 4 | Click a quick action | Navigates to relevant page |

### 3.2 Create Project (on behalf of student team)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/pr/create` | Project wizard loads |
| 2 | Fill out all fields (same as Student 2.3) | Form accepts input |
| 3 | Add student team members | Students added with LEAD/MEMBER roles |
| 4 | Set self as advisor | Faculty listed as MAIN advisor |
| 5 | Submit project | Project created — faculty as creator |

### 3.3 Review Advisee Projects

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to advisee project list (from dashboard) | Projects where faculty is advisor |
| 2 | Open a submitted project | Project detail loads |
| 3 | Review project info, files, team | All sections accessible |
| 4 | Post a comment with feedback | Comment appears in thread |
| 5 | Rate the project (1-5 stars) | Rating saved |

### 3.4 Pending Approvals (Faculty)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/faculty/pending-approvals` | Pending approval queue loads |
| 2 | Verify only department projects shown | Projects filtered to faculty's department |
| 3 | Open a pending project | Project detail loads |
| 4 | Review and provide feedback | Comment posted |

### 3.5 Project Flags

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open an advisee project | Project detail loads |
| 2 | Click "Flag Issue" | Flag creation form appears |
| 3 | Select flag type (e.g., `scope_creep`) | Type selected |
| 4 | Select severity (low / medium / high / critical) | Severity selected |
| 5 | Add description | Description field filled |
| 6 | Submit flag | Flag created — appears in project flags list |
| 7 | Resolve a flag | Flag marked as resolved with notes |

### 3.6 Update Advisee Project

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/pr/{slug}/edit` for advisee project | Edit form loads |
| 2 | Update project fields | Fields update |
| 3 | Save changes | Changes saved |
| 4 | Attempt to edit a non-advisee project | 403 Forbidden or edit button not visible |

### 3.7 Evaluations

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/evaluations` | Evaluation interface loads |
| 2 | Select a project to evaluate | Project evaluation form loads |
| 3 | Submit evaluation | Evaluation recorded |

### 3.8 Milestone Management

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open advisee project | Project detail loads |
| 2 | View milestone timeline | Milestones displayed with states |
| 3 | Start a milestone | Status changes to `in_progress`, `startedAt` set |
| 4 | Complete a milestone | Status changes to `completed`, `completedAt` set |
| 5 | Add completion notes | Notes saved |
| 6 | Reopen a completed milestone | Status reverts to `in_progress` |
| 7 | Update milestone due date | Due date updated |

### 3.9 File Management (Advisee Projects)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open advisee project files section | Files listed |
| 2 | Upload a file | File uploaded successfully |
| 3 | Download any file | File downloads with correct filename |
| 4 | Delete own uploaded file | File removed |

### 3.10 Faculty Access Restrictions

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/admin/approvals` | Redirect or 403 |
| 2 | Navigate to `/access-control` | Redirect or 403 |
| 3 | `POST /api/admin/users` (create user) | 403 Forbidden |
| 4 | `DELETE /api/admin/users/{id}` (delete user) | 403 Forbidden |
| 5 | `POST /api/projects/{slug}/approve` (admin approval) | 403 Forbidden |

---

## 4. Admin

### 4.1 Login & Dashboard

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Login as admin | Redirect to `/dashboard` |
| 2 | Verify Admin Dashboard | Shows "Total Projects", "Pending Approvals", "Approved", "Recent Activity" |
| 3 | Click "Pending Approvals" | Navigates to `/admin/approvals` |

### 4.2 Project Approval Workflow

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/admin/approvals` | Approval queue loads with pending projects |
| 2 | Click a pending project | Project detail loads |
| 3 | Review project info, files, team, comments | All sections accessible |
| 4 | Click "Approve" | Confirmation dialog |
| 5 | Confirm approval | `adminApprovalStatus` → `approved`, all files made public |
| 6 | Verify notification | Creator receives approval notification |
| 7 | Verify project visibility | Project now appears in `/explore` for all users |

### 4.3 Hide Project

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open an approved project | Project detail loads |
| 2 | Click "Hide" | Confirmation dialog |
| 3 | Confirm hide | `adminApprovalStatus` → `hidden` |
| 4 | Verify on `/explore` | Project no longer visible publicly |

### 4.4 User Management — CRUD

#### 4.4.1 List Users

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/admin` or user management page | User list loads |
| 2 | Search by name or email | Results filter |
| 3 | Filter by role | Only matching role users shown |
| 4 | Filter by status (active/inactive/suspended) | Results filter |
| 5 | Paginate through results | Pages load correctly |

#### 4.4.2 Create User

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Create User" | User creation form loads |
| 2 | Enter full name, email, password | Fields accept input |
| 3 | Select role (student/faculty/reviewer/admin) | Role selected |
| 4 | Select department (if faculty/student) | Department selected |
| 5 | Click "Create" | User created — appears in list |

#### 4.4.3 Update User

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Edit" on a user | User edit form loads |
| 2 | Modify full name | Field updates |
| 3 | Change role | Role updated |
| 4 | Click "Save" | Changes saved |

#### 4.4.4 Delete User

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Delete" on a user | Confirmation dialog |
| 2 | Confirm deletion | User removed from list |
| 3 | Deleted user attempts login | Login fails |

#### 4.4.5 Toggle User Status

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click status toggle on a user | Status cycles: active → inactive → suspended |
| 2 | Set to "Suspended" | User cannot login |
| 3 | Set to "Inactive" | User cannot login |
| 4 | Set back to "Active" | User can login again |

### 4.5 Role & Permission Management

#### 4.5.1 List Roles

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/access-control` | Roles list loads |
| 2 | Verify system roles visible | admin, faculty, student, reviewer listed |
| 3 | See permissions per role | Each role shows assigned permissions with scopes |

#### 4.5.2 Create Custom Role

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Create Role" | Role creation form loads |
| 2 | Enter role name and description | Fields accept input |
| 3 | Select permissions and scopes | Permissions checkboxes with scope dropdowns |
| 4 | Click "Create" | Role created — appears in list |

#### 4.5.3 Edit Role Permissions

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Edit" on a role | Role edit form loads |
| 2 | Add/remove a permission | Permission toggled |
| 3 | Change scope (all → department → own) | Scope updated |
| 4 | Click "Save" | Changes saved |
| 5 | Verify affected user behavior | User with this role now has updated permissions |

#### 4.5.4 Delete Custom Role

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Delete" on a custom role | Confirmation dialog |
| 2 | Confirm deletion | Role removed (system roles cannot be deleted) |

#### 4.5.5 View All Permissions

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | View permissions list | All 13 permissions listed with categories |
| 2 | Verify categories | Users, Projects, Files, System |
| 3 | See which roles have each permission | Role-permission mapping visible |

### 4.6 Milestone Template Management

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/milestone-templates` | Template list loads |
| 2 | Click "Create Template" | Template editor loads |
| 3 | Enter template name | Name field accepts input |
| 4 | Add milestone items with names and descriptions | Items added to list |
| 5 | Reorder items (drag and drop) | Items reorder |
| 6 | Click "Save" | Template saved |
| 7 | Edit existing template | Modify items and save |
| 8 | Delete template | Template removed |
| 9 | Mark template as default for a program | Default flag set |

### 4.7 Admin — Manage Any Project

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to any project `/pr/{slug}` | Project detail loads |
| 2 | Click "Edit" | Edit form loads (admin can edit any project) |
| 3 | Modify fields and save | Changes saved |
| 4 | Upload files to any project | Files uploaded |
| 5 | Delete files from any project | Files deleted |
| 6 | Delete any project | Project deleted |

### 4.8 Analytics

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/analytics` | Analytics dashboard loads |
| 2 | Verify status distribution chart | Bar/pie chart showing projects by status |
| 3 | Verify department distribution | Chart showing projects by department |
| 4 | Verify monthly trend | Line chart showing projects over time |
| 5 | Filter by department | Charts update to filtered data |
| 6 | Filter by academic year | Charts update |
| 7 | Verify top projects section | Top rated, most viewed, most followed displayed |

### 4.9 Admin — Full System Access

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/student/my-projects` | Page loads (admin has universal access) |
| 2 | Navigate to `/faculty/pending-approvals` | Page loads |
| 3 | Navigate to `/evaluations` | Page loads |
| 4 | Access any API endpoint | 200 OK (never 403) |
| 5 | Create project with `system.admin` scope | Project created with full permissions |

---

## 5. Reviewer

### 5.1 Login & Dashboard

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Login as reviewer | Redirect to `/dashboard` |
| 2 | Verify Reviewer Dashboard | Shows assigned projects, review status |

### 5.2 Browse & Review Projects

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/explore` | Explore page loads |
| 2 | Open a project | Project detail loads with full read access |
| 3 | View all sections (info, files, comments, timeline) | All sections visible |
| 4 | Download any file | File downloads successfully |
| 5 | Post a comment/feedback | Comment posted |

### 5.3 Rate Projects

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open a project | Project detail loads |
| 2 | Submit a rating (1-5 stars + text) | Rating saved |
| 3 | Verify rating appears | Rating visible in project ratings section |

### 5.4 Reviewer Access Restrictions

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/pr/create` | Redirect or 403 (no create permission) |
| 2 | Click "Edit" on any project | Button not visible or 403 |
| 3 | Attempt file upload | Not allowed (no upload permission) |
| 4 | Attempt file delete | Not allowed (no delete permission) |
| 5 | Navigate to `/admin/approvals` | Redirect or 403 |
| 6 | Navigate to `/access-control` | Redirect or 403 |
| 7 | `POST /api/projects` (create) | 403 Forbidden |
| 8 | `PUT /api/projects/{slug}` (update) | 403 Forbidden |
| 9 | `DELETE /api/projects/{slug}` (delete) | 403 Forbidden |

---

## 6. Cross-Role Workflows

These test end-to-end flows that span multiple roles.

### 6.1 Full Project Lifecycle

| # | Actor | Step | Expected Result |
|---|-------|------|-----------------|
| 1 | **Student** | Create project via `/pr/create` | Project created in `draft` status |
| 2 | **Student** | Upload files (report PDF, code ZIP) | Files uploaded |
| 3 | **Student** | Add team member (another student) | Team member added |
| 4 | **Student** | Add faculty advisor | Advisor assigned |
| 5 | **Student** | Submit for review | Status → `submitted`; notification to advisor |
| 6 | **Faculty** | Open notification → navigate to project | Project detail loads |
| 7 | **Faculty** | Review project, post comment | Comment visible |
| 8 | **Faculty** | Rate project (4 stars) | Rating saved |
| 9 | **Faculty** | Flag minor issue (`timeline_risk`, low) | Flag created |
| 10 | **Student** | See notification about flag | Notification received |
| 11 | **Student** | Update project to address flag | Edit saved |
| 12 | **Faculty** | Resolve flag with notes | Flag resolved |
| 13 | **Admin** | See project in `/admin/approvals` | Project in pending queue |
| 14 | **Admin** | Approve project | `adminApprovalStatus` → `approved` |
| 15 | **Student** | See approval notification | Notification received |
| 16 | **Guest** | Search for project on `/explore` | Project appears in results |
| 17 | **Guest** | Download public file | File downloads successfully |
| 18 | **Reviewer** | Open project, rate it (5 stars) | Rating saved, average updates |

### 6.2 Project Rejection & Resubmission

| # | Actor | Step | Expected Result |
|---|-------|------|-----------------|
| 1 | **Student** | Create and submit project | Status → `submitted` |
| 2 | **Admin** | Reject project with reason | Status → `rejected`; notification sent |
| 3 | **Student** | See rejection notification | Notification explains reason |
| 4 | **Student** | Edit project to address issues | Changes saved |
| 5 | **Student** | Resubmit | Status → `submitted` again |
| 6 | **Admin** | Approve revised project | Status → `approved` |

### 6.3 Milestone Tracking Lifecycle

| # | Actor | Step | Expected Result |
|---|-------|------|-----------------|
| 1 | **Admin** | Create milestone template with 4 items | Template saved |
| 2 | **Student** | Create project (template auto-applied) | 4 milestones created in `not_started` |
| 3 | **Student** | Start milestone #1 | Status → `in_progress` |
| 4 | **Faculty** | View milestone timeline | Timeline shows 1 in progress, 3 not started |
| 5 | **Student** | Complete milestone #1 with notes | Status → `completed` |
| 6 | **Faculty** | Reopen milestone #1 (needs revision) | Status → `in_progress` |
| 7 | **Student** | Re-complete milestone #1 | Status → `completed` |
| 8 | **Student** | Start and complete remaining milestones | All 4 completed |

### 6.4 Bookmark Sync Across Guest & Authenticated

| # | Actor | Step | Expected Result |
|---|-------|------|-----------------|
| 1 | **Guest** | Bookmark 3 projects | Stored in cookies |
| 2 | **Guest** | Navigate to `/bookmarks` | 3 projects shown |
| 3 | **Guest** | Login as student | Redirect to dashboard |
| 4 | **Student** | Navigate to `/bookmarks` | 3 guest bookmarks synced + any existing bookmarks |
| 5 | **Student** | Remove 1 bookmark | Bookmark removed from DB |
| 6 | **Student** | Logout | Session cleared |
| 7 | **Guest** | Navigate to `/bookmarks` | Cookie bookmarks may still show (minus synced ones) |

### 6.5 Multi-Role Comment Thread

| # | Actor | Step | Expected Result |
|---|-------|------|-----------------|
| 1 | **Student** | Post comment on own project | Comment appears |
| 2 | **Faculty** | Reply to student's comment | Threaded reply appears |
| 3 | **Admin** | Reply to faculty's comment | Another threaded reply |
| 4 | **Reviewer** | Post top-level comment | New comment thread |
| 5 | **Guest** | View project | All comments visible (read-only) |

---

## 7. Error & Edge Case Workflows

### 7.1 Authentication Errors

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Login with wrong password | "Invalid credentials" error message |
| 2 | Login with non-existent email | "Invalid credentials" error (no email enumeration) |
| 3 | Login with suspended account | "Account is suspended" error |
| 4 | Login with inactive account | "Account is inactive" error |
| 5 | Access API with expired token | 401 Unauthorized |
| 6 | Register with duplicate email | "Email already registered" error |
| 7 | Register with weak password | Validation error message |
| 8 | Submit invalid OTP | "Invalid verification code" error |
| 9 | Use expired reset token | "Token expired" error |

### 7.2 Authorization Errors

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Student tries `DELETE /api/projects/{slug}` on other's project | 403 Forbidden |
| 2 | Faculty tries `POST /api/projects/{slug}/approve` | 403 Forbidden |
| 3 | Reviewer tries `POST /api/projects` | 403 Forbidden |
| 4 | Student tries `GET /api/admin/users` | 403 Forbidden |
| 5 | Faculty tries `DELETE /api/admin/users/{id}` | 403 Forbidden |
| 6 | Non-admin accesses `/access-control` | Redirect or 403 |
| 7 | Non-admin accesses `/milestone-templates` | Redirect or 403 |

### 7.3 Input Validation

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Create project with empty title | Validation error — "Title is required" |
| 2 | Create project with empty abstract | Validation error — "Abstract is required" |
| 3 | Upload file exceeding size limit | Error — "File too large" |
| 4 | Upload unsupported file type | Error or graceful handling |
| 5 | Submit rating > 5 or < 1 | Validation error |
| 6 | Submit empty comment | Validation error — "Comment cannot be empty" |
| 7 | Create user with invalid email format | Validation error |

### 7.4 Not Found / Deleted Resources

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/pr/nonexistent-slug` | 404 Not Found page |
| 2 | Download deleted file `GET /api/files/99999/download` | 404 Not Found |
| 3 | Edit deleted project | 404 Not Found |
| 4 | View deleted user profile | 404 Not Found |

### 7.5 Concurrent & Race Conditions

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Two users bookmark same project simultaneously | Both bookmarks saved independently |
| 2 | Admin approves project while student is editing | Approval takes effect; edit may warn about state change |
| 3 | Two admins approve same project | Second approval is idempotent (no error) |
| 4 | Student deletes project while admin is approving | Delete succeeds or approval fails gracefully |

### 7.6 File Handling Edge Cases

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Upload file with Arabic filename | File uploaded — downloads with correct Arabic name (RFC 5987) |
| 2 | Upload file with special characters in name | Filename sanitized — upload succeeds |
| 3 | Upload very large file (e.g., 500MB) | Either succeeds or shows meaningful size limit error |
| 4 | Download file when S3/MinIO is unavailable | Graceful error — "File temporarily unavailable" |

### 7.7 Internationalization (i18n) & RTL

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Switch language to Arabic | All UI text switches to Arabic |
| 2 | Verify RTL layout | Content flows right-to-left |
| 3 | Verify form inputs in RTL | Text alignment correct |
| 4 | Switch back to English | All UI text switches to English, LTR layout |
| 5 | Verify mixed content (EN title, AR abstract) | Both render correctly |

### 7.8 Theme & Accessibility

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Toggle dark mode | All pages render correctly in dark theme |
| 2 | Toggle light mode | All pages render correctly in light theme |
| 3 | Check keyboard navigation | All interactive elements focusable via Tab |
| 4 | Check screen reader labels | Important elements have aria-labels |

---

## Permission Matrix Quick Reference

| Action | Guest | Student | Faculty | Admin | Reviewer |
|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| Browse public projects | ✅ | ✅ | ✅ | ✅ | ✅ |
| View project detail | ✅ | ✅ | ✅ | ✅ | ✅ |
| Download public files | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search & filter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bookmark (cookie) | ✅ | — | — | — | — |
| Bookmark (DB) | — | ✅ | ✅ | ✅ | ✅ |
| Follow projects | — | ✅ | ✅ | ✅ | ✅ |
| Post comments | — | ✅ | ✅ | ✅ | ✅ |
| Rate projects | — | ✅ | ✅ | ✅ | ✅ |
| Create project | — | ✅ (own) | ✅ | ✅ | — |
| Edit project | — | ✅ (own) | ✅ (own) | ✅ (all) | — |
| Delete project | — | ✅ (own) | — | ✅ (all) | — |
| Upload files | — | ✅ (own) | ✅ | ✅ | — |
| Delete files | — | ✅ (own) | ✅ | ✅ | — |
| Submit for review | — | ✅ (own) | — | — | — |
| Approve project | — | — | — | ✅ | — |
| Hide project | — | — | — | ✅ | — |
| Flag issues | — | — | ✅ | ✅ | — |
| Manage milestones | — | ✅ (own) | ✅ (advisee) | ✅ (all) | — |
| Manage users | — | — | — | ✅ | — |
| Manage roles | — | — | — | ✅ | — |
| Manage templates | — | — | — | ✅ | — |
| View analytics | — | — | — | ✅ | — |
| Access control | — | — | — | ✅ | — |

---

## API Endpoint Test Matrix

### Authentication Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/login` | POST | ✅ | — | — | — | — |
| `/api/register` | POST | ✅ | — | — | — | — |
| `/api/user` | GET | 401 | ✅ | ✅ | ✅ | ✅ |

### Project Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/projects` | GET | ✅ (public) | ✅ | ✅ | ✅ | ✅ |
| `/api/projects` | POST | 401 | ✅ | ✅ | ✅ | 403 |
| `/api/projects/[slug]` | GET | ✅ (public) | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/[slug]` | PUT | 401 | ✅ (own) | ✅ (own) | ✅ | 403 |
| `/api/projects/[slug]` | DELETE | 401 | ✅ (own) | 403 | ✅ | 403 |
| `/api/projects/[slug]/approve` | POST | 401 | 403 | 403 | ✅ | 403 |
| `/api/projects/[slug]/hide` | POST | 401 | 403 | 403 | ✅ | 403 |
| `/api/projects/[slug]/visibility` | PUT | 401 | ✅ (own) | ✅ (own) | ✅ | 403 |
| `/api/projects/[slug]/comments` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/[slug]/comments` | POST | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/[slug]/ratings` | POST | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/[slug]/files` | POST | 401 | ✅ (own) | ✅ | ✅ | 403 |
| `/api/projects/[slug]/bookmark` | POST | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/[slug]/follow` | POST | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/[slug]/flags` | POST | 401 | 403 | ✅ | ✅ | 403 |
| `/api/projects/suggestions` | GET | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/admin` | GET | 401 | 403 | 403 | ✅ | 403 |
| `/api/projects/analytics` | GET | 401 | 403 | 403 | ✅ | 403 |
| `/api/projects/[slug]/timeline` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/[slug]/followers` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/projects/[slug]/activities` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |

### File Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/files/[id]/download` | GET | ✅ (public) | ✅ | ✅ | ✅ | ✅ |
| `/api/files/[id]` | DELETE | 401 | ✅ (own) | ✅ | ✅ | 403 |

### Tags & Search Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/tags` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/search-queries` | GET | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/saved-searches` | GET | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/saved-searches` | POST | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/saved-searches/[id]` | GET | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/saved-searches/[id]` | DELETE | 401 | ✅ | ✅ | ✅ | ✅ |

### Academic Structure Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/programs` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/faculties` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/departments` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |

### Bookmark Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/bookmarks` | GET | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/bookmarks` | POST | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/bookmarks/sync` | POST | 401 | ✅ | ✅ | ✅ | ✅ |

### Admin Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/admin/users` | GET | 401 | 403 | 403 | ✅ | 403 |
| `/api/admin/users` | POST | 401 | 403 | 403 | ✅ | 403 |
| `/api/admin/users/[id]` | PUT | 401 | 403 | 403 | ✅ | 403 |
| `/api/admin/users/[id]` | DELETE | 401 | 403 | 403 | ✅ | 403 |
| `/api/admin/users/[id]/toggle-status` | POST | 401 | 403 | 403 | ✅ | 403 |
| `/api/roles` | GET | 401 | 403 | 403 | ✅ | 403 |
| `/api/roles` | POST | 401 | 403 | 403 | ✅ | 403 |
| `/api/roles/[id]` | PUT | 401 | 403 | 403 | ✅ | 403 |
| `/api/roles/[id]` | DELETE | 401 | 403 | 403 | ✅ | 403 |
| `/api/permissions` | GET | 401 | 403 | 403 | ✅ | 403 |

### Milestone Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/milestone-templates` | GET | 401 | 403 | 403 | ✅ | 403 |
| `/api/milestone-templates` | POST | 401 | 403 | 403 | ✅ | 403 |
| `/api/milestone-templates/[id]/reorder` | POST | 401 | 403 | 403 | ✅ | 403 |
| `/api/milestones/[id]` | PUT | 401 | ✅ (own) | ✅ | ✅ | 403 |
| `/api/milestones/[id]/start` | POST | 401 | ✅ (own) | ✅ | ✅ | 403 |
| `/api/milestones/[id]/complete` | POST | 401 | ✅ (own) | ✅ | ✅ | 403 |
| `/api/milestones/[id]/reopen` | POST | 401 | ✅ (own) | ✅ | ✅ | 403 |
| `/api/milestones/[id]/due-date` | PUT | 401 | ✅ (own) | ✅ | ✅ | 403 |

### Notification Endpoints

| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |
|----------|--------|:-----:|:-------:|:-------:|:-----:|:--------:|
| `/api/notifications` | GET | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/notifications/unread-count` | GET | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/notifications/[id]/read` | POST | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/notifications/mark-all-read` | POST | 401 | ✅ | ✅ | ✅ | ✅ |
| `/api/notifications/delete-all` | POST | 401 | ✅ | ✅ | ✅ | ✅ |

---

## 8. Browser Click & Navigate Tests

> **Purpose:** Step-by-step browser automation tests using real click, type, and navigate actions.  
> **Base URL:** `http://localhost:3000`  
> **Selectors:** Use `#id`, `[name=...]`, `role`, `text`, and `aria-label` attributes from the actual codebase.

---

### 8.1 Guest — Landing Page Navigation

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/                          Page loads, hero carousel visible
screenshot      --                                             Verify landing page renders
scroll          down 600px                                     Featured projects section visible
click           text="Explore"  (nav button)                   URL changes to /explore
wait            [data-testid] or project cards to load         Explore page with project grid
click           browser back                                   Returns to /
click           text="Sign In" or text="Login"                 URL changes to /login
verify-url      /login                                         Login page loaded
```

### 8.2 Guest — Explore & Search

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/explore                   Explore page loads
screenshot      --                                             Project grid visible
click           input (search bar at top)                      Search field focused
type            "graduation project"                           Text entered in search
press           Enter                                          Results filter — URL may update with ?search=
wait            project cards to reload                        Filtered results shown
screenshot      --                                             Verify filtered results
click           first project card                             URL changes to /pr/{slug}
verify-url      /pr/                                           Project detail page loaded
verify-text     (project title heading)                        Title text visible on page
click           browser back                                   Returns to /explore
```

### 8.3 Guest — Project Detail & File Download

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/explore                   Explore page loads
click           first project card link                        Navigates to /pr/{slug}
verify-text     h1 or h2 heading                               Project title visible
scroll          to files section                               Files section visible
verify-element  download button/link                           At least one file listed
click           first download button                          File download starts (browser triggers download)
scroll          to comments section                            Comments section visible
verify-text     "Comments" or similar heading                  Section heading visible
```

### 8.4 Guest — Access Denied Redirects

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/dashboard                 Redirects to /login
verify-url      /login                                         Login page shown
navigate        http://localhost:3000/pr/create                 Redirects to /login
verify-url      /login                                         Login page shown
navigate        http://localhost:3000/admin/approvals           Redirects to /login
verify-url      /login                                         Login page shown
navigate        http://localhost:3000/notifications             Redirects to /login
verify-url      /login                                         Login page shown
navigate        http://localhost:3000/student/my-projects       Redirects to /login
verify-url      /login                                         Login page shown
```

---

### 8.5 Student — Login Flow

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/login                     Login page loads
verify-text     "Welcome Back"                                 Heading visible
click           #email                                         Email field focused
type            ahmed.almansouri@student.fahras.edu             Email entered
click           #password                                      Password field focused
type            password                                       Password entered
click           button[type="submit"] (text="Sign In")         Form submits, loading spinner shows
wait            URL changes to /dashboard                      Dashboard loaded
verify-url      /dashboard                                     Student dashboard page
screenshot      --                                             Verify Student Dashboard rendered
verify-text     "My Projects" or stat card                     Dashboard stats visible
```

### 8.6 Student — Login Validation Errors

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/login                     Login page loads
click           button[type="submit"] (text="Sign In")         Submit with empty fields
verify-text     "Email is required"                            Validation error shown under email
verify-text     "Password is required"                         Validation error shown under password
click           #email                                         Focus email field
type            not-an-email                                   Invalid email typed
click           #password                                      Focus password field
type            wrongpassword                                  Wrong password typed
click           button[type="submit"]                          Form submits
wait            error alert                                    "Invalid credentials" alert appears
verify-element  .MuiAlert-standardError                        Error alert is visible
screenshot      --                                             Capture error state
```

### 8.7 Student — Dashboard Navigation

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS STUDENT FIRST — see 8.5]

navigate        http://localhost:3000/dashboard                 Student Dashboard loads
verify-text     "My Projects"                                  Stats card visible
click           "Create Project" or "New Project" button       URL changes to /pr/create
verify-url      /pr/create                                     Project creation wizard loads
click           browser back                                   Returns to /dashboard
click           "My Projects" link/button                      URL changes to /student/my-projects
verify-url      /student/my-projects                           My projects list loads
```

### 8.8 Student — Create Project Wizard (3 Steps)

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS STUDENT FIRST — see 8.5]

navigate        http://localhost:3000/pr/create                 Wizard Step 1 loads
screenshot      --                                             Step 1 "Basic Info" visible

── STEP 1: Basic Info ──
click           title input field                              Field focused
type            E2E Test Project - Browser Automation           Title entered
click           abstract / description textarea                 Field focused
type            This project tests browser automation flows     Abstract entered
click           academic year dropdown                          Dropdown opens
click           first/available option                          Year selected
click           semester dropdown                               Dropdown opens
click           option "Fall" or first available                Semester selected
click           department dropdown                             Dropdown opens
click           first available department                      Department selected
click           "Next" button                                   Wizard advances to Step 2
screenshot      --                                             Step 2 "Team" visible

── STEP 2: Team Members ──
verify-text     current user name or "Team Lead"               Creator shown as lead
click           advisor search / autocomplete field             Field focused
type            sarah                                          Autocomplete triggers
wait            dropdown suggestions appear                     Faculty suggestions shown
click           first suggestion (Sarah Johnson)                Advisor added to list
click           "Next" button                                   Wizard advances to Step 3
screenshot      --                                             Step 3 "Files" visible

── STEP 3: Files & Submit ──
click           "Create Project" or "Save as Draft" button     Project created
wait            URL changes to /pr/{new-slug}                  Redirected to project detail
verify-url      /pr/                                           Project detail page loaded
verify-text     "E2E Test Project - Browser Automation"        Title visible
verify-text     "Draft"                                        Status badge shows Draft
screenshot      --                                             Capture created project
```

### 8.9 Student — Edit Project

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS STUDENT FIRST — see 8.5]

navigate        http://localhost:3000/student/my-projects       My projects list loads
click           first project card or "Edit" action             Navigates to /pr/{slug}/edit
verify-url      /pr/.*?/edit                                   Edit page loads
verify-element  title input pre-populated                      Existing title in field
click           title input                                    Field focused
triple-click    (select all text in field)                     Text selected
type            Updated E2E Project Title                       New title entered
click           "Save" button                                  Changes submitted
wait            success notification/toast                      "Saved" confirmation shown
screenshot      --                                             Verify success state
```

### 8.10 Student — Bookmark a Project

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS STUDENT FIRST — see 8.5]

navigate        http://localhost:3000/explore                   Explore page loads
click           first project card                             Navigates to /pr/{slug}
wait            project detail page loaded                     Page renders fully
click           bookmark icon (heart/bookmark button)           Icon toggles to "filled" state
screenshot      --                                             Verify bookmark icon is active
navigate        http://localhost:3000/bookmarks                 Bookmarks page loads
verify-element  project card                                   Bookmarked project appears in list
verify-text     project title text                              Title matches what was bookmarked
navigate        back to project (/pr/{slug})                   Project detail reloads
click           bookmark icon again                            Icon toggles to "unfilled" state
navigate        http://localhost:3000/bookmarks                 Bookmarks page loads
verify-element  empty state OR project removed                 Project no longer in list
```

### 8.11 Student — Notifications Page

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS STUDENT FIRST — see 8.5]

click           notification bell icon (in header)              Navigates to /notifications or opens dropdown
verify-url      /notifications                                 Notifications page loads
screenshot      --                                             Notifications list visible
click           first notification item (if any)               Marked as read — navigates to related resource
click           browser back                                   Returns to /notifications
click           "Mark All as Read" button (if unread exist)    All notifications marked as read
verify-element  no unread badge                                Badge count cleared
```

### 8.12 Student — Profile & Settings

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS STUDENT FIRST — see 8.5]

click           user avatar/menu in header                     User dropdown menu opens
click           "Profile" menu item                            Navigates to /profile
verify-url      /profile                                       Profile page loads
verify-text     user's full name                               Name visible
screenshot      --                                             Profile page captured

navigate        http://localhost:3000/settings                  Settings page loads
verify-url      /settings                                      Settings page loaded
screenshot      --                                             Settings UI visible
```

### 8.13 Student — Language & Theme Toggle

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS STUDENT FIRST — see 8.5]

navigate        http://localhost:3000/dashboard                 Dashboard loads in current language
click           language switcher (AR/EN toggle)                Language switches
wait            page re-renders                                 UI text changes (EN→AR or AR→EN)
verify-element  dir="rtl" on html (if Arabic)                  RTL layout applied
screenshot      --                                             Capture Arabic/RTL state
click           language switcher again                        Switches back to original language

click           theme toggle (light/dark icon)                 Theme changes
verify-element  body/root background color changed             Dark or light mode applied
screenshot      --                                             Capture theme change
click           theme toggle again                             Reverts to original theme
```

### 8.14 Student — Logout

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS STUDENT FIRST — see 8.5]

click           user avatar/menu in header                     Dropdown menu opens
click           "Logout" or "Sign Out" menu item               Session cleared
wait            URL changes to /login                          Redirected to login page
verify-url      /login                                         Login page shown
navigate        http://localhost:3000/dashboard                 Should redirect to /login
verify-url      /login                                         Confirms session is cleared
```

---

### 8.15 Faculty — Login & Dashboard

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/login                     Login page loads
click           #email                                         Email field focused
type            sarah.johnson@fahras.edu                       Email entered
click           #password                                      Password field focused
type            password                                       Password entered
click           button[type="submit"]                          Form submits
wait            URL changes to /dashboard                      Faculty Dashboard loads
verify-url      /dashboard                                     Dashboard page
verify-text     "Advisee Projects" or similar                  Faculty-specific dashboard content
screenshot      --                                             Capture Faculty Dashboard
```

### 8.16 Faculty — Review Advisee Project

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS FACULTY FIRST — see 8.15]

navigate        http://localhost:3000/dashboard                 Faculty Dashboard loads
click           an advisee project link/card                   Navigates to /pr/{slug}
verify-url      /pr/                                           Project detail loads
scroll          to comments section                            Comments area visible
click           comment input / textarea                        Field focused
type            Faculty review: good progress on implementation Comment typed
click           "Submit" or "Post Comment" button              Comment posted
wait            comment appears in list                        New comment visible in thread
screenshot      --                                             Verify comment posted
```

### 8.17 Faculty — Pending Approvals

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS FACULTY FIRST — see 8.15]

navigate        http://localhost:3000/faculty/pending-approvals  Pending approvals page loads
verify-url      /faculty/pending-approvals                     Page loaded
screenshot      --                                             Approval queue visible
click           first project in queue (if any)                Navigates to /pr/{slug}
verify-url      /pr/                                           Project detail loads
click           browser back                                   Returns to pending approvals
```

### 8.18 Faculty — Access Denied Pages

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS FACULTY FIRST — see 8.15]

navigate        http://localhost:3000/admin/approvals           Redirect to /dashboard or 403
verify-url      NOT /admin/approvals                           Faculty cannot access admin page
navigate        http://localhost:3000/access-control            Redirect to /dashboard or 403
verify-url      NOT /access-control                            Faculty cannot access RBAC page
navigate        http://localhost:3000/milestone-templates       Redirect to /dashboard or 403
verify-url      NOT /milestone-templates                       Faculty cannot manage templates
screenshot      --                                             Verify denied state
```

---

### 8.19 Admin — Login & Dashboard

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/login                     Login page loads
click           #email                                         Email field focused
type            admin@fahras.edu                               Email entered
click           #password                                      Password field focused
type            password                                       Password entered
click           button[type="submit"]                          Form submits
wait            URL changes to /dashboard                      Admin Dashboard loads
verify-url      /dashboard                                     Dashboard page
verify-text     "Total Projects"                               Admin stat card visible
verify-text     "Pending Approvals"                            Admin stat card visible
screenshot      --                                             Capture Admin Dashboard
```

### 8.20 Admin — Approve a Project

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS ADMIN FIRST — see 8.19]

navigate        http://localhost:3000/admin/approvals           Approval queue loads
verify-url      /admin/approvals                               Page loaded
screenshot      --                                             Pending projects listed
click           first pending project                          Navigates to project detail
verify-url      /pr/                                           Project detail loads
click           "Approve" button                               Confirmation dialog appears
click           "Confirm" or dialog accept button              Approval processed
wait            success message/notification                   "Project approved" confirmation
screenshot      --                                             Verify approval success
navigate        http://localhost:3000/admin/approvals           Return to approval queue
verify-element  project removed from pending list              Approved project no longer pending
```

### 8.21 Admin — User Management

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS ADMIN FIRST — see 8.19]

navigate        http://localhost:3000/access-control (or admin user page) User list loads
screenshot      --                                             User table/list visible
click           search input                                   Search field focused
type            sarah                                          Search query entered
wait            results filter                                 Filtered to matching users
verify-text     "sarah" (in result rows)                       Sarah appears in results
click           "Clear" or clear search                        Full list restored

── Create User ──
click           "Create User" or "Add User" button             Creation form/dialog opens
click           name input                                     Name field focused
type            Test User Browser                              Name entered
click           email input                                    Email field focused
type            testuser.browser@fahras.edu                    Email entered
click           password input                                 Password field focused
type            TestPassword123!                               Password entered
click           role select/dropdown                           Role dropdown opens
click           "student" option                               Student role selected
click           "Create" / "Save" button                       User created
wait            success message                                "User created" confirmation
screenshot      --                                             Verify user in list
```

### 8.22 Admin — Access Control (Roles & Permissions)

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS ADMIN FIRST — see 8.19]

navigate        http://localhost:3000/access-control            Access control page loads
verify-url      /access-control                                Page loaded
verify-text     "admin"                                        Admin role listed
verify-text     "faculty"                                      Faculty role listed
verify-text     "student"                                      Student role listed
verify-text     "reviewer"                                     Reviewer role listed
screenshot      --                                             Roles & permissions visible
click           "admin" role row/card                          Role detail/edit view opens
verify-text     "system.admin"                                 Admin permissions listed
click           browser back or close                          Returns to roles list
```

### 8.23 Admin — Milestone Templates

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS ADMIN FIRST — see 8.19]

navigate        http://localhost:3000/milestone-templates       Template list loads
verify-url      /milestone-templates                           Page loaded
screenshot      --                                             Templates listed
click           "Create Template" button                       Template editor opens
click           template name input                            Field focused
type            E2E Test Template                              Template name entered
click           "Add Item" or "Add Milestone" button           New item row appears
click           item name input                                Field focused
type            Phase 1 - Requirements                         Item name entered
click           "Save" button                                  Template saved
wait            success message                                "Template created" confirmation
screenshot      --                                             Verify template in list
```

### 8.24 Admin — Analytics Dashboard

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS ADMIN FIRST — see 8.19]

navigate        http://localhost:3000/analytics                 Analytics page loads
verify-url      /analytics                                     Page loaded
wait            charts to render                               Charts/graphs visible
verify-element  chart or SVG element                           At least one chart rendered
screenshot      --                                             Capture analytics dashboard
scroll          down to see more charts                        Additional visualizations visible
screenshot      --                                             Capture full analytics view
```

### 8.25 Admin — Full Navigation Sweep

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS ADMIN FIRST — see 8.19]

navigate        http://localhost:3000/dashboard                 ✅ Admin Dashboard loads
navigate        http://localhost:3000/explore                   ✅ Explore page loads
navigate        http://localhost:3000/admin/approvals           ✅ Approval queue loads
navigate        http://localhost:3000/access-control            ✅ RBAC page loads
navigate        http://localhost:3000/milestone-templates       ✅ Templates page loads
navigate        http://localhost:3000/analytics                 ✅ Analytics loads
navigate        http://localhost:3000/access-control            ✅ User management loads
navigate        http://localhost:3000/notifications             ✅ Notifications load
navigate        http://localhost:3000/profile                   ✅ Profile page loads
navigate        http://localhost:3000/settings                  ✅ Settings page loads
navigate        http://localhost:3000/bookmarks                 ✅ Bookmarks page loads
navigate        http://localhost:3000/student/my-projects       ✅ Student projects loads (admin access)
navigate        http://localhost:3000/faculty/pending-approvals ✅ Faculty approvals loads (admin access)
navigate        http://localhost:3000/evaluations               ✅ Evaluations loads
navigate        http://localhost:3000/pr/create                 ✅ Project create wizard loads
```

---

### 8.26 Reviewer — Login & Read-Only Browsing

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
navigate        http://localhost:3000/login                     Login page loads
click           #email                                         Email field focused
type            reviewer@fahras.edu                            Email entered
click           #password                                      Password field focused
type            password                                       Password entered
click           button[type="submit"]                          Form submits
wait            URL changes to /dashboard                      Reviewer Dashboard loads
verify-url      /dashboard                                     Dashboard page
screenshot      --                                             Capture Reviewer Dashboard

── Browse Projects ──
navigate        http://localhost:3000/explore                   Explore page loads
click           first project card                             Navigates to /pr/{slug}
verify-url      /pr/                                           Project detail loads
verify-element  NO "Edit" button visible                       Edit is not available to reviewer
verify-element  NO "Delete" button visible                     Delete is not available to reviewer
scroll          to files section                               Files visible
click           download button on a file                      File downloads
scroll          to comments section                            Comments visible
click           comment textarea                               Field focused
type            Reviewer feedback: well-documented project     Comment typed
click           "Post" / "Submit" button                       Comment saved
wait            comment appears in list                        Reviewer comment visible
screenshot      --                                             Verify read + comment access
```

### 8.27 Reviewer — Access Denied Pages

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS REVIEWER FIRST — see 8.26]

navigate        http://localhost:3000/pr/create                 Redirect or 403
verify-url      NOT /pr/create                                 Cannot create projects
navigate        http://localhost:3000/admin/approvals           Redirect or 403
verify-url      NOT /admin/approvals                           Cannot access admin
navigate        http://localhost:3000/access-control            Redirect or 403
verify-url      NOT /access-control                            Cannot manage roles
navigate        http://localhost:3000/milestone-templates       Redirect or 403
verify-url      NOT /milestone-templates                       Cannot manage templates
screenshot      --                                             Verify restrictions
```

---

### 8.28 Cross-Role — Full Project Lifecycle (Browser E2E)

> This is the **most comprehensive** browser test. It walks through the entire project lifecycle across 3 different user sessions.

```
═══════════════════════════════════════════════════════════════
PHASE 1: Student Creates & Submits Project
═══════════════════════════════════════════════════════════════

navigate        http://localhost:3000/login                     Login page
click           #email → type: ahmed.almansouri@student.fahras.edu
click           #password → type: password
click           button[type="submit"]                          Login
wait            /dashboard                                     Student Dashboard

navigate        http://localhost:3000/pr/create                 Wizard Step 1
click           title → type: "Lifecycle E2E Test Project"
click           abstract → type: "End-to-end browser test"
click           academic year → select first option
click           semester → select first option
click           department → select first option
click           "Next"                                         Step 2
click           "Next"                                         Step 3 (skip team for speed)
click           "Create Project"                               Project created
wait            /pr/{slug}                                     Detail page
verify-text     "Lifecycle E2E Test Project"                   Title confirmed
verify-text     "Draft"                                        Status confirmed
screenshot      --                                             Phase 1 complete

── Student logs out ──
click           user menu → "Logout"
wait            /login

═══════════════════════════════════════════════════════════════
PHASE 2: Faculty Reviews & Comments
═══════════════════════════════════════════════════════════════

click           #email → type: sarah.johnson@fahras.edu
click           #password → type: password
click           button[type="submit"]                          Login as Faculty
wait            /dashboard                                     Faculty Dashboard

navigate        http://localhost:3000/explore                   Explore
click           search → type: "Lifecycle E2E Test Project"
press           Enter                                          Search
click           matching project card                          Navigate to project
scroll          to comments section
click           comment input → type: "Faculty review: looks great!"
click           "Post Comment"                                 Comment saved
wait            comment visible in list
screenshot      --                                             Phase 2 complete

── Faculty logs out ──
click           user menu → "Logout"
wait            /login

═══════════════════════════════════════════════════════════════
PHASE 3: Admin Approves Project
═══════════════════════════════════════════════════════════════

click           #email → type: admin@fahras.edu
click           #password → type: password
click           button[type="submit"]                          Login as Admin
wait            /dashboard                                     Admin Dashboard

navigate        http://localhost:3000/admin/approvals           Approvals page
click           project "Lifecycle E2E Test Project" (if in queue)
click           "Approve" button                               Approval dialog
click           "Confirm"                                      Project approved
wait            success message
screenshot      --                                             Phase 3 complete

── Verify as Guest ──
click           user menu → "Logout"
wait            /login

navigate        http://localhost:3000/explore
click           search → type: "Lifecycle E2E Test Project"
press           Enter
verify-element  project card in results                        Approved project is publicly visible
screenshot      --                                             Full lifecycle verified
```

---

### 8.29 Cross-Role — Bookmark Sync (Guest → Student)

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
── Phase 1: Guest bookmarks ──
navigate        http://localhost:3000/explore                   Explore page (not logged in)
click           first project card                             Navigate to /pr/{slug}
click           bookmark icon                                  Bookmark saved (cookie)
navigate        http://localhost:3000/bookmarks                 Bookmarks page
verify-element  bookmarked project card                        Project visible in bookmarks

── Phase 2: Login and verify sync ──
navigate        http://localhost:3000/login
click           #email → type: ahmed.almansouri@student.fahras.edu
click           #password → type: password
click           button[type="submit"]                          Login
wait            /dashboard

navigate        http://localhost:3000/bookmarks                 Bookmarks page
verify-element  project card from guest session                 Guest bookmarks synced to account
screenshot      --                                             Verify sync complete
```

---

### 8.30 Error Handling — Browser Validation Tests

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
── Login Validation ──
navigate        http://localhost:3000/login
click           button[type="submit"]                          Submit empty form
verify-text     "Email is required"                            Email error shown
verify-text     "Password is required"                         Password error shown
screenshot      --                                             Capture validation errors

click           #email → type: invalid-email
click           #password → type: x
click           button[type="submit"]
verify-text     "Email is invalid"                             Email format error
screenshot      --                                             Capture email format error

click           #email → clear → type: admin@fahras.edu
click           #password → clear → type: wrongpassword
click           button[type="submit"]
wait            error alert
verify-element  .MuiAlert-standardError                        "Invalid credentials" alert
screenshot      --                                             Capture wrong password error

── 404 Page ──
navigate        http://localhost:3000/pr/this-slug-does-not-exist
wait            page loads
verify-text     "404" or "Not Found"                           404 page shown
screenshot      --                                             Capture 404 page

── Direct URL to restricted page ──
navigate        http://localhost:3000/admin/approvals
verify-url      /login                                         Redirected (not authenticated)
screenshot      --                                             Verify redirect
```

### 8.31 Responsiveness — Mobile Viewport Tests

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
set-viewport    375 x 812 (iPhone)                             Mobile viewport
navigate        http://localhost:3000/                          Landing page loads
screenshot      --                                             Verify mobile layout
verify-element  hamburger menu icon (MenuIcon)                 Mobile nav trigger visible
click           hamburger menu icon                            Mobile drawer opens
screenshot      --                                             Capture mobile drawer
click           "Explore" in drawer                            Navigates to /explore
verify-url      /explore                                       Explore page
screenshot      --                                             Verify mobile explore layout

navigate        http://localhost:3000/login
screenshot      --                                             Verify login mobile layout
click           #email → type: admin@fahras.edu
click           #password → type: password
click           button[type="submit"]
wait            /dashboard
screenshot      --                                             Verify dashboard mobile layout

set-viewport    1920 x 1080 (Desktop)                          Reset to desktop
navigate        http://localhost:3000/dashboard
screenshot      --                                             Compare desktop layout
```

### 8.32 RTL / Arabic Layout Tests

```
ACTION          TARGET / VALUE                                  EXPECTED
─────────────────────────────────────────────────────────────────────────
[LOGIN AS ANY USER — see 8.5 / 8.15 / 8.19]

navigate        http://localhost:3000/dashboard                 Dashboard loads (EN/LTR)
screenshot      --                                             Baseline LTR screenshot
click           language switcher (toggle to Arabic)           Language changes
wait            page re-renders in Arabic                      Arabic text visible
verify-element  html[dir="rtl"]                                RTL direction applied
screenshot      --                                             Capture RTL dashboard

navigate        http://localhost:3000/explore                   Explore page (Arabic)
screenshot      --                                             Verify RTL explore layout
verify-element  search input aligned right                     RTL text alignment

navigate        http://localhost:3000/login
click           language switcher                              Back to English
wait            page re-renders                                English text restored
verify-element  html[dir="ltr"]                                LTR direction restored
screenshot      --                                             Confirm restored to LTR
```

---

### Browser Test Summary Matrix

| Test ID | Role | Feature Tested | Steps |
|---------|------|----------------|:-----:|
| 8.1 | Guest | Landing page nav | 8 |
| 8.2 | Guest | Explore & search | 12 |
| 8.3 | Guest | Project detail & download | 8 |
| 8.4 | Guest | Access denied redirects | 10 |
| 8.5 | Student | Login flow | 10 |
| 8.6 | Student | Login validation | 12 |
| 8.7 | Student | Dashboard navigation | 8 |
| 8.8 | Student | Create project (3-step) | 25+ |
| 8.9 | Student | Edit project | 10 |
| 8.10 | Student | Bookmark toggle | 12 |
| 8.11 | Student | Notifications | 8 |
| 8.12 | Student | Profile & settings | 8 |
| 8.13 | Student | Language & theme | 10 |
| 8.14 | Student | Logout | 6 |
| 8.15 | Faculty | Login & dashboard | 10 |
| 8.16 | Faculty | Review project + comment | 12 |
| 8.17 | Faculty | Pending approvals | 6 |
| 8.18 | Faculty | Access denied | 8 |
| 8.19 | Admin | Login & dashboard | 10 |
| 8.20 | Admin | Approve project | 12 |
| 8.21 | Admin | User management + create | 16 |
| 8.22 | Admin | Access control (RBAC) | 10 |
| 8.23 | Admin | Milestone templates | 10 |
| 8.24 | Admin | Analytics dashboard | 6 |
| 8.25 | Admin | Full navigation sweep | 15 |
| 8.26 | Reviewer | Login & read-only browse | 18 |
| 8.27 | Reviewer | Access denied | 10 |
| 8.28 | Cross-Role | Full project lifecycle E2E | 40+ |
| 8.29 | Cross-Role | Bookmark sync guest→student | 12 |
| 8.30 | All | Error & validation handling | 16 |
| 8.31 | All | Mobile responsiveness | 14 |
| 8.32 | All | RTL / Arabic layout | 12 |

**Total: 32 browser test scenarios, ~350+ individual actions**

---

*End of Test Workflows Document*
