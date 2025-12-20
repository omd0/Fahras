<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'created_by_user_id',
        'title',
        'abstract',
        'keywords',
        'academic_year',
        'semester',
        'status',
        'is_public',
        'admin_approval_status',
        'approved_by_user_id',
        'approved_at',
        'admin_notes',
        'doi',
        'repo_url',
        'custom_members',
        'custom_advisors',
        'milestone_template_id',
    ];

    protected $casts = [
        'keywords' => 'array',
        'custom_members' => 'array',
        'custom_advisors' => 'array',
        'is_public' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members')
                    ->withPivot('role_in_project');
    }

    public function advisors()
    {
        return $this->belongsToMany(User::class, 'project_advisors')
                    ->withPivot('advisor_role');
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->orderBy('created_at', 'desc');
    }

    public function allComments()
    {
        return $this->hasMany(Comment::class)->orderBy('created_at', 'desc');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class)->orderBy('created_at', 'desc');
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function isBookmarkedBy($userId)
    {
        return $this->bookmarks()->where('user_id', $userId)->exists();
    }

    public function getAverageRating()
    {
        return $this->ratings()->avg('rating');
    }

    public function getTotalRatings()
    {
        return $this->ratings()->count();
    }

    public function getLeadMember()
    {
        return $this->members()->wherePivot('role_in_project', 'LEAD')->first();
    }

    public function isApproved()
    {
        return $this->admin_approval_status === 'approved';
    }

    public function isHidden()
    {
        return $this->admin_approval_status === 'hidden';
    }

    public function isPendingApproval()
    {
        return $this->admin_approval_status === 'pending';
    }

    public function isVisibleToPublic()
    {
        return $this->is_public && $this->isApproved();
    }

    public function milestoneTemplate()
    {
        return $this->belongsTo(MilestoneTemplate::class, 'milestone_template_id');
    }

    public function milestones()
    {
        return $this->hasMany(ProjectMilestone::class)->orderBy('order');
    }

    public function activities()
    {
        return $this->hasMany(ProjectActivity::class)->orderBy('created_at', 'desc');
    }

    public function flags()
    {
        return $this->hasMany(ProjectFlag::class)->orderBy('created_at', 'desc');
    }

    public function followers()
    {
        return $this->hasMany(ProjectFollower::class);
    }

    public function isFollowedBy($userId)
    {
        return $this->followers()->where('user_id', $userId)->exists();
    }
}
