<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');
            $table->boolean('is_approved')->default(true); // Auto-approve for now
            $table->timestamps();
            
            $table->index(['project_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('rating'); // 1-5 stars
            $table->text('review')->nullable(); // Optional text review
            $table->boolean('is_approved')->default(true); // Auto-approve for now
            $table->timestamps();
            
            $table->unique(['project_id', 'user_id']); // One rating per user per project
            $table->index(['project_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
        Schema::dropIfExists('comments');
    }
};
