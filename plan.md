# Fahras - Graduation Project Archiving System
## Development Plan & Architecture

### Project Overview
**Technology Stack:** Laravel + React + PostgreSQL  
**Architecture:** API-First Design with SPA Frontend  
**Target Users:** Academic Institutions, Students, Faculty, Administrators

---

## Part 1: Foundational Setup & Architecture (Sprint 0)

### 1. Core Philosophy & Guiding Principles

#### **API-First Design**
- Laravel backend serves pure RESTful API
- React frontend as completely separate SPA
- Decoupled development allowing future clients (mobile apps)
- Clean separation of concerns

#### **Modularity & Scalability**
- Code organized by feature/domain (Users, Projects, Files)
- Maintainable as system grows
- Feature-based modules for easy team collaboration

#### **Security by Default**
- Robust RBAC (Role-Based Access Control)
- Input validation and sanitization
- Protection against common web vulnerabilities
- API token-based authentication

#### **Developer Experience (DX)**
- Docker-based local development setup
- Automated scripts for environment setup
- Consistent development environment across team
- Comprehensive tooling and linting

### 2. Technology Stack Selection

#### **Backend**
- **Framework:** Laravel 11 (latest stable)
- **PHP Version:** 8.3
- **Authentication:** Laravel Sanctum (SPA token-based)
- **Database:** PostgreSQL 16
- **Caching:** Redis (optional for local development)
- **Queue:** Laravel Queues for background jobs

#### **Frontend**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast development server)
- **Component Library:** MUI (Material-UI)
- **State Management:** Zustand
- **Styling:** Styled-components/Emotion (MUI integration)
- **HTTP Client:** Axios
- **Routing:** React Router v6

#### **Database & Storage**
- **Primary Database:** PostgreSQL 16
- **File Storage:** AWS S3 / DigitalOcean Spaces (production), Local (development)
- **Search:** PostgreSQL Full-Text Search with Laravel Scout

#### **DevOps & Deployment**
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Cloud Platform:** DigitalOcean App Platform / AWS ECS
- **CDN:** Cloudflare (asset caching, DDoS protection)

### 3. Project & Environment Setup

#### **Repository Structure**
```
fahras/
├── api/                    # Laravel backend
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── ...
├── web/                    # React frontend
│   ├── src/
│   ├── public/
│   └── ...
├── docker-compose.yml
├── README.md
└── plan.md
```

#### **Local Development Environment**
- **Docker Compose Services:**
  - **Nginx:** Web server and reverse proxy
  - **PHP-FPM:** Laravel application container
  - **PostgreSQL:** Database server
  - **Node.js:** Vite dev server for React
  - **Redis:** Caching and session storage
  - **MailHog:** Email testing (optional)

#### **Automation Scripts**
- Setup script for initial environment configuration
- Automated `composer install` and `npm install`
- Database migration and seeding
- Environment file generation

#### **Tooling & Code Quality**
- **Backend:** Laravel Pint (code styling), Larastan (static analysis)
- **Frontend:** ESLint, Prettier, TypeScript strict mode
- **CI:** Automated linting and testing on every push

---

## Part 2: Development & Implementation Plan (Sprints 1-N)

### Phase 1: Core Authentication & User Management (Sprint 1-2)

#### **Objective**
Establish foundation for users, roles, and permissions system.

#### **Backend Implementation (Laravel)**

##### **Database Schema**
```sql
-- Core User Management Tables
users (id, full_name, email, password_hash, status, created_at, last_login_at)
roles (id, name, description, created_at, updated_at)
permissions (id, code, description, created_at, updated_at)
role_user (user_id, role_id) -- Pivot table
permission_role (role_id, permission_id) -- Pivot table

-- User Specializations
faculty (user_id, department_id, faculty_no, is_supervisor)
students (user_id, program_id, student_no, cohort_year)

-- Academic Structure
departments (id, name, created_at, updated_at)
programs (id, department_id, name, degree_level, created_at, updated_at)
```

##### **Models & Relationships**
- **User Model:** Base user with authentication
- **Role & Permission Models:** RBAC implementation
- **Faculty & Student Models:** Specialized user types
- **Department & Program Models:** Academic hierarchy

##### **API Endpoints**
```
POST /api/register          # User registration
POST /api/login            # User authentication
POST /api/logout           # Token invalidation
GET  /api/user             # Current user profile
GET  /api/users            # List users (admin)
PUT  /api/user/profile     # Update profile
POST /api/forgot-password  # Password reset request
POST /api/reset-password   # Password reset
```

##### **Middleware & Guards**
- **Authentication:** Sanctum middleware
- **Authorization:** Custom permission middleware
- **Rate Limiting:** API rate limiting for security

#### **Frontend Implementation (React)**

##### **Authentication Flow**
- Login/Registration forms with validation
- Protected route wrapper component
- Token management and automatic refresh
- Logout functionality with token cleanup

##### **State Management (Zustand)**
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserProfile) => Promise<void>;
}
```

##### **UI Components**
- **Login Page:** Clean, accessible login form
- **Registration Page:** Multi-step registration for students/faculty
- **Profile Page:** User profile management
- **Admin Dashboard:** User management interface

### Phase 2: Project Management Module (Sprint 3-4)

#### **Objective**
Enable users to create, view, and manage graduation projects.

#### **Backend Implementation**

##### **Database Schema**
```sql
-- Project Core Tables
projects (id, program_id, created_by_user_id, title, abstract, keywords, 
          academic_year, semester, status, is_public, doi, repo_url, 
          created_at, updated_at)

-- Project Relationships
project_members (project_id, user_id, role_in_project) -- LEAD/MEMBER
project_advisors (project_id, user_id, advisor_role)   -- MAIN/CO-ADVISOR/REVIEWER
project_tags (project_id, tag_id)
tags (id, name, created_at, updated_at)
```

##### **Models & Relationships**
- **Project Model:** Central entity with complex relationships
- **ProjectMember & ProjectAdvisor Models:** Many-to-many relationships
- **Tag Model:** Flexible tagging system

##### **API Endpoints**
```
GET    /api/projects              # List projects with filtering/pagination
POST   /api/projects              # Create new project
GET    /api/projects/{id}         # View project details
PUT    /api/projects/{id}         # Update project
DELETE /api/projects/{id}         # Archive project
GET    /api/projects/{id}/members # Project team members
POST   /api/projects/{id}/members # Add team member
PUT    /api/projects/{id}/members/{user_id} # Update member role
DELETE /api/projects/{id}/members/{user_id} # Remove team member
```

##### **Advanced Features**
- **Full-Text Search:** PostgreSQL FTS on title, abstract, keywords
- **Filtering:** By department, program, year, status, tags
- **Sorting:** By date, title, status, academic year
- **Pagination:** Cursor-based for performance

#### **Frontend Implementation**

##### **Project Dashboard**
- **Project List:** MUI DataGrid with server-side pagination
- **Advanced Filters:** Sidebar with multiple filter options
- **Search Bar:** Global search with debounced input
- **Quick Actions:** Create, export, bulk operations

##### **Project Detail View**
- **Project Header:** Title, status, academic info
- **Team Section:** Members and advisors with roles
- **Description:** Abstract, keywords, objectives
- **Timeline:** Project milestones and progress
- **Files Section:** Document management interface

##### **Project Creation/Edit**
- **Multi-Step Form:** Wizard-style project creation
- **Validation:** Real-time form validation
- **Team Management:** Add/remove members and advisors
- **Tag Management:** Tag input with autocomplete

### Phase 3: File Management & Milestones (Sprint 5-6)

#### **Objective**
Handle file uploads, versioning, and project milestone tracking.

#### **Backend Implementation**

##### **Database Schema**
```sql
-- File Management
files (id, project_id, uploaded_by_user_id, version, filename, 
       mime_type, size_bytes, storage_url, checksum, is_public, uploaded_at)

-- Project Milestones
milestones (id, project_id, name, due_date, status, created_at, updated_at)
```

##### **File Storage Strategy**
- **Development:** Local storage with symbolic links
- **Production:** Cloud storage (S3/Spaces) with CDN
- **Versioning:** Automatic version tracking
- **Security:** Permission-based access control

##### **API Endpoints**
```
POST   /api/projects/{id}/files     # Upload file
GET    /api/projects/{id}/files     # List project files
GET    /api/files/{id}/download     # Download file
DELETE /api/files/{id}              # Delete file
PUT    /api/files/{id}/visibility   # Update file visibility

GET    /api/projects/{id}/milestones     # List milestones
POST   /api/projects/{id}/milestones     # Create milestone
PUT    /api/milestones/{id}              # Update milestone
DELETE /api/milestones/{id}              # Delete milestone
```

##### **File Processing**
- **Validation:** File type, size, and security checks
- **Metadata Extraction:** Automatic file information extraction
- **Virus Scanning:** Integration with security services
- **Thumbnails:** Generate thumbnails for images/PDFs

#### **Frontend Implementation**

##### **File Upload Component**
- **Drag & Drop:** Intuitive file upload interface
- **Progress Tracking:** Real-time upload progress
- **File Validation:** Client-side validation with error messages
- **Batch Upload:** Multiple file selection and upload

##### **File Management Interface**
- **File Browser:** Hierarchical file organization
- **Version History:** View and compare file versions
- **Preview:** In-browser file preview for common formats
- **Download Management:** Bulk download and sharing options

##### **Milestone Management**
- **Timeline View:** Visual project timeline
- **Milestone Cards:** Status-based milestone display
- **Progress Tracking:** Visual progress indicators
- **Notification System:** Milestone deadline alerts

### Phase 4: Advanced Features & Workflows (Sprint 7-8)

#### **Objective**
Implement evaluations, approvals, and comprehensive search functionality.

#### **Backend Implementation**

##### **Database Schema**
```sql
-- Evaluation System
evaluations (id, project_id, evaluator_user_id, milestone_id, 
            score, remarks, created_at, updated_at)

-- Approval Workflow
approvals (id, project_id, approver_user_id, stage, decision, 
          note, decided_at, created_at, updated_at)

-- Activity Logging
access_logs (id, user_id, project_id, action, ip, user_agent, occurred_at)
```

##### **Workflow Engine**
- **State Machine:** Project status transitions
- **Approval Chains:** Multi-level approval process
- **Notification System:** Email and in-app notifications
- **Deadline Management:** Automatic escalation for overdue items

##### **API Endpoints**
```
# Evaluation System
GET    /api/projects/{id}/evaluations     # List evaluations
POST   /api/projects/{id}/evaluations     # Submit evaluation
PUT    /api/evaluations/{id}              # Update evaluation

# Approval System
GET    /api/approvals/pending            # Pending approvals
POST   /api/projects/{id}/approvals      # Submit for approval
PUT    /api/approvals/{id}/decide        # Make approval decision

# Search & Analytics
GET    /api/search                       # Global search
GET    /api/analytics/dashboard          # Dashboard statistics
GET    /api/activity-logs               # Activity logs (admin)
```

##### **Search Implementation**
- **Full-Text Search:** PostgreSQL FTS with ranking
- **Faceted Search:** Filter by multiple criteria
- **Search Suggestions:** Autocomplete functionality
- **Search Analytics:** Track search queries and results

#### **Frontend Implementation**

##### **Evaluation Interface**
- **Evaluation Form:** Structured evaluation criteria
- **Score Calculation:** Automatic score aggregation
- **Feedback System:** Detailed feedback collection
- **Evaluation History:** Track evaluation progress

##### **Approval Dashboard**
- **Pending Approvals:** Queue of items requiring approval
- **Approval History:** Complete approval timeline
- **Decision Interface:** Streamlined approval decisions
- **Notification Center:** Real-time approval notifications

##### **Search & Analytics**
- **Global Search:** Powerful search with filters
- **Search Results:** Ranked results with snippets
- **Analytics Dashboard:** Key metrics and statistics
- **Activity Feed:** Real-time system activity

---

## Part 3: UI/UX, Performance, and Deployment

### 1. UI/UX Design Principles

#### **Design System**
- **Material Design 3:** Modern, accessible design language
- **Consistent Spacing:** 8px grid system
- **Color Palette:** Academic institution branding
- **Typography:** Clear hierarchy with readable fonts

#### **User Experience**
- **Dashboard-Centric:** Primary interface as comprehensive dashboard
- **Role-Based Navigation:** Different views for Students, Faculty, Admins
- **Responsive Design:** Mobile-first approach with tablet optimization
- **Accessibility:** WCAG 2.1 AA compliance

#### **Key User Flows**
1. **Student Flow:** Registration → Project Creation → Team Building → Submission → Tracking
2. **Faculty Flow:** Login → Dashboard → Project Review → Evaluation → Approval
3. **Admin Flow:** System Overview → User Management → Analytics → Configuration

### 2. Performance Optimization

#### **Backend Performance**
- **Database Optimization:**
  - Proper indexing on all foreign keys and search columns
  - Query optimization with eager loading
  - Database connection pooling
  - Read replicas for reporting queries

- **Caching Strategy:**
  - Redis for session storage and frequently accessed data
  - Application-level caching for static data (departments, programs)
  - HTTP caching headers for API responses
  - Database query result caching

- **Background Processing:**
  - Queue system for heavy operations (file processing, email sending)
  - Async processing for non-critical tasks
  - Job retry mechanisms with exponential backoff

#### **Frontend Performance**
- **Code Splitting:**
  - Route-based code splitting with React.lazy
  - Component-level lazy loading
  - Dynamic imports for heavy components

- **Optimization Techniques:**
  - React.memo for preventing unnecessary re-renders
  - useMemo and useCallback for expensive calculations
  - Virtual scrolling for large lists
  - Image optimization and lazy loading

- **Bundle Optimization:**
  - Tree shaking to remove unused code
  - Vendor chunk splitting
  - Gzip/Brotli compression
  - CDN for static assets

### 3. Testing Strategy

#### **Backend Testing**
- **Unit Tests:** Individual class and method testing
- **Feature Tests:** API endpoint testing with database transactions
- **Integration Tests:** Third-party service integration testing
- **Performance Tests:** Load testing for critical endpoints

#### **Frontend Testing**
- **Unit Tests:** Component and utility function testing
- **Integration Tests:** Component interaction testing
- **E2E Tests:** Complete user flow testing
- **Visual Regression Tests:** UI consistency testing

#### **Testing Tools**
- **Backend:** Pest/PHPUnit, Laravel Testing Suite
- **Frontend:** Vitest, React Testing Library, Playwright
- **CI/CD:** Automated testing in GitHub Actions

### 4. Security Implementation

#### **Authentication & Authorization**
- **Multi-Factor Authentication:** Optional 2FA for admin users
- **Session Management:** Secure token handling with expiration
- **Password Security:** Bcrypt hashing with salt
- **Account Lockout:** Brute force protection

#### **Data Protection**
- **Input Validation:** Comprehensive server-side validation
- **SQL Injection Prevention:** Parameterized queries and ORM
- **XSS Protection:** Content Security Policy and input sanitization
- **CSRF Protection:** Token-based CSRF protection

#### **File Security**
- **File Type Validation:** Whitelist of allowed file types
- **Virus Scanning:** Integration with security services
- **Access Control:** Permission-based file access
- **Secure Storage:** Encrypted file storage

### 5. Deployment & DevOps

#### **Environment Strategy**
- **Development:** Local Docker environment
- **Staging:** Production-like environment for testing
- **Production:** Scalable cloud infrastructure

#### **CI/CD Pipeline**
```yaml
# GitHub Actions Workflow
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup PHP/Node.js
      - Install dependencies
      - Run linting
      - Run tests
      - Build frontend
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Build Docker images
      - Push to registry
      - Deploy to cloud platform
      - Run health checks
```

#### **Infrastructure**
- **Cloud Platform:** DigitalOcean App Platform or AWS ECS
- **Database:** Managed PostgreSQL with automated backups
- **File Storage:** Cloud storage with CDN
- **Monitoring:** Application performance monitoring
- **Logging:** Centralized logging with log aggregation

#### **Monitoring & Maintenance**
- **Health Checks:** Automated service health monitoring
- **Error Tracking:** Sentry or similar error tracking service
- **Performance Monitoring:** APM tools for performance insights
- **Backup Strategy:** Automated database and file backups
- **Security Updates:** Automated dependency updates

---

## Success Metrics & KPIs

### **Technical Metrics**
- **Performance:** Page load times < 2 seconds
- **Availability:** 99.9% uptime
- **Security:** Zero critical security vulnerabilities
- **Code Quality:** > 80% test coverage

### **User Experience Metrics**
- **User Adoption:** 90% of target users actively using system
- **Task Completion:** 95% successful task completion rate
- **User Satisfaction:** > 4.5/5 user satisfaction score
- **Support Tickets:** < 5% of users requiring support

### **Business Metrics**
- **Project Submissions:** Increased project submission rate
- **Processing Time:** Reduced approval processing time
- **Administrative Efficiency:** Reduced manual administrative tasks
- **Data Quality:** Improved data accuracy and completeness

---

## Timeline & Milestones

### **Phase 1: Foundation (Weeks 1-4)**
- Project setup and infrastructure
- Core authentication system
- Basic user management

### **Phase 2: Core Features (Weeks 5-12)**
- Project management module
- File upload and management
- Basic search functionality

### **Phase 3: Advanced Features (Weeks 13-20)**
- Evaluation and approval workflows
- Advanced search and analytics
- Notification system

### **Phase 4: Polish & Deployment (Weeks 21-24)**
- Performance optimization
- Security hardening
- Production deployment
- User training and documentation

---

## Risk Mitigation

### **Technical Risks**
- **Database Performance:** Regular performance testing and optimization
- **Scalability Issues:** Load testing and horizontal scaling preparation
- **Security Vulnerabilities:** Regular security audits and updates

### **Project Risks**
- **Scope Creep:** Clear requirement documentation and change control
- **Timeline Delays:** Agile development with regular sprint reviews
- **Resource Constraints:** Flexible resource allocation and prioritization

### **User Adoption Risks**
- **User Training:** Comprehensive training materials and sessions
- **Change Management:** Gradual rollout with user feedback integration
- **Support System:** Robust help documentation and support channels

---

This comprehensive plan provides a roadmap for building a robust, scalable, and user-friendly graduation project archiving system that meets the needs of academic institutions while maintaining high standards of security, performance, and user experience.
