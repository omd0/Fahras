<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Project;
use App\Models\User;
use App\Models\File;

echo "=== Complete File Flow Test ===\n";

// Get admin user
$user = User::where('email', 'admin@fahras.edu')->first();
echo "Using user: {$user->email}\n";

// Get the project we made public
$project = Project::find(3);
echo "Using project: {$project->title} (ID: {$project->id})\n";
echo "Project is public: " . ($project->is_public ? 'Yes' : 'No') . "\n";
echo "Project is approved: " . ($project->isApproved() ? 'Yes' : 'No') . "\n";

// Check current files
echo "\n=== Current Files ===\n";
$files = $project->files;
echo "Files count: " . $files->count() . "\n";

if ($files->count() > 0) {
    foreach ($files as $file) {
        echo "File: {$file->original_filename}\n";
        echo "  - ID: {$file->id}\n";
        echo "  - Storage URL: {$file->storage_url}\n";
        echo "  - Public URL: {$file->public_url}\n";
        echo "  - Is Public: " . ($file->is_public ? 'Yes' : 'No') . "\n";
        echo "  - Size: {$file->size_bytes} bytes\n";
        echo "  - Created: {$file->created_at}\n";
        echo "\n";
    }
}

// Test file access through different methods
echo "=== Testing File Access ===\n";

// Method 1: Direct database query
echo "Method 1: Direct database query\n";
$directFiles = File::where('project_id', $project->id)->get();
echo "Direct query files count: " . $directFiles->count() . "\n";

// Method 2: Through project relationship
echo "Method 2: Through project relationship\n";
$project->refresh();
$relationshipFiles = $project->files;
echo "Relationship files count: " . $relationshipFiles->count() . "\n";

// Method 3: Check if files exist in storage
echo "Method 3: Check storage\n";
use Illuminate\Support\Facades\Storage;

foreach ($files as $file) {
    $exists = Storage::disk('s3')->exists($file->storage_url);
    echo "File '{$file->original_filename}' exists in storage: " . ($exists ? 'Yes' : 'No') . "\n";
    
    if ($exists) {
        $url = Storage::disk('s3')->url($file->storage_url);
        echo "  Storage URL: $url\n";
    }
}

// Test the access control logic
echo "\n=== Testing Access Control Logic ===\n";

// Simulate the ProjectController logic
$isProjectMember = (
    $project->created_by_user_id === $user->id ||
    $project->members()->where('user_id', $user->id)->exists() ||
    $project->advisors()->where('user_id', $user->id)->exists() ||
    $user->hasRole('admin') ||
    $user->hasRole('reviewer') ||
    $user->hasRole('faculty')
);

echo "User is project member: " . ($isProjectMember ? 'Yes' : 'No') . "\n";
echo "Project is approved: " . ($project->isApproved() ? 'Yes' : 'No') . "\n";
echo "Project is visible to public: " . ($project->isVisibleToPublic() ? 'Yes' : 'No') . "\n";

$shouldShowFiles = $project->isApproved() && $project->isVisibleToPublic() || $isProjectMember;
echo "Should show files: " . ($shouldShowFiles ? 'Yes' : 'No') . "\n";

if ($shouldShowFiles) {
    echo "✅ Files should be visible in the frontend!\n";
} else {
    echo "❌ Files are being hidden by access control!\n";
}

echo "\n=== Test Complete ===\n";
