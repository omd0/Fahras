<?php

namespace App\Services;

use App\Models\User;
use App\Models\MilestoneTemplateItem;
use App\Models\ProjectMilestone;

class PermissionService
{
    /**
     * Check if a user can perform an action on a step
     *
     * @param int $userId
     * @param int $stepId MilestoneTemplateItem ID
     * @param string $action Action to check (start, pause, extend, view, edit, complete)
     * @return bool
     */
    public function canPerformAction(int $userId, int $stepId, string $action): bool
    {
        $user = User::findOrFail($userId);
        $step = MilestoneTemplateItem::findOrFail($stepId);

        // Get user's roles
        $userRoles = $this->getUserRoles($user);

        // Get step permissions
        $allowedRoles = $step->allowed_roles ?? [];
        $allowedActions = $step->allowed_actions ?? [];

        // Check if user has at least one allowed role
        $hasAllowedRole = !empty(array_intersect($userRoles, $allowedRoles));

        // Check if action is allowed
        $isActionAllowed = in_array($action, $allowedActions);

        return $hasAllowedRole && $isActionAllowed;
    }

    /**
     * Check if a user can perform an action on a project milestone
     *
     * @param int $userId
     * @param int $milestoneId ProjectMilestone ID
     * @param string $action Action to check
     * @return bool
     */
    public function canPerformActionOnMilestone(int $userId, int $milestoneId, string $action): bool
    {
        $milestone = ProjectMilestone::with('templateItem')->findOrFail($milestoneId);

        if (!$milestone->templateItem) {
            // If milestone doesn't have a template item, allow all actions (backward compatibility)
            return true;
        }

        return $this->canPerformAction($userId, $milestone->templateItem->id, $action);
    }

    /**
     * Get user's roles as an array of role names
     *
     * @param User $user
     * @return array Array of role names (e.g., ['admin', 'faculty'])
     */
    public function getUserRole(User $user): array
    {
        return $this->getUserRoles($user);
    }

    /**
     * Get user's roles as an array of role names
     *
     * @param User $user
     * @return array Array of role names (e.g., ['admin', 'faculty'])
     */
    private function getUserRoles(User $user): array
    {
        // Load roles if not already loaded
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        // Map role names to lowercase for comparison
        return $user->roles->pluck('name')->map(function ($roleName) {
            return strtolower($roleName);
        })->toArray();
    }

    /**
     * Get step permissions
     *
     * @param int $stepId MilestoneTemplateItem ID
     * @return array Array with 'allowed_roles' and 'allowed_actions'
     */
    public function getStepPermissions(int $stepId): array
    {
        $step = MilestoneTemplateItem::findOrFail($stepId);

        return [
            'allowed_roles' => $step->allowed_roles ?? [],
            'allowed_actions' => $step->allowed_actions ?? [],
        ];
    }

    /**
     * Check if user has a specific role
     *
     * @param User $user
     * @param string $roleName Role name to check (case-insensitive)
     * @return bool
     */
    public function userHasRole(User $user, string $roleName): bool
    {
        $userRoles = $this->getUserRoles($user);
        return in_array(strtolower($roleName), $userRoles);
    }
}

