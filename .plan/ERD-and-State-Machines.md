# Fahras — ERD & State Machines (Mermaid)

Entity-relationship and state-machine diagrams derived from `prisma/schema.prisma` and application constants.

---

## 1. Entity Relationship Diagram (Core)

```mermaid
erDiagram
    User ||--o{ RoleUser : "has"
    Role ||--o{ RoleUser : "assigned via"
    Role ||--o{ PermissionRole : "has"
    Permission ||--o{ PermissionRole : "granted via"

    User ||--o{ Project : "creates"
    User ||--o{ Project : "approves"
    Program ||--o{ Project : "belongs to"
    Department ||--o{ Program : "contains"
    User ||--o{ Faculty : "is"
    User ||--o{ Student : "is"
    Program ||--o{ Student : "enrolled in"
    Department ||--o{ Faculty : "employs"

    Project ||--o{ ProjectMember : "has"
    User ||--o{ ProjectMember : "member of"
    Project ||--o{ ProjectAdvisor : "has"
    User ||--o{ ProjectAdvisor : "advises"

    Project ||--o{ File : "has"
    User ||--o{ File : "uploads"
    Project ||--o{ Comment : "has"
    User ||--o{ Comment : "writes"
    Project ||--o{ Rating : "has"
    User ||--o{ Rating : "gives"
    Project ||--o{ Bookmark : "bookmarked"
    User ||--o{ Bookmark : "bookmarks"

    Project ||--o{ ProjectTag : "tagged"
    Tag ||--o{ ProjectTag : "applied to"
    Project ||--o| ProjectAiMetadata : "has"
    Project ||--o{ ProjectMilestone : "has"
    MilestoneTemplateItem ||--o{ ProjectMilestone : "instantiates"
    MilestoneTemplate ||--o{ MilestoneTemplateItem : "contains"
    Project ||--o| MilestoneTemplate : "uses"

    Project ||--o{ ProjectActivity : "logs"
    User ||--o{ ProjectActivity : "performs"
    Project ||--o{ ProjectFollower : "followed by"
    User ||--o{ ProjectFollower : "follows"
    Project ||--o{ ProjectFlag : "has"
    User ||--o{ ProjectFlag : "creates"
    User ||--o{ ProjectFlag : "resolves"

    User ||--o{ Notification : "receives"
    Project ||--o{ Notification : "related"
    User ||--o{ SavedSearch : "saves"
    User ||--o{ SearchQuery : "queries"

    User {
        int id PK
        string full_name
        string email UK
        UserStatus status
        datetime created_at
        datetime updated_at
    }

    Role {
        int id PK
        string name UK
        boolean is_system_role
        boolean is_template
    }

    Permission {
        int id PK
        string code UK
        PermissionCategory category
        PermissionScope scope
    }

    Department {
        int id PK
        string name
    }

    Program {
        int id PK
        int department_id FK
        string name
        DegreeLevel degree_level
    }

    Project {
        int id PK
        string slug UK
        int program_id FK
        int created_by_user_id FK
        int approved_by_user_id FK
        string title
        text abstract
        ProjectStatus status
        AdminApprovalStatus admin_approval_status
        AiAnalysisStatus ai_analysis_status
        boolean is_public
        datetime created_at
        datetime updated_at
    }

    File {
        int id PK
        int project_id FK
        int uploaded_by_user_id FK
        string filename
        string storage_url
        boolean is_public
    }

    ProjectMilestone {
        int id PK
        int project_id FK
        int template_item_id FK
        string title
        MilestoneStatus status
        date due_date
        datetime started_at
        datetime completed_at
    }

    MilestoneTemplate {
        int id PK
        string name
        int program_id FK
        int department_id FK
        int created_by_user_id FK
        boolean is_default
    }

    MilestoneTemplateItem {
        int id PK
        int template_id FK
        string title
        int order
        int estimated_days
    }

    ProjectFlag {
        int id PK
        int project_id FK
        int flagged_by_user_id FK
        int resolved_by_user_id FK
        FlagType flag_type
        FlagSeverity severity
        datetime resolved_at
    }

    Notification {
        int id PK
        int user_id FK
        int project_id FK
        string type
        string title
        text message
        boolean is_read
    }

    Tag {
        int id PK
        string name UK
        string slug UK
        TagType type
    }
```

---

## 2. Entity Relationship Diagram (Auth & Academic)

```mermaid
erDiagram
    User ||--o{ Session : "has"
    User ||--o{ PersonalAccessToken : "tokenable"
    User ||--o{ RoleUser : "has"
    Role ||--o{ RoleUser : "assigned to"
    Role ||--o{ PermissionRole : "has"
    Permission ||--o{ PermissionRole : "in"

    Faculty }o--|| User : "user"
    Faculty }o--|| Department : "department"
    Student }o--|| User : "user"
    Student }o--|| Program : "program"
    Department ||--o{ Program : "programs"
    Department ||--o{ Faculty : "faculty"
    Program ||--o{ Student : "students"
    Program ||--o{ Project : "projects"

    User {
        int id PK
        string full_name
        string email UK
        UserStatus status
    }

    Faculty {
        int id PK
        int user_id FK
        int department_id FK
        string faculty_no UK
        boolean is_supervisor
    }

    Student {
        int id PK
        int user_id FK
        int program_id FK
        string student_no UK
        int cohort_year
    }
```

---

## 3. State Machine — User Status

User account lifecycle (admin toggle).

```mermaid
stateDiagram-v2
    [*] --> active
    active --> inactive : deactivate
    active --> suspended : suspend
    inactive --> active : activate
    suspended --> active : reactivate
    suspended --> inactive : deactivate
```

| State      | Description                    |
|-----------|---------------------------------|
| `active`   | User can log in and use the system |
| `inactive` | Account disabled, cannot log in    |
| `suspended`| Temporarily blocked               |

---

## 4. State Machine — Project Status (Workflow)

Project lifecycle from creation to completion.

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> submitted : submit
    submitted --> under_review : assign review
    under_review --> approved : approve
    under_review --> rejected : reject
    under_review --> draft : request revision
    rejected --> draft : resubmit
    approved --> completed : mark completed
    completed --> approved : reopen
```

| State          | Description                          |
|----------------|--------------------------------------|
| `draft`        | Work in progress, not submitted      |
| `submitted`    | Submitted for review                 |
| `under_review` | Being evaluated                      |
| `approved`     | Accepted and visible (if admin approved) |
| `rejected`     | Rejected; can resubmit from draft    |
| `completed`    | Project marked as finished          |

---

## 5. State Machine — Admin Approval Status

Visibility/approval of a project (admin-controlled).

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> approved : approve
    pending --> hidden : hide
    approved --> hidden : hide
    approved --> pending : revoke
    hidden --> pending : unhide
    hidden --> approved : approve
```

| State     | Description                              |
|-----------|------------------------------------------|
| `pending` | Awaiting admin decision                  |
| `approved`| Listed and discoverable                 |
| `hidden`  | Not listed; may still be accessible by URL |

---

## 6. State Machine — AI Analysis Status

AI metadata analysis for a project.

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> processing : start analysis
    processing --> completed : success
    processing --> failed : error
    failed --> pending : retry
    completed --> pending : re-analyze
```

| State        | Description                |
|-------------|----------------------------|
| `pending`   | Not yet analyzed           |
| `processing`| Analysis in progress       |
| `completed` | Analysis done; metadata set |
| `failed`    | Analysis error; can retry  |

---

## 7. State Machine — Milestone Status

Per-project milestone progress.

```mermaid
stateDiagram-v2
    [*] --> not_started
    not_started --> in_progress : start
    in_progress --> completed : complete
    in_progress --> blocked : block
    blocked --> in_progress : unblock
    completed --> in_progress : reopen
```

| State         | Description           |
|---------------|-----------------------|
| `not_started` | Not yet started       |
| `in_progress` | Work in progress      |
| `completed`   | Done                  |
| `blocked`     | Blocked by dependency or issue |

---

## 8. State Machine — Project Flag (Resolution)

Issue flags on a project (open vs resolved).

```mermaid
stateDiagram-v2
    [*] --> open
    open --> resolved : resolve
    resolved --> open : reopen
```

| State     | Description                    |
|-----------|--------------------------------|
| `open`    | `resolved_at` is null          |
| `resolved`| `resolved_at` set; has resolver and notes |

**Flag types:** `scope_creep`, `technical_blocker`, `team_conflict`, `resource_shortage`, `timeline_risk`, `other`  
**Severity:** `low`, `medium`, `high`, `critical`

---

## 9. Enums Reference (from Prisma)

| Enum                 | Values |
|----------------------|--------|
| `UserStatus`         | active, inactive, suspended |
| `ProjectStatus`      | draft, submitted, under_review, approved, rejected, completed |
| `AdminApprovalStatus`| pending, approved, hidden |
| `AiAnalysisStatus`   | pending, processing, completed, failed |
| `MilestoneStatus`    | not_started, in_progress, completed, blocked |
| `DegreeLevel`       | bachelor, master, phd |
| `Semester`          | fall, spring, summer |
| `MemberRole`        | LEAD, MEMBER |
| `AdvisorRole`       | MAIN, CO_ADVISOR, REVIEWER |
| `FlagType`          | scope_creep, technical_blocker, team_conflict, resource_shortage, timeline_risk, other |
| `FlagSeverity`      | low, medium, high, critical |
| `TagType`           | manual, ai_generated, system |
| `ProjectTagSource`  | manual, ai_suggested, ai_auto |
| `PermissionCategory`| Projects, Users, Files, Analytics, Settings, System, Roles |
| `PermissionScope`   | all, department, own, none |
| `ComplexityLevel`   | beginner, intermediate, advanced, expert |

---

## 10. High-Level Domain Overview

```mermaid
flowchart TB
    subgraph Auth["Auth & RBAC"]
        User
        Role
        Permission
        Session
    end

    subgraph Academic["Academic Structure"]
        Department
        Program
        Faculty
        Student
    end

    subgraph Projects["Projects Domain"]
        Project
        File
        Comment
        Rating
        Bookmark
        ProjectTag
        ProjectAiMetadata
        ProjectMilestone
        ProjectActivity
        ProjectFollower
        ProjectFlag
    end

    subgraph Templates["Templates"]
        MilestoneTemplate
        MilestoneTemplateItem
    end

    subgraph Discovery["Discovery & Search"]
        Tag
        SavedSearch
        SearchQuery
    end

    User --> Auth
    User --> Academic
    User --> Projects
    Academic --> Project
    Project --> Templates
    Project --> Discovery
```

---

## 11. How Next.js Handles the Backend

This app does **not** call an external Laravel API. **Next.js is the backend**: the same app serves the React frontend and the API via Route Handlers and talks to PostgreSQL with Prisma.

### Request flow

```mermaid
flowchart LR
  subgraph Client["Browser"]
    React["React App"]
  end

  subgraph NextJS["Next.js (same origin)"]
    API["/api/* Route Handlers"]
    Auth["NextAuth (session)"]
    Prisma["Prisma Client"]
  end

  DB[(PostgreSQL)]

  React -->|"fetch('/api/...')"| API
  API --> Auth
  API --> Prisma
  Auth -->|"session from cookie"| API
  Prisma --> DB
```

### Pieces

| Layer | What it does |
|-------|-------------------------------|
| **Frontend** (`src/lib/api.ts`) | Calls relative URLs `fetch('/api/...')`. Sends `Accept: application/json` and optionally `Authorization: Bearer <token>` (legacy; see below). |
| **API routes** (`src/app/api/**/route.ts`) | Implement GET/POST/etc. They use **Prisma** for DB and **NextAuth** for auth. No proxy to Laravel. |
| **Auth** | **NextAuth** with Credentials provider and JWT session. Login is `signIn('credentials', { email, password })`; session is stored in a **cookie**. Server reads session via `auth()` in Route Handlers. |
| **Auth helpers** (`src/lib/auth-helpers.ts`, `src/middleware/auth.ts`) | `requireAuth()`, `optionalAuth()`, `requireRole()`, and route wrappers `withAuth()`, `withOptionalAuth()`, `withRole()` so handlers get a validated session or 401/403. |
| **Database** | **Prisma** as the only ORM; `prisma/schema.prisma` matches the DB. Laravel does not run in this stack; Prisma replaces it. |

### Auth note

- **Server-side**: Route Handlers use `auth()` (NextAuth), which uses the **session cookie**. Same-origin `fetch('/api/...')` sends that cookie automatically.
- **Client-side**: The app still has a Zustand auth store and `Authorization: Bearer` in `api.ts` (leftover from a previous Laravel/Sanctum setup). The routes that use `requireAuth()` / `withAuth()` rely on the **NextAuth session cookie**, not the Bearer token.

### Summary

- **Backend = Next.js API routes + Prisma + PostgreSQL.**
- **No Laravel in the request path** — frontend → Next.js `/api/*` → Prisma → DB.
- **Auth** = NextAuth (Credentials, JWT, cookie); protect routes with `withAuth` / `requireAuth` and optional role checks with `withRole` / `requireRole`.

---

*Generated from Fahras codebase — Prisma schema and app constants. Update this doc when schema or state transitions change.*
