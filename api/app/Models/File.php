<?php

namespace App\Models;

use App\Domains\Projects\Models\Project;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'uploaded_by_user_id',
        'version',
        'filename',
        'original_filename',
        'mime_type',
        'size_bytes',
        'storage_url',
        'checksum',
        'is_public',
        'uploaded_at',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'uploaded_at' => 'datetime',
    ];

    protected $appends = [
        'size_human',
        'public_url'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    public function getSizeHumanAttribute()
    {
        $bytes = $this->size_bytes;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getPublicUrlAttribute()
    {
        $disk = config('filesystems.default', 'local');
        
        try {
            // For S3/MinIO, construct the public URL manually
            if ($disk === 's3') {
                $bucket = config('filesystems.disks.s3.bucket');
                $endpoint = config('filesystems.disks.s3.url') ?? config('filesystems.disks.s3.endpoint');
                
                // Remove trailing slash from endpoint
                $endpoint = rtrim($endpoint, '/');
                
                // For MinIO with path-style URLs
                if (config('filesystems.disks.s3.use_path_style_endpoint')) {
                    return $endpoint . '/' . $bucket . '/' . $this->storage_url;
                }
                
                // For AWS S3 virtual-hosted style
                return $endpoint . '/' . $this->storage_url;
            }
            
            // For other storage drivers, use Laravel's url method
            return \Storage::disk($disk)->url($this->storage_url);
        } catch (\Exception $e) {
            \Log::error('Error generating public URL for file', [
                'file_id' => $this->id,
                'storage_url' => $this->storage_url,
                'error' => $e->getMessage()
            ]);
            
            // Fallback to storage URL
            return $this->storage_url;
        }
    }
}
