<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Program;
use App\Models\Department;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csDept = Department::where('name', 'Computer Science')->first();
        $itDept = Department::where('name', 'Information Technology')->first();
        $seDept = Department::where('name', 'Software Engineering')->first();

        $programs = [
            // Computer Science programs
            [
                'department_id' => $csDept->id,
                'name' => 'Bachelor of Computer Science',
                'degree_level' => 'bachelor',
            ],
            [
                'department_id' => $csDept->id,
                'name' => 'Master of Computer Science',
                'degree_level' => 'master',
            ],
            [
                'department_id' => $csDept->id,
                'name' => 'PhD in Computer Science',
                'degree_level' => 'phd',
            ],

            // Information Technology programs
            [
                'department_id' => $itDept->id,
                'name' => 'Bachelor of Information Technology',
                'degree_level' => 'bachelor',
            ],
            [
                'department_id' => $itDept->id,
                'name' => 'Master of Information Technology',
                'degree_level' => 'master',
            ],

            // Software Engineering programs
            [
                'department_id' => $seDept->id,
                'name' => 'Bachelor of Software Engineering',
                'degree_level' => 'bachelor',
            ],
            [
                'department_id' => $seDept->id,
                'name' => 'Master of Software Engineering',
                'degree_level' => 'master',
            ],
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }
    }
}
