<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domains\Projects\Models\Project;
use App\Models\Program;
use App\Models\User;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first program
        $program = Program::first();
        if (!$program) {
            $this->command->info('No programs found. Please run ProgramSeeder first.');
            return;
        }

        // Get a student user to be the creator
        $student = User::whereHas('roles', function ($query) {
            $query->where('name', 'student');
        })->first();

        if (!$student) {
            $this->command->info('No student users found. Please run UserSeeder first.');
            return;
        }

        // Create sample approved projects
        $projects = [
            [
                'program_id' => $program->id,
                'created_by_user_id' => $student->id,
                'title' => 'Smart Campus Management System',
                'abstract' => 'A comprehensive system for managing campus resources, student activities, and administrative tasks using modern web technologies.',
                'keywords' => ['web development', 'campus management', 'student portal'],
                'academic_year' => '2024-2025',
                'semester' => 'fall',
                'status' => 'completed',
                'is_public' => true,
                'admin_approval_status' => 'approved',
                'doi' => '10.1000/example.2024.001',
                'repo_url' => 'https://github.com/example/smart-campus',
            ],
            [
                'program_id' => $program->id,
                'created_by_user_id' => $student->id,
                'title' => 'AI-Powered Learning Assistant',
                'abstract' => 'An intelligent tutoring system that adapts to individual learning styles and provides personalized educational content.',
                'keywords' => ['artificial intelligence', 'machine learning', 'education'],
                'academic_year' => '2024-2025',
                'semester' => 'spring',
                'status' => 'completed',
                'is_public' => true,
                'admin_approval_status' => 'approved',
                'doi' => '10.1000/example.2024.002',
                'repo_url' => 'https://github.com/example/ai-tutor',
            ],
            [
                'program_id' => $program->id,
                'created_by_user_id' => $student->id,
                'title' => 'Sustainable Energy Monitoring Platform',
                'abstract' => 'A real-time monitoring system for tracking energy consumption and optimizing renewable energy usage in educational institutions.',
                'keywords' => ['sustainability', 'energy monitoring', 'IoT'],
                'academic_year' => '2023-2024',
                'semester' => 'summer',
                'status' => 'completed',
                'is_public' => true,
                'admin_approval_status' => 'approved',
                'doi' => '10.1000/example.2023.003',
                'repo_url' => 'https://github.com/example/energy-monitor',
            ],
            [
                'program_id' => $program->id,
                'created_by_user_id' => $student->id,
                'title' => 'Blockchain-Based Academic Credential Verification',
                'abstract' => 'A secure and tamper-proof system for verifying academic credentials using blockchain technology.',
                'keywords' => ['blockchain', 'security', 'credentials', 'verification'],
                'academic_year' => '2024-2025',
                'semester' => 'fall',
                'status' => 'completed',
                'is_public' => true,
                'admin_approval_status' => 'approved',
                'doi' => '10.1000/example.2024.004',
                'repo_url' => 'https://github.com/example/blockchain-credentials',
            ],
            [
                'program_id' => $program->id,
                'created_by_user_id' => $student->id,
                'title' => 'Virtual Reality Laboratory Environment',
                'abstract' => 'An immersive VR platform for conducting virtual science experiments and laboratory simulations.',
                'keywords' => ['virtual reality', 'education', 'simulation', 'laboratory'],
                'academic_year' => '2023-2024',
                'semester' => 'spring',
                'status' => 'completed',
                'is_public' => true,
                'admin_approval_status' => 'approved',
                'doi' => '10.1000/example.2023.005',
                'repo_url' => 'https://github.com/example/vr-lab',
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create($projectData);
        }

        $this->command->info('Created ' . count($projects) . ' sample approved projects.');
    }
}
