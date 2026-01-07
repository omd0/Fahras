<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchQuery extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_query',
        'normalized_query',
        'extracted_filters',
        'results_count',
        'had_results',
        'ip_address',
    ];

    protected $casts = [
        'extracted_filters' => 'array',
        'results_count' => 'integer',
        'had_results' => 'boolean',
    ];

    /**
     * Get the user who performed this search.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get failed searches (no results).
     */
    public function scopeFailedSearches($query)
    {
        return $query->where('had_results', false);
    }

    /**
     * Scope to get popular search terms.
     */
    public function scopePopularSearches($query, int $limit = 10)
    {
        return $query->selectRaw('original_query, COUNT(*) as search_count')
            ->groupBy('original_query')
            ->orderByDesc('search_count')
            ->limit($limit);
    }

    /**
     * Log a search query.
     */
    public static function logSearch(
        ?int $userId,
        string $originalQuery,
        ?string $normalizedQuery,
        ?array $extractedFilters,
        int $resultsCount,
        ?string $ipAddress = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'original_query' => $originalQuery,
            'normalized_query' => $normalizedQuery,
            'extracted_filters' => $extractedFilters,
            'results_count' => $resultsCount,
            'had_results' => $resultsCount > 0,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }
}
