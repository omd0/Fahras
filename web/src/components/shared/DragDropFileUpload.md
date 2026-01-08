# DragDropFileUpload Component

A modern, animated drag-and-drop file upload component built with React, Material-UI, and Framer Motion.

## Features

- ✨ **Smooth Animations**: Powered by framer-motion for delightful user interactions
- 🎯 **Drag & Drop**: Intuitive drag-and-drop interface with visual feedback
- 📊 **Progress Tracking**: Real-time upload progress indicators with status badges
- ✅ **File Validation**: Built-in validation for file size and type
- 🎨 **Batch Uploads**: Support for multiple file uploads with individual progress tracking
- 🔄 **Status Indicators**: Visual feedback for upload states (pending, uploading, success, error)
- 🎭 **Animated Transitions**: Spring animations and smooth enter/exit transitions
- ♿ **Accessible**: Follows accessibility best practices

## Installation

The component requires the following dependencies:

```bash
npm install framer-motion@latest --legacy-peer-deps
```

## Basic Usage

```tsx
import { useState } from 'react';
import { DragDropFileUpload } from '@/components/shared/DragDropFileUpload';

function MyComponent() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <DragDropFileUpload
      files={files}
      onFilesChange={setFiles}
      maxFiles={10}
      maxSizeBytes={50 * 1024 * 1024} // 50MB
      acceptedTypes={['.pdf', '.doc', '.docx', 'image/*']}
    />
  );
}
```

## Advanced Usage with Progress Tracking

```tsx
import { useState } from 'react';
import { DragDropFileUpload, FileWithProgress } from '@/components/shared/DragDropFileUpload';

function AdvancedUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [filesWithProgress, setFilesWithProgress] = useState<FileWithProgress[]>([]);

  const handleUploadStart = () => {
    // Initialize progress tracking
    const newFilesWithProgress = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    setFilesWithProgress(newFilesWithProgress);

    // Simulate upload with progress updates
    files.forEach((file, index) => {
      simulateUpload(file, (progress) => {
        setFilesWithProgress(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], progress };
          return updated;
        });
      }, (success) => {
        setFilesWithProgress(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: success ? 'success' : 'error',
            progress: 100,
            error: success ? undefined : 'Upload failed',
          };
          return updated;
        });
      });
    });
  };

  return (
    <DragDropFileUpload
      files={files}
      onFilesChange={setFiles}
      showProgress={true}
      filesWithProgress={filesWithProgress}
      onUploadStart={handleUploadStart}
      maxFiles={5}
      acceptedTypes={['image/*', '.pdf']}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | `File[]` | Required | Array of selected files |
| `onFilesChange` | `(files: File[]) => void` | Required | Callback when files change |
| `maxFiles` | `number` | `10` | Maximum number of files allowed |
| `maxSizeBytes` | `number` | `52428800` (50MB) | Maximum file size in bytes |
| `acceptedTypes` | `string[]` | `[]` | Accepted file types (extensions or MIME types) |
| `disabled` | `boolean` | `false` | Disable the upload zone |
| `showPreview` | `boolean` | `true` | Show file list preview |
| `showProgress` | `boolean` | `false` | Enable progress tracking UI |
| `filesWithProgress` | `FileWithProgress[]` | `[]` | Array of files with upload progress |
| `onUploadStart` | `() => void` | - | Callback when upload starts |
| `onUploadComplete` | `() => void` | - | Callback when upload completes |

## FileWithProgress Interface

```typescript
interface FileWithProgress {
  file: File;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}
```

## Accepted File Types

The `acceptedTypes` prop accepts:

- **File extensions**: `.pdf`, `.doc`, `.docx`
- **MIME types**: `application/pdf`, `text/plain`
- **MIME wildcards**: `image/*`, `video/*`, `audio/*`

Example:
```tsx
acceptedTypes={['.pdf', '.doc', '.docx', 'image/*', 'video/mp4']}
```

## Animation Features

### Drop Zone Animations
- **Idle State**: Subtle scale effect on hover
- **Dragging State**: Animated border color and scale transformation
- **Icon Animation**: Rotating wiggle animation during drag

### File List Animations
- **Enter Animation**: Spring-based slide-in from left
- **Exit Animation**: Smooth slide-out to right with fade
- **Layout Animation**: Smooth reordering when files are added/removed
- **Progress Bar**: Animated scale-in with smooth progress updates

### Interactive Elements
- **Buttons**: Scale animations on hover and tap
- **Delete Icons**: Scale feedback on interaction
- **Error Alerts**: Smooth height and opacity transitions

## Validation

The component automatically validates:

1. **File Count**: Ensures total files don't exceed `maxFiles`
2. **File Size**: Checks each file against `maxSizeBytes`
3. **File Type**: Validates against `acceptedTypes` (if provided)
4. **Duplicates**: Prevents adding files with same name and size

Validation errors are displayed in an animated alert banner.

## Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard accessible file input
- Screen reader friendly status indicators
- Focus management for interactive elements

## Integration with Backend

Example integration with the Fahras API:

```tsx
import { apiService } from '@/services/api';

const handleUploadFiles = async () => {
  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('visibility', 'public');

      await apiService.uploadFile(formData);

      // Update progress state
      setFilesWithProgress(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'success', progress: 100 }
            : f
        )
      );
    } catch (error) {
      setFilesWithProgress(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      );
    }
  }
};
```

## Styling Customization

The component uses MUI's theming system and can be customized via `sx` props or theme overrides.

Example custom styling:
```tsx
<Box sx={{
  '& .MuiPaper-root': {
    borderRadius: 4,
    borderColor: 'secondary.main'
  }
}}>
  <DragDropFileUpload {...props} />
</Box>
```

## Performance Considerations

- Uses `useCallback` to memoize event handlers
- Implements drag counter to handle nested drag events
- Efficient file validation with early returns
- Optimized animations with Framer Motion's layout animations

## Browser Support

- Modern browsers with File API support
- Drag and Drop API support required
- CSS animations and transitions support

## License

Part of the Fahras graduation project archiving system.
