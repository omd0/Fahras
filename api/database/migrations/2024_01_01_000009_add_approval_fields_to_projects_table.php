<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->enum('admin_approval_status', ['pending', 'approved', 'hidden'])->default('pending')->after('is_public');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->onDelete('set null')->after('admin_approval_status');
            $table->timestamp('approved_at')->nullable()->after('approved_by_user_id');
            $table->text('admin_notes')->nullable()->after('approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['approved_by_user_id']);
            $table->dropColumn(['admin_approval_status', 'approved_by_user_id', 'approved_at', 'admin_notes']);
        });
    }
};
