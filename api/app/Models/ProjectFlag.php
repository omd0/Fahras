<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'flagged_by_user_id',
        'flag_type',
        'severity',
        'message',
        'is_confidential',
        'resolved_at',
        'resolved_by_user_id',
        'resolution_notes',
    ];

    protected $casts = [
        'is_confidential' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function flaggedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'flagged_by_user_id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_user_id');
    }

    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    public function resolve(User $resolver, string $notes = null): void
    {
        $this->update([
            'resolved_at' => now(),
            'resolved_by_user_id' => $resolver->id,
            'resolution_notes' => $notes,
        ]);
    }
}

