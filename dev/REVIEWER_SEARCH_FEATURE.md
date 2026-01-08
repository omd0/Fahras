# Reviewer Search Feature Implementation

## Overview
Added a comprehensive search functionality to the Reviewer Dashboard that allows reviewers to search and filter projects based on multiple criteria.

## Changes Made

### 1. **ReviewerDashboard Component** (`web/src/components/dashboards/ReviewerDashboard.tsx`)

#### New Features:
- **Integrated ProjectSearch Component**: Reused the existing ProjectSearch component with reviewer-specific theme styling
- **Search State Management**: Added state for filtered projects and search loading status
- **Advanced Filtering**: Supports searching by:
  - Project title, abstract, and keywords (text search with autocomplete)
  - Project status (draft, submitted, under_review, approved, etc.)
  - Program and Department
  - Academic year and semester
  - Sorting options (by date, title, status, etc.)

#### Key Functionality:

##### Search Handler
```typescript
const handleSearch = async (filters: any) => {
  // Builds query parameters from search filters
  // Fetches projects from API with filters applied
  // Only shows approved projects to reviewers
  // Updates filteredProjects state
}
```

##### Clear Search Handler
```typescript
const handleClearSearch = () => {
  // Resets filtered projects to show all projects
  // Clears search state
}
```

#### UI Enhancements:

1. **Search Section** - Positioned prominently after stats cards
   - Styled with reviewer theme colors (green gradient)
   - Collapsible advanced filters
   - Real-time search suggestions
   - Active filter counter

2. **Search Results Summary with Clear Button** - Shows filtered count
   - Appears when search is active
   - "Showing X of Y projects" indicator with filter icon
   - **Prominent "Clear All Filters" button** in green gradient (reviewer theme)
   - Button positioned next to results count for easy access
   - Smooth hover animations and disabled state during search
   - One-click reset to original project list

3. **Dynamic Project Display**
   - Title changes from "Recent Projects" to "Search Results" when filtering
   - Shows appropriate empty states:
     - No projects available
     - No matching search results
   - Uses filtered projects for display

4. **Theme Integration**
   - Consistent with reviewer dashboard theme (#059669 green)
   - Custom styling for buttons, chips, and borders
   - Smooth transitions and hover effects
   - Green gradient for primary actions

## User Experience

### For Reviewers:
1. **Easy Access**: Search bar is prominently displayed below statistics
2. **Quick Search**: Type in the main search field for instant filtering
3. **Advanced Filters**: Click expand icon to access detailed filters
4. **Visual Feedback**: 
   - Loading indicators during search
   - Clear count of filtered results with filter icon
   - Helpful empty states
5. **Clear Filters**: 
   - **Prominent "Clear All Filters" button** appears when search is active
   - Positioned in the results summary bar for maximum visibility
   - Styled with reviewer's green gradient theme
   - One-click reset to view all projects
   - Clear button also available in the search form itself

### Search Criteria Available:
- **Text Search**: Project title, abstract, or keywords
- **Status Filter**: Filter by project status
- **Program/Department**: Filter by academic structure
- **Academic Period**: Filter by year and semester
- **Sorting**: Sort by date, title, or status (ascending/descending)

## Technical Details

### State Management:
- `projects`: All approved projects (baseline)
- `filteredProjects`: Currently displayed projects after search/filter
- `isSearching`: Loading state for search operations

### API Integration:
- Uses existing `apiService.getProjects()` with parameter support
- Filters results to show only approved projects (admin_approval_status === 'approved')
- Supports pagination (fetches up to 100 projects)

### Safe Data Handling:
- All array operations use fallback patterns: `(projects || [])`
- Proper error handling with user-friendly messages
- Loading states prevent premature rendering

## Clear Button Features

### Two Clear Options:
1. **Clear Button in Search Form** (ProjectSearch component)
   - Located in the search form's action button area
   - Resets all search fields and filters
   - Outlined style for secondary action

2. **Prominent "Clear All Filters" Button** (Results Summary)
   - **Only appears when filters are active** (when filteredProjects ≠ projects)
   - Positioned in the alert bar showing filtered results count
   - Styled with reviewer's signature green gradient
   - Features:
     - Clear icon (✕) for immediate recognition
     - "Clear All Filters" text for clarity
     - Hover animation (lifts up 2px with enhanced shadow)
     - Disabled state during search operations
     - Smooth transitions (0.3s ease)
   - Highly visible and accessible
   - Instantly resets view to show all projects

### Clear Button Behavior:
```typescript
const handleClearSearch = () => {
  setFilteredProjects(projects);  // Reset to original list
  setIsSearching(false);           // Clear search state
};
```

## Benefits

1. **Efficient Review Process**: Reviewers can quickly find specific projects
2. **Better Organization**: Filter by status to focus on projects needing attention
3. **Academic Context**: Search by program, year, or semester for relevant projects
4. **Consistent Experience**: Reuses existing search component with reviewer styling
5. **No Breaking Changes**: All existing functionality preserved
6. **Easy Reset**: Prominent clear button makes it simple to return to full project list

## Screenshots Location
The search feature is visible in the Reviewer Dashboard at `/dashboard` when logged in as a reviewer.

## Related Files
- `web/src/components/dashboards/ReviewerDashboard.tsx` - Main implementation
- `web/src/components/ProjectSearch.tsx` - Reusable search component
- `web/src/services/api.ts` - API service with search support
- `web/src/config/dashboardThemes.ts` - Reviewer theme configuration

## Future Enhancements (Optional)
- Add search history for reviewers
- Implement saved search filters
- Add export functionality for filtered results
- Include project evaluation status in search filters

