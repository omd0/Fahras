<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // User management permissions
            ['code' => 'users.create', 'description' => 'Create users'],
            ['code' => 'users.read', 'description' => 'View users'],
            ['code' => 'users.update', 'description' => 'Update users'],
            ['code' => 'users.delete', 'description' => 'Delete users'],
            
            // Project permissions
            ['code' => 'projects.create', 'description' => 'Create projects'],
            ['code' => 'projects.read', 'description' => 'View projects'],
            ['code' => 'projects.update', 'description' => 'Update projects'],
            ['code' => 'projects.delete', 'description' => 'Delete projects'],
            ['code' => 'projects.approve', 'description' => 'Approve projects'],
            
            // File permissions
            ['code' => 'files.upload', 'description' => 'Upload files'],
            ['code' => 'files.download', 'description' => 'Download files'],
            ['code' => 'files.delete', 'description' => 'Delete files'],
            
            // System permissions
            ['code' => 'system.admin', 'description' => 'System administration'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Assign permissions to roles
        $this->assignPermissionsToRoles();
    }

    private function assignPermissionsToRoles(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $facultyRole = Role::where('name', 'faculty')->first();
        $studentRole = Role::where('name', 'student')->first();
        $reviewerRole = Role::where('name', 'reviewer')->first();

        // Admin gets all permissions
        if ($adminRole) {
            $adminRole->permissions()->sync(Permission::all()->pluck('id'));
        }

        // Faculty permissions
        if ($facultyRole) {
            $facultyPermissions = Permission::whereIn('code', [
                'users.read',
                'projects.create',
                'projects.read',
                'projects.update',
                'projects.approve',
                'files.upload',
                'files.download',
                'files.delete',
            ])->pluck('id');
            $facultyRole->permissions()->sync($facultyPermissions);
        }

        // Student permissions
        if ($studentRole) {
            $studentPermissions = Permission::whereIn('code', [
                'users.read',
                'projects.create',
                'projects.read',
                'projects.update',
                'projects.delete',
                'files.upload',
                'files.download',
                'files.delete',
            ])->pluck('id');
            $studentRole->permissions()->sync($studentPermissions);
        }

        // Reviewer permissions (read-only access)
        if ($reviewerRole) {
            $reviewerPermissions = Permission::whereIn('code', [
                'users.read',
                'projects.read',
                'files.download',
            ])->pluck('id');
            $reviewerRole->permissions()->sync($reviewerPermissions);
        }
    }
}
