<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Project;
use App\Models\File;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

echo "=== File Upload Test ===\n";

// Get a test project (use the first approved project)
$project = Project::where('admin_approval_status', 'approved')->first();

if (!$project) {
    echo "❌ No approved projects found!\n";
    exit(1);
}

echo "Using project: {$project->title} (ID: {$project->id})\n";

// Get a test user (admin user)
$user = User::where('email', 'admin@fahras.edu')->first();

if (!$user) {
    echo "❌ Admin user not found!\n";
    exit(1);
}

echo "Using user: {$user->email}\n";

// Create a test file in storage
$testContent = 'Test file content for project upload - ' . date('Y-m-d H:i:s');
$testFilename = 'test-upload-' . time() . '.txt';
$testPath = storage_path('app/' . $testFilename);

file_put_contents($testPath, $testContent);

echo "Created test file: $testPath\n";

// Test direct file upload to storage
try {
    echo "\n=== Testing Direct Storage Upload ===\n";
    
    $storagePath = 'uploads/projects/' . $project->id . '/' . $testFilename;
    Storage::disk('s3')->put($storagePath, $testContent);
    
    echo "✅ File uploaded to storage successfully!\n";
    echo "Storage path: $storagePath\n";
    
    // Test file retrieval
    $retrievedContent = Storage::disk('s3')->get($storagePath);
    echo "✅ File retrieved successfully!\n";
    echo "Content matches: " . ($retrievedContent === $testContent ? 'Yes' : 'No') . "\n";
    
    // Test file URL
    $fileUrl = Storage::disk('s3')->url($storagePath);
    echo "File URL: $fileUrl\n";
    
    // Create a File record in database
    echo "\n=== Testing Database Record Creation ===\n";
    
    $fileRecord = File::create([
        'project_id' => $project->id,
        'uploaded_by_user_id' => $user->id,
        'version' => 1,
        'filename' => $testFilename,
        'original_filename' => $testFilename,
        'mime_type' => 'text/plain',
        'size_bytes' => strlen($testContent),
        'storage_url' => $storagePath,
        'checksum' => hash('sha256', $testContent),
        'is_public' => true,
        'uploaded_at' => now(),
    ]);
    
    echo "✅ File record created in database!\n";
    echo "File ID: {$fileRecord->id}\n";
    
    // Test project files relationship
    echo "\n=== Testing Project Files Relationship ===\n";
    
    $project->refresh();
    $filesCount = $project->files()->count();
    echo "Project files count: $filesCount\n";
    
    if ($filesCount > 0) {
        echo "✅ Project files relationship working!\n";
        
        $latestFile = $project->files()->latest()->first();
        echo "Latest file: {$latestFile->original_filename}\n";
        echo "File URL: " . $latestFile->public_url . "\n";
    } else {
        echo "❌ Project files relationship not working!\n";
    }
    
    // Clean up
    echo "\n=== Cleaning Up ===\n";
    Storage::disk('s3')->delete($storagePath);
    $fileRecord->delete();
    echo "✅ Test file and record cleaned up!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

// Clean up local test file
unlink($testPath);

echo "\n=== Test Complete ===\n";
