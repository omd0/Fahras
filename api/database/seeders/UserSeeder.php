<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use App\Models\Program;
use App\Models\Faculty;
use App\Models\Student;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'full_name' => 'System Administrator',
            'email' => 'admin@fahras.edu',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->roles()->attach($adminRole->id);
        }

        // Create faculty users
        $facultyRole = Role::where('name', 'faculty')->first();
        $csDept = Department::where('name', 'Computer Science')->first();

        $facultyUsers = [
            [
                'full_name' => 'Dr. Sarah Johnson',
                'email' => 'sarah.johnson@fahras.edu',
                'faculty_no' => 'FAC001',
                'is_supervisor' => true,
            ],
            [
                'full_name' => 'Prof. Michael Chen',
                'email' => 'michael.chen@fahras.edu',
                'faculty_no' => 'FAC002',
                'is_supervisor' => true,
            ],
            [
                'full_name' => 'Dr. Emily Rodriguez',
                'email' => 'emily.rodriguez@fahras.edu',
                'faculty_no' => 'FAC003',
                'is_supervisor' => false,
            ],
        ];

        foreach ($facultyUsers as $facultyData) {
            $user = User::create([
                'full_name' => $facultyData['full_name'],
                'email' => $facultyData['email'],
                'password' => Hash::make('password'),
                'status' => 'active',
            ]);

            $user->roles()->attach($facultyRole->id);

            Faculty::create([
                'user_id' => $user->id,
                'department_id' => $csDept->id,
                'faculty_no' => $facultyData['faculty_no'],
                'is_supervisor' => $facultyData['is_supervisor'],
            ]);
        }

        // Create student users
        $studentRole = Role::where('name', 'student')->first();
        $bcsProgram = Program::where('name', 'Bachelor of Computer Science')->first();
        $mcsProgram = Program::where('name', 'Master of Computer Science')->first();

        $studentUsers = [
            [
                'full_name' => 'Ahmed Al-Mansouri',
                'email' => 'ahmed.almansouri@student.fahras.edu',
                'student_no' => 'STU001',
                'program' => $bcsProgram,
                'cohort_year' => 2023,
            ],
            [
                'full_name' => 'Fatima Hassan',
                'email' => 'fatima.hassan@student.fahras.edu',
                'student_no' => 'STU002',
                'program' => $bcsProgram,
                'cohort_year' => 2023,
            ],
            [
                'full_name' => 'Omar Khalil',
                'email' => 'omar.khalil@student.fahras.edu',
                'student_no' => 'STU003',
                'program' => $mcsProgram,
                'cohort_year' => 2022,
            ],
            [
                'full_name' => 'Layla Ibrahim',
                'email' => 'layla.ibrahim@student.fahras.edu',
                'student_no' => 'STU004',
                'program' => $mcsProgram,
                'cohort_year' => 2022,
            ],
        ];

        foreach ($studentUsers as $studentData) {
            $user = User::create([
                'full_name' => $studentData['full_name'],
                'email' => $studentData['email'],
                'password' => Hash::make('password'),
                'status' => 'active',
            ]);

            $user->roles()->attach($studentRole->id);

            Student::create([
                'user_id' => $user->id,
                'program_id' => $studentData['program']->id,
                'student_no' => $studentData['student_no'],
                'cohort_year' => $studentData['cohort_year'],
            ]);
        }
    }
}
