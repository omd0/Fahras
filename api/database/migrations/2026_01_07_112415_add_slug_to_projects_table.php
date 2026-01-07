<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug', 20)->nullable()->after('id')->comment('Unique alphanumeric identifier for URLs');
            $table->unique('slug');
            $table->index('slug'); // For faster lookups
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
