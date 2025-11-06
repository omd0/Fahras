<?php

namespace App\Models;

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
}
