# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fahras is a graduation project archiving system built with Laravel 11 (API backend) and React 18 with TypeScript (frontend). The application runs in Docker containers and uses PostgreSQL, Redis, and MinIO for storage.

## Essential Commands

### Docker Operations
```bash
# Start all services (includes automatic migrations and seeding)
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f [php|node|db|redis|minio]

# Restart a specific service
docker compose restart [service_name]

# Rebuild containers after changes
docker compose up -d --build

# Reset everything (removes volumes)
docker compose down -v
```

### Laravel Backend (API)

Run Laravel commands inside the PHP container:
```bash
# Enter PHP container
docker compose exec php bash

# Run migrations
php artisan migrate
docker compose exec php php artisan migrate

# Reset database with fresh migrations and seed data
php artisan migrate:fresh --seed
docker compose exec php php artisan migrate:fresh --seed

# Run tests
php artisan test
docker compose exec php php artisan test

# Run specific test
php artisan test --filter=ProjectTest
docker compose exec php php artisan test --filter=ProjectTest

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Laravel Pint (code formatter)
./vendor/bin/pint
docker compose exec php ./vendor/bin/pint
```

### React Frontend (Web)

Run frontend commands inside the Node container:
```bash
# Enter Node container
docker compose exec node sh

# Install dependencies
npm install
docker compose exec node npm install

# Start dev server (usually auto-starts with docker compose up)
npm start

# Build for production
npm run build
docker compose exec node npm run build

# Run linter
npm run lint
docker compose exec node npm run lint

# Fix linting issues
npm run lint -- --fix
docker compose exec node npm run lint -- --fix

# Run tests
npm test
docker compose exec node npm test
```

## Architecture

### Backend Structure

**Laravel 11 API** (`/api/`)
- **Authentication**: Laravel Sanctum with SPA cookie-based auth + token authentication
- **Database**: PostgreSQL 16 (UTF-8 support for Arabic filenames)
- **Cache**: Redis for sessions, cache, and queues
- **Storage**: MinIO (S3-compatible) for file storage with support for cloud providers (AWS S3, Google Cloud, Azure, Dropbox)
- **Key Models**: User, Project, File, Role, Permission, Milestone, Comment, Rating, Notification
- **Custom Middleware**: `OptionalAuthSanctum` - allows routes to work with or without authentication (used for public project views)

**Directory Structure**:
- `app/Http/Controllers/` - API controllers (ProjectController, AuthController, FileController, etc.)
- `app/Models/` - Eloquent models with relationships
- `app/Http/Middleware/` - Custom middleware including `OptionalAuthSanctum`
- `database/migrations/` - Database schema migrations
- `database/seeders/` - Database seeders for initial data
- `routes/api.php` - All API route definitions

**Important Controllers**:
- `ProjectController.php` - Comprehensive project management (CRUD, search, analytics, approvals)
- `FileController.php` - File upload/download with cloud storage support
- `MilestoneTemplateController.php` - Milestone templates for project workflows
- `ProjectFollowController.php` - Project following, activity tracking, and flags
- `RoleController.php` - Role-based access control (RBAC)
- `UserController.php` - User management and profile operations

### Frontend Structure

**React 18 + TypeScript** (`/web/`)
- **UI Framework**: Material-UI (MUI) v7 with custom theme
- **State Management**: Zustand with persist middleware
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors for auth and error handling
- **Build Tool**: Vite

**Directory Structure**:
- `src/pages/` - Page components (ExplorePage, ProjectDetailPage, CreateProjectPage, etc.)
- `src/components/` - Reusable UI components
- `src/services/` - API service layer (`api.ts` with typed endpoints)
- `src/store/` - Zustand stores (`authStore.ts`, `repositoryStore.ts`)
- `src/types/` - TypeScript type definitions
- `src/theme/` - MUI theme configuration
- `src/utils/` - Utility functions including project routing and helpers

**State Management**:
- `authStore.ts` - Authentication state (user, token, login/logout/register)
- `repositoryStore.ts` - Repository/project state
- Uses Zustand's persist middleware to save state to localStorage

**API Service Pattern**:
- Single `ApiService` class in `src/services/api.ts`
- Axios interceptors handle auth token injection and 401 redirects
- All endpoints typed with TypeScript interfaces
- Defensive error handling with fallback values

**Utility Functions**:
- `projectRoutes.ts` - Centralized project URL routing (detail, edit, follow, code views)
- `projectHelpers.ts` - Project status utilities (color coding, status labels)
- `bookmarkCookies.ts` - Guest bookmark management with cookie persistence
- `errorHandling.ts` - Standardized error handling utilities

### Key Integration Points

1. **Authentication Flow**:
   - Login/Register → Sanctum token → Stored in Zustand → Injected via Axios interceptor
   - Public routes use `auth.optional` middleware for optional authentication
   - Protected routes use `auth:sanctum` middleware

2. **File Uploads**:
   - Frontend: FormData with multipart/form-data
   - Backend: FileController validates, stores in MinIO/S3
   - Supports public/private file visibility

3. **Role-Based Access Control (RBAC)**:
   - Custom role system with permissions and scopes
   - Permission categories: projects, users, files, evaluations, settings, system
   - Scopes: global, department, program, own
   - Enforced in controllers via policy checks

4. **Project Workflow**:
   - Projects have approval status: pending, approved, hidden
   - Milestone templates can be applied to projects
   - Activity tracking for all project changes
   - Project following system with notification preferences

5. **Project Slugs and Routing**:
   - Projects use unique alphanumeric slugs (e.g., "244k3n") for URLs instead of numeric IDs
   - Backend: `Project` model auto-generates slugs on creation, supports route binding by slug
   - Backend: Fallback to numeric ID for backward compatibility during migration
   - Frontend: Use `projectRoutes` utility for all project URLs (never hardcode)
   - Example: `/pr/244k3n` instead of `/projects/123`

## Critical Development Patterns

### Project URL Routing
**ALWAYS use the `projectRoutes` utility** from `web/src/utils/projectRoutes.ts`:
```typescript
// ✅ Correct - Use centralized routing utility
import { projectRoutes, getProjectDetailUrl } from '@/utils/projectRoutes';

// Navigate to project detail
navigate(projectRoutes.detail(project.slug));
// Or with project object
navigate(getProjectDetailUrl(project));

// Link to project edit
<Link to={projectRoutes.edit(project.slug)}>Edit</Link>

// Other routes: projectRoutes.follow(), projectRoutes.code(), projectRoutes.codeFile()

// ❌ Wrong - Never hardcode project URLs
navigate(`/projects/${project.id}`); // Outdated pattern
<Link to={`/project/${project.id}`}>View</Link> // Wrong prefix
```

### Material-UI v7 Grid Syntax
**ALWAYS use the `size` prop** (not `item` prop from v4):
```typescript
// ✅ Correct (v7)
<Grid size={{ xs: 12, md: 6 }}>
  <Card>Content</Card>
</Grid>

// ❌ Wrong (old v4 syntax)
<Grid item xs={12} md={6}>
  <Card>Content</Card>
</Grid>
```

### Safe Data Access
**Always provide fallback arrays and use optional chaining**:
```typescript
// ✅ Correct
{(items || []).map(item => <div key={item.id}>{item.name}</div>)}
const userName = user?.full_name || 'Unknown';
const roleName = user?.roles?.[0]?.name || 'No Role';

// ❌ Wrong
{items.map(item => <div key={item.id}>{item.name}</div>)} // crashes if items is null/undefined
```

### API Response Handling
**Handle various response structures with fallbacks**:
```typescript
// ✅ Correct
const fetchData = async () => {
  try {
    const response = await apiService.getData();
    // Handles { "data": [...] }, [...], or undefined
    return response.data || response || [];
  } catch (error) {
    console.error('API Error:', error);
    return []; // Always return fallback
  }
};

// State initialization with try-catch-finally
const [data, setData] = useState<User[]>([]);
const [loading, setLoading] = useState(true);

try {
  const response = await apiService.getUsers();
  setData(response.data || response || []);
} catch (error) {
  setData([]); // Set to fallback on error
} finally {
  setLoading(false);
}
```

### Import Management
**Remove unused imports to avoid linting errors**:
```typescript
// ✅ Correct - Only import what you use
import { Box, Typography, Button } from '@mui/material';

// ❌ Incorrect - Imports unused components
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
```

Always run `npm run lint -- --fix` before committing to auto-remove unused imports.

### Axios Interceptor Behavior
- Request interceptor: Reads token from localStorage (`auth-storage`), injects as `Bearer` token
- Response interceptor: On 401, clears auth and redirects to login (except for public pages)
- FormData detection: Automatically removes Content-Type header for file uploads

## Testing

### Backend Tests
Located in `api/tests/`
```bash
# Run all tests
docker compose exec php php artisan test

# Run specific test file
docker compose exec php php artisan test tests/Feature/ProjectTest.php

# Run with coverage (if xdebug enabled)
docker compose exec php php artisan test --coverage
```

### Frontend Tests
Located in `web/src/__tests__/`
```bash
# Run tests
docker compose exec node npm test

# Run with coverage
docker compose exec node npm test -- --coverage
```

## Environment Configuration

### Backend Environment (`api/.env`)
Key variables:
- `APP_KEY` - Laravel encryption key (generated with `php artisan key:generate`)
- `DB_*` - PostgreSQL connection details
- `REDIS_*` - Redis connection details
- `AWS_*` - S3/MinIO storage configuration
- `FILESYSTEM_DISK` - Storage driver (s3 for MinIO/S3, local for filesystem)

### Frontend Environment (`web/.env`)
Key variables:
- `VITE_API_URL` - API base URL (default: `http://localhost/api`)
- `VITE_APP_NAME` - Application name

## Common Issues & Solutions

### Database Connection Issues
```bash
# Check if database is ready
docker compose ps db

# View database logs
docker compose logs db

# Reset database connection
docker compose restart db php
```

### Migration Errors
```bash
# Fresh migrations (destructive - clears all data)
docker compose exec php php artisan migrate:fresh --seed

# Run pending migrations
docker compose exec php php artisan migrate
```

### Frontend Build/HMR Issues
```bash
# Clear node_modules and reinstall
docker compose exec node rm -rf node_modules package-lock.json
docker compose exec node npm install

# Restart dev server
docker compose restart node
```

### Storage/File Upload Issues
```bash
# Check MinIO is running
docker compose ps minio

# View MinIO logs
docker compose logs minio

# Check storage permissions
docker compose exec php chmod -R 775 storage bootstrap/cache
```

## Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost/api
- **PostgreSQL**: localhost:5433 (external), port 5432 (internal)
- **Redis**: localhost:6379
- **MinIO Console**: http://localhost:9001 (credentials: minioadmin/minioadmin123)

## Database Schema Highlights

**Core Tables**:
- `users` - User accounts with roles
- `roles` - Custom roles with permissions
- `permissions` - Granular permissions with categories and scopes
- `projects` - Projects with approval status, visibility, custom members, and unique slugs
- `files` - File metadata with cloud storage paths
- `project_milestones` - Project milestones with dependencies
- `milestone_templates` - Reusable milestone templates
- `project_activities` - Activity tracking log
- `project_followers` - Project following with notification preferences
- `project_flags` - Issue flags with severity levels
- `notifications` - User notifications
- `bookmarks` - Project bookmarks

**Important Relationships**:
- Users have many Roles (many-to-many)
- Projects belong to User (creator), Program, Department
- Projects have many Files, Milestones, Comments, Ratings, Followers
- Milestones can have dependencies (self-referential)
- Activity tracking auto-logs changes to projects

## Code Quality Tools

- **Backend**: Laravel Pint for code formatting
- **Frontend**: ESLint for linting (auto-fix with `npm run lint -- --fix`)
- Remove unused imports to avoid lint errors

## Important Notes

1. **Arabic/UTF-8 Support**: The system fully supports Arabic and Unicode characters in filenames and content
2. **Guest Access**: Projects can be viewed by guests using `OptionalAuthSanctum` middleware
3. **Bookmark Sync**: Guest bookmarks (stored in cookies) are synced to user account on login/register
4. **Cloud Storage**: Supports multiple providers (MinIO, AWS S3, Google Cloud, Azure, Dropbox)
5. **RBAC System**: Custom role system with granular permissions and scopes (not using Laravel's built-in policies)
6. **Docker-First**: All development happens in containers; avoid running commands on host machine
7. **Project Slugs**: Use slug-based URLs for SEO and user-friendly routing; backend supports backward compatibility with numeric IDs
