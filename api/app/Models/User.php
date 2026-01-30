<?php

namespace App\Models;

use App\Domains\Projects\Models\Project;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'status',
        'avatar_url',
        'email_verified_at',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_login_at' => 'datetime',
    ];

    /**
     * Set the email attribute (always lowercase and trimmed)
     */
    public function setEmailAttribute($value)
    {
        $this->attributes['email'] = strtolower(trim($value));
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function faculty()
    {
        return $this->hasOne(Faculty::class);
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'created_by_user_id');
    }

    public function projectMemberships()
    {
        return $this->belongsToMany(Project::class, 'project_members');
    }

    public function projectAdvisorships()
    {
        return $this->belongsToMany(Project::class, 'project_advisors');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function hasRole($role)
    {
        return $this->roles()->where('name', $role)->exists();
    }

    public function hasPermission($permission)
    {
        return $this->roles()->whereHas('permissions', function ($query) use ($permission) {
            $query->where('code', $permission);
        })->exists();
    }

    /**
     * Check if user is a legacy user (e.g., has unhashed password or other legacy attributes)
     * For now, all users are considered non-legacy since passwords are always hashed
     */
    public function isLegacyUser()
    {
        // Check if password is not hashed (legacy users might have plain text passwords)
        // Since Laravel 11 always hashes passwords, we can assume all users are non-legacy
        // If you need to check for legacy users, you could check for a specific field or pattern
        return false;
    }
}
