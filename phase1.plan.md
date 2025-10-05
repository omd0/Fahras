# Fahras - Proof of Concept (PoC) Plan

## PoC Objectives
- Demonstrate core functionality of the graduation project archiving system
- Validate technical approach and architecture
- Identify potential challenges early in development
- Create a minimal working system that can be expanded upon

## Technology Stack (PoC)
- **Backend**: Laravel 11 (API-only)
- **Frontend**: React 18 with TypeScript
- **Database**: PostgreSQL 16
- **Authentication**: Laravel Sanctum (SPA token-based)

## Development Phases

### Phase 1: Basic Infrastructure Setup (1-2 weeks)

1. **Repository & Environment Setup**
   - Create project structure (api/ and web/ directories)
   - Set up Docker development environment
   - Configure basic CI/CD pipeline

2. **Authentication System (Core)**
   - Implement user registration and login
   - Set up role-based access control (basic roles only)
   - Create protected routes in frontend

### Phase 2: Project Management (2-3 weeks)

1. **Database Schema (Minimal)**
   ```sql
   -- Core User Tables
   users (id, full_name, email, password_hash, status, created_at)
   roles (id, name, description)
   role_user (user_id, role_id)
   
   -- Basic Academic Structure
   departments (id, name)
   programs (id, department_id, name, degree_level)
   
   -- Project Core
   projects (id, program_id, created_by_user_id, title, abstract, 
            academic_year, status, created_at, updated_at)
   project_members (project_id, user_id, role_in_project)
   ```

2. **Core API Endpoints**
   ```
   # Authentication
   POST /api/register
   POST /api/login
   POST /api/logout
   GET  /api/user
   
   # Projects
   GET  /api/projects
   POST /api/projects
   GET  /api/projects/{id}
   PUT  /api/projects/{id}
   ```

3. **Frontend Implementation**
   - Login/Registration screens
   - Dashboard with project listing
   - Project creation form
   - Project detail view

### Phase 3: Basic File Management (1-2 weeks)

1. **Database Schema**
   ```sql
   -- File Management (Basic)
   files (id, project_id, uploaded_by_user_id, filename, 
          mime_type, size_bytes, storage_url, uploaded_at)
   ```

2. **API Endpoints**
   ```
   POST /api/projects/{id}/files  # Upload file
   GET  /api/projects/{id}/files  # List project files
   GET  /api/files/{id}/download  # Download file
   ```

3. **Frontend Implementation**
   - Basic file upload component
   - File listing in project details
   - File download functionality

## Technical Implementation Details

### API-First Approach
- Backend will be developed as a pure REST API
- All communication between frontend and backend via JSON
- API will follow consistent patterns and return appropriate status codes

### Authentication Flow
1. User logs in via form submission
2. Backend validates credentials and returns token
3. Frontend stores token in secure storage
4. Token is sent with each subsequent request
5. Protected routes check for valid token

### Security Considerations for PoC
- Input validation on all endpoints
- CSRF protection
- Basic permission checks
- Secure file upload validation

### Docker Setup (Development)
```yaml
# Basic services for PoC
services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
  
  php:
    build:
      context: ./api
      dockerfile: Dockerfile
    volumes:
      - ./api:/var/www/html
  
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: fahras
      POSTGRES_USER: fahras
      POSTGRES_PASSWORD: fahras_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  node:
    image: node:18
    volumes:
      - ./web:/app
    working_dir: /app
    command: npm run dev

volumes:
  postgres_data:
```

## Testing Strategy for PoC
- API endpoint testing with Postman/Insomnia collection
- Basic frontend component testing
- Manual testing of key user flows

## Next Steps After PoC
1. Evaluate PoC functionality and gather feedback
2. Refine architecture based on findings
3. Expand features for full MVP implementation
4. Improve UI/UX based on user testing
5. Enhance security and performance optimizations

## Success Criteria for PoC
- Users can register and log in
- Users can create and view projects
- Users can upload and download files
- Basic role-based permissions work correctly
- System demonstrates the core architecture's viability
