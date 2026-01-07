<?php

namespace App\Http\Controllers;

use App\Models\SavedSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SavedSearchController extends Controller
{
    /**
     * Get all saved searches for the authenticated user.
     */
    public function index(): JsonResponse
    {
        $searches = SavedSearch::where('user_id', Auth::id())
            ->orderBy('is_default', 'desc')
            ->orderBy('usage_count', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $searches,
        ]);
    }

    /**
     * Store a new saved search.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'filters' => 'required|array',
            'is_default' => 'sometimes|boolean',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['is_default'] = $validated['is_default'] ?? false;

        $savedSearch = SavedSearch::create($validated);

        // If marked as default, update other searches
        if ($savedSearch->is_default) {
            $savedSearch->setAsDefault();
            $savedSearch->refresh();
        }

        return response()->json([
            'success' => true,
            'message' => 'Saved search created successfully',
            'data' => $savedSearch,
        ], 201);
    }

    /**
     * Display the specified saved search.
     */
    public function show(SavedSearch $savedSearch): JsonResponse
    {
        // Ensure the user owns this saved search
        if ($savedSearch->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to saved search',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $savedSearch,
        ]);
    }

    /**
     * Update the specified saved search.
     */
    public function update(Request $request, SavedSearch $savedSearch): JsonResponse
    {
        // Ensure the user owns this saved search
        if ($savedSearch->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to saved search',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'filters' => 'sometimes|required|array',
            'is_default' => 'sometimes|boolean',
        ]);

        $savedSearch->update($validated);

        // If marked as default, update other searches
        if (isset($validated['is_default']) && $validated['is_default']) {
            $savedSearch->setAsDefault();
            $savedSearch->refresh();
        }

        return response()->json([
            'success' => true,
            'message' => 'Saved search updated successfully',
            'data' => $savedSearch,
        ]);
    }

    /**
     * Remove the specified saved search.
     */
    public function destroy(SavedSearch $savedSearch): JsonResponse
    {
        // Ensure the user owns this saved search
        if ($savedSearch->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to saved search',
            ], 403);
        }

        $savedSearch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Saved search deleted successfully',
        ]);
    }

    /**
     * Record usage of a saved search.
     */
    public function recordUsage(SavedSearch $savedSearch): JsonResponse
    {
        // Ensure the user owns this saved search
        if ($savedSearch->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to saved search',
            ], 403);
        }

        $savedSearch->recordUsage();

        return response()->json([
            'success' => true,
            'message' => 'Usage recorded',
            'data' => $savedSearch->fresh(),
        ]);
    }

    /**
     * Set a saved search as default.
     */
    public function setDefault(SavedSearch $savedSearch): JsonResponse
    {
        // Ensure the user owns this saved search
        if ($savedSearch->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to saved search',
            ], 403);
        }

        $savedSearch->setAsDefault();

        return response()->json([
            'success' => true,
            'message' => 'Default search updated',
            'data' => $savedSearch->fresh(),
        ]);
    }
}
