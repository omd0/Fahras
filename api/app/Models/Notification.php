<?php

namespace App\Models;

use App\Domains\Projects\Models\Project;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Create a notification for project advisors when a student comments or rates
     */
    public static function createForProjectAdvisors($project, $type, $title, $message, $data = null)
    {
        $advisors = $project->advisors;
        
        foreach ($advisors as $advisor) {
            self::create([
                'user_id' => $advisor->id,
                'project_id' => $project->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
            ]);
        }
    }

    /**
     * Create a notification for project creator when a student comments or rates
     */
    public static function createForProjectCreator($project, $type, $title, $message, $data = null)
    {
        self::create([
            'user_id' => $project->created_by_user_id,
            'project_id' => $project->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }
}
