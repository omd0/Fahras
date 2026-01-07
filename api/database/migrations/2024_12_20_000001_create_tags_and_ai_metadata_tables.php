<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tags table for categorization
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('color')->nullable(); // Hex color for UI
            $table->enum('type', ['manual', 'ai_generated', 'system'])->default('manual');
            $table->integer('usage_count')->default(0); // Track how many projects use this tag
            $table->timestamps();
            
            $table->index('type');
            $table->index('usage_count');
        });

        // Project-Tag pivot table (many-to-many)
        Schema::create('project_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->enum('source', ['manual', 'ai_suggested', 'ai_auto'])->default('manual');
            $table->float('confidence_score')->nullable(); // AI confidence (0-1)
            $table->timestamps();
            
            $table->unique(['project_id', 'tag_id']);
            $table->index('source');
        });

        // AI-generated metadata for projects
        Schema::create('project_ai_metadata', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->unique()->constrained()->onDelete('cascade');
            
            // Auto-generated summary
            $table->text('ai_summary')->nullable();
            
            // Extracted key concepts
            $table->json('key_concepts')->nullable();
            
            // Research area classification
            $table->string('research_area')->nullable();
            $table->json('research_subcategories')->nullable();
            
            // Semantic embedding for similarity search (stored as JSON array)
            $table->json('embedding_vector')->nullable();
            
            // Language and complexity analysis
            $table->string('detected_language')->nullable();
            $table->enum('complexity_level', ['beginner', 'intermediate', 'advanced', 'expert'])->nullable();
            
            // Processing metadata
            $table->string('ai_model_version')->nullable();
            $table->timestamp('last_analyzed_at')->nullable();
            $table->integer('analysis_attempts')->default(0);
            $table->text('analysis_error')->nullable();
            
            $table->timestamps();
            
            $table->index('research_area');
            $table->index('complexity_level');
            $table->index('last_analyzed_at');
        });

        // Search query logs for NLP improvement
        Schema::create('search_queries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->text('original_query');
            $table->text('normalized_query')->nullable(); // AI-processed query
            $table->json('extracted_filters')->nullable(); // Filters extracted from NLP
            $table->integer('results_count')->default(0);
            $table->boolean('had_results')->default(true);
            $table->string('ip_address')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('had_results');
            $table->index('created_at');
        });

        // Add columns to projects table for AI features
        Schema::table('projects', function (Blueprint $table) {
            $table->boolean('ai_analysis_enabled')->default(true)->after('is_public');
            $table->enum('ai_analysis_status', ['pending', 'processing', 'completed', 'failed'])->default('pending')->after('ai_analysis_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['ai_analysis_enabled', 'ai_analysis_status']);
        });
        
        Schema::dropIfExists('search_queries');
        Schema::dropIfExists('project_ai_metadata');
        Schema::dropIfExists('project_tag');
        Schema::dropIfExists('tags');
    }
};
