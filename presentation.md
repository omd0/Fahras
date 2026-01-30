---
marp: true
theme: default
paginate: true
backgroundColor: #f8fafc
style: |
  :root {
    --color-primary: #1e3a5f;
    --color-accent: #2563eb;
    --color-highlight: #059669;
  }
  section {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: #1e293b;
  }
  section.lead {
    background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
    color: #ffffff;
    text-align: center;
  }
  section.lead h1 {
    font-size: 3em;
    margin-bottom: 0.2em;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  section.lead h2 {
    font-weight: 300;
    font-size: 1.4em;
    opacity: 0.9;
  }
  section.lead p {
    opacity: 0.8;
  }
  h1 {
    color: var(--color-primary);
    border-bottom: 3px solid var(--color-accent);
    padding-bottom: 0.3em;
  }
  h2 { color: var(--color-primary); }
  strong { color: var(--color-accent); }
  code {
    background: #e2e8f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  table {
    font-size: 0.85em;
    width: 100%;
  }
  th {
    background: var(--color-primary);
    color: white;
    padding: 8px 12px;
  }
  td { padding: 6px 12px; }
  section.section-break {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    color: white;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  section.section-break h1 {
    color: white;
    border: none;
    font-size: 2.5em;
  }
  .columns { display: flex; gap: 2em; }
  .col { flex: 1; }
  .badge {
    display: inline-block;
    background: var(--color-accent);
    color: white;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.8em;
    margin: 2px;
  }
---

<!-- _class: lead -->

# Fahras

## Graduation Project Archiving System

**A Modern Full-Stack Platform for Academic Project Management**

Laravel 11 &bull; React 19 &bull; PostgreSQL &bull; Docker

---

# Agenda

1. **Problem Statement** — Why Fahras?
2. **Solution Overview** — What we built
3. **Technology Stack** — Tools & frameworks
4. **System Architecture** — How it all connects
5. **Backend Design** — API & domain structure
6. **Frontend Design** — UI & state management
7. **Database Schema** — Data modeling
8. **Key Features** — Core capabilities
9. **Infrastructure** — Docker & cloud storage
10. **Security** — Authentication & authorization
11. **Demo & Access** — Running the system
12. **Future Work** — What's next

---

# Problem Statement

### Challenges in Academic Project Management

- **Scattered Archives** — Graduation projects stored across USB drives, emails, and shared folders with no centralized system
- **No Discoverability** — Students cannot easily search or learn from previous work
- **Lost Institutional Knowledge** — Valuable academic output disappears after graduation
- **Manual Workflows** — Project approval, evaluation, and milestone tracking done on paper
- **No Collaboration** — Limited tools for advisors, evaluators, and students to interact

### The Cost

> Universities lose years of academic research and student innovation due to lack of a proper archiving and discovery system.

---

# Solution: Fahras

### A Comprehensive Digital Archive & Management Platform

<div class="columns">
<div class="col">

**For Students**
- Submit & manage projects
- Track milestones
- Upload files & documentation
- Receive feedback & ratings

**For Faculty**
- Advise and evaluate projects
- Approve submissions
- Track student progress
- Manage milestone templates

</div>
<div class="col">

**For Administrators**
- Full project lifecycle management
- Role-based access control
- Analytics & reporting
- System configuration

**For the Institution**
- Searchable project archive
- AI-powered discovery
- Institutional memory preservation
- Multi-language support (Arabic/English)

</div>
</div>

---

<!-- _class: section-break -->

# Technology Stack

---

# Tech Stack — Backend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Laravel | 11 | PHP API framework |
| **Language** | PHP | 8.2+ | Server-side logic |
| **Auth** | Laravel Sanctum | 4.0 | SPA & token authentication |
| **Database** | PostgreSQL | 16 | Primary data store (UTF-8) |
| **Cache** | Redis | 7 | Sessions, cache, queues |
| **Storage** | MinIO (S3) | Latest | Object storage for files |
| **Testing** | PHPUnit | 11 | Unit & feature tests |
| **Linting** | Laravel Pint | 1.13 | Code formatting |

Cloud storage adapters: **AWS S3**, **Google Cloud**, **Azure Blob**, **Dropbox**

---

# Tech Stack — Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19 | UI component library |
| **Language** | TypeScript | 5.6 | Type-safe JavaScript |
| **UI Kit** | Material-UI (MUI) | 7 | Component design system |
| **State** | Zustand | 5 | Lightweight state management |
| **Routing** | React Router | 7 | Client-side routing |
| **HTTP** | Axios | 1.12 | API communication |
| **Animation** | Framer Motion | 12 | UI animations |
| **Build** | Vite | 6 | Fast build tooling |
| **Linting** | ESLint | 9 | Code quality |

---

<!-- _class: section-break -->

# System Architecture

---

# Architecture Overview

```
                    ┌─────────────────────────────────────────────┐
                    │              Docker Network                  │
                    │                                             │
  Users ──────────►│  ┌─────────┐     ┌──────────┐              │
                    │  │  Nginx  │────►│  PHP/FPM │              │
           :80      │  │ Reverse │     │ Laravel  │              │
                    │  │  Proxy  │     │   API    │              │
                    │  └─────────┘     └────┬─────┘              │
                    │                       │                     │
  Users ──────────►│  ┌─────────┐     ┌────┴─────┐  ┌────────┐ │
                    │  │  Vite   │     │PostgreSQL│  │ Redis  │ │
           :3000    │  │  React  │     │   :5432  │  │ :6379  │ │
                    │  │Frontend │     └──────────┘  └────────┘ │
                    │  └─────────┘                               │
                    │                  ┌──────────┐              │
                    │                  │  MinIO   │              │
                    │                  │S3 Storage│              │
                    │                  │:9000/9001│              │
                    │                  └──────────┘              │
                    └─────────────────────────────────────────────┘
```

---

# Request Flow

```
  Browser                    Nginx                 Laravel               Database
    │                          │                      │                     │
    │── GET /api/projects ────►│                      │                     │
    │                          │── Forward to PHP ───►│                     │
    │                          │                      │── SQL Query ───────►│
    │                          │                      │◄── Result Set ──────│
    │                          │                      │── Cache in Redis    │
    │                          │◄── JSON Response ────│                     │
    │◄── API Response ─────────│                      │                     │
    │                          │                      │                     │
    │── POST /api/files ──────►│                      │                     │
    │   (multipart/form-data)  │── Forward ──────────►│                     │
    │                          │                      │── Store in MinIO    │
    │                          │                      │── Save metadata ───►│
    │                          │◄── { url, id } ──────│                     │
    │◄── Upload Complete ──────│                      │                     │
```

---

<!-- _class: section-break -->

# Backend Design

---

# Domain-Driven Design (DDD)

### Backend follows a hybrid DDD + traditional Laravel structure

```
api/
├── app/
│   ├── Domains/                          # Domain-Driven modules
│   │   └── Projects/
│   │       ├── Controllers/
│   │       │   ├── ProjectController.php      # CRUD, search, analytics
│   │       │   └── ProjectFollowController.php # Following & flags
│   │       ├── Models/
│   │       │   ├── Project.php
│   │       │   ├── ProjectActivity.php
│   │       │   ├── ProjectFollower.php
│   │       │   └── ProjectMilestone.php
│   │       └── Services/                      # Business logic
│   │
│   ├── Http/Controllers/                 # Shared controllers
│   │   ├── AuthController.php
│   │   ├── FileController.php
│   │   ├── AiSearchController.php
│   │   └── RoleController.php
│   │
│   ├── Models/                           # Shared models
│   │   ├── User.php, Role.php, Permission.php
│   │   └── Tag.php, File.php, Comment.php
│   │
│   └── Http/Middleware/
│       └── OptionalAuthSanctum.php       # Guest + auth support
```

---

# API Endpoints

<div class="columns">
<div class="col">

### Authentication
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/register` | User registration |
| POST | `/api/login` | User login |
| POST | `/api/logout` | User logout |
| GET | `/api/user` | Current user |
| POST | `/api/refresh` | Refresh token |

### Projects
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/projects` | List & filter |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{slug}` | Get details |
| PUT | `/api/projects/{slug}` | Update |
| DELETE | `/api/projects/{slug}` | Delete |

</div>
<div class="col">

### Files
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/projects/{id}/files` | Upload |
| GET | `/api/projects/{id}/files` | List files |
| GET | `/api/files/{id}/download` | Download |

### Discovery
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/ai-search` | AI search |
| GET | `/api/tags` | Browse tags |
| GET/POST | `/api/saved-searches` | Saved queries |

### Admin
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET/POST | `/api/roles` | Manage roles |
| GET/PUT | `/api/users` | Manage users |
| GET/POST | `/api/milestones` | Templates |

</div>
</div>

---

<!-- _class: section-break -->

# Frontend Design

---

# Feature-Based Architecture

```
web/src/
├── features/                        # Feature modules (domain-driven)
│   ├── auth/                        # Authentication
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── store.ts                 # Zustand auth store
│   ├── projects/                    # Project management
│   │   ├── ExplorePage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   ├── CreateProjectPage.tsx
│   │   └── components/              # Feature-specific components
│   ├── dashboards/                  # User dashboards
│   ├── access-control/              # RBAC management
│   ├── milestones/                  # Milestone templates
│   ├── notifications/               # User notifications
│   └── bookmarks/                   # Project bookmarks
│
├── components/                      # Shared UI components
├── lib/api.ts                       # Typed API client
├── store/                           # Global stores (theme, repo)
├── types/                           # TypeScript definitions
├── utils/                           # Helpers (routing, errors)
└── theme/                           # MUI theme config
```

---

# State Management & Data Flow

### Zustand Stores with Persist Middleware

```typescript
// Authentication Store (features/auth/store.ts)
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials) => Promise<void>;
  logout: () => void;
  register: (data) => Promise<void>;
}

// Persisted to localStorage via Zustand persist middleware
```

### Axios Interceptor Pattern

```
Request                                          Response
   │                                                │
   ├── Read token from localStorage ──► Inject      │
   │   Bearer header automatically                  │
   │                                                ├── 401? → Clear auth
   ├── FormData? → Remove Content-Type              │         → Redirect login
   │   (let browser set boundary)                   │
   │                                                ├── Success → Return data
   └── Send request ──────────────────────────────► └── 
```

---

<!-- _class: section-break -->

# Database Schema

---

# Entity Relationship Overview

<div class="columns">
<div class="col">

### Core Entities
- **Users** — Accounts with role assignments
- **Roles** — Custom roles (many-to-many)
- **Permissions** — Granular permissions with scopes
- **Projects** — Central entity with approval workflow
- **Files** — Metadata + cloud storage paths

### Project Relations
- **Project Members** — Team members
- **Project Advisors** — Faculty supervisors
- **Project Milestones** — Progress tracking
- **Project Activities** — Change audit log
- **Project Followers** — Notification subscriptions
- **Project Flags** — Issue reporting

</div>
<div class="col">

### Discovery & Social
- **Tags** — Project categorization (M2M)
- **Comments** — Project discussions
- **Ratings** — Project evaluations
- **Bookmarks** — Saved projects
- **Saved Searches** — Reusable queries
- **AI Metadata** — AI-generated search data

### Academic Structure
- **Faculty** — University faculties
- **Departments** — Academic departments
- **Programs** — Academic programs
- **Students** — Student information

### Security
- **Sessions**, **Tokens**, **Email Verifications**

</div>
</div>

---

# Key Schema Relationships

```
┌──────────┐     ┌────────────┐     ┌─────────────┐
│  Users   │────►│  role_user │◄────│    Roles    │
│          │     └────────────┘     │             │
│  - name  │                        │  - name     │────►┌──────────────┐
│  - email │     ┌────────────┐     │  - scope    │     │permission_role│
└──────────┘     │  Projects  │     └─────────────┘     └──────┬───────┘
     │           │            │                                 │
     │ creates   │  - title   │◄──── project_tag ────►┌────────┴──────┐
     └──────────►│  - slug    │                       │  Permissions  │
                 │  - status  │◄──── project_members   │  - category   │
                 │  - dept_id │                        │  - scope      │
                 └─────┬──────┘                        └───────────────┘
                       │
           ┌───────────┼───────────┬────────────┐
           ▼           ▼           ▼            ▼
      ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
      │ Files  │ │Milestones│ │Comments│ │Activities│
      │        │ │          │ │        │ │          │
      └────────┘ └──────────┘ └────────┘ └──────────┘
```

---

<!-- _class: section-break -->

# Key Features

---

# Feature Highlights

<div class="columns">
<div class="col">

### Project Management
- Full CRUD with approval workflow
- **Slug-based URLs** (`/pr/244k3n`)
- Milestone tracking with dependencies
- Activity audit log
- Multi-member team support

### Search & Discovery
- **AI-powered semantic search**
- Tag-based categorization
- Saved search queries
- Advanced filtering & sorting
- Search analytics

### File Management
- Cloud storage (S3/MinIO)
- Multi-provider support
- Public/private visibility
- **Arabic/Unicode filename support**
- Up to 100MB uploads

</div>
<div class="col">

### Collaboration
- Project following & notifications
- Comments & ratings
- Issue flags with severity levels
- Advisor assignment
- Bookmark system (guest + auth)

### Administration
- **Custom RBAC** with granular permissions
- Permission scopes: global, department, program, own
- Milestone templates
- User management
- Analytics dashboard

### Accessibility
- Full **RTL** (Right-to-Left) support
- Arabic/English bilingual
- Responsive Material Design
- Keyboard navigation
- ARIA helpers

</div>
</div>

---

# Project Workflow

```
  Student                    System                    Faculty/Admin
    │                          │                           │
    │── Create Project ───────►│                           │
    │                          │── Status: PENDING         │
    │── Upload Files ─────────►│                           │
    │── Set Milestones ───────►│                           │
    │── Add Members ──────────►│                           │
    │                          │                           │
    │                          │── Notify Advisor ────────►│
    │                          │                           │── Review Project
    │                          │                           │── Approve / Reject
    │                          │◄── Status: APPROVED ──────│
    │◄── Notification ─────────│                           │
    │                          │                           │
    │                          │── Public Archive          │
    │                          │── AI Metadata Generated   │
    │                          │── Searchable & Discoverable
```

---

<!-- _class: section-break -->

# Infrastructure

---

# Docker Compose Architecture

### 8 Services — Single Command Deployment

| Service | Image | Port | Role |
|---------|-------|------|------|
| **nginx** | `nginx:latest` | `:80` | Reverse proxy |
| **php** | Custom Dockerfile | `:9000` | Laravel PHP-FPM |
| **node** | `node:20-alpine` | `:3000` | React dev server |
| **db** | `postgres:16-alpine` | `:5433` | Database |
| **redis** | `redis:7-alpine` | `:6379` | Cache & sessions |
| **minio** | `minio/minio:latest` | `:9000/:9001` | Object storage |
| **minio-init** | `minio/mc:latest` | — | Bucket setup |
| **laravel-init** | Custom | — | Migrations & seeding |

### Resource Limits
- PHP: 2 CPU / 1GB RAM &bull; Node: 2 CPU / 2GB RAM
- DB: 1 CPU / 512MB RAM &bull; Redis: 0.5 CPU / 512MB RAM

---

# Cloud Storage Architecture

### Multi-Provider File Storage via S3 API

```
                            ┌───────────────────────┐
                            │     FileController     │
                            │   (Laravel Backend)    │
                            └───────────┬───────────┘
                                        │
                              ┌─────────┴─────────┐
                              │  Flysystem S3 API  │
                              │  (Abstraction Layer)│
                              └─────────┬─────────┘
                                        │
              ┌────────────┬────────────┼────────────┬───────────┐
              ▼            ▼            ▼            ▼           ▼
         ┌────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐  ┌────────┐
         │ MinIO  │  │ AWS S3  │  │ Google  │  │ Azure │  │Dropbox │
         │ (Dev)  │  │ (Prod)  │  │ Cloud   │  │ Blob  │  │        │
         └────────┘  └─────────┘  └─────────┘  └───────┘  └────────┘
```

- **Development**: MinIO (S3-compatible, self-hosted)
- **Production**: Swap to any supported provider via environment variables
- **Zero code changes** — only `.env` configuration needed

---

<!-- _class: section-break -->

# Security

---

# Authentication & Authorization

<div class="columns">
<div class="col">

### Authentication (Sanctum)
- **SPA Cookie Auth** for browser sessions
- **Token Auth** for API clients
- CSRF protection
- Session management via Redis
- Auto-refresh capability

### Auth Flow
```
Login Request
    │
    ├── Validate credentials
    ├── Generate Sanctum token
    ├── Store session in Redis
    └── Return token + user data
         │
         ▼
    Subsequent Requests
    │
    ├── Axios interceptor injects
    │   Bearer token automatically
    └── 401 → Clear auth → Redirect
```

</div>
<div class="col">

### Authorization (Custom RBAC)

**Permission Categories:**
- `projects` — Create, edit, approve
- `users` — Manage accounts
- `files` — Upload, download
- `evaluations` — Rate, comment
- `settings` — System config
- `system` — Admin operations

**Permission Scopes:**
| Scope | Access Level |
|-------|-------------|
| `global` | All resources |
| `department` | Same department |
| `program` | Same program |
| `own` | Own resources only |

</div>
</div>

---

# Security Features

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt via Laravel |
| **CSRF Protection** | Sanctum double-submit cookie |
| **CORS** | Configured in `config/cors.php` |
| **Rate Limiting** | Laravel middleware |
| **Input Validation** | Form Request classes |
| **SQL Injection** | Eloquent ORM parameterized queries |
| **XSS Prevention** | React auto-escaping + sanitization |
| **File Validation** | Type, size, extension checks |
| **Session Security** | Redis-backed, encrypted |
| **Environment Isolation** | Docker network isolation |

---

<!-- _class: section-break -->

# Demo & Deployment

---

# Getting Started

### One-Command Setup

```bash
git clone https://github.com/omd0/Fahras.git
cd Fahras
docker compose up -d
```

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `http://localhost:3000` | React application |
| **API** | `http://localhost/api` | REST API |
| **MinIO Console** | `http://localhost:9001` | File storage admin |
| **PostgreSQL** | `localhost:5433` | Database access |

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fahras.edu` | `password` |
| Faculty | `sarah.johnson@fahras.edu` | `password` |
| Student | `ahmed.almansouri@student.fahras.edu` | `password` |

---

# Future Work

<div class="columns">
<div class="col">

### Short Term
- Enhanced AI search with embeddings
- Real-time notifications (WebSockets)
- PDF preview & document viewer
- Advanced analytics dashboards
- Batch project operations

### Medium Term
- Mobile application (React Native)
- Plagiarism detection integration
- Video presentation uploads
- Citation & reference management
- Calendar integration for milestones

</div>
<div class="col">

### Long Term
- Multi-university federation
- Blockchain-based certification
- Machine learning recommendations
- Automated grading assistance
- Open API for third-party integrations

### Quality Improvements
- Comprehensive E2E test suite
- Performance optimization
- Accessibility audit (WCAG 2.1)
- Internationalization (i18n)
- Production monitoring & alerting

</div>
</div>

---

<!-- _class: lead -->

# Thank You

### Fahras — Preserving Academic Excellence

**Repository**: github.com/omd0/Fahras
**Stack**: Laravel 11 &bull; React 19 &bull; PostgreSQL 16 &bull; Docker

*Questions?*
