# Quick Start: MinIO Cloud Storage

## ✅ What's Integrated

MinIO is **automatically included** in Fahras Docker setup. Files uploaded through the application are stored in MinIO instead of local disk.

## 🚀 Getting Started

### 1. Start Fahras (MinIO starts automatically)

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### 2. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | admin@fahras.edu / password |
| **API** | http://localhost/api | - |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |
| **Database** | localhost:5433 | fahras / fahras_password |

### 3. Test File Upload

1. Login to frontend: http://localhost:3000
2. Create or view a project
3. Upload a file
4. File is automatically stored in MinIO
5. View uploaded files in project details

### 4. Verify in MinIO Console

1. Open: http://localhost:9001
2. Login: `minioadmin` / `minioadmin123`
3. Click on `fahras-files` bucket
4. See your uploaded files!

## 📁 File Storage Structure

```
fahras-files/                    # MinIO bucket
└── uploads/
    └── projects/
        └── {project_id}/
            └── {uuid}.{ext}     # Uploaded files
```

## 🔧 How It Works

```
User uploads file
       ↓
React Frontend (Port 3000)
       ↓
Laravel API (Port 80)
       ↓
MinIO Storage (Port 9000)
       ↓
File URL returned to user
```

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# MinIO only
docker compose logs -f minio

# Laravel only
docker compose logs -f php
```

### Restart Services
```bash
docker compose restart
```

### Stop Services
```bash
docker compose down
```

### Clear All Data
```bash
docker compose down -v
```

## 🔍 Troubleshooting

### Files not uploading?

**Check backend logs:**
```bash
docker compose logs php | grep -i error
```

**Check MinIO is running:**
```bash
docker compose ps minio
```

### Can't access MinIO console?

**Check if port 9001 is available:**
```bash
# Linux/Mac
lsof -i :9001

# Windows
netstat -ano | findstr :9001
```

### Files not visible?

**Check bucket exists:**
```bash
docker compose exec minio mc ls /data
```

## 📊 Storage Information

### View Storage Usage
```bash
# From MinIO console: http://localhost:9001
# Or via command:
docker exec fahras-minio-1 du -sh /data
```

### Backup Files
```bash
# Backup entire MinIO data
docker run --rm \
  -v fahras_minio_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/minio-backup.tar.gz /data
```

### Restore Files
```bash
# Restore from backup
docker run --rm \
  -v fahras_minio_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/minio-backup.tar.gz -C /
```

## 🌐 Production Deployment

For production, switch to AWS S3 by updating environment variables:

```env
# Change in docker-compose.yml or .env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-production-bucket
# Remove AWS_ENDPOINT and AWS_USE_PATH_STYLE_ENDPOINT
```

No code changes needed! 🎉

## 📚 Documentation

- **Full Integration Guide**: [MINIO_INTEGRATION.md](MINIO_INTEGRATION.md)
- **Main README**: [README.md](README.md)
- **Project Structure**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 💡 Tips

- **Development**: Use MinIO (included, free, fast)
- **Production**: Use AWS S3 (scalable, global, reliable)
- **Bucket is auto-created**: No manual setup needed
- **Files are public**: For easy testing (change in production)
- **S3-compatible**: Easy migration to any S3 provider

## ✨ Features

✅ Automatic bucket creation  
✅ File upload/download  
✅ Public URL generation  
✅ Size formatting  
✅ CORS configured  
✅ Web console access  
✅ Production-ready (switchable to S3)  
✅ No additional setup required  

---

**Need help?** Check the logs or open an issue on GitHub!
