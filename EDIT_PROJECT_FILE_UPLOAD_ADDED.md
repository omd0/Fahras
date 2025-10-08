# Edit Project Page - File Upload Feature Added

## ✅ **What Was Added**

### EditProjectPage.tsx - Complete File Upload Functionality

**New Features:**
1. ✅ **File Selection** - Users can select multiple files to upload
2. ✅ **File Preview** - Shows selected files with name and size before upload
3. ✅ **File Upload** - Uploads files after project is updated
4. ✅ **Progress Tracking** - Detailed console logging for each file
5. ✅ **Error Handling** - Shows which files failed, allows partial success
6. ✅ **File Management** - Can remove files before uploading

## 📝 **Changes Made**

### 1. Added Imports (lines 23-30)
```typescript
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,  // NEW
  AttachFile as AttachFileIcon,    // NEW
} from '@mui/icons-material';
```

### 2. Added State (line 55)
```typescript
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
```

### 3. Added File Handlers (lines 183-198)
```typescript
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  setSelectedFiles(prev => [...prev, ...files]);
};

const handleRemoveFile = (index: number) => {
  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
```

### 4. Enhanced Submit Handler (lines 201-253)

**Before:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    await apiService.updateProject(parseInt(id!), formData);
    navigate(`/projects/${id}`);
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to update project');
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    console.log('Updating project...', formData);
    
    // Update the project first
    await apiService.updateProject(parseInt(id!), formData);
    console.log('Project updated successfully');

    // If files are selected, upload them
    if (selectedFiles.length > 0) {
      console.log(`Starting file upload: ${selectedFiles.length} files to project ${id}`);
      
      let uploadedCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          console.log(`[${i + 1}/${selectedFiles.length}] Uploading: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
          
          const uploadResponse = await apiService.uploadFile(parseInt(id!), file, true);
          
          console.log(`✅ File uploaded successfully:`, uploadResponse);
          uploadedCount++;
        } catch (uploadError: any) {
          console.error(`❌ File upload failed for ${file.name}:`, uploadError);
          console.error('Error details:', uploadError.response?.data);
          failedCount++;
        }
      }
      
      console.log(`File upload complete: ${uploadedCount} succeeded, ${failedCount} failed`);
      
      if (failedCount > 0) {
        setError(`Project updated but ${failedCount} file(s) failed to upload.`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    navigate(`/projects/${id}`);
  } catch (error: any) {
    console.error('Project update failed:', error);
    console.error('Error response:', error.response?.data);
    setError(error.response?.data?.message || 'Failed to update project');
  } finally {
    setLoading(false);
  }
};
```

### 5. Added File Upload UI (lines 537-607)

```typescript
{/* File Upload Section */}
<Grid size={{ xs: 12 }}>
  <Typography variant="h6" gutterBottom>
    Upload Additional Files
  </Typography>
  <Box sx={{ mb: 2 }}>
    <input
      accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
      style={{ display: 'none' }}
      id="file-upload-edit"
      multiple
      type="file"
      onChange={handleFileSelect}
    />
    <label htmlFor="file-upload-edit">
      <Button
        variant="outlined"
        component="span"
        startIcon={<CloudUploadIcon />}
        sx={{ mb: 1 }}
      >
        Upload Files
      </Button>
    </label>
    <Typography variant="caption" display="block" color="text.secondary">
      Supported formats: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX
    </Typography>
  </Box>
  
  {selectedFiles.length > 0 && (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Selected Files ({selectedFiles.length}):
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {selectedFiles.map((file, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'background.paper'
            }}
          >
            <AttachFileIcon color="action" />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => handleRemoveFile(index)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  )}
</Grid>
```

## 🎯 **How It Works**

### User Flow:

1. **Navigate to Edit Page**
   - User clicks "Edit" button on project details page
   - EditProjectPage loads with current project data

2. **Make Changes**
   - User updates title, abstract, keywords, members, advisors
   - User clicks "Upload Files" button

3. **Select Files**
   - File picker opens
   - User selects 1 or more files
   - Files appear in "Selected Files" list

4. **Remove Files (Optional)**
   - User can click X icon to remove files before upload
   - Only affects not-yet-uploaded files

5. **Submit Form**
   - User clicks "Update Project"
   - Form validation runs
   - Project metadata updates first
   - Then files upload one by one

6. **Upload Progress**
   - Console shows:
     ```
     Updating project... {data}
     Project updated successfully
     Starting file upload: 2 files to project 27
     [1/2] Uploading: report.pdf (345.67 KB)
     ✅ File uploaded successfully
     [2/2] Uploading: slides.pptx (512.89 KB)
     ✅ File uploaded successfully
     File upload complete: 2 succeeded, 0 failed
     ```

7. **Navigate Back**
   - User redirected to project details page
   - New files visible in "Project Files" section

## 🧪 **How to Test**

### Test 1: Basic File Upload
```
1. Login as project owner
2. Navigate to any project you created
3. Click "Edit" button
4. Click "Upload Files"
5. Select 1-2 test files
6. Verify files appear in "Selected Files" list
7. Click "Update Project"
8. Watch console for upload logs
9. Verify redirect to project details
10. Verify files appear in "Project Files" section
```

### Test 2: Remove Files Before Upload
```
1. Follow steps 1-5 from Test 1
2. Click X icon on one file
3. Verify file removed from list
4. Continue with steps 7-10
5. Verify only remaining files were uploaded
```

### Test 3: Upload Without Changing Metadata
```
1. Edit a project
2. Don't change title, abstract, etc.
3. Only upload new files
4. Submit
5. Verify files uploaded successfully
```

### Test 4: Large Files
```
1. Edit a project
2. Try uploading a 15MB file (should fail with 10MB limit)
3. Verify error message in console
4. Try uploading a 5MB file (should succeed)
```

### Test 5: Mixed Success/Failure
```
1. Edit a project
2. Upload mix of valid and invalid files
3. Watch console - should see:
   - ✅ for successful uploads
   - ❌ for failed uploads
4. Error message should show count of failures
5. Successful files should appear in project
```

## 📊 **Console Output Examples**

### Successful Upload:
```
Updating project... {program_id: 1, title: "Test", ...}
Project updated successfully
Starting file upload: 2 files to project 27
[1/2] Uploading: document.pdf (245.67 KB)
✅ File uploaded successfully: {file: {...}}
[2/2] Uploading: presentation.pptx (512.34 KB)
✅ File uploaded successfully: {file: {...}}
File upload complete: 2 succeeded, 0 failed
```

### Partial Failure:
```
Updating project... {program_id: 1, title: "Test", ...}
Project updated successfully
Starting file upload: 3 files to project 27
[1/3] Uploading: valid.pdf (245.67 KB)
✅ File uploaded successfully: {file: {...}}
[2/3] Uploading: too-large.pdf (15234.56 KB)
❌ File upload failed for too-large.pdf: Error
Error details: {message: "Validation failed", errors: {...}}
[3/3] Uploading: another.docx (123.45 KB)
✅ File uploaded successfully: {file: {...}}
File upload complete: 2 succeeded, 1 failed
```

## ⚙️ **Key Features**

### File Upload Enhancements:
- ✅ **Multiple file selection** - Upload many files at once
- ✅ **File preview** - See what will be uploaded
- ✅ **Remove before upload** - Cancel unwanted files
- ✅ **Progress tracking** - See each file as it uploads
- ✅ **Error visibility** - Know which files failed
- ✅ **Partial success** - Upload continues even if one file fails
- ✅ **Size display** - Shows file size in human-readable format
- ✅ **Format restriction** - Only accepts document types

### Error Handling:
- ✅ **Per-file errors** - Each file can succeed or fail independently
- ✅ **Error logging** - Full error details in console
- ✅ **User notification** - Shows error message with count
- ✅ **Graceful degradation** - Project still updates even if files fail

### User Experience:
- ✅ **Visual feedback** - File icons, size, remove buttons
- ✅ **Format hints** - Shows accepted file types
- ✅ **Loading state** - Button shows "Updating..." during submission
- ✅ **Error delay** - 3 seconds to read error before navigation

## 📋 **Supported File Types**

- ✅ PDF (.pdf)
- ✅ Word (.doc, .docx)
- ✅ Text (.txt, .rtf)
- ✅ PowerPoint (.ppt, .pptx)
- ✅ Excel (.xls, .xlsx)

**File Size Limit:** 10MB per file (configurable in `FileController.php`)

## 🔄 **Comparison: Create vs Edit**

Both pages now have **identical file upload functionality**:

| Feature | CreateProjectPage | EditProjectPage |
|---------|------------------|-----------------|
| Multiple Files | ✅ | ✅ |
| File Preview | ✅ | ✅ |
| Remove Files | ✅ | ✅ |
| Progress Tracking | ✅ | ✅ |
| Error Handling | ✅ | ✅ |
| Console Logging | ✅ | ✅ |
| Files Public by Default | ✅ | ✅ |

## 🎉 **Summary**

**The EditProjectPage now has complete file upload functionality**, matching the CreateProjectPage. Users can:

1. ✅ Upload new files when editing existing projects
2. ✅ See detailed progress for each file upload
3. ✅ Get clear error messages if uploads fail
4. ✅ Continue working even if some files fail to upload
5. ✅ Remove files before uploading
6. ✅ See file sizes and names before submission

**Result:** Users can now manage project files throughout the entire project lifecycle:
- Create project → Upload files
- Edit project → Upload more files
- View project → Download/see all files

All file operations are now fully debuggable with comprehensive console logging!

