<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'description' => 'System administrator with full access',
            ],
            [
                'name' => 'faculty',
                'description' => 'Faculty member who can supervise projects',
            ],
            [
                'name' => 'student',
                'description' => 'Student who can create and manage projects',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
