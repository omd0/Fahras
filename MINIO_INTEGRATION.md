# MinIO Cloud Storage Integration Guide

## Overview

Fahras uses MinIO as an S3-compatible object storage solution for storing project files. MinIO is automatically included in the Docker setup and requires no additional configuration.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   Laravel   │────▶│   MinIO     │
│  Frontend   │     │   Backend   │     │  Storage    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                     │                    │
      │                     │                    │
   Port 3000            Port 80             Port 9000
```

## Services

### 1. MinIO Server
- **Port**: 9000 (API)
- **Port**: 9001 (Web Console)
- **Bucket**: `fahras-files`
- **Access**: Internal Docker network and localhost

### 2. MinIO Init Container
- Automatically creates the bucket on startup
- Sets public download policy
- Runs once and exits

### 3. Laravel Backend
- Connects to MinIO using S3 driver
- Handles file uploads/downloads
- Generates public URLs for files

### 4. React Frontend
- Uploads files through Laravel API
- Displays files using public URLs
- Downloads files via API

## File Upload Flow

1. **User selects file** in React frontend
2. **Frontend sends file** to Laravel API (`POST /api/projects/{id}/files`)
3. **Laravel validates** file and user permissions
4. **Laravel stores file** in MinIO using S3 driver
5. **MinIO returns** storage URL
6. **Laravel saves** file metadata in PostgreSQL
7. **Frontend receives** file information with public URL
8. **User can view/download** file from MinIO

## Configuration

### Docker Compose (docker-compose.yml)

```yaml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"
    - "9001:9001"
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin123
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"

minio-init:
  image: minio/mc:latest
  depends_on:
    minio:
      condition: service_healthy
  entrypoint: >
    /bin/sh -c "
    mc alias set myminio http://minio:9000 minioadmin minioadmin123;
    mc mb myminio/fahras-files --ignore-existing;
    mc anonymous set download myminio/fahras-files;
    "
```

### Laravel Environment Variables

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=fahras-files
AWS_ENDPOINT=http://minio:9000
AWS_URL=http://localhost:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

### Laravel Filesystem Config (api/config/filesystems.php)

```php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'url' => env('AWS_URL'),
    'endpoint' => env('AWS_ENDPOINT'),
    'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
    'visibility' => 'public',
],
```

## File Model

The File model automatically appends the public URL:

```php
protected $appends = [
    'size_human',
    'public_url'
];

public function getPublicUrlAttribute()
{
    $disk = config('filesystems.default', 'local');
    return \Storage::disk($disk)->url($this->storage_url);
}
```

## Frontend Integration

### TypeScript Interface

```typescript
export interface File {
  id: number;
  original_filename: string;
  storage_url: string;
  public_url?: string;  // MinIO public URL
  size_human?: string;
  mime_type: string;
  // ... other fields
}
```

### File Upload

```typescript
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('is_public', isPublic ? '1' : '0');

await apiService.uploadFile(projectId, formData);
```

### File Display

```typescript
// Use public_url for direct access
<a href={file.public_url} target="_blank">
  {file.original_filename}
</a>
```

## Testing the Integration

### 1. Verify MinIO is Running

```bash
# Check MinIO health
curl http://localhost:9000/minio/health/live

# Check bucket exists
docker exec -it fahras-minio-1 mc ls myminio/
```

### 2. Upload a Test File

```bash
# Via API
curl -X POST http://localhost/api/projects/1/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "is_public=1"
```

### 3. View Files in MinIO Console

1. Open http://localhost:9001
2. Login with `minioadmin` / `minioadmin123`
3. Browse to `fahras-files` bucket
4. View uploaded files

## Troubleshooting

### Files Not Uploading

**Check Laravel logs:**
```bash
docker compose logs php
# or
tail -f api/storage/logs/laravel.log
```

**Check MinIO logs:**
```bash
docker compose logs minio
```

### Cannot Access Files

**Verify bucket policy:**
```bash
docker exec -it fahras-minio-1 mc policy get myminio/fahras-files
```

**Should return:** `download` policy

### Connection Issues

**Test MinIO from PHP container:**
```bash
docker compose exec php curl http://minio:9000/minio/health/live
```

**Should return:** HTTP 200 OK

### Public URLs Not Working

**Check environment variables:**
```bash
docker compose exec php printenv | grep AWS
```

**Expected output:**
```
AWS_ENDPOINT=http://minio:9000
AWS_URL=http://localhost:9000
AWS_BUCKET=fahras-files
AWS_USE_PATH_STYLE_ENDPOINT=true
```

## Migration to Production

For production, replace MinIO with AWS S3:

### 1. Update Environment Variables

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-production-bucket
# Remove AWS_ENDPOINT
# Remove AWS_USE_PATH_STYLE_ENDPOINT
```

### 2. Create S3 Bucket

```bash
aws s3 mb s3://your-production-bucket
aws s3api put-bucket-policy --bucket your-production-bucket --policy file://bucket-policy.json
```

### 3. Migrate Existing Files

```bash
# Export from MinIO
mc cp --recursive myminio/fahras-files/ ./backup/

# Import to S3
aws s3 sync ./backup/ s3://your-production-bucket/
```

## Security Considerations

### Development (MinIO)
- Default credentials are used
- Public download policy for easy testing
- All files accessible via direct URL

### Production (AWS S3)
- Use IAM roles with least privilege
- Enable bucket encryption
- Use signed URLs for private files
- Enable versioning and logging
- Set up CloudFront for CDN

## Performance

### MinIO Advantages
- **Fast**: Local storage, no network latency
- **Free**: Open-source, no cloud costs
- **Compatible**: S3-compatible API
- **Simple**: Easy Docker setup

### Scaling Considerations
- For production, consider AWS S3 for unlimited storage
- Use CloudFront CDN for global distribution
- Enable multi-part uploads for large files
- Implement file compression for documents

## Maintenance

### Backup MinIO Data

```bash
# Create backup
docker run --rm -v fahras_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data

# Restore backup
docker run --rm -v fahras_minio_data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup.tar.gz -C /
```

### Clear All Files

```bash
# Remove all files from bucket
docker exec -it fahras-minio-1 mc rm --recursive --force myminio/fahras-files/

# Recreate bucket
docker exec -it fahras-minio-1 mc mb myminio/fahras-files --ignore-existing
docker exec -it fahras-minio-1 mc anonymous set download myminio/fahras-files
```

### Monitor Storage Usage

```bash
# Check storage usage
docker exec -it fahras-minio-1 mc du myminio/fahras-files
```

## API Reference

### Upload File
```
POST /api/projects/{id}/files
Content-Type: multipart/form-data

Body:
- file: (binary)
- is_public: 1|0

Response:
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "original_filename": "document.pdf",
    "storage_url": "uploads/projects/1/uuid.pdf",
    "public_url": "http://localhost:9000/fahras-files/uploads/projects/1/uuid.pdf",
    "size_human": "2.5 MB"
  }
}
```

### List Files
```
GET /api/projects/{id}/files

Response:
{
  "files": [...]
}
```

### Download File
```
GET /api/files/{id}/download

Response: File stream
```

### Delete File
```
DELETE /api/files/{id}

Response:
{
  "message": "File deleted successfully"
}
```

## Conclusion

MinIO is fully integrated into Fahras and provides a robust, S3-compatible storage solution for development. The system is designed to easily migrate to AWS S3 or other cloud providers for production use without code changes.
