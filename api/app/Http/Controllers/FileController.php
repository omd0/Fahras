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
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $uploadedFile = $request->file('file');
        $filename = Str::uuid() . '.' . $uploadedFile->getClientOriginalExtension();
        $path = $uploadedFile->storeAs('projects/' . $project->id, $filename, 'local');

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
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'file' => $file
        ], 201);
    }

    public function index(Project $project)
    {
        $files = $project->files()
            ->with('uploader')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'files' => $files
        ]);
    }

    public function download(File $file)
    {
        // Check if user has access to this file
        $user = request()->user();
        $hasAccess = false;

        // Project creator or member can access
        if ($file->project->created_by_user_id === $user->id) {
            $hasAccess = true;
        }

        // Project members can access
        if ($file->project->members()->where('user_id', $user->id)->exists()) {
            $hasAccess = true;
        }

        // Project advisors can access
        if ($file->project->advisors()->where('user_id', $user->id)->exists()) {
            $hasAccess = true;
        }

        // Public files can be accessed by anyone
        if ($file->is_public) {
            $hasAccess = true;
        }

        if (!$hasAccess) {
            return response()->json([
                'message' => 'Unauthorized to access this file'
            ], 403);
        }

        if (!Storage::exists($file->storage_url)) {
            return response()->json([
                'message' => 'File not found'
            ], 404);
        }

        return Storage::download($file->storage_url, $file->original_filename);
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
        if (Storage::exists($file->storage_url)) {
            Storage::delete($file->storage_url);
        }

        $file->delete();

        return response()->json([
            'message' => 'File deleted successfully'
        ]);
    }
}
