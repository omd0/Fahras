<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Project;
use App\Services\ProjectActivityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileController extends Controller
{
    public function upload(Request $request, Project $project)
    {
        \Log::info('File upload request received', [
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'has_file' => $request->hasFile('file'),
            'is_public' => $request->input('is_public'),
            'all_input' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'file' => 'required|file', // No size limit
            'is_public' => 'nullable|boolean|in:0,1,true,false',
        ]);

        if ($validator->fails()) {
            \Log::error('File upload validation failed', [
                'errors' => $validator->errors()->toArray(),
                'input' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $uploadedFile = $request->file('file');
            $filename = Str::uuid() . '.' . $uploadedFile->getClientOriginalExtension();
            
            // Use cloud storage if configured, otherwise fallback to local
            $disk = config('filesystems.default', 'local');
            
            \Log::info('Attempting to store file', [
                'disk' => $disk,
                'project_id' => $project->id,
                'filename' => $filename,
                'original_filename' => $uploadedFile->getClientOriginalName(),
                'file_size' => $uploadedFile->getSize()
            ]);
            
            $path = $uploadedFile->storeAs('uploads/projects/' . $project->id, $filename, $disk);
            
            if (!$path) {
                \Log::error('File storage failed - storeAs returned false', [
                    'disk' => $disk,
                    'project_id' => $project->id,
                    'filename' => $filename
                ]);
                return response()->json([
                    'message' => 'Failed to store file. Please check storage permissions.',
                    'error' => 'storage_failed'
                ], 500);
            }

            $file = File::create([
                'project_id' => $project->id,
                'uploaded_by_user_id' => $request->user()->id,
                'filename' => $filename,
                'original_filename' => $uploadedFile->getClientOriginalName(),
                'mime_type' => $uploadedFile->getMimeType(),
                'size_bytes' => $uploadedFile->getSize(),
                'storage_url' => $path,
                'checksum' => hash_file('sha256', $uploadedFile->getPathname()),
                'is_public' => $request->boolean('is_public', false),
                'uploaded_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('File upload exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'project_id' => $project->id,
                'user_id' => $request->user()->id
            ]);
            
            return response()->json([
                'message' => 'File upload failed: ' . $e->getMessage(),
                'error' => 'upload_exception'
            ], 500);
        }

        \Log::info('File uploaded successfully', [
            'file_id' => $file->id,
            'project_id' => $project->id,
            'filename' => $file->original_filename,
            'storage_url' => $file->storage_url
        ]);

        // Log file upload activity
        ProjectActivityService::logFileUpload($project, $request->user(), $file);

        return response()->json([
            'message' => 'File uploaded successfully',
            'file' => $file
        ], 201);
    }

    public function index(Project $project)
    {
        $user = request()->user();
        
        \Log::info('Files list request received', [
            'project_id' => $project->id,
            'user_id' => $user ? $user->id : 'guest',
            'project_exists' => $project->exists
        ]);
        
        // Load all files with uploader information - no access control
        $files = $project->files()
            ->with('uploader')
            ->orderBy('uploaded_at', 'desc')
            ->get();

        // Debug: Check file storage existence
        $disk = config('filesystems.default', 'local');
        $filesWithStatus = $files->map(function ($file) use ($disk) {
            $exists = Storage::disk($disk)->exists($file->storage_url);
            return [
                'id' => $file->id,
                'original_filename' => $file->original_filename,
                'filename' => $file->filename,
                'storage_url' => $file->storage_url,
                'size_bytes' => $file->size_bytes,
                'mime_type' => $file->mime_type,
                'is_public' => $file->is_public,
                'uploaded_at' => $file->uploaded_at,
                'storage_exists' => $exists,
                'uploader' => $file->uploader ? [
                    'id' => $file->uploader->id,
                    'full_name' => $file->uploader->full_name,
                    'email' => $file->uploader->email
                ] : null
            ];
        });

        \Log::info('Files listed for project', [
            'project_id' => $project->id,
            'user_id' => $user ? $user->id : 'guest',
            'files_count' => $files->count(),
            'files' => $filesWithStatus->toArray(),
            'disk' => $disk,
            'storage_path' => storage_path('app')
        ]);

        return response()->json([
            'files' => $filesWithStatus,
            'debug' => [
                'project_id' => $project->id,
                'total_files' => $files->count(),
                'disk' => $disk,
                'storage_path' => storage_path('app')
            ]
        ]);
    }

    public function download(File $file)
    {
        $user = request()->user();
        $project = $file->project;
        
        \Log::info('File download request', [
            'file_id' => $file->id,
            'project_id' => $project->id,
            'user_id' => $user ? $user->id : 'guest',
            'original_filename' => $file->original_filename,
            'storage_url' => $file->storage_url
        ]);
        
        // No access control - everyone can download files
        $disk = config('filesystems.default', 'local');
        
        if (!Storage::disk($disk)->exists($file->storage_url)) {
            \Log::error('File not found in storage', [
                'file_id' => $file->id,
                'storage_url' => $file->storage_url,
                'disk' => $disk,
                'full_path' => Storage::disk($disk)->path($file->storage_url),
                'storage_root' => storage_path('app')
            ]);
            
            return response()->json([
                'message' => 'File not found in storage',
                'error' => 'file_not_found',
                'debug' => [
                    'file_id' => $file->id,
                    'storage_url' => $file->storage_url,
                    'disk' => $disk,
                    'storage_path' => storage_path('app')
                ]
            ], 404);
        }

        \Log::info('File downloaded successfully', [
            'file_id' => $file->id,
            'project_id' => $project->id,
            'user_id' => $user ? $user->id : 'guest',
            'filename' => $file->original_filename,
            'file_size' => $file->size_bytes
        ]);

        // Properly encode Arabic/UTF-8 filenames in Content-Disposition header
        $filename = $file->original_filename;
        $encodedFilename = rawurlencode($filename);
        
        // Use RFC 5987 encoding for proper UTF-8 filename support
        $headers = [
            'Content-Type' => $file->mime_type,
            'Content-Disposition' => "attachment; filename=\"{$filename}\"; filename*=UTF-8''{$encodedFilename}",
            'Cache-Control' => 'no-cache, must-revalidate',
        ];

        return Storage::disk($disk)->response($file->storage_url, $filename, $headers);
    }

    public function destroy(File $file)
    {
        $user = request()->user();

        // Only project creator or file uploader can delete
        if ($file->project->created_by_user_id !== $user->id && 
            $file->uploaded_by_user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to delete this file'
            ], 403);
        }

        // Log file deletion activity before deleting
        ProjectActivityService::logFileDelete($file->project, $user, $file);

        // Delete from storage
        $disk = config('filesystems.default', 'local');
        if (Storage::disk($disk)->exists($file->storage_url)) {
            Storage::disk($disk)->delete($file->storage_url);
        }

        $file->delete();

        return response()->json([
            'message' => 'File deleted successfully'
        ]);
    }
}
