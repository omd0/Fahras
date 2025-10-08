# Custom Members & Advisors Feature

## Overview
Updated the Project Team and Project Members fields to allow both manual typing and selection from a dropdown list. Users can now either select existing users from the database or type custom names for external members/advisors.

## Changes Made

### Frontend Changes

#### 1. **CreateProjectPage.tsx**
- Updated `Autocomplete` components to use `freeSolo` prop
- Added `customName` field to state for members and advisors
- Updated handlers to support both user selection and manual text entry
- Modified display logic to show custom names when available
- Labels updated to "Select or Type Member Name" and "Select or Type Advisor Name"

#### 2. **EditProjectPage.tsx**
- Replaced `Select` dropdowns with `Autocomplete` components with `freeSolo`
- Added `customName` field to state
- Updated project loading to handle custom members/advisors
- Updated handlers to support both user selection and manual text entry
- Modified display logic to show custom names

#### 3. **types/index.ts**
- Updated `CreateProjectData` interface to include optional `customName` field for members and advisors
- Updated `ProjectMember` and `ProjectAdvisor` interfaces to support:
  - Nullable `id` (for custom members without user accounts)
  - Nullable `email` (for custom members)
  - Optional `is_custom` boolean flag

### Backend Changes

#### 1. **Database Migration**
- Created migration: `2024_01_01_000014_add_custom_members_to_projects_table.php`
- Added `custom_members` JSON column to projects table
- Added `custom_advisors` JSON column to projects table

#### 2. **Project Model** (`app/Models/Project.php`)
- Added `custom_members` and `custom_advisors` to `$fillable` array
- Added array casts for both fields

#### 3. **ProjectController.php**

**store() method:**
- Updated validation to make `user_id` optional when `customName` is provided
- Added validation for `customName` field
- Separated custom members/advisors from regular ones
- Stores custom entries in JSON columns
- Only creates relationships for members/advisors with valid user_ids

**show() method:**
- Merges regular members/advisors with custom ones
- Returns combined array with both types
- Custom entries have `is_custom: true` flag and `id: null`

**update() method:**
- Added support for updating members and advisors
- Handles both custom names and user_ids
- Separates and stores each type appropriately
- Uses `sync()` for regular members/advisors
- Updates JSON columns for custom entries

## Database Schema

### projects table (new columns)
```sql
custom_members: JSON (nullable)
  - Stores array of objects: [{ name: string, role: string }]

custom_advisors: JSON (nullable)
  - Stores array of objects: [{ name: string, role: string }]
```

## Usage

### For Users:
1. **Create/Edit Project Page:**
   - Click on the "Select or Type Member/Advisor Name" field
   - Option 1: Start typing to filter existing users and select from dropdown
   - Option 2: Type a custom name and press Enter or click Add
   - Custom names will persist in the database

2. **Viewing Projects:**
   - Both registered users and custom names display seamlessly
   - Custom entries show only the name (no email)
   - Regular users show name and email

### For Developers:

**Frontend (TypeScript):**
```typescript
// Member/Advisor structure
{
  user_id: number | -1,  // -1 for custom entries
  role: 'LEAD' | 'MEMBER',
  customName?: string    // Present for custom entries
}
```

**Backend (PHP):**
```php
// API Request
{
  "members": [
    { "user_id": 5, "role": "LEAD" },           // Regular user
    { "user_id": -1, "role": "MEMBER", "customName": "John Doe" }  // Custom
  ]
}

// Database Storage
- Regular: project_members pivot table
- Custom: projects.custom_members JSON column
```

## Migration Instructions

To apply the database changes:

```bash
# Using Docker
docker-compose exec api php artisan migrate

# Or directly
cd api
php artisan migrate
```

## Benefits

1. **Flexibility:** Support for external collaborators not in the system
2. **Better UX:** Autocomplete with search/filter functionality
3. **Data Integrity:** Regular users maintain full relationship data
4. **Persistence:** Custom names are stored and displayed correctly
5. **Backward Compatible:** Existing projects continue to work

## Technical Notes

- Custom members/advisors don't create user accounts
- They're stored as JSON for flexibility and performance
- The system merges both types when displaying project details
- Validation ensures either `user_id` or `customName` is provided
- Empty or invalid entries are rejected with clear error messages

