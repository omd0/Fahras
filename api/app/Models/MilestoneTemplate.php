<?php

namespace App\Models;

use App\Domains\Projects\Models\Project;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MilestoneTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'program_id',
        'department_id',
        'is_default',
        'created_by_user_id',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MilestoneTemplateItem::class, 'template_id')->orderBy('order');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'milestone_template_id');
    }
}

