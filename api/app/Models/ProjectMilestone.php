<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'template_item_id',
        'title',
        'description',
        'status',
        'due_date',
        'started_at',
        'completed_at',
        'order',
        'dependencies',
        'completion_notes',
    ];

    protected $casts = [
        'dependencies' => 'array',
        'due_date' => 'date',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function templateItem(): BelongsTo
    {
        return $this->belongsTo(MilestoneTemplateItem::class, 'template_item_id');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isBlocked(): bool
    {
        return $this->status === 'blocked';
    }

    public function isOverdue(): bool
    {
        if (!$this->due_date || $this->isCompleted()) {
            return false;
        }
        return $this->due_date->isPast();
    }

    public function getDependentMilestones()
    {
        if (empty($this->dependencies)) {
            return collect();
        }
        return ProjectMilestone::whereIn('id', $this->dependencies)->get();
    }

    public function canStart(): bool
    {
        if ($this->isCompleted() || $this->isInProgress()) {
            return false;
        }

        if (empty($this->dependencies)) {
            return true;
        }

        $dependentMilestones = $this->getDependentMilestones();
        return $dependentMilestones->every(fn($milestone) => $milestone->isCompleted());
    }
}

