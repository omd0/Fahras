<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_system_role',
        'is_template',
    ];

    protected $casts = [
        'is_system_role' => 'boolean',
        'is_template' => 'boolean',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_role')
            ->withPivot('scope')
            ->withTimestamps();
    }
}
