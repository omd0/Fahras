<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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

        $uploadedFile = $request->file('file');
        $filename = Str::uuid() . '.' . $uploadedFile->getClientOriginalExtension();
        
        // Use cloud storage if configured, otherwise fallback to local
        $disk = config('filesystems.default', 'local');
        $path = $uploadedFile->storeAs('uploads/projects/' . $project->id, $filename, $disk);

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

        \Log::info('File uploaded successfully', [
            'file_id' => $file->id,
            'project_id' => $project->id,
            'filename' => $file->original_filename,
            'storage_url' => $file->storage_url
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'file' => $file
        ], 201);
    }

    public function index(Project $project)
    {
        $user = request()->user();
        
        // Load all files with uploader information - no access control
        $files = $project->files()
            ->with('uploader')
            ->orderBy('uploaded_at', 'desc')
            ->get();

        \Log::info('Files listed for project', [
            'project_id' => $project->id,
            'user_id' => $user->id,
            'files_count' => $files->count()
        ]);

        return response()->json([
            'files' => $files
        ]);
    }

    public function download(File $file)
    {
        $user = request()->user();
        $project = $file->project;
        
        // No access control - everyone can download files
        $disk = config('filesystems.default', 'local');
        
        if (!Storage::disk($disk)->exists($file->storage_url)) {
            \Log::error('File not found in storage', [
                'file_id' => $file->id,
                'storage_url' => $file->storage_url,
                'disk' => $disk
            ]);
            
            return response()->json([
                'message' => 'File not found'
            ], 404);
        }

        \Log::info('File downloaded', [
            'file_id' => $file->id,
            'project_id' => $project->id,
            'user_id' => $user->id,
            'filename' => $file->original_filename
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
