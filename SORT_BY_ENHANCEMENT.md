# Sort By Filter Enhancement

## Overview
Enhanced the "Sort By" filter in the ProjectSearch component to include dynamic, contextual input fields based on the selected sorting option. This provides users with more granular control over project filtering and searching.

## Changes Made

### 1. **Removed 'Status' from Sort By Dropdown**
- **Reason**: Status filter is already available as a separate filter next to the Sort By dropdown
- **Before**: 5 options (Date Created, Last Updated, Title, Academic Year, Status)
- **After**: 4 options (Date Created, Last Updated, Title, Academic Year)

### 2. **Added Dynamic Year Input Field**
Shows when user selects:
- **"Date Created"** → Input field labeled "Filter by Year Created"
- **"Academic Year"** → Input field labeled "Filter by Academic Year"

**Features:**
- Number input type for better UX
- Placeholder: "e.g., 2024"
- Min/max validation (1900-2100)
- Clears when sort option changes

### 3. **Added Dynamic Title Input Field**
Shows when user selects:
- **"Title"** → Input field labeled "Filter by Title"

**Features:**
- Text input for flexible searching
- Placeholder: "Enter title to search for"
- Allows partial matching
- Clears when sort option changes

## Technical Implementation

### Updated Interface
```typescript
interface SearchFilters {
  search: string;
  status: string;
  program_id: string;
  department_id: string;
  academic_year: string;
  semester: string;
  is_public: boolean | null;
  sort_by: string;
  sort_order: string;
  sort_year?: string;      // NEW
  sort_title?: string;     // NEW
}
```

### State Management
```typescript
const [filters, setFilters] = useState<SearchFilters>({
  // ... existing fields
  sort_year: '',
  sort_title: '',
});
```

### Conditional Rendering Logic
```typescript
{/* Year Input - Shows for Date Created or Academic Year */}
{(filters.sort_by === 'created_at' || filters.sort_by === 'academic_year') && (
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <TextField
      fullWidth
      label={filters.sort_by === 'created_at' ? 'Filter by Year Created' : 'Filter by Academic Year'}
      placeholder="e.g., 2024"
      value={filters.sort_year || ''}
      onChange={(e) => handleInputChange('sort_year', e.target.value)}
      type="number"
      inputProps={{ min: 1900, max: 2100 }}
    />
  </Grid>
)}

{/* Title Input - Shows for Title sorting */}
{filters.sort_by === 'title' && (
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <TextField
      fullWidth
      label="Filter by Title"
      placeholder="Enter title to search for"
      value={filters.sort_title || ''}
      onChange={(e) => handleInputChange('sort_title', e.target.value)}
    />
  </Grid>
)}
```

### Updated Sort Options
```typescript
const sortOptions = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'title', label: 'Title' },
  { value: 'academic_year', label: 'Academic Year' },
  // 'Status' option removed
];
```

## User Experience

### Before Enhancement:
1. User selects "Sort By: Date Created"
2. No additional filtering options
3. Results sorted by creation date but all years included

### After Enhancement:
1. User selects "Sort By: Date Created"
2. **New year input field appears below**
3. User enters "2024" in the year field
4. Results show only projects created in 2024, sorted by date
5. More precise and relevant results

## Visual Flow Examples

### Example 1: Date Created with Year Filter
```
┌─────────────────────────────────────────────────────────────┐
│ Search projects...        │ Status: All    │ Sort By: Date Created │
├─────────────────────────────────────────────────────────────┤
│                           Filter by Year Created: 2024      │
└─────────────────────────────────────────────────────────────┘
```

### Example 2: Academic Year with Year Filter
```
┌─────────────────────────────────────────────────────────────┐
│ Search projects...        │ Status: All    │ Sort By: Academic Year │
├─────────────────────────────────────────────────────────────┤
│                           Filter by Academic Year: 2023     │
└─────────────────────────────────────────────────────────────┘
```

### Example 3: Title with Text Filter
```
┌─────────────────────────────────────────────────────────────┐
│ Search projects...        │ Status: All    │ Sort By: Title │
├─────────────────────────────────────────────────────────────┤
│                           Filter by Title: Machine Learning │
└─────────────────────────────────────────────────────────────┘
```

### Example 4: Last Updated (No Additional Field)
```
┌─────────────────────────────────────────────────────────────┐
│ Search projects...        │ Status: All    │ Sort By: Last Updated │
└─────────────────────────────────────────────────────────────┘
```

## Design Alignment

### Material-UI v7 Compliance:
- ✅ Uses `Grid size={{ xs: 12, sm: 6, md: 3 }}` syntax
- ✅ Consistent spacing with `spacing={2}`
- ✅ Full-width text fields matching existing design
- ✅ Same border radius and styling as other inputs

### Responsive Layout:
- **Mobile (xs)**: Each field takes full width (12 columns)
- **Tablet (sm)**: Fields take half width (6 columns)
- **Desktop (md+)**: Fields take quarter width (3 columns)

### Visual Consistency:
- Same label styling as other form fields
- Matching placeholder text format
- Consistent focus states and borders
- Smooth transitions when fields appear/disappear

## Benefits

1. **Reduced Redundancy**: Removed duplicate Status filter from Sort By dropdown
2. **More Precise Filtering**: Users can combine sorting with specific criteria
3. **Better UX**: Contextual fields appear only when relevant
4. **Clean Interface**: Fields hide when not needed, reducing clutter
5. **Flexible Search**: Multiple ways to find specific projects
6. **Intuitive Design**: Labels clearly indicate the purpose of each field

## Use Cases

### Use Case 1: Find Recent Projects from 2024
1. Select "Sort By: Date Created"
2. Enter "2024" in the year field
3. Click "Search"
4. Results: All 2024 projects sorted by creation date

### Use Case 2: Find Projects with "AI" in Title
1. Select "Sort By: Title"
2. Enter "AI" in the title field
3. Click "Search"
4. Results: All projects with "AI" in title, alphabetically sorted

### Use Case 3: Review 2023 Academic Year Projects
1. Select "Sort By: Academic Year"
2. Enter "2023" in the year field
3. Click "Search"
4. Results: All 2023 academic year projects

## Clear Functionality

The `handleClear` function resets all fields including the new ones:
```typescript
const handleClear = () => {
  setFilters({
    // ... all existing fields reset
    sort_year: '',
    sort_title: '',
  });
  onClear();
};
```

## Testing Checklist

- ✅ Status option removed from Sort By dropdown
- ✅ Year field appears when "Date Created" selected
- ✅ Year field appears when "Academic Year" selected
- ✅ Title field appears when "Title" selected
- ✅ No extra field appears for "Last Updated"
- ✅ Fields hide when switching sort options
- ✅ Number input validation works (min/max)
- ✅ Clear button resets all fields including new ones
- ✅ Design matches existing form styling
- ✅ Responsive layout works on all screen sizes
- ✅ No linting errors

## Files Modified

1. **web/src/components/ProjectSearch.tsx**
   - Added `sort_year` and `sort_title` to SearchFilters interface
   - Updated state initialization
   - Updated handleClear function
   - Removed 'Status' from sortOptions
   - Added conditional year input field
   - Added conditional title input field

## Future Enhancements (Optional)

- Add date range picker for Date Created filter
- Add autocomplete for title field using existing projects
- Add validation messages for year input
- Save user's preferred sort options
- Add tooltips explaining each filter option

## Related Features

This enhancement works seamlessly with:
- Existing search functionality
- Status filter (now independent)
- Advanced filters (program, department, semester)
- Clear All Filters button
- Reviewer dashboard integration

