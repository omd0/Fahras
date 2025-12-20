<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectActivity;
use App\Models\User;
use App\Models\File;
use App\Models\Comment;
use App\Models\ProjectMilestone;

class ProjectActivityService
{
    private static function logActivity(
        int $projectId,
        int $userId,
        string $activityType,
        string $title,
        string $description,
        ?array $metadata = null
    ): void {
        ProjectActivity::create([
            'project_id' => $projectId,
            'user_id' => $userId,
            'activity_type' => $activityType,
            'title' => $title,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    public static function logProjectCreated(Project $project, User $user): void
    {
        self::logActivity(
            $project->id,
            $user->id,
            'project_created',
            'Project Created',
            "The project \"{$project->title}\" was created by {$user->full_name}."
        );
    }

    public static function logProjectUpdated(Project $project, User $user): void
    {
        self::logActivity(
            $project->id,
            $user->id,
            'project_updated',
            'Project Details Updated',
            "The project \"{$project->title}\" was updated by {$user->full_name}."
        );
    }

    public static function logStatusChange(Project $project, User $user, string $oldStatus, string $newStatus): void
    {
        $statusLabels = [
            'draft' => 'Draft',
            'submitted' => 'Submitted',
            'under_review' => 'Under Review',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'completed' => 'Completed',
        ];

        $oldLabel = $statusLabels[$oldStatus] ?? $oldStatus;
        $newLabel = $statusLabels[$newStatus] ?? $newStatus;

        self::logActivity(
            $project->id,
            $user->id,
            'status_change',
            'Project Status Changed',
            "{$user->full_name} changed the project status from '{$oldLabel}' to '{$newLabel}'.",
            ['old_status' => $oldStatus, 'new_status' => $newStatus]
        );
    }

    public static function logFileUpload(Project $project, User $user, File $file): void
    {
        self::logActivity(
            $project->id,
            $user->id,
            'file_upload',
            'File Uploaded',
            "{$user->full_name} uploaded the file \"{$file->original_filename}\".",
            [
                'file_id' => $file->id,
                'filename' => $file->original_filename,
                'mime_type' => $file->mime_type,
                'size_bytes' => $file->size_bytes,
            ]
        );
    }

    public static function logFileDelete(Project $project, User $user, File $file): void
    {
        self::logActivity(
            $project->id,
            $user->id,
            'file_delete',
            'File Deleted',
            "{$user->full_name} deleted the file \"{$file->original_filename}\".",
            [
                'file_id' => $file->id,
                'filename' => $file->original_filename,
            ]
        );
    }

    public static function logCommentAdded(Project $project, User $user, Comment $comment): void
    {
        self::logActivity(
            $project->id,
            $user->id,
            'comment_added',
            'Comment Added',
            "{$user->full_name} added a new comment.",
            ['comment_id' => $comment->id]
        );
    }

    public static function logMilestoneStarted(Project $project, User $user, ProjectMilestone $milestone): void
    {
        self::logActivity(
            $project->id,
            $user->id,
            'milestone_started',
            'Milestone Started',
            "The milestone \"{$milestone->title}\" has been started by {$user->full_name}.",
            ['milestone_id' => $milestone->id]
        );
    }

    public static function logMilestoneCompleted(Project $project, User $user, ProjectMilestone $milestone): void
    {
        self::logActivity(
            $project->id,
            $user->id,
            'milestone_completed',
            'Milestone Completed',
            "{$user->full_name} marked the milestone \"{$milestone->title}\" as completed.",
            ['milestone_id' => $milestone->id]
        );
    }

    public static function logMilestoneUpdated(Project $project, User $user, ProjectMilestone $milestone, array $changes = []): void
    {
        $changeDescriptions = [];
        if (isset($changes['due_date'])) {
            $changeDescriptions[] = "due date updated";
        }
        if (isset($changes['description'])) {
            $changeDescriptions[] = "description updated";
        }
        if (isset($changes['title'])) {
            $changeDescriptions[] = "title updated";
        }

        $description = !empty($changeDescriptions)
            ? "{$user->full_name} updated the milestone \"{$milestone->title}\" (" . implode(', ', $changeDescriptions) . ")."
            : "{$user->full_name} updated the milestone \"{$milestone->title}\".";

        self::logActivity(
            $project->id,
            $user->id,
            'milestone_updated',
            'Milestone Updated',
            $description,
            ['milestone_id' => $milestone->id, 'changes' => $changes]
        );
    }
}

