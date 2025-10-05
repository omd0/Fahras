<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('abstract');
            $table->json('keywords')->nullable();
            $table->string('academic_year');
            $table->enum('semester', ['fall', 'spring', 'summer'])->default('fall');
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'])->default('draft');
            $table->boolean('is_public')->default(false);
            $table->string('doi')->nullable();
            $table->string('repo_url')->nullable();
            $table->timestamps();
        });

        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role_in_project', ['LEAD', 'MEMBER']);
            $table->timestamps();
            
            $table->unique(['project_id', 'user_id']);
        });

        Schema::create('project_advisors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('advisor_role', ['MAIN', 'CO_ADVISOR', 'REVIEWER']);
            $table->timestamps();
            
            $table->unique(['project_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_advisors');
        Schema::dropIfExists('project_members');
        Schema::dropIfExists('projects');
    }
};
