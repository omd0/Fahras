<?php

namespace App\Services\Project;

use App\Models\Project;
use App\Models\User;

class ProjectMemberService
{
    /**
     * Separate members into custom and regular members
     *
     * @param array $members
     * @return array ['custom_members' => array, 'regular_members' => array]
     */
    public function separateMembers(array $members): array
    {
        $customMembers = [];
        $regularMembers = [];

        foreach ($members as $member) {
            if (!empty($member['customName'])) {
                $customMembers[] = [
                    'name' => $member['customName'],
                    'role' => $member['role']
                ];
            } elseif (!empty($member['user_id']) && $member['user_id'] > 0) {
                $regularMembers[] = $member;
            }
        }

        return [
            'custom_members' => $customMembers,
            'regular_members' => $regularMembers
        ];
    }

    /**
     * Separate advisors into custom and regular advisors
     *
     * @param array $advisors
     * @return array ['custom_advisors' => array, 'regular_advisors' => array]
     */
    public function separateAdvisors(array $advisors): array
    {
        $customAdvisors = [];
        $regularAdvisors = [];

        foreach ($advisors as $advisor) {
            if (!empty($advisor['customName'])) {
                $customAdvisors[] = [
                    'name' => $advisor['customName'],
                    'role' => $advisor['role']
                ];
            } elseif (!empty($advisor['user_id']) && $advisor['user_id'] > 0) {
                $regularAdvisors[] = $advisor;
            }
        }

        return [
            'custom_advisors' => $customAdvisors,
            'regular_advisors' => $regularAdvisors
        ];
    }

    /**
     * Sync members to a project
     * Extracted from lines 262-290, 536-586
     *
     * @param Project $project
     * @param array $members
     * @return void
     */
    public function syncMembers(Project $project, array $members): void
    {
        $separated = $this->separateMembers($members);

        // Update custom members
        $project->update([
            'custom_members' => !empty($separated['custom_members']) ? $separated['custom_members'] : null
        ]);

        // Sync regular members
        $regularMembersData = [];
        foreach ($separated['regular_members'] as $member) {
            $regularMembersData[$member['user_id']] = [
                'role_in_project' => $member['role']
            ];
        }

        $project->members()->sync($regularMembersData);
    }

    /**
     * Sync advisors to a project
     * Extracted from lines 262-290, 536-586
     *
     * @param Project $project
     * @param array $advisors
     * @return void
     */
    public function syncAdvisors(Project $project, array $advisors): void
    {
        $separated = $this->separateAdvisors($advisors);

        // Update custom advisors
        $project->update([
            'custom_advisors' => !empty($separated['custom_advisors']) ? $separated['custom_advisors'] : null
        ]);

        // Sync regular advisors
        $regularAdvisorsData = [];
        foreach ($separated['regular_advisors'] as $advisor) {
            $regularAdvisorsData[$advisor['user_id']] = [
                'advisor_role' => $advisor['role']
            ];
        }

        $project->advisors()->sync($regularAdvisorsData);
    }

    /**
     * Add a single member to a project
     *
     * @param Project $project
     * @param int $userId
     * @param string $role
     * @return void
     */
    public function addMember(Project $project, int $userId, string $role): void
    {
        $project->members()->syncWithoutDetaching([
            $userId => ['role_in_project' => $role]
        ]);
    }

    /**
     * Update a member's role in a project
     *
     * @param Project $project
     * @param int $userId
     * @param string $role
     * @return void
     */
    public function updateMemberRole(Project $project, int $userId, string $role): void
    {
        $project->members()->updateExistingPivot($userId, [
            'role_in_project' => $role
        ]);
    }

    /**
     * Remove a member from a project
     *
     * @param Project $project
     * @param int $userId
     * @return void
     */
    public function removeMember(Project $project, int $userId): void
    {
        $project->members()->detach($userId);
    }

    /**
     * Merge regular members with custom members for display
     *
     * @param Project $project
     * @return array
     */
    public function getMergedMembers(Project $project): array
    {
        $members = $project->members->map(function($member) {
            return [
                'id' => $member->id,
                'full_name' => $member->full_name,
                'email' => $member->email,
                'pivot' => [
                    'role_in_project' => $member->pivot->role_in_project
                ]
            ];
        })->toArray();

        // Add custom members
        if ($project->custom_members) {
            foreach ($project->custom_members as $customMember) {
                $members[] = [
                    'id' => null,
                    'full_name' => $customMember['name'],
                    'email' => null,
                    'is_custom' => true,
                    'pivot' => [
                        'role_in_project' => $customMember['role']
                    ]
                ];
            }
        }

        return $members;
    }

    /**
     * Merge regular advisors with custom advisors for display
     *
     * @param Project $project
     * @return array
     */
    public function getMergedAdvisors(Project $project): array
    {
        $advisors = $project->advisors->map(function($advisor) {
            return [
                'id' => $advisor->id,
                'full_name' => $advisor->full_name,
                'email' => $advisor->email,
                'pivot' => [
                    'advisor_role' => $advisor->pivot->advisor_role
                ]
            ];
        })->toArray();

        // Add custom advisors
        if ($project->custom_advisors) {
            foreach ($project->custom_advisors as $customAdvisor) {
                $advisors[] = [
                    'id' => null,
                    'full_name' => $customAdvisor['name'],
                    'email' => null,
                    'is_custom' => true,
                    'pivot' => [
                        'advisor_role' => $customAdvisor['role']
                    ]
                ];
            }
        }

        return $advisors;
    }
}
