<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['name' => 'Computer Science'],
            ['name' => 'Information Technology'],
            ['name' => 'Software Engineering'],
            ['name' => 'Cybersecurity'],
            ['name' => 'Data Science'],
            ['name' => 'Artificial Intelligence'],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
}
