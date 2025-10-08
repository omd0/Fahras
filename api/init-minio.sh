#!/bin/bash

echo "Initializing MinIO bucket for Fahras..."

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
until curl -f http://localhost:9000/minio/health/live; do
    echo "MinIO is not ready yet. Waiting..."
    sleep 2
done

echo "MinIO is ready!"

# Install MinIO client (mc)
echo "Installing MinIO client..."
curl https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc
chmod +x /usr/local/bin/mc

# Configure MinIO client
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Create bucket
echo "Creating bucket 'fahras-files'..."
mc mb local/fahras-files --ignore-existing

# Set bucket policy to public read
echo "Setting bucket policy..."
mc anonymous set download local/fahras-files

echo "MinIO bucket initialized successfully!"
echo "Bucket: fahras-files"
echo "Access Key: minioadmin"
echo "Secret Key: minioadmin123"
echo "Console: http://localhost:9001"
