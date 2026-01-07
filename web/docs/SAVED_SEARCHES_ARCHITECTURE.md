# Saved Searches - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE (Browser)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     ExplorePage Component                        │   │
│  │  (web/src/features/projects/pages/ExplorePage.tsx)              │   │
│  │                                                                   │   │
│  │  State:                                                           │   │
│  │  • filters: SearchFilters                                        │   │
│  │  • projects: Project[]                                           │   │
│  │  • showSavedSearches: boolean                                    │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │          AdvancedFilters Component                      │   │   │
│  │  │  (web/src/components/explore/AdvancedFilters.tsx)       │   │   │
│  │  │                                                          │   │   │
│  │  │  • Search input                                         │   │   │
│  │  │  • Primary filters (Program, Dept, Year, Sort)         │   │   │
│  │  │  • Advanced filters (Semester, Sort Order)             │   │   │
│  │  │  • "Saved" button → opens SavedSearches dialog        │   │   │
│  │  │  • "Search" button → triggers search                   │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │           SavedSearches Dialog Component                │   │   │
│  │  │  (web/src/components/explore/SavedSearches.tsx)         │   │   │
│  │  │                                                          │   │   │
│  │  │  • List of saved searches                              │   │   │
│  │  │  • Create new saved search                             │   │   │
│  │  │  • Edit existing search                                │   │   │
│  │  │  • Delete search                                       │   │   │
│  │  │  • Set default search                                  │   │   │
│  │  │  • Load search (calls onLoadSearch)                   │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ API Calls via apiService
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    apiService (Axios)                            │   │
│  │            (web/src/lib/api.ts)                                  │   │
│  │                                                                   │   │
│  │  Methods:                                                         │   │
│  │  • getSavedSearches()                                            │   │
│  │  • createSavedSearch(data)                                       │   │
│  │  • updateSavedSearch(id, data)                                   │   │
│  │  • deleteSavedSearch(id)                                         │   │
│  │  • recordSavedSearchUsage(id)                                    │   │
│  │  • setSavedSearchAsDefault(id)                                   │   │
│  │                                                                   │   │
│  │  Interceptors:                                                    │   │
│  │  • Request: Inject auth token from localStorage                 │   │
│  │  • Response: Handle 401 errors, redirect to login               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests (REST API)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Laravel)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    API Routes                                    │   │
│  │              (api/routes/api.php)                                │   │
│  │                                                                   │   │
│  │  GET    /api/saved-searches              → index()              │   │
│  │  POST   /api/saved-searches              → store()              │   │
│  │  GET    /api/saved-searches/{id}         → show()               │   │
│  │  PUT    /api/saved-searches/{id}         → update()             │   │
│  │  DELETE /api/saved-searches/{id}         → destroy()            │   │
│  │  POST   /api/saved-searches/{id}/use     → recordUsage()        │   │
│  │  POST   /api/saved-searches/{id}/set-default → setDefault()     │   │
│  │                                                                   │   │
│  │  Middleware: auth:sanctum (all routes)                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              SavedSearchController                               │   │
│  │      (api/app/Http/Controllers/SavedSearchController.php)        │   │
│  │                                                                   │   │
│  │  Methods:                                                         │   │
│  │  • index()         - Get all searches for user                  │   │
│  │  • store()         - Create new search                          │   │
│  │  • show()          - Get single search                          │   │
│  │  • update()        - Update search                              │   │
│  │  • destroy()       - Delete search                              │   │
│  │  • recordUsage()   - Increment usage_count                      │   │
│  │  • setDefault()    - Set as default, unset others               │   │
│  │                                                                   │   │
│  │  Authorization: Check user_id matches auth user                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  SavedSearch Model                               │   │
│  │            (api/app/Models/SavedSearch.php)                      │   │
│  │                                                                   │   │
│  │  Fillable:                                                        │   │
│  │  • user_id, name, filters, is_default, usage_count, last_used_at│   │
│  │                                                                   │   │
│  │  Casts:                                                           │   │
│  │  • filters → array (JSON)                                        │   │
│  │  • is_default → boolean                                          │   │
│  │                                                                   │   │
│  │  Methods:                                                         │   │
│  │  • recordUsage()   - Increment count, update timestamp          │   │
│  │  • setAsDefault()  - Set default, unset others                  │   │
│  │  • user()          - BelongsTo User relationship                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Eloquent ORM
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  saved_searches Table                            │   │
│  │                                                                   │   │
│  │  Columns:                                                         │   │
│  │  • id (bigint, PK)                                               │   │
│  │  • user_id (bigint, FK → users.id, CASCADE)                     │   │
│  │  • name (string, max 100)                                        │   │
│  │  • filters (json) ─────────────────────┐                        │   │
│  │  • is_default (boolean, default false) │                        │   │
│  │  • usage_count (integer, default 0)    │                        │   │
│  │  • last_used_at (timestamp, nullable)  │                        │   │
│  │  • created_at (timestamp)              │                        │   │
│  │  • updated_at (timestamp)              │                        │   │
│  │                                         │                        │   │
│  │  Indexes:                               │                        │   │
│  │  • PRIMARY (id)                         │                        │   │
│  │  • INDEX (user_id)                      │                        │   │
│  └─────────────────────────────────────────┼────────────────────────┘   │
│                                             │                            │
│                                             │ Example JSON:              │
│                                             ▼                            │
│                    {                                                     │
│                      "search": "machine learning",                       │
│                      "program_id": "5",                                  │
│                      "department_id": "",                                │
│                      "academic_year": "2024-2025",                       │
│                      "semester": "fall",                                 │
│                      "sort_by": "created_at",                            │
│                      "sort_order": "desc"                                │
│                    }                                                     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Flow 1: Creating a Saved Search

```
User                ExplorePage          SavedSearches        apiService         Backend API         Database
  │                      │                     │                   │                   │                 │
  │ Apply filters        │                     │                   │                   │                 │
  ├─────────────────────►│                     │                   │                   │                 │
  │                      │                     │                   │                   │                 │
  │ Click "Saved"        │                     │                   │                   │                 │
  ├─────────────────────►│                     │                   │                   │                 │
  │                      │ Open dialog         │                   │                   │                 │
  │                      ├────────────────────►│                   │                   │                 │
  │                      │                     │                   │                   │                 │
  │                      │                     │ GET /saved-searches                   │                 │
  │                      │                     ├──────────────────►│ GET /saved-searches                 │
  │                      │                     │                   ├──────────────────►│                 │
  │                      │                     │                   │                   │ SELECT *        │
  │                      │                     │                   │                   ├────────────────►│
  │                      │                     │                   │                   │                 │
  │                      │                     │                   │                   │ Results         │
  │                      │                     │                   │                   │◄────────────────┤
  │                      │                     │                   │ Response (JSON)   │                 │
  │                      │                     │                   │◄──────────────────┤                 │
  │                      │                     │ Searches list     │                   │                 │
  │                      │                     │◄──────────────────┤                   │                 │
  │                      │                     │                   │                   │                 │
  │ Click "Save Current" │                     │                   │                   │                 │
  ├─────────────────────►│────────────────────►│                   │                   │                 │
  │                      │                     │                   │                   │                 │
  │ Enter name: "CS 2024"│                     │                   │                   │                 │
  ├─────────────────────►│────────────────────►│                   │                   │                 │
  │                      │                     │                   │                   │                 │
  │ Click "Save"         │                     │                   │                   │                 │
  ├─────────────────────►│────────────────────►│ POST /saved-searches                  │                 │
  │                      │                     ├──────────────────►│ POST /saved-searches                │
  │                      │                     │                   ├──────────────────►│                 │
  │                      │                     │                   │                   │ INSERT          │
  │                      │                     │                   │                   ├────────────────►│
  │                      │                     │                   │                   │                 │
  │                      │                     │                   │                   │ New record      │
  │                      │                     │                   │                   │◄────────────────┤
  │                      │                     │                   │ Response          │                 │
  │                      │                     │                   │◄──────────────────┤                 │
  │                      │                     │ Success           │                   │                 │
  │                      │                     │◄──────────────────┤                   │                 │
  │                      │                     │                   │                   │                 │
  │                      │                     │ Refresh list      │                   │                 │
  │                      │                     ├──────────────────►│                   │                 │
  │                      │                     │                   │                   │                 │
  │ Success message      │                     │                   │                   │                 │
  │◄─────────────────────┤◄────────────────────┤                   │                   │                 │
```

### Flow 2: Loading a Saved Search

```
User                ExplorePage          SavedSearches        apiService         Backend API         Database
  │                      │                     │                   │                   │                 │
  │ Click "Saved"        │                     │                   │                   │                 │
  ├─────────────────────►│                     │                   │                   │                 │
  │                      │ Open dialog         │                   │                   │                 │
  │                      ├────────────────────►│                   │                   │                 │
  │                      │                     │ GET /saved-searches                   │                 │
  │                      │                     ├──────────────────►│                   │                 │
  │                      │                     │                   │ (... database query ...)            │
  │                      │                     │ Searches list     │                   │                 │
  │                      │                     │◄──────────────────┤                   │                 │
  │                      │                     │                   │                   │                 │
  │ Click on "CS 2024"   │                     │                   │                   │                 │
  ├─────────────────────►│────────────────────►│                   │                   │                 │
  │                      │                     │ POST /saved-searches/{id}/use         │                 │
  │                      │                     ├──────────────────►│ POST /saved-searches/{id}/use       │
  │                      │                     │                   ├──────────────────►│                 │
  │                      │                     │                   │                   │ UPDATE          │
  │                      │                     │                   │                   │ usage_count++   │
  │                      │                     │                   │                   │ last_used_at    │
  │                      │                     │                   │                   ├────────────────►│
  │                      │                     │                   │ Response          │                 │
  │                      │                     │                   │◄──────────────────┤                 │
  │                      │                     │                   │                   │                 │
  │                      │ onLoadSearch(filters)                   │                   │                 │
  │                      │◄────────────────────┤                   │                   │                 │
  │                      │                     │                   │                   │                 │
  │                      │ Apply filters       │                   │                   │                 │
  │                      │ setFilters(...)     │                   │                   │                 │
  │                      │                     │                   │                   │                 │
  │                      │ GET /projects?filters=...               │                   │                 │
  │                      ├────────────────────────────────────────►│                   │                 │
  │                      │                     │                   │ (... query projects ...)            │
  │                      │ Projects list       │                   │                   │                 │
  │                      │◄────────────────────────────────────────┤                   │                 │
  │                      │                     │                   │                   │                 │
  │                      │ Close dialog        │                   │                   │                 │
  │                      ├────────────────────►│                   │                   │                 │
  │                      │                     │                   │                   │                 │
  │ See filtered results │                     │                   │                   │                 │
  │◄─────────────────────┤                     │                   │                   │                 │
```

### Flow 3: Setting Default Search

```
User                SavedSearches        apiService         Backend API         Database
  │                      │                   │                   │                 │
  │ Click star icon      │                   │                   │                 │
  ├─────────────────────►│                   │                   │                 │
  │                      │ POST /saved-searches/{id}/set-default │                 │
  │                      ├──────────────────►│ POST /saved-searches/{id}/set-default
  │                      │                   ├──────────────────►│                 │
  │                      │                   │                   │ UPDATE          │
  │                      │                   │                   │ (unset others)  │
  │                      │                   │                   ├────────────────►│
  │                      │                   │                   │ UPDATE is_default = false
  │                      │                   │                   │ WHERE user_id = X AND id != Y
  │                      │                   │                   │                 │
  │                      │                   │                   │ UPDATE          │
  │                      │                   │                   │ (set current)   │
  │                      │                   │                   ├────────────────►│
  │                      │                   │                   │ UPDATE is_default = true
  │                      │                   │                   │ WHERE id = Y    │
  │                      │                   │                   │                 │
  │                      │                   │ Response          │                 │
  │                      │                   │◄──────────────────┤                 │
  │                      │ Success           │                   │                 │
  │                      │◄──────────────────┤                   │                 │
  │                      │                   │                   │                 │
  │                      │ Refresh list      │                   │                 │
  │                      ├──────────────────►│                   │                 │
  │                      │                   │                   │                 │
  │ See updated UI       │                   │                   │                 │
  │ (filled star + badge)│                   │                   │                 │
  │◄─────────────────────┤                   │                   │                 │
```

## Component Hierarchy

```
App
└── ExplorePage
    ├── AdvancedFilters
    │   ├── Search TextField
    │   ├── Filter Dropdowns (Program, Department, Year, etc.)
    │   ├── "Filters" Button (collapse/expand)
    │   ├── "Saved" Button (opens dialog)
    │   └── "Search" Button (triggers search)
    │
    └── SavedSearches (Dialog)
        ├── Dialog Header
        │   ├── Title
        │   └── Close Button
        │
        ├── Dialog Content
        │   └── List of Saved Searches
        │       └── ListItem (for each search)
        │           ├── Search Name
        │           ├── Filter Summary
        │           ├── Usage Count
        │           ├── Default Badge (if applicable)
        │           └── Action Buttons
        │               ├── Star (set/unset default)
        │               ├── Edit (edit name)
        │               └── Delete (remove search)
        │
        └── Dialog Actions
            ├── "Close" Button
            └── "Save Current Search" Button
                └── Opens Save Dialog
                    ├── TextField (search name)
                    ├── Filter Summary (read-only)
                    └── "Save" / "Cancel" Buttons
```

## State Management

### ExplorePage State
```typescript
{
  projects: Project[],              // All projects
  filteredProjects: Project[],      // Filtered projects
  filters: SearchFilters,           // Current filters
  loading: boolean,                 // Loading state
  searching: boolean,               // Search in progress
  error: string | null,             // Error message
  showFilters: boolean,             // Filters panel visibility
  showSavedSearches: boolean,       // Dialog visibility
  programs: Program[],              // Available programs
  departments: Department[]         // Available departments
}
```

### SearchFilters Type
```typescript
{
  search?: string,                  // Text search
  program_id?: string | number,     // Program filter
  department_id?: string | number,  // Department filter
  academic_year?: string,           // Year filter
  semester?: string,                // Semester filter
  sort_by?: string,                 // Sort field
  sort_order?: 'asc' | 'desc'      // Sort direction
}
```

### SavedSearches State
```typescript
{
  savedSearches: SavedSearch[],    // List of saved searches
  loading: boolean,                // Loading state
  saveDialogOpen: boolean,         // Save dialog visibility
  searchName: string,              // New search name
  editingSearch: SavedSearch | null // Search being edited
}
```

## Security & Authorization

```
┌──────────────────────────────────────────────────────────────┐
│                   Security Layers                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Authentication (Laravel Sanctum)                  │
│  ────────────────────────────────────────                   │
│  • Token-based auth                                         │
│  • Token stored in localStorage (authStore)                 │
│  • Axios interceptor injects token in request headers      │
│  • Middleware: auth:sanctum on all routes                  │
│                                                              │
│  Layer 2: Authorization (Controller Level)                  │
│  ──────────────────────────────────────                     │
│  • Check: $savedSearch->user_id === Auth::id()             │
│  • Users can only access their own saved searches          │
│  • Returns 403 Forbidden if unauthorized                   │
│                                                              │
│  Layer 3: Input Validation                                  │
│  ─────────────────────────                                  │
│  • Request validation rules                                 │
│  • name: required, string, max 100                         │
│  • filters: required, array                                │
│  • is_default: sometimes, boolean                          │
│                                                              │
│  Layer 4: Database Constraints                              │
│  ────────────────────────────                               │
│  • Foreign key on user_id with CASCADE delete              │
│  • Only owner can modify/delete                            │
│  • Automatic cleanup when user is deleted                  │
│                                                              │
│  Layer 5: Frontend Guards                                   │
│  ───────────────────────                                    │
│  • Protected routes (ProtectedRoute component)             │
│  • "Saved" button only shown if authenticated              │
│  • Graceful error handling and fallbacks                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Performance Optimizations

```
┌──────────────────────────────────────────────────────────────┐
│                Performance Considerations                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Database Layer:                                            │
│  • INDEX on user_id for fast lookups                       │
│  • Efficient sorting in query (ORDER BY)                   │
│  • No N+1 queries (no relationships loaded)                │
│                                                              │
│  Backend API:                                               │
│  • Single query to fetch all searches                      │
│  • JSON casting handled by Eloquent                        │
│  • No complex joins or aggregations                        │
│                                                              │
│  Frontend:                                                  │
│  • Searches loaded on dialog open (lazy loading)           │
│  • Local state management (no Redux overhead)              │
│  • Responsive UI updates (optimistic updates possible)     │
│                                                              │
│  Network:                                                   │
│  • Small payload size (JSON, ~1-5KB per search)           │
│  • HTTP/2 multiplexing (via Nginx)                        │
│  • Gzip compression (via Nginx)                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: January 7, 2026
**Version**: 1.0
