<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Milestone Templates - Predefined milestone sequences
        Schema::create('milestone_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_default')->default(false);
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['program_id', 'is_default']);
            $table->index(['department_id', 'is_default']);
        });

        // Milestone Template Items - Individual milestones in a template
        Schema::create('milestone_template_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('milestone_templates')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->integer('estimated_days')->default(0)->comment('Days from previous milestone');
            $table->boolean('is_required')->default(true);
            $table->timestamps();
            
            $table->index(['template_id', 'order']);
        });

        // Project Milestones - Actual milestones for projects
        Schema::create('project_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('template_item_id')->nullable()->constrained('milestone_template_items')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'blocked'])->default('not_started');
            $table->date('due_date')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('order')->default(0);
            $table->json('dependencies')->nullable()->comment('Array of milestone IDs that must complete first');
            $table->text('completion_notes')->nullable();
            $table->timestamps();
            
            $table->index(['project_id', 'order']);
            $table->index(['project_id', 'status']);
            $table->index('due_date');
        });

        // Project Activities - Log all project-related activities
        Schema::create('project_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('activity_type'); // status_change, file_upload, file_delete, comment, milestone_completed, milestone_started, etc.
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable()->comment('Additional data like file_id, comment_id, old_status, new_status, etc.');
            $table->timestamps();
            
            $table->index(['project_id', 'created_at']);
            $table->index(['project_id', 'activity_type']);
            $table->index('user_id');
        });

        // Project Flags - Early warning system
        Schema::create('project_flags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('flagged_by_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('flag_type', ['scope_creep', 'technical_blocker', 'team_conflict', 'resource_shortage', 'timeline_risk', 'other'])->default('other');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('message');
            $table->boolean('is_confidential')->default(false)->comment('Only visible to admins/advisors');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            
            $table->index(['project_id', 'resolved_at']);
            $table->index('flag_type');
            $table->index('severity');
        });

        // Project Followers - Track which users are following projects
        Schema::create('project_followers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('notification_preferences')->nullable()->comment('Preferences for what notifications to receive');
            $table->timestamps();
            
            $table->unique(['project_id', 'user_id']);
            $table->index('user_id');
        });

        // Add milestone_template_id to projects table for tracking which template is used
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('milestone_template_id')->nullable()->after('repo_url')
                  ->constrained('milestone_templates')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['milestone_template_id']);
            $table->dropColumn('milestone_template_id');
        });

        Schema::dropIfExists('project_followers');
        Schema::dropIfExists('project_flags');
        Schema::dropIfExists('project_activities');
        Schema::dropIfExists('project_milestones');
        Schema::dropIfExists('milestone_template_items');
        Schema::dropIfExists('milestone_templates');
    }
};

