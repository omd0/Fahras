<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectAiMetadata extends Model
{
    use HasFactory;

    protected $table = 'project_ai_metadata';

    protected $fillable = [
        'project_id',
        'ai_summary',
        'key_concepts',
        'research_area',
        'research_subcategories',
        'embedding_vector',
        'detected_language',
        'complexity_level',
        'ai_model_version',
        'last_analyzed_at',
        'analysis_attempts',
        'analysis_error',
    ];

    protected $casts = [
        'key_concepts' => 'array',
        'research_subcategories' => 'array',
        'embedding_vector' => 'array',
        'last_analyzed_at' => 'datetime',
        'analysis_attempts' => 'integer',
    ];

    /**
     * Get the project that owns this AI metadata.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Mark analysis as completed.
     */
    public function markAsCompleted(string $modelVersion): void
    {
        $this->update([
            'last_analyzed_at' => now(),
            'ai_model_version' => $modelVersion,
            'analysis_error' => null,
        ]);
    }

    /**
     * Mark analysis as failed.
     */
    public function markAsFailed(string $error): void
    {
        $this->increment('analysis_attempts');
        $this->update([
            'analysis_error' => $error,
            'last_analyzed_at' => now(),
        ]);
    }

    /**
     * Check if analysis needs refresh (older than 30 days).
     */
    public function needsRefresh(): bool
    {
        if (!$this->last_analyzed_at) {
            return true;
        }

        return $this->last_analyzed_at->lt(now()->subDays(30));
    }

    /**
     * Get similarity score with another project (using cosine similarity).
     */
    public function getSimilarityScore(?array $otherEmbedding): float
    {
        if (!$this->embedding_vector || !$otherEmbedding) {
            return 0.0;
        }

        // Cosine similarity
        $dotProduct = 0.0;
        $magnitudeA = 0.0;
        $magnitudeB = 0.0;

        $vectorA = $this->embedding_vector;
        $vectorB = $otherEmbedding;

        $dimensions = min(count($vectorA), count($vectorB));

        for ($i = 0; $i < $dimensions; $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $magnitudeA += $vectorA[$i] ** 2;
            $magnitudeB += $vectorB[$i] ** 2;
        }

        $magnitudeA = sqrt($magnitudeA);
        $magnitudeB = sqrt($magnitudeB);

        if ($magnitudeA == 0 || $magnitudeB == 0) {
            return 0.0;
        }

        return $dotProduct / ($magnitudeA * $magnitudeB);
    }
}
