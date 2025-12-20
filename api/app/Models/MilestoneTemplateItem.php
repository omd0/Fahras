<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MilestoneTemplateItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'title',
        'description',
        'order',
        'estimated_days',
        'is_required',
        'allowed_roles',
        'allowed_actions',
    ];

    protected $casts = [
        'order' => 'integer',
        'estimated_days' => 'integer',
        'is_required' => 'boolean',
        'allowed_roles' => 'array',
        'allowed_actions' => 'array',
    ];

    /**
     * Valid roles that can be assigned to a step
     */
    public static function getValidRoles(): array
    {
        return ['admin', 'faculty', 'student'];
    }

    /**
     * Valid actions that can be assigned to a step
     */
    public static function getValidActions(): array
    {
        return ['start', 'pause', 'extend', 'view', 'edit', 'complete'];
    }

    /**
     * Validate allowed roles
     */
    public static function validateRoles(array $roles): bool
    {
        $validRoles = self::getValidRoles();
        foreach ($roles as $role) {
            if (!in_array($role, $validRoles)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Validate allowed actions
     */
    public static function validateActions(array $actions): bool
    {
        $validActions = self::getValidActions();
        foreach ($actions as $action) {
            if (!in_array($action, $validActions)) {
                return false;
            }
        }
        return true;
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(MilestoneTemplate::class, 'template_id');
    }

    public function projectMilestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class, 'template_item_id');
    }
}

