<?php

namespace App\Domains\Projects\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class ProjectVisibilityService
{
    /**
     * Apply visibility filters to a project query based on user role
     * This method is duplicated 6+ times across the controller
     * Lines: 38-52, 370-385, 688-700, 766-787, and more
     *
     * @param Builder $query
     * @param User|null $user
     * @param bool $skipVisibilityRules If true, skip all visibility filtering (used for my_projects)
     * @return Builder
     */
    public function applyVisibilityFilters(Builder $query, ?User $user, bool $skipVisibilityRules = false): Builder
    {
        // If requesting my_projects, skip visibility rules
        if ($skipVisibilityRules) {
            return $query;
        }

        // Apply visibility rules based on user role
        if (!$user) {
            // Unauthenticated users: only see approved projects
            $query->where('admin_approval_status', 'approved');
        } elseif ($user->hasRole('admin') || $user->hasRole('reviewer')) {
            // Admin and Reviewer: can see all projects (including hidden ones)
            // No additional filtering needed
        } else {
            // Regular users: can see approved projects and their own projects (including hidden ones)
            $query->where(function ($q) use ($user) {
                $q->where('admin_approval_status', 'approved')
                  ->orWhere('created_by_user_id', $user->id);
            });
        }

        return $query;
    }

    /**
     * Apply visibility filters for analytics queries
     * Includes member and advisor relationships
     *
     * @param Builder $query
     * @param User|null $user
     * @return Builder
     */
    public function applyAnalyticsVisibilityFilters(Builder $query, ?User $user): Builder
    {
        // Apply visibility rules based on user role
        if (!$user) {
            // Unauthenticated users: only see approved projects
            $query->where('admin_approval_status', 'approved');
        } elseif ($user->hasRole('admin') || $user->hasRole('reviewer')) {
            // Admin and Reviewer: can see all projects (including hidden ones)
            // No additional filtering needed
        } else {
            // Regular users: can see approved projects and their own projects (including hidden ones)
            $query->where(function ($q) use ($user) {
                $q->where('admin_approval_status', 'approved')
                  ->orWhere('created_by_user_id', $user->id)
                  ->orWhereHas('members', function ($memberQuery) use ($user) {
                      $memberQuery->where('user_id', $user->id);
                  })
                  ->orWhereHas('advisors', function ($advisorQuery) use ($user) {
                      $advisorQuery->where('user_id', $user->id);
                  });
            });
        }

        return $query;
    }

    /**
     * Check if user can view a specific project
     *
     * @param \App\Models\Project $project
     * @param User|null $user
     * @return bool
     */
    public function canViewProject($project, ?User $user): bool
    {
        // Unauthenticated users: only see approved projects
        if (!$user) {
            return $project->admin_approval_status === 'approved';
        }

        // Admin and Reviewer: can see all projects (including hidden ones)
        if ($user->hasRole('admin') || $user->hasRole('reviewer')) {
            return true;
        }

        // Regular users: can see approved projects and their own projects (including hidden ones)
        return $project->admin_approval_status === 'approved'
            || $project->created_by_user_id === $user->id;
    }

    /**
     * Apply user's own projects filter
     *
     * @param Builder $query
     * @param User $user
     * @return Builder
     */
    public function applyMyProjectsFilter(Builder $query, User $user): Builder
    {
        // Include projects where user is creator OR member
        $query->where(function ($q) use ($user) {
            $q->where('created_by_user_id', $user->id)
              ->orWhereHas('members', function ($memberQuery) use ($user) {
                  $memberQuery->where('user_id', $user->id);
              });
        });

        return $query;
    }

    /**
     * Create a base query with visibility filtering and common relationships
     *
     * @param User|null $user
     * @param bool $skipVisibilityRules
     * @return Builder
     */
    public function createBaseQuery(?User $user, bool $skipVisibilityRules = false): Builder
    {
        $query = \App\Domains\Projects\Models\Project::query();

        return $this->applyVisibilityFilters($query, $user, $skipVisibilityRules);
    }

    /**
     * Create a base query for analytics with visibility filtering
     *
     * @param User|null $user
     * @return Builder
     */
    public function createAnalyticsBaseQuery(?User $user): Builder
    {
        $query = \App\Domains\Projects\Models\Project::query();

        return $this->applyAnalyticsVisibilityFilters($query, $user);
    }
}
