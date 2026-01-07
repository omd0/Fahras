# Saved Searches - Developer Quick Start

## TL;DR

The Saved Searches feature is **fully implemented** and ready to use. No additional setup required beyond normal project setup.

## Quick Start (5 minutes)

### 1. Start the Application

```bash
# Start all services
docker compose up -d

# Check services are running
docker compose ps
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost/api
- **Explore Page**: http://localhost:3000/explore

### 3. Test the Feature

1. Navigate to http://localhost:3000/explore
2. Log in (create account if needed at http://localhost:3000/register)
3. Apply some filters (Program, Academic Year, etc.)
4. Click "Saved" button
5. Click "Save Current Search"
6. Enter a name and save
7. Reload the page and load your saved search

**Done!** ✅

## File Locations

### Frontend
```
web/src/
├── features/projects/pages/
│   └── ExplorePage.tsx              # Main page with integration
├── components/explore/
│   ├── SavedSearches.tsx            # Saved searches dialog
│   └── AdvancedFilters.tsx          # Filter panel with "Saved" button
├── types/
│   └── index.ts                     # TypeScript types (SavedSearch, SearchFilters)
└── lib/
    └── api.ts                       # API service methods
```

### Backend
```
api/
├── routes/
│   └── api.php                      # API routes (/saved-searches/*)
├── app/Http/Controllers/
│   └── SavedSearchController.php    # Controller with CRUD operations
├── app/Models/
│   └── SavedSearch.php              # Eloquent model
└── database/migrations/
    └── 2026_01_07_164000_create_saved_searches_table.php  # Migration
```

### Documentation
```
web/docs/
├── SAVED_SEARCHES_FEATURE.md        # Complete technical docs
├── SAVED_SEARCHES_USER_GUIDE.md     # User guide
├── SAVED_SEARCHES_ARCHITECTURE.md   # Architecture diagrams
└── SAVED_SEARCHES_QUICKSTART.md     # This file
```

## API Endpoints (Auth Required)

```bash
# Get all saved searches
GET /api/saved-searches

# Create new saved search
POST /api/saved-searches
Body: { "name": "Search Name", "filters": {...}, "is_default": false }

# Update saved search
PUT /api/saved-searches/{id}
Body: { "name": "Updated Name" }

# Delete saved search
DELETE /api/saved-searches/{id}

# Record usage
POST /api/saved-searches/{id}/use

# Set as default
POST /api/saved-searches/{id}/set-default
```

## Code Examples

### Frontend: Load a Saved Search

```typescript
// In ExplorePage.tsx
const handleLoadSavedSearch = (newFilters: SearchFilters) => {
  setFilters(newFilters);
  
  // Build query params
  const params: any = {};
  if (newFilters.search) params.search = newFilters.search;
  if (newFilters.program_id) params.program_id = newFilters.program_id;
  // ... add other filters
  
  // Fetch projects with new filters
  apiService.getProjects(params)
    .then((response) => {
      const projectsData = Array.isArray(response) ? response : response.data || [];
      setFilteredProjects(projectsData);
    })
    .catch((error) => {
      console.error('Failed to load saved search:', error);
    });
};
```

### Backend: Get User's Saved Searches

```php
// In SavedSearchController.php
public function index(): JsonResponse
{
    $searches = SavedSearch::where('user_id', Auth::id())
        ->orderBy('is_default', 'desc')
        ->orderBy('usage_count', 'desc')
        ->orderBy('name')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $searches,
    ]);
}
```

### Backend: Set as Default

```php
// In SavedSearch.php model
public function setAsDefault(): void
{
    // Unset other default searches for this user
    static::where('user_id', $this->user_id)
        ->where('id', '!=', $this->id)
        ->update(['is_default' => false]);

    $this->update(['is_default' => true]);
}
```

## Testing

### Manual Test Checklist

- [ ] Create saved search
- [ ] Load saved search
- [ ] Edit search name
- [ ] Delete saved search
- [ ] Set default search
- [ ] Usage counter increments
- [ ] Only one search can be default
- [ ] Filter summary shows correct values
- [ ] Searches sorted correctly (default → usage → name)

### API Test (cURL)

```bash
# Get your auth token first
TOKEN="your_auth_token_here"

# Test: Get all saved searches
curl -X GET http://localhost/api/saved-searches \
  -H "Authorization: Bearer $TOKEN"

# Test: Create saved search
curl -X POST http://localhost/api/saved-searches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Search",
    "filters": {
      "program_id": "5",
      "academic_year": "2024-2025"
    }
  }'
```

## Common Issues

### Issue: "Saved" button not showing
**Fix**: You must be logged in. The feature requires authentication.

### Issue: API returns 401 Unauthorized
**Fix**: Check your auth token is valid. Try logging out and back in.

### Issue: Saved searches not loading
**Fix**: 
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check database connection

### Issue: Changes not reflected
**Fix**: Hard refresh the page (Ctrl+Shift+R) to clear cache.

## Database Schema

```sql
-- Table: saved_searches
CREATE TABLE saved_searches (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    filters JSON NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
```

## TypeScript Types

```typescript
interface SearchFilters {
  search?: string;
  program_id?: string | number;
  department_id?: string | number;
  academic_year?: string;
  semester?: string;
  status?: string;
  is_public?: boolean | null;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface SavedSearch {
  id: number;
  user_id: number;
  name: string;
  filters: SearchFilters;
  is_default: boolean;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}
```

## Next Steps

1. ✅ Feature is ready - no setup required
2. ⚠️ Test manually to ensure everything works
3. ⚠️ Share user guide with end users
4. ⚠️ Monitor usage and gather feedback
5. ⚠️ Consider future enhancements (see SAVED_SEARCHES_FEATURE.md)

## Support

- **Technical Docs**: `web/docs/SAVED_SEARCHES_FEATURE.md`
- **User Guide**: `web/docs/SAVED_SEARCHES_USER_GUIDE.md`
- **Architecture**: `web/docs/SAVED_SEARCHES_ARCHITECTURE.md`
- **Code**: Search for `SavedSearch` in codebase

## License

Part of the Fahras project. Same license applies.

---

**Version**: 1.0  
**Last Updated**: January 7, 2026  
**Status**: ✅ Production Ready
