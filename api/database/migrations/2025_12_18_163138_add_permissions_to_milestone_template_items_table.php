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
        Schema::table('milestone_template_items', function (Blueprint $table) {
            $table->json('allowed_roles')->nullable()->after('is_required')->comment('Array of roles: admin, faculty, student');
            $table->json('allowed_actions')->nullable()->after('allowed_roles')->comment('Array of actions: start, pause, extend, view, edit, complete');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('milestone_template_items', function (Blueprint $table) {
            $table->dropColumn(['allowed_roles', 'allowed_actions']);
        });
    }
};
