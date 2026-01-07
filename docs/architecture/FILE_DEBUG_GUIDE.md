# File Upload & Debug Guide

## Overview
This guide explains the debugging enhancements added to help troubleshoot file upload and management issues in the project.

## Debugging Features Added

### 1. Backend (Laravel) Debugging

#### FileController Enhancements

**File Upload (`upload` method):**
- ✅ Detailed logging before file storage attempt
- ✅ Logs disk configuration, project ID, filename, and file size
- ✅ Try-catch error handling with detailed exception logging
- ✅ Validates storage operation success
- ✅ Returns detailed error messages with error codes

**File Listing (`index` method):**
- ✅ Logs request details (project ID, user ID)
- ✅ Checks file existence in storage for each file
- ✅ Returns debug information including:
  - Total file count
  - Disk configuration
  - Storage path
  - File existence status for each file
- ✅ Includes uploader information for each file

**File Download (`download` method):**
- ✅ Logs download requests with file details
- ✅ Enhanced error logging when file not found
- ✅ Returns debug information in error responses
- ✅ Logs successful downloads with file size

### 2. Frontend (React) Debugging

#### API Service (`api.ts`)

**File Upload:**
- ✅ Console logs for file details (name, size, type, lastModified)
- ✅ Upload progress tracking
- ✅ Detailed error logging with status and response data

**File Listing:**
- ✅ Logs when fetching files for a project
- ✅ Logs response data and file count
- ✅ Displays debug information from backend

**File Download:**
- ✅ Logs download attempts with file details
- ✅ Logs blob information (size, type)
- ✅ Detailed error logging

#### ProjectDetailPage

**File Loading:**
- ✅ Comprehensive logging of file loading process
- ✅ Logs each file's details including:
  - ID, filename, storage URL
  - Size, MIME type, public status
  - Storage existence status
  - Uploader information
- ✅ Error logging with full error details

**File Download:**
- ✅ Logs download start with file details
- ✅ Logs blob information
- ✅ User-friendly error messages
- ✅ Fallback download mechanism

## How to Debug File Issues

### 1. Check Browser Console

Open browser DevTools (F12) and check the Console tab. You'll see:
- `[DEBUG]` prefixed logs for all file operations
- File upload progress
- File listing details
- Download attempts and results
- Error messages with full details

### 2. Check Laravel Logs

Check the Laravel log file: `api/storage/logs/laravel.log`

Look for:
- `File upload request received` - Upload attempts
- `Attempting to store file` - Storage operations
- `File uploaded successfully` - Successful uploads
- `File upload exception` - Upload errors
- `Files listed for project` - File listing operations
- `File download request` - Download attempts
- `File not found in storage` - Missing file errors

### 3. Common Issues & Solutions

#### Issue: Files not uploading
**Check:**
1. Browser console for upload errors
2. Laravel logs for storage errors
3. Storage directory permissions: `api/storage/app/uploads/`
4. Disk configuration in `api/config/filesystems.php`

**Solution:**
- Ensure storage directory is writable: `chmod -R 775 api/storage/app`
- Check disk configuration matches your setup (local/S3/MinIO)

#### Issue: Files not appearing in project
**Check:**
1. Browser console for file listing errors
2. Laravel logs for file listing operations
3. Database to verify files are saved: `SELECT * FROM files WHERE project_id = ?`

**Solution:**
- Verify files are in database
- Check storage existence status in debug output
- Ensure file relationships are correct

#### Issue: File download fails
**Check:**
1. Browser console for download errors
2. Laravel logs for "File not found in storage"
3. Storage path in debug output

**Solution:**
- Verify file exists in storage: Check `storage_exists` in file listing
- Check file permissions
- Verify storage URL is correct

### 4. Testing File Operations

#### Test File Upload:
1. Open browser console (F12)
2. Navigate to Create Project page
3. Select files and submit
4. Watch console for:
   - `Uploading file:` messages
   - `File upload response:` messages
   - Any error messages

#### Test File Listing:
1. Open browser console (F12)
2. Navigate to a project detail page
3. Check console for:
   - `[DEBUG] Loading files for project X`
   - `[DEBUG] Files response:` with file details
   - `[DEBUG] File X:` for each file

#### Test File Download:
1. Open browser console (F12)
2. Click download button on a file
3. Check console for:
   - `[DEBUG] Starting download for file:`
   - `[DEBUG] Blob received:`
   - `[DEBUG] File download completed:`

## Debug Information Available

### In Browser Console:
- File upload progress and status
- File listing with full details
- Download attempts and results
- Error messages with full context

### In Laravel Logs:
- All file operations with timestamps
- Storage paths and disk configuration
- File existence checks
- Detailed error messages and stack traces

### In API Responses:
- Debug information in file listing responses
- Error details in error responses
- File existence status for each file

## Storage Configuration

The system supports multiple storage backends:
- **Local**: Files stored in `api/storage/app/uploads/projects/{project_id}/`
- **S3/MinIO**: Configured via environment variables
- **Other**: GCS, Azure, Dropbox (if configured)

Check `api/config/filesystems.php` for configuration.

## Permissions

Ensure proper permissions:
```bash
# Storage directory
chmod -R 775 api/storage/app

# If using local storage
chown -R www-data:www-data api/storage/app  # Linux
```

## Next Steps

If you encounter issues:
1. Check browser console for `[DEBUG]` messages
2. Check Laravel logs for detailed error information
3. Verify storage permissions and configuration
4. Check database for file records
5. Verify file existence in storage directory

