<?php
// Direct test of file upload functionality
require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;
use App\Models\File;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

echo "=== FILE UPLOAD DEBUG TEST ===\n\n";

// 1. Check if projects exist
$projectsCount = Project::count();
echo "Total projects in DB: $projectsCount\n";

if ($projectsCount > 0) {
    $project = Project::first();
    echo "Testing with project ID: {$project->id} - {$project->title}\n";
    
    // 2. Check if files exist for this project
    $filesCount = File::where('project_id', $project->id)->count();
    echo "Files for this project: $filesCount\n";
    
    if ($filesCount > 0) {
        echo "\nFiles in database:\n";
        $files = File::where('project_id', $project->id)->get();
        foreach ($files as $file) {
            echo "  - ID: {$file->id}, Name: {$file->original_filename}, Storage: {$file->storage_url}\n";
            
            // 3. Check if file exists in storage
            $disk = config('filesystems.default', 'local');
            $exists = Storage::disk($disk)->exists($file->storage_url);
            echo "    Storage exists ({$disk}): " . ($exists ? 'YES' : 'NO') . "\n";
            
            if (!$exists && $disk === 's3') {
                // Try checking local storage as fallback
                $localExists = Storage::disk('local')->exists($file->storage_url);
                echo "    Local storage exists: " . ($localExists ? 'YES' : 'NO') . "\n";
            }
        }
    } else {
        echo "\n⚠️  NO FILES FOUND for this project!\n";
        echo "This means files are not being uploaded or saved to the database.\n";
    }
} else {
    echo "⚠️  NO PROJECTS FOUND in database!\n";
}

// 4. Check storage configuration
echo "\n=== STORAGE CONFIGURATION ===\n";
echo "Default disk: " . config('filesystems.default') . "\n";
echo "AWS Endpoint: " . config('filesystems.disks.s3.endpoint') . "\n";
echo "AWS Bucket: " . config('filesystems.disks.s3.bucket') . "\n";
echo "AWS Key: " . config('filesystems.disks.s3.key') . "\n";

// 5. Test if we can write to storage
echo "\n=== STORAGE WRITE TEST ===\n";
try {
    $testContent = "Test file content " . date('Y-m-d H:i:s');
    $testPath = 'test-upload-' . time() . '.txt';
    
    $disk = config('filesystems.default');
    Storage::disk($disk)->put($testPath, $testContent);
    echo "✅ Successfully wrote test file to {$disk} storage\n";
    
    // Check if we can read it back
    $readContent = Storage::disk($disk)->get($testPath);
    echo "✅ Successfully read test file back\n";
    
    // Clean up
    Storage::disk($disk)->delete($testPath);
    echo "✅ Successfully deleted test file\n";
} catch (\Exception $e) {
    echo "❌ Error testing storage: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

// 6. Check recent Laravel logs for file upload attempts
echo "\n=== RECENT FILE UPLOAD LOGS ===\n";
$logFile = __DIR__ . '/../storage/logs/laravel.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    $recentLines = array_slice($lines, -50); // Last 50 lines
    $uploadLines = array_filter($recentLines, function($line) {
        return strpos($line, 'File upload') !== false || 
               strpos($line, 'file') !== false ||
               strpos($line, 'upload') !== false;
    });
    
    if (count($uploadLines) > 0) {
        foreach ($uploadLines as $line) {
            echo $line;
        }
    } else {
        echo "No file upload logs found in recent entries\n";
    }
} else {
    echo "Log file not found\n";
}

echo "\n=== TEST COMPLETE ===\n";

