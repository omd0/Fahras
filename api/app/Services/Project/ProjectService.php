<?php

namespace App\Services\Project;

use App\Models\Project;
use App\Models\User;
use App\Services\ProjectActivityService;
use Illuminate\Support\Facades\Log;

class ProjectService
{
    /**
     * Create a new project
     *
     * @param array $data
     * @param User $creator
     * @return Project
     * @throws \Exception
     */
    public function createProject(array $data, User $creator): Project
    {
        try {
            $project = Project::create([
                'program_id' => $data['program_id'],
                'created_by_user_id' => $creator->id,
                'title' => $data['title'],
                'abstract' => $data['abstract'],
                'keywords' => $data['keywords'] ?? [],
                'academic_year' => $data['academic_year'],
                'semester' => $data['semester'],
                'status' => 'draft',
                'custom_members' => $data['custom_members'] ?? null,
                'custom_advisors' => $data['custom_advisors'] ?? null,
            ]);

            // Add regular members (with user_id)
            if (!empty($data['regular_members'])) {
                foreach ($data['regular_members'] as $member) {
                    $project->members()->attach($member['user_id'], [
                        'role_in_project' => $member['role']
                    ]);
                }
            }

            // Add regular advisors (with user_id)
            if (!empty($data['regular_advisors'])) {
                foreach ($data['regular_advisors'] as $advisor) {
                    $project->advisors()->attach($advisor['user_id'], [
                        'advisor_role' => $advisor['role']
                    ]);
                }
            }

            // If creator is faculty, add them as advisor if not already
            if ($creator->hasRole('faculty')) {
                $isCreatorAlreadyAdvisor = $project
                    ->advisors()
                    ->wherePivot('user_id', $creator->id)
                    ->exists();

                if (!$isCreatorAlreadyAdvisor) {
                    $advisorFound = collect($data['regular_advisors'] ?? [])->firstWhere('user_id', $creator->id);
                    $advisorRole = $advisorFound ? ($advisorFound['role'] ?? 'MAIN') : 'MAIN';

                    $project->advisors()->attach($creator->id, [
                        'advisor_role' => $advisorRole,
                    ]);
                }
            }

            // Log project creation activity
            ProjectActivityService::logProjectCreated($project, $creator);

            return $project;
        } catch (\Exception $e) {
            Log::error('Project creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $creator->id,
                'request_data' => array_except($data, ['password', 'token'])
            ]);

            throw $e;
        }
    }

    /**
     * Update an existing project
     *
     * @param Project $project
     * @param array $data
     * @param User $user
     * @return Project
     */
    public function updateProject(Project $project, array $data, User $user): Project
    {
        // Track status change for activity logging
        $oldStatus = $project->status;

        // Update basic project fields
        $project->update(array_filter($data, function($key) {
            return in_array($key, [
                'program_id', 'title', 'abstract', 'keywords', 'academic_year',
                'semester', 'status', 'is_public', 'doi', 'repo_url'
            ]);
        }, ARRAY_FILTER_USE_KEY));

        // Log status change if status was updated
        if (isset($data['status']) && $oldStatus !== $project->status) {
            ProjectActivityService::logStatusChange($project, $user, $oldStatus, $project->status);
        }

        // Log project update
        ProjectActivityService::logProjectUpdated($project, $user);

        return $project->fresh();
    }

    /**
     * Delete a project
     *
     * @param Project $project
     * @return bool
     */
    public function deleteProject(Project $project): bool
    {
        return $project->delete();
    }

    /**
     * Approve a project (admin only)
     *
     * @param Project $project
     * @param User $admin
     * @param string|null $adminNotes
     * @param string|null $status
     * @return Project
     */
    public function approveProject(Project $project, User $admin, ?string $adminNotes = null, ?string $status = null): Project
    {
        $updateData = [
            'admin_approval_status' => 'approved',
            'approved_by_user_id' => $admin->id,
            'approved_at' => now(),
            'admin_notes' => $adminNotes,
        ];

        // If status is provided, update it as well
        if ($status) {
            $updateData['status'] = $status;
        }

        $project->update($updateData);

        // Make all project files public when project is approved
        $project->files()->update(['is_public' => true]);

        return $project->fresh();
    }

    /**
     * Hide a project (admin only)
     *
     * @param Project $project
     * @param User $admin
     * @param string|null $adminNotes
     * @return Project
     */
    public function hideProject(Project $project, User $admin, ?string $adminNotes = null): Project
    {
        $project->update([
            'admin_approval_status' => 'hidden',
            'approved_by_user_id' => $admin->id,
            'approved_at' => now(),
            'admin_notes' => $adminNotes,
        ]);

        // Make all project files private when project is hidden
        $project->files()->update(['is_public' => false]);

        return $project->fresh();
    }

    /**
     * Toggle project visibility between approved and hidden
     *
     * @param Project $project
     * @param User $admin
     * @param string|null $adminNotes
     * @return array ['project' => Project, 'new_status' => string]
     */
    public function toggleProjectVisibility(Project $project, User $admin, ?string $adminNotes = null): array
    {
        // Toggle between approved and hidden
        $newStatus = $project->admin_approval_status === 'approved' ? 'hidden' : 'approved';

        $project->update([
            'admin_approval_status' => $newStatus,
            'approved_by_user_id' => $admin->id,
            'approved_at' => now(),
            'admin_notes' => $adminNotes,
        ]);

        return [
            'project' => $project->fresh(),
            'new_status' => $newStatus
        ];
    }
}
