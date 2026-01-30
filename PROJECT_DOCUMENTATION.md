# Fahras Project Documentation

## 1. Project Overview

**Fahras** is a comprehensive academic project archiving and management system designed for educational institutions. It facilitates the submission, review, approval, and showcasing of student graduation projects.

### Tech Stack

*   **Backend**: Laravel 11 (PHP 8.2+)
*   **Frontend**: React 18 + TypeScript (Vite)
*   **Database**: PostgreSQL
*   **Storage**: MinIO (S3-compatible)
*   **CI/CD**: Self-hosted Forgejo (Gitea fork) + Act Runner
*   **Infrastructure**: Docker Compose

---

## 2. Architecture & Project Structure

The project follows a Domain-Driven Design (DDD) approach for the backend and a Feature-Based structure for the frontend.

### Backend Structure (`api/`)

```
api/app/Domains/
├── Auth/           # Authentication & User Identity
├── Projects/       # Project Management (Core)
├── Files/          # File Handling & MinIO Integration
├── Milestones/     # Project Milestones & Timelines
├── Users/          # User Profiles (Student/Faculty)
├── AccessControl/  # Roles & Permissions (RBAC)
└── Notifications/  # System Notifications
```

Each domain contains its own `Controllers`, `Models`, `Services`, `Requests`, and `Resources`.

### Frontend Structure (`web/src/`)

```
web/src/
├── components/
│   ├── ui/         # Reusable primitives (Buttons, Inputs)
│   └── layout/     # Structural components (Header, Sidebar)
├── features/       # Feature-specific logic
│   ├── auth/
│   ├── projects/
│   ├── project-follow/
│   ├── dashboards/
│   └── ...
├── lib/            # Core libraries (API client, i18n)
├── pages/          # Route components
├── store/          # Global state (Zustand)
└── types/          # Shared TypeScript interfaces
```

---

## 3. Infrastructure & Deployment

### Docker Environment

The project is fully containerized using Docker Compose.

*   **Services**:
    *   `nginx`: Web server & reverse proxy (Ports: 80, 443)
    *   `php`: Laravel API backend (Port: 9000 internal)
    *   `node`: React frontend dev server (Port: 3000)
    *   `db`: PostgreSQL database (Port: 5433)
    *   `redis`: Cache & Session storage (Port: 6379)
    *   `minio`: Object storage (Ports: 9000 API, 9001 Console)

**Quick Start Commands**:
*   Start: `./docker-helpers.sh start` (Linux/Mac) or `docker-helpers.bat start` (Windows)
*   Stop: `./docker-helpers.sh stop`
*   Logs: `./docker-helpers.sh logs`

### MinIO Storage Integration

MinIO provides S3-compatible storage for project files.
*   **Bucket**: `fahras-files`
*   **Console**: `http://localhost:9001` (User: `minioadmin`, Pass: `minioadmin123`)
*   **Integration**: Laravel uses the `s3` driver to communicate with MinIO. Files are uploaded via the API and served via public URLs.

### Production Deployment

For production (`docs/deployment/PRODUCTION_DEPLOYMENT.md`):
1.  Use `nginx.production.conf` and `Dockerfile.production`.
2.  Set `APP_ENV=production` and `APP_DEBUG=false`.
3.  Bind Nginx to `0.0.0.0:80` for public access.
4.  Ensure `api/public/index.php` and `vendor/` are correctly built.
5.  Use managed services (RDS, S3) if possible, or persistent volumes for self-hosted.

### CI/CD with Forgejo

A self-hosted Git/CI platform is integrated.
*   **URL**: `http://localhost:3000` (Forgejo)
*   **Runner**: Act Runner for executing GitHub Actions-compatible workflows.
*   **Pipelines**: defined in `api/.forgejo/workflows/` (CI, Security Audit, Release).

---

## 4. Key Features & Workflows

### Project Management
*   **Creation**: Students can create projects with titles, abstracts, and keywords.
*   **Team**: Manage members and advisors with specific roles.
*   **Approval Workflow**: Projects go through `Pending -> In Review -> Approved` states.

### Project Follow Manager
A system to track project progress via milestones.
*   **Timeline**: Visual timeline of milestones with due dates and status.
*   **Templates**: Pre-defined milestone templates for different programs.
*   **Health Score**: Automated score based on activity, timeliness, and completion.
*   **Activity Feed**: Log of all project actions.

### Authentication
*   **Methods**: Email/Password, Registration.
*   **Flow**: JWT/Sanctum based.
*   **Roles**: Student, Faculty, Admin, Reviewer.
*   **Endpoints**:
    *   `POST /api/login`, `POST /api/register`
    *   `POST /api/email/verify`, `POST /api/forgot-password`

### Dashboards
Role-based dashboards for different user types:
*   **Student**: View own projects, tasks, and deadlines.
*   **Faculty**: Manage advised projects and reviews.
*   **Admin**: System-wide statistics and user management.

---

## 5. Development Guide

### Prerequisites
*   Docker & Docker Compose
*   Node.js 18+ (for local tool usage, though Docker handles runtime)
*   PHP 8.2+ (optional, useful for IDE support)

### Common Commands
```bash
# Enter PHP container shell
./docker-helpers.sh shell

# Run Migrations
./docker-helpers.sh migrate

# Run Tests
docker compose exec php php artisan test

# Install Frontend Deps
docker compose exec node npm install
```

### Debugging
*   **API 404s**: Check `api/public/index.php` existence and Nginx config.
*   **CORS Issues**: Ensure `Access-Control-Allow-Origin` headers in Nginx/Laravel.
*   **Database**: Connect via `localhost:5433` (User: `fahras`, Pass: `fahras_password`).

---

## 6. Migration History

*   **Phase 1**: Initial Setup & Dockerization.
*   **Phase 2**: Authentication Implementation (Sanctum, Email Verification).
*   **Phase 3**: Frontend Redesign (Material UI v5+, Responsive Layouts).
*   **Phase 4**: Project Structure Refactor (DDD Backend, Feature-First Frontend).
*   **Phase 5**: MinIO & Cloud Storage Integration.
*   **Current**: "Project Follow Manager" & Dashboard Enhancements.

---

*This document consolidates previous documentation files including `PROJECT_STRUCTURE.md`, `DOCKER.md`, `FRONTEND_IMPLEMENTATION_PLAN.md`, and others. Refer to `README.md` for the most basic entry point.*
