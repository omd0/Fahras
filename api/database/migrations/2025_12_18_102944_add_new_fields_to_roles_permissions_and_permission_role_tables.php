<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->boolean('is_system_role')->default(false)->after('description');
            $table->boolean('is_template')->default(false)->after('is_system_role');
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->enum('category', [
                'Projects',
                'Users',
                'Files',
                'Analytics',
                'Settings',
                'System',
                'Roles'
            ])->nullable()->after('code');
        });

        Schema::table('permission_role', function (Blueprint $table) {
            $table->enum('scope', ['all', 'department', 'own', 'none'])->default('all')->after('permission_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn(['is_system_role', 'is_template']);
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('category');
        });

        Schema::table('permission_role', function (Blueprint $table) {
            $table->dropColumn('scope');
        });
    }
};
