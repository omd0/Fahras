<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\AiAnalysisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AnalyzeProjectWithAi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes timeout
    public $tries = 3; // Retry up to 3 times
    public $backoff = [60, 300, 900]; // Wait 1 min, 5 min, 15 min between retries

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Project $project,
        public bool $force = false
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(AiAnalysisService $aiService): void
    {
        Log::info("Starting AI analysis for project {$this->project->id}");

        try {
            $aiService->analyzeProject($this->project, $this->force);

            Log::info("AI analysis completed successfully for project {$this->project->id}");
        } catch (\Exception $e) {
            Log::error("AI analysis failed for project {$this->project->id}", [
                'error' => $e->getMessage(),
            ]);

            // Re-throw to allow retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("AI analysis job failed permanently for project {$this->project->id}", [
            'error' => $exception->getMessage(),
        ]);

        // Mark project analysis as failed
        $this->project->update(['ai_analysis_status' => 'failed']);
    }
}
