<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all projects that don't have a slug
        $projects = DB::table('projects')->whereNull('slug')->get();

        foreach ($projects as $project) {
            $slug = $this->generateUniqueSlug($project->id);

            DB::table('projects')
                ->where('id', $project->id)
                ->update(['slug' => $slug]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Set all slugs to null
        DB::table('projects')->update(['slug' => null]);
    }

    /**
     * Generate a unique 6-character alphanumeric slug
     */
    private function generateUniqueSlug(int $projectId): string
    {
        $maxAttempts = 100;
        $attempt = 0;

        do {
            // Convert ID to base36 for compactness
            $base = base_convert($projectId, 10, 36);

            // Generate random suffix
            $randomLength = 6 - strlen($base);
            if ($randomLength > 0) {
                $random = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'), 0, $randomLength);
            } else {
                $random = '';
            }

            // Combine and ensure exactly 6 characters
            $slug = strtolower(substr($base . $random, 0, 6));
            $slug = str_pad($slug, 6, '0', STR_PAD_RIGHT);

            // Check uniqueness
            $exists = DB::table('projects')->where('slug', $slug)->exists();

            $attempt++;
            if ($attempt >= $maxAttempts) {
                throw new \Exception("Failed to generate unique slug for project ID: {$projectId}");
            }
        } while ($exists);

        return $slug;
    }
};
