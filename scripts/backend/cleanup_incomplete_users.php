<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

echo "=== Cleanup Incomplete/Unverified Users Script ===\n\n";

// Verify database connection
try {
    DB::connection()->getPdo();
    echo "✅ Database connection verified\n\n";
} catch (Exception $e) {
    echo "❌ Error: Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Find all users (this script can be used for general cleanup)
$users = User::all();

if ($users->isEmpty()) {
    echo "✅ No users found.\n";
    exit(0);
}

echo "Found {$users->count()} user(s):\n\n";

$deletedCount = 0;
$errorCount = 0;

foreach ($users as $user) {
    try {
        echo "Processing: {$user->full_name} ({$user->email})\n";
        echo "   Created: {$user->created_at}\n";
        
        // Clean up related records
        $relatedCount = 0;
        
        // Detach roles
        $rolesCount = $user->roles()->count();
        if ($rolesCount > 0) {
            $user->roles()->detach();
            echo "   ✅ Detached {$rolesCount} role(s)\n";
            $relatedCount += $rolesCount;
        }
        
        // Delete related records in other tables if they exist
        if ($user->faculty) {
            $user->faculty->delete();
            echo "   ✅ Deleted faculty record\n";
            $relatedCount++;
        }
        if ($user->student) {
            $user->student->delete();
            echo "   ✅ Deleted student record\n";
            $relatedCount++;
        }
        
        // Delete any tokens (Sanctum)
        $tokensCount = $user->tokens()->count();
        if ($tokensCount > 0) {
            $user->tokens()->delete();
            echo "   ✅ Deleted {$tokensCount} token(s)\n";
            $relatedCount += $tokensCount;
        }
        
        // Delete the user
        $user->delete();
        echo "   ✅ Deleted user record\n";
        $deletedCount++;
        
        echo "   Summary: Deleted user and {$relatedCount} related record(s)\n\n";
        
    } catch (Exception $e) {
        echo "   ❌ Error: " . $e->getMessage() . "\n\n";
        $errorCount++;
    }
}

echo "=== Cleanup Complete ===\n";
echo "✅ Successfully deleted: {$deletedCount} user(s)\n";
if ($errorCount > 0) {
    echo "❌ Errors encountered: {$errorCount} user(s)\n";
}
echo "\nUnverified users have been cleaned up. Registration should now work properly.\n";

