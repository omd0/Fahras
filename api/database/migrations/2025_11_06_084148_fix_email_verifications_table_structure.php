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
        Schema::table('email_verifications', function (Blueprint $table) {
            // Drop foreign key constraint if it exists
            $table->dropForeign(['user_id']);
            
            // Drop old index
            $table->dropIndex('email_verifications_user_id_code_index');
            
            // Drop user_id column
            $table->dropColumn('user_id');
            
            // Add email column with index
            $table->string('email')->index()->after('id');
            
            // Add composite index for email and code
            $table->index(['email', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_verifications', function (Blueprint $table) {
            // Drop email column and its indexes
            $table->dropIndex(['email_verifications_email_code_index']);
            $table->dropIndex(['email_verifications_email_index']);
            $table->dropColumn('email');
            
            // Add back user_id column
            $table->unsignedBigInteger('user_id')->after('id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'code']);
        });
    }
};
