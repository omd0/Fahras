<?php

namespace App\Http\Controllers;

use App\Jobs\AnalyzeProjectWithAi;
use App\Models\Project;
use App\Models\SearchQuery;
use App\Services\AiAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiSearchController extends Controller
{
    public function __construct(private AiAnalysisService $aiService)
    {
    }

    /**
     * Trigger AI analysis for a project.
     */
    public function analyzeProject(Request $request, Project $project): JsonResponse
    {
        // Check permissions
        if (!$request->user() || !$this->canAnalyzeProject($request->user(), $project)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $force = $request->boolean('force', false);

        // Dispatch job for background processing
        AnalyzeProjectWithAi::dispatch($project, $force);

        return response()->json([
            'message' => 'AI analysis queued successfully',
            'project_id' => $project->id,
            'status' => 'processing',
        ]);
    }

    /**
     * Get AI metadata for a project.
     */
    public function getProjectMetadata(Project $project): JsonResponse
    {
        $metadata = $project->aiMetadata()->first();

        if (!$metadata) {
            return response()->json([
                'message' => 'No AI metadata available for this project',
                'status' => $project->ai_analysis_status,
            ], 404);
        }

        return response()->json([
            'metadata' => $metadata,
            'tags' => $project->tags()->get(),
        ]);
    }

    /**
     * Natural language search with AI query parsing.
     */
    public function naturalLanguageSearch(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 3) {
            return response()->json([
                'message' => 'Query must be at least 3 characters',
            ], 422);
        }

        // Parse natural language query
        $parsed = $this->aiService->parseNaturalLanguageQuery($query);

        // Build search query
        $projectsQuery = Project::query();

        // Apply extracted filters
        foreach ($parsed['filters'] as $key => $value) {
            if ($key === 'academic_year') {
                $projectsQuery->where('academic_year', $value);
            } elseif ($key === 'semester') {
                $projectsQuery->where('semester', $value);
            } elseif ($key === 'status') {
                $projectsQuery->where('status', $value);
            }
        }

        // Apply text search on normalized query
        if (!empty($parsed['normalized_query'])) {
            $searchTerm = $parsed['normalized_query'];
            $projectsQuery->where(function ($q) use ($searchTerm) {
                $q->where('title', 'ILIKE', "%{$searchTerm}%")
                  ->orWhere('abstract', 'ILIKE', "%{$searchTerm}%")
                  ->orWhereJsonContains('keywords', $searchTerm);
            });
        }

        // Apply visibility rules
        if (!$request->user() || !$request->user()->hasRole('admin')) {
            $projectsQuery->where('is_public', true)
                ->where('admin_approval_status', 'approved');
        }

        // Execute search
        $projects = $projectsQuery
            ->with(['creator', 'program', 'tags'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Log search query
        SearchQuery::logSearch(
            $request->user()?->id,
            $query,
            $parsed['normalized_query'],
            $parsed['filters'],
            $projects->total()
        );

        return response()->json([
            'original_query' => $query,
            'normalized_query' => $parsed['normalized_query'],
            'extracted_filters' => $parsed['filters'],
            'results' => $projects,
        ]);
    }

    /**
     * Get search suggestions based on AI analysis.
     */
    public function searchSuggestions(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        // Get suggestions from:
        // 1. Popular tags
        // 2. Research areas
        // 3. Key concepts

        $suggestions = [];

        // Tag suggestions
        $tags = \App\Models\Tag::where('name', 'ILIKE', "%{$query}%")
            ->orderBy('usage_count', 'desc')
            ->limit(5)
            ->get(['name', 'usage_count']);

        foreach ($tags as $tag) {
            $suggestions[] = [
                'text' => $tag->name,
                'type' => 'tag',
                'count' => $tag->usage_count,
            ];
        }

        // Research area suggestions
        $researchAreas = \App\Models\ProjectAiMetadata::where('research_area', 'ILIKE', "%{$query}%")
            ->groupBy('research_area')
            ->selectRaw('research_area, COUNT(*) as count')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        foreach ($researchAreas as $area) {
            if ($area->research_area) {
                $suggestions[] = [
                    'text' => $area->research_area,
                    'type' => 'research_area',
                    'count' => $area->count,
                ];
            }
        }

        return response()->json($suggestions);
    }

    /**
     * Find similar projects based on AI embeddings.
     */
    public function findSimilarProjects(Project $project, Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);

        $metadata = $project->aiMetadata;

        if (!$metadata || !$metadata->embedding_vector) {
            return response()->json([
                'message' => 'No AI embeddings available for similarity search',
            ], 404);
        }

        // Get all projects with embeddings
        $allProjects = Project::whereHas('aiMetadata', function ($query) {
            $query->whereNotNull('embedding_vector');
        })
        ->where('id', '!=', $project->id)
        ->where('is_public', true)
        ->where('admin_approval_status', 'approved')
        ->with(['aiMetadata', 'tags', 'creator'])
        ->get();

        // Calculate similarity scores
        $similarities = [];

        foreach ($allProjects as $otherProject) {
            $similarity = $metadata->getSimilarityScore(
                $otherProject->aiMetadata->embedding_vector
            );

            if ($similarity > 0.5) {
                $similarities[] = [
                    'project' => $otherProject,
                    'similarity_score' => round($similarity, 3),
                ];
            }
        }

        // Sort by similarity score
        usort($similarities, fn($a, $b) => $b['similarity_score'] <=> $a['similarity_score']);

        // Return top N
        $results = array_slice($similarities, 0, $limit);

        return response()->json([
            'similar_projects' => $results,
            'total_found' => count($similarities),
        ]);
    }

    /**
     * Get search analytics and popular queries.
     */
    public function searchAnalytics(Request $request): JsonResponse
    {
        // Check admin permissions
        if (!$request->user() || !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $popularQueries = SearchQuery::popularSearches(20)->get();
        $failedSearches = SearchQuery::failedSearches()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $totalSearches = SearchQuery::count();
        $successRate = SearchQuery::where('had_results', true)->count() / max($totalSearches, 1);

        return response()->json([
            'popular_queries' => $popularQueries,
            'failed_searches' => $failedSearches,
            'total_searches' => $totalSearches,
            'success_rate' => round($successRate * 100, 2),
        ]);
    }

    /**
     * Check if user can analyze a project.
     */
    private function canAnalyzeProject($user, Project $project): bool
    {
        // Admin can analyze any project
        if ($user->hasRole('admin')) {
            return true;
        }

        // Project creator can analyze their own project
        if ($project->created_by_user_id === $user->id) {
            return true;
        }

        // Project members can analyze
        if ($project->members()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }
}
