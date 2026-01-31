<?php

require_once 'api/vendor/autoload.php';

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;

// Set up basic Laravel configuration for testing
Config::set('filesystems.default', 's3');
Config::set('filesystems.disks.s3', [
    'driver' => 's3',
    'key' => 'minioadmin',
    'secret' => 'minioadmin123',
    'region' => 'us-east-1',
    'bucket' => 'fahras-files',
    'endpoint' => 'http://localhost:9000',
    'use_path_style_endpoint' => true,
]);

echo "=== Cloud Storage Test ===\n";

try {
    // Test file operations
    $testContent = 'Hello from Fahras cloud storage! ' . date('Y-m-d H:i:s');
    $testFile = 'test/test-file-' . time() . '.txt';
    
    echo "📝 Writing test file...\n";
    Storage::disk('s3')->put($testFile, $testContent);
    
    echo "✅ File written successfully!\n";
    
    echo "📖 Reading test file...\n";
    $readContent = Storage::disk('s3')->get($testFile);
    
    if ($readContent === $testContent) {
        echo "✅ File read successfully!\n";
    } else {
        echo "❌ File content mismatch!\n";
    }
    
    echo "🔗 Getting file URL...\n";
    $fileUrl = Storage::disk('s3')->url($testFile);
    echo "File URL: $fileUrl\n";
    
    echo "🗑️ Cleaning up test file...\n";
    Storage::disk('s3')->delete($testFile);
    
    echo "✅ Cloud storage test completed successfully!\n";
    echo "🚀 Your MinIO setup is working correctly!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "🔧 Please check your MinIO configuration.\n";
}
