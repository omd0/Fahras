#!/bin/bash

echo "Installing cloud storage packages for Laravel..."

# Install AWS S3
composer require league/flysystem-aws-s3-v3

# Install Google Cloud Storage
composer require league/flysystem-google-cloud-storage

# Install Azure Blob Storage
composer require league/flysystem-azure-blob-storage

# Install Dropbox
composer require spatie/flysystem-dropbox

echo "Cloud storage packages installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy configuration from cloud-storage-config.example to your .env file"
echo "2. Set FILESYSTEM_DISK to your preferred cloud provider (s3, gcs, azure, dropbox)"
echo "3. Configure the required environment variables for your chosen provider"
echo "4. Test file upload functionality"
