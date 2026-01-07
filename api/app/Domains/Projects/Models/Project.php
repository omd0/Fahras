<?php

namespace App\Domains\Projects\Models;

use App\Models\Program;
use App\Models\User;
use App\Models\File;
use App\Models\Notification;
use App\Models\Comment;
use App\Models\Rating;
use App\Models\Bookmark;
use App\Models\MilestoneTemplate;
use App\Constants\MemberRole;
use App\Constants\ApprovalStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'created_by_user_id',
        'slug',
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

    /**
     * Boot method to auto-generate slug on creation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = $project->generateUniqueSlug();
            }
        });
    }

    /**
     * Get the route key name for Laravel route model binding
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Resolve route binding - supports both slug and ID (backward compatibility)
     */
    public function resolveRouteBinding($value, $field = null)
    {
        // Try to find by slug first
        $project = $this->where('slug', $value)->first();

        // Fallback to ID if numeric (for backward compatibility)
        if (!$project && is_numeric($value)) {
            $project = $this->find($value);
        }

        return $project ?: abort(404);
    }

    /**
     * Generate a unique 6-character alphanumeric slug
     */
    protected function generateUniqueSlug(): string
    {
        $maxAttempts = 100;
        $attempt = 0;

        do {
            // Convert ID to base36 for compactness (ID may not be set yet during creation)
            $baseId = $this->id ?? rand(1, 999999);
            $base = base_convert($baseId, 10, 36);

            // Generate random suffix to reach 6 characters
            $randomLength = 6 - strlen($base);
            if ($randomLength > 0) {
                $random = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'), 0, $randomLength);
            } else {
                $random = '';
            }

            // Combine and ensure exactly 6 characters
            $slug = strtolower(substr($base . $random, 0, 6));
            $slug = str_pad($slug, 6, '0', STR_PAD_RIGHT);

            // Check uniqueness
            $exists = static::where('slug', $slug)->exists();

            $attempt++;
            if ($attempt >= $maxAttempts) {
                throw new \Exception("Failed to generate unique slug after {$maxAttempts} attempts");
            }
        } while ($exists);

        return $slug;
    }

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
        return $this->members()->wherePivot('role_in_project', MemberRole::LEAD)->first();
    }

    public function isApproved()
    {
        return $this->admin_approval_status === ApprovalStatus::APPROVED;
    }

    public function isHidden()
    {
        return $this->admin_approval_status === ApprovalStatus::HIDDEN;
    }

    public function isPendingApproval()
    {
        return $this->admin_approval_status === ApprovalStatus::PENDING;
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
