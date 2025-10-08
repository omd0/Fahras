# File Access - Unrestricted Mode

## Changes Summary

All role-based access control for file visibility and downloads has been **removed**. Files are now visible and downloadable by everyone, regardless of:
- User roles (admin, reviewer, faculty, student)
- Project approval status (pending, approved, hidden)
- Project public/private setting
- User relationship to project (creator, member, advisor, or none)

## Modified Files

### 1. `api/app/Http/Controllers/FileController.php`

#### `index()` method (lines 74-93)
**Before**: Complex access control checking user roles, project membership, and approval status  
**After**: Simply loads and returns all files for any project

```php
// Old: ~50 lines of access control logic
// New: Direct file loading with no restrictions
$files = $project->files()
    ->with('uploader')
    ->orderBy('uploaded_at', 'desc')
    ->get();
```

#### `download()` method (lines 95-123)
**Before**: Multiple permission checks before allowing download  
**After**: Allows anyone to download any file

```php
// Old: ~40 lines of access control logic
// New: Direct file download with only storage existence check
$disk = config('filesystems.default', 'local');
if (!Storage::disk($disk)->exists($file->storage_url)) {
    return response()->json(['message' => 'File not found'], 404);
}
return Storage::disk($disk)->download($file->storage_url, $file->original_filename);
```

### 2. `api/app/Http/Controllers/ProjectController.php`

#### `show()` method (lines 331-332)
**Before**: Conditional file loading based on user permissions  
**After**: Always loads and returns all files

```php
// Old: ~30 lines of conditional logic
// New: Direct file loading
$projectData['files'] = $project->files()->orderBy('uploaded_at', 'desc')->get()->toArray();
```

## Behavior Changes

### File Listing (`GET /api/projects/{project}/files`)
- **Before**: Returned 403 error if user didn't have permission
- **After**: Always returns all files for the requested project

### File Download (`GET /api/files/{file}/download`)
- **Before**: Returned 403 error with message about project approval
- **After**: Always allows download (returns 404 only if file doesn't exist in storage)

### Project Details (`GET /api/projects/{project}`)
- **Before**: Files array could be empty based on user permissions
- **After**: Always includes all files in the response

## Impact

### Positive
✅ **Simplified**: Removed ~120 lines of complex access control logic  
✅ **Consistent**: Files always visible, no confusion about why they're hidden  
✅ **Fast**: No additional database queries to check memberships/roles  
✅ **Predictable**: Same behavior for all users

### Security Considerations
⚠️ **Public Access**: All uploaded files are now publicly accessible to any authenticated user  
⚠️ **No Privacy**: Project creators/members cannot restrict file access  
⚠️ **Open Repository**: System now functions as an open repository where all files are visible

## Testing

### Quick Test
1. **Create a project** with files as any user
2. **Log in as a different user** (different role, not related to project)
3. **Navigate to the project**
4. **Verify**: Files are visible and downloadable

### Edge Cases Tested
- ✅ Pending projects: Files visible
- ✅ Hidden projects: Files visible (if project itself is accessible)
- ✅ Draft projects: Files visible
- ✅ Private projects: Files visible
- ✅ No membership: Files visible
- ✅ Any role: Files visible

## Rollback

If you need to restore access control, you can revert these changes:

```bash
git diff HEAD~1 api/app/Http/Controllers/FileController.php
git diff HEAD~1 api/app/Http/Controllers/ProjectController.php

# To rollback:
git checkout HEAD~1 -- api/app/Http/Controllers/FileController.php
git checkout HEAD~1 -- api/app/Http/Controllers/ProjectController.php
```

## Alternative: Selective Access Control

If you need some access control but want it simpler, consider these options:

### Option 1: Public Projects Only
```php
// In FileController::index()
if (!$project->isApproved() || !$project->is_public) {
    return response()->json(['message' => 'Files not available'], 403);
}
// Load files...
```

### Option 2: Approved Projects Only
```php
// In FileController::index()
if (!$project->isApproved()) {
    return response()->json(['message' => 'Files not yet approved'], 403);
}
// Load files...
```

### Option 3: Creator + Approved Public
```php
// In FileController::index()
$user = request()->user();
if (!$project->isApproved() && $project->created_by_user_id !== $user->id) {
    return response()->json(['message' => 'Unauthorized'], 403);
}
// Load files...
```

## Notes

- **File Delete**: Still restricted to project creator and file uploader
- **File Upload**: Still restricted to authenticated users
- **Project Visibility**: Still controlled by admin approval status
- **Authentication**: Users must still be logged in to access files

## Related Documentation

- See `CreateProjectPage.tsx` for file upload implementation
- See `ProjectDetailPage.tsx` for file display implementation
- See `File.php` model for file-related methods

