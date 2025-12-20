<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get or create an admin user for the template
        $adminUser = $this->getOrCreateAdminUser();

        // Check if template already exists
        $existingTemplate = DB::table('milestone_templates')
            ->where('name', 'Graduate Program')
            ->first();

        if ($existingTemplate) {
            // Update existing template to be default
            DB::table('milestone_templates')
                ->where('id', '!=', $existingTemplate->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            DB::table('milestone_templates')
                ->where('id', $existingTemplate->id)
                ->update(['is_default' => true]);

            return;
        }

        // Create the template
        $templateId = DB::table('milestone_templates')->insertGetId([
            'name' => 'Graduate Program',
            'description' => 'Default milestone template for graduate programs including thesis proposal, research, implementation, and defense phases.',
            'program_id' => null,
            'department_id' => null,
            'is_default' => true,
            'created_by_user_id' => $adminUser->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Unset any other default templates
        DB::table('milestone_templates')
            ->where('id', '!=', $templateId)
            ->where('is_default', true)
            ->update(['is_default' => false]);

        // Define milestone items
        $milestoneItems = [
            [
                'template_id' => $templateId,
                'title' => 'Start',
                'description' => 'Project initiation and setup',
                'estimated_days' => 0,
                'is_required' => true,
                'order' => 0,
                'allowed_roles' => json_encode(['admin', 'faculty', 'student']),
                'allowed_actions' => json_encode(['start', 'view']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Proposal Submission',
                'description' => 'Submit thesis proposal for review',
                'estimated_days' => 30,
                'is_required' => true,
                'order' => 1,
                'allowed_roles' => json_encode(['admin', 'faculty', 'student']),
                'allowed_actions' => json_encode(['view', 'edit']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Proposal Review',
                'description' => 'Review and evaluation of thesis proposal',
                'estimated_days' => 14,
                'is_required' => true,
                'order' => 2,
                'allowed_roles' => json_encode(['admin', 'faculty']),
                'allowed_actions' => json_encode(['view', 'edit', 'complete']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Literature Review',
                'description' => 'Complete comprehensive literature review',
                'estimated_days' => 45,
                'is_required' => true,
                'order' => 3,
                'allowed_roles' => json_encode(['admin', 'faculty', 'student']),
                'allowed_actions' => json_encode(['view', 'edit']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Methodology Design',
                'description' => 'Design and document research methodology',
                'estimated_days' => 30,
                'is_required' => true,
                'order' => 4,
                'allowed_roles' => json_encode(['admin', 'faculty', 'student']),
                'allowed_actions' => json_encode(['view', 'edit']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Implementation',
                'description' => 'Implement research solution or system',
                'estimated_days' => 90,
                'is_required' => true,
                'order' => 5,
                'allowed_roles' => json_encode(['admin', 'faculty', 'student']),
                'allowed_actions' => json_encode(['view', 'edit', 'pause', 'extend']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Testing & Validation',
                'description' => 'Test and validate the implemented solution',
                'estimated_days' => 30,
                'is_required' => true,
                'order' => 6,
                'allowed_roles' => json_encode(['admin', 'faculty', 'student']),
                'allowed_actions' => json_encode(['view', 'edit']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Thesis Writing',
                'description' => 'Write and finalize thesis document',
                'estimated_days' => 60,
                'is_required' => true,
                'order' => 7,
                'allowed_roles' => json_encode(['admin', 'faculty', 'student']),
                'allowed_actions' => json_encode(['view', 'edit']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Final Review',
                'description' => 'Final review by advisors and committee',
                'estimated_days' => 21,
                'is_required' => true,
                'order' => 8,
                'allowed_roles' => json_encode(['admin', 'faculty']),
                'allowed_actions' => json_encode(['view', 'edit', 'complete']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_id' => $templateId,
                'title' => 'Defense',
                'description' => 'Thesis defense presentation',
                'estimated_days' => 14,
                'is_required' => true,
                'order' => 9,
                'allowed_roles' => json_encode(['admin', 'faculty']),
                'allowed_actions' => json_encode(['view', 'edit', 'complete']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert milestone items
        DB::table('milestone_template_items')->insert($milestoneItems);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Find and delete the Graduate Program template
        $template = DB::table('milestone_templates')
            ->where('name', 'Graduate Program')
            ->first();

        if ($template) {
            // Delete milestone items first (cascade should handle this, but being explicit)
            DB::table('milestone_template_items')
                ->where('template_id', $template->id)
                ->delete();

            // Delete the template
            DB::table('milestone_templates')
                ->where('id', $template->id)
                ->delete();
        }
    }

    /**
     * Get or create an admin user for the template
     */
    private function getOrCreateAdminUser()
    {
        // Try to get an existing admin user
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        
        if ($adminRole) {
            $adminUser = DB::table('users')
                ->join('role_user', 'users.id', '=', 'role_user.user_id')
                ->where('role_user.role_id', $adminRole->id)
                ->select('users.*')
                ->first();

            if ($adminUser) {
                return $adminUser;
            }
        }

        // If no admin user exists, get the first user
        $firstUser = DB::table('users')->first();
        
        if ($firstUser) {
            return $firstUser;
        }

        // Last resort: create a system user (shouldn't happen in normal flow)
        $userId = DB::table('users')->insertGetId([
            'full_name' => 'System',
            'email' => 'system@fahras.edu',
            'password' => bcrypt('system'),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return (object) ['id' => $userId];
    }
};

