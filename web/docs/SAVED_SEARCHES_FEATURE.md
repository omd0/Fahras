# Saved Searches Feature Documentation

## Overview

The Saved Searches feature allows users to save their frequently used search filter combinations for quick access later. This significantly improves the user experience by eliminating the need to repeatedly configure the same filters.

## Features

### 1. Save Search Filters
- Users can save any combination of search filters with a custom name
- Filters include:
  - Search term (text search)
  - Program filter
  - Department filter
  - Academic year filter
  - Semester filter
  - Sort by (date created, last updated, title, academic year, rating)
  - Sort order (ascending/descending)

### 2. Manage Saved Searches
- **View All**: Browse all your saved searches in a dialog
- **Load Search**: Click on a saved search to apply its filters instantly
- **Edit Search**: Update the name or filters of an existing saved search
- **Delete Search**: Remove saved searches you no longer need
- **Set Default**: Mark a search as your default (loads automatically)

### 3. Usage Tracking
- The system tracks how many times each saved search is used
- Saved searches are sorted by:
  1. Default status (default searches appear first)
  2. Usage count (most used searches appear first)
  3. Name (alphabetically)

### 4. Quick Access
- Access saved searches via the "Saved" button in the filter panel
- The button is located next to the "Filters" toggle button
- Saved searches dialog opens as a modal overlay

## User Interface

### ExplorePage Integration

The Saved Searches feature is integrated into the ExplorePage (`web/src/features/projects/pages/ExplorePage.tsx`):

1. **Saved Button**: Located in the filter panel, next to the "Filters" button
2. **SavedSearches Dialog**: Modal dialog that opens when clicking the "Saved" button
3. **Filter Application**: When you load a saved search, filters are applied immediately and search results update

### SavedSearches Component

Location: `web/src/components/explore/SavedSearches.tsx`

**Props**:
- `open`: Boolean - Controls dialog visibility
- `onClose`: Function - Called when dialog is closed
- `currentFilters`: SearchFilters object - Current filter state
- `onLoadSearch`: Function - Called when a saved search is loaded

**Features**:
- List of saved searches with usage statistics
- Star icon to set/unset default search
- Edit icon to modify search name
- Delete icon to remove search
- "Save Current Search" button to create new saved search
- Filter summary showing active filters for each saved search

### AdvancedFilters Component

Location: `web/src/components/explore/AdvancedFilters.tsx`

**Features**:
- Primary filters (always visible): Program, Department, Academic Year, Sort By
- Advanced filters (collapsed by default): Semester, Sort Order
- "Saved" button to open SavedSearches dialog
- Responsive layout with proper MUI Grid v7 syntax

## Backend Implementation

### API Endpoints

All endpoints require authentication (`auth:sanctum` middleware).

#### GET `/api/saved-searches`
Get all saved searches for the authenticated user.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "2024 CS Projects",
      "filters": {
        "search": "",
        "program_id": "5",
        "department_id": "",
        "academic_year": "2024-2025",
        "semester": "",
        "sort_by": "created_at",
        "sort_order": "desc"
      },
      "is_default": false,
      "usage_count": 5,
      "last_used_at": "2024-01-07T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-07T10:30:00Z"
    }
  ]
}
```

#### POST `/api/saved-searches`
Create a new saved search.

**Request Body**:
```json
{
  "name": "2024 CS Projects",
  "filters": {
    "search": "",
    "program_id": "5",
    "academic_year": "2024-2025"
  },
  "is_default": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Saved search created successfully",
  "data": { /* SavedSearch object */ }
}
```

#### PUT `/api/saved-searches/{id}`
Update an existing saved search.

**Request Body**:
```json
{
  "name": "Updated Name",
  "filters": { /* Updated filters */ }
}
```

#### DELETE `/api/saved-searches/{id}`
Delete a saved search.

**Response**:
```json
{
  "success": true,
  "message": "Saved search deleted successfully"
}
```

#### POST `/api/saved-searches/{id}/use`
Record usage of a saved search (increments usage_count).

**Response**:
```json
{
  "success": true,
  "message": "Usage recorded",
  "data": { /* Updated SavedSearch object */ }
}
```

#### POST `/api/saved-searches/{id}/set-default`
Set a saved search as the default search.

**Response**:
```json
{
  "success": true,
  "message": "Default search updated",
  "data": { /* Updated SavedSearch object */ }
}
```

### Database Schema

**Table**: `saved_searches`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | Foreign key to users table |
| name | string | Name of the saved search |
| filters | json | JSON object containing filter criteria |
| is_default | boolean | Whether this is the default search |
| usage_count | integer | Number of times this search has been used |
| last_used_at | timestamp | Last time this search was used |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes**:
- `user_id` - For efficient user-based queries

**Constraints**:
- Foreign key on `user_id` with CASCADE delete
- Only one search can be marked as default per user

### Controller: SavedSearchController

Location: `api/app/Http/Controllers/SavedSearchController.php`

**Methods**:
- `index()` - Get all saved searches for authenticated user
- `store(Request $request)` - Create new saved search
- `show(SavedSearch $savedSearch)` - Get single saved search
- `update(Request $request, SavedSearch $savedSearch)` - Update saved search
- `destroy(SavedSearch $savedSearch)` - Delete saved search
- `recordUsage(SavedSearch $savedSearch)` - Increment usage count
- `setDefault(SavedSearch $savedSearch)` - Set as default search

**Authorization**:
All methods check that the saved search belongs to the authenticated user.

### Model: SavedSearch

Location: `api/app/Models/SavedSearch.php`

**Fillable Fields**:
- `user_id`, `name`, `filters`, `is_default`, `usage_count`, `last_used_at`

**Casts**:
- `filters`: array (JSON)
- `is_default`: boolean
- `usage_count`: integer
- `last_used_at`: datetime

**Methods**:
- `user()` - BelongsTo relationship with User model
- `recordUsage()` - Increment usage_count and update last_used_at
- `setAsDefault()` - Set this search as default and unset others

## Frontend Implementation

### API Service

Location: `web/src/lib/api.ts`

**Methods**:
- `getSavedSearches()` - Fetch all saved searches
- `getSavedSearch(searchId)` - Fetch single saved search
- `createSavedSearch(data)` - Create new saved search
- `updateSavedSearch(searchId, data)` - Update saved search
- `deleteSavedSearch(searchId)` - Delete saved search
- `recordSavedSearchUsage(searchId)` - Record usage
- `setSavedSearchAsDefault(searchId)` - Set as default

### TypeScript Types

Location: `web/src/types/index.ts`

**SearchFilters**:
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
```

**SavedSearch**:
```typescript
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

**CreateSavedSearchData**:
```typescript
interface CreateSavedSearchData {
  name: string;
  filters: SearchFilters;
  is_default?: boolean;
}
```

## Testing Guide

### Manual Testing Steps

#### 1. Test Save Search
1. Navigate to the ExplorePage (`http://localhost:3000/explore`)
2. Apply some filters (e.g., select a program, academic year)
3. Click the "Filters" button to expand the filter panel
4. Click the "Saved" button
5. In the dialog, click "Save Current Search"
6. Enter a name (e.g., "CS 2024 Projects")
7. Click "Save"
8. Verify the search appears in the list

#### 2. Test Load Search
1. Clear all filters
2. Click "Saved" button
3. Click on a saved search
4. Verify filters are applied and search executes
5. Verify results update based on loaded filters

#### 3. Test Edit Search
1. Click "Saved" button
2. Click the edit icon (pencil) on a saved search
3. Change the name
4. Click "Update"
5. Verify the name is updated in the list

#### 4. Test Delete Search
1. Click "Saved" button
2. Click the delete icon (trash) on a saved search
3. Verify the search is removed from the list

#### 5. Test Set Default
1. Click "Saved" button
2. Click the star outline icon on a saved search
3. Verify the star becomes filled
4. Verify only one search has a filled star
5. Verify "Default" chip appears next to the search name

#### 6. Test Usage Tracking
1. Load a saved search multiple times
2. Click "Saved" button
3. Verify "Used X times" counter increases
4. Verify searches are sorted by usage count (most used first)

### API Testing with cURL

#### Get Saved Searches
```bash
curl -X GET http://localhost/api/saved-searches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Create Saved Search
```bash
curl -X POST http://localhost/api/saved-searches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Search",
    "filters": {
      "program_id": "5",
      "academic_year": "2024-2025"
    },
    "is_default": false
  }'
```

#### Update Saved Search
```bash
curl -X PUT http://localhost/api/saved-searches/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Search Name"
  }'
```

#### Delete Saved Search
```bash
curl -X DELETE http://localhost/api/saved-searches/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Record Usage
```bash
curl -X POST http://localhost/api/saved-searches/1/use \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Set as Default
```bash
curl -X POST http://localhost/api/saved-searches/1/set-default \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Common Issues & Troubleshooting

### Issue: "Saved" button not appearing
**Solution**: Ensure you're logged in. The saved searches feature requires authentication.

### Issue: Saved searches not loading
**Solution**: 
1. Check browser console for errors
2. Verify API endpoint is accessible: `GET /api/saved-searches`
3. Check authentication token is valid

### Issue: Filters not applying when loading saved search
**Solution**: 
1. Check that `handleLoadSavedSearch` function is properly wired in ExplorePage
2. Verify the filters object structure matches SearchFilters type
3. Check browser console for errors

### Issue: Multiple searches marked as default
**Solution**: This should not happen due to backend logic. If it does:
1. Call `POST /api/saved-searches/{id}/set-default` on the desired search
2. Backend will automatically unset other default searches

### Issue: Usage count not incrementing
**Solution**: Verify `recordSavedSearchUsage` is being called when loading a search in SavedSearches component.

## Performance Considerations

1. **Pagination**: Not implemented as users typically have < 50 saved searches
2. **Caching**: Consider implementing client-side caching for saved searches list
3. **Debouncing**: Filter changes in AdvancedFilters component are not debounced (immediate API calls)
4. **Optimistic Updates**: Consider adding optimistic UI updates for better perceived performance

## Future Enhancements

1. **Shared Searches**: Allow users to share saved searches with team members
2. **Search Templates**: Pre-defined search templates for common use cases
3. **Search Analytics**: Track which searches are most popular across all users
4. **Auto-complete**: Suggest search names based on filter combinations
5. **Export/Import**: Allow users to export and import saved searches
6. **Search Folders**: Organize saved searches into folders/categories
7. **Smart Searches**: Dynamically adjust filters based on available data

## Accessibility

The Saved Searches feature follows accessibility best practices:

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **ARIA Labels**: Proper ARIA labels on buttons and icons
3. **Screen Reader Support**: Meaningful text for screen readers
4. **Focus Management**: Proper focus management in dialogs
5. **Color Contrast**: Meets WCAG AA standards

## Localization

The feature supports internationalization via the `useLanguage` hook:

- All user-facing text uses the `t()` function
- Translation keys are defined in language files
- Supports both English and Arabic (RTL layout)

## Security

1. **Authentication**: All API endpoints require valid authentication token
2. **Authorization**: Users can only access their own saved searches
3. **Input Validation**: Backend validates all input data
4. **SQL Injection Prevention**: Uses Eloquent ORM for database queries
5. **XSS Prevention**: Frontend properly escapes user input

## License

This feature is part of the Fahras project and follows the same license terms.
