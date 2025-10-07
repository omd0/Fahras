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
        'doi',
        'repo_url',
    ];

    protected $casts = [
        'keywords' => 'array',
        'is_public' => 'boolean',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
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

    public function getLeadMember()
    {
        return $this->members()->wherePivot('role_in_project', 'LEAD')->first();
    }
}
