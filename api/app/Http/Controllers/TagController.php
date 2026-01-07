<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TagController extends Controller
{
    /**
     * Get all tags with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tag::query();

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by minimum usage
        if ($request->has('min_usage')) {
            $query->where('usage_count', '>=', $request->input('min_usage'));
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'ILIKE', "%{$search}%");
        }

        // Sort
        $sortBy = $request->input('sort_by', 'usage_count');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate or get all
        if ($request->has('per_page')) {
            $tags = $query->paginate($request->input('per_page', 50));
        } else {
            $tags = $query->get();
        }

        return response()->json($tags);
    }

    /**
     * Get popular tags.
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 20);
        $minUsage = $request->input('min_usage', 5);

        $tags = Tag::popular($minUsage)
            ->limit($limit)
            ->get();

        return response()->json($tags);
    }

    /**
     * Get AI-generated tags.
     */
    public function aiGenerated(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 50);

        $tags = Tag::aiGenerated()
            ->orderBy('usage_count', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($tags);
    }

    /**
     * Get tag suggestions for autocomplete.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $tags = Tag::where('name', 'ILIKE', "%{$query}%")
            ->orderBy('usage_count', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'type', 'usage_count']);

        return response()->json($tags);
    }

    /**
     * Get a single tag with related projects.
     */
    public function show(string $slug): JsonResponse
    {
        $tag = Tag::where('slug', $slug)
            ->with(['projects' => function ($query) {
                $query->where('is_public', true)
                    ->where('admin_approval_status', 'approved')
                    ->orderBy('created_at', 'desc')
                    ->limit(20);
            }])
            ->firstOrFail();

        return response()->json($tag);
    }

    /**
     * Create a new tag.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:tags,name',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'type' => 'nullable|in:manual,ai_generated,system',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tag = Tag::create([
            'name' => $request->input('name'),
            'color' => $request->input('color'),
            'type' => $request->input('type', 'manual'),
        ]);

        return response()->json($tag, 201);
    }

    /**
     * Update a tag.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:50|unique:tags,name,' . $id,
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tag->update($request->only(['name', 'color']));

        return response()->json($tag);
    }

    /**
     * Delete a tag.
     */
    public function destroy(int $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);

        // Detach from all projects
        $tag->projects()->detach();

        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }

    /**
     * Attach tags to a project.
     */
    public function attachToProject(Request $request, Project $project): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tags' => 'required|array',
            'tags.*' => 'required|string|max:50',
            'source' => 'nullable|in:manual,ai_suggested,ai_auto',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tagNames = $request->input('tags');
        $source = $request->input('source', 'manual');

        $project->attachTags($tagNames, $source);

        return response()->json([
            'message' => 'Tags attached successfully',
            'tags' => $project->tags()->get(),
        ]);
    }

    /**
     * Detach a tag from a project.
     */
    public function detachFromProject(Request $request, Project $project, int $tagId): JsonResponse
    {
        $tag = Tag::findOrFail($tagId);

        if ($project->tags()->where('tag_id', $tagId)->exists()) {
            $project->tags()->detach($tagId);
            $tag->decrementUsage();
        }

        return response()->json([
            'message' => 'Tag detached successfully',
        ]);
    }

    /**
     * Sync tags for a project (replace all).
     */
    public function syncProjectTags(Request $request, Project $project): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tags' => 'required|array',
            'tags.*' => 'required|string|max:50',
            'source' => 'nullable|in:manual,ai_suggested,ai_auto',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tagNames = $request->input('tags');
        $source = $request->input('source', 'manual');

        $project->syncTags($tagNames, $source);

        return response()->json([
            'message' => 'Tags synced successfully',
            'tags' => $project->tags()->get(),
        ]);
    }
}
