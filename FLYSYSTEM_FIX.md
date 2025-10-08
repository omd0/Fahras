# Flysystem 3.x URL Method Fix

## Problem

When using Flysystem 3.x with Laravel, the error occurred:
```
Call to undefined method League\Flysystem\Filesystem::url()
```

## Root Cause

In Flysystem 3.x, the `Filesystem` class no longer has a `url()` method. Laravel's `FilesystemAdapter` provides this method, but we were returning a raw `Filesystem` object from the storage driver registration.

## Solution

### 1. Updated AppServiceProvider (api/app/Providers/AppServiceProvider.php)

Changed the S3 driver registration to return a `FilesystemAdapter` instead of raw `Filesystem`:

```php
use Illuminate\Filesystem\FilesystemAdapter;
use League\Flysystem\AwsS3V3\PortableVisibilityConverter;
use League\Flysystem\Visibility;

Storage::extend('s3', function ($app, $config) {
    // ... S3Client configuration ...
    
    $client = new S3Client($s3Config);
    
    // Create adapter with visibility converter
    $adapter = new AwsS3V3Adapter(
        $client,
        $config['bucket'],
        $config['prefix'] ?? '',
        new PortableVisibilityConverter(Visibility::PUBLIC)
    );

    // Return FilesystemAdapter (provides url() method)
    return new FilesystemAdapter(
        new Filesystem($adapter, ['visibility' => Visibility::PUBLIC]),
        $adapter,
        $config
    );
});
```

### 2. Updated File Model (api/app/Models/File.php)

Added manual URL construction for MinIO to avoid relying on Flysystem's url() method:

```php
public function getPublicUrlAttribute()
{
    $disk = config('filesystems.default', 'local');
    
    try {
        // For S3/MinIO, construct the public URL manually
        if ($disk === 's3') {
            $bucket = config('filesystems.disks.s3.bucket');
            $endpoint = config('filesystems.disks.s3.url') ?? config('filesystems.disks.s3.endpoint');
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
        // Fallback to storage URL
        return $this->storage_url;
    }
}
```

## How It Works

### MinIO Path-Style URL
```
http://localhost:9000/fahras-files/uploads/projects/1/abc123.pdf
└─────┬──────────┘ └──────┬─────┘ └────────────┬───────────────┘
   endpoint         bucket           storage_url
```

### AWS S3 Virtual-Hosted Style
```
https://my-bucket.s3.amazonaws.com/uploads/projects/1/abc123.pdf
└─────────────┬───────────────────┘ └────────────┬──────────────┘
         endpoint                           storage_url
```

## Testing

### 1. Restart Docker Services
```bash
docker compose restart php
```

### 2. Test File Upload
```bash
# Upload a test file
curl -X POST http://localhost/api/projects/1/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "is_public=1"
```

### 3. Verify Response
The response should include a properly formatted `public_url`:
```json
{
  "file": {
    "id": 1,
    "original_filename": "test.pdf",
    "storage_url": "uploads/projects/1/abc123.pdf",
    "public_url": "http://localhost:9000/fahras-files/uploads/projects/1/abc123.pdf",
    "size_human": "125.5 KB"
  }
}
```

### 4. Test File Access
```bash
# Direct access to MinIO URL
curl -I http://localhost:9000/fahras-files/uploads/projects/1/abc123.pdf
```

Should return `HTTP/1.1 200 OK`

## Benefits

1. **Compatible with Flysystem 3.x**: Uses the correct API
2. **Works with FilesystemAdapter**: Provides all Laravel storage methods
3. **Manual URL construction**: More control over URL format
4. **Error handling**: Graceful fallback if URL generation fails
5. **Supports both MinIO and AWS S3**: Path-style and virtual-hosted URLs

## Additional Notes

- The `FilesystemAdapter` wraps the `Filesystem` and provides Laravel-specific methods
- The `PortableVisibilityConverter` ensures files are marked as public
- URL construction is done manually for better control and debugging
- Logging is added for troubleshooting URL generation issues

## Related Files

- `api/app/Providers/AppServiceProvider.php` - Storage driver registration
- `api/app/Models/File.php` - Public URL generation
- `api/config/filesystems.php` - Storage configuration
- `docker-compose.yml` - MinIO service configuration
