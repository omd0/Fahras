<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "=== Login Test ===\n";

// Get admin user
$admin = User::where('email', 'admin@fahras.edu')->first();

if ($admin) {
    echo "Admin user found: {$admin->email}\n";
    
    // Create a personal access token
    $token = $admin->createToken('test-token')->plainTextToken;
    
    echo "✅ Authentication token created!\n";
    echo "Token: {$token}\n";
    echo "Bearer header: Bearer {$token}\n";
    
    echo "\nYou can use this token to test API endpoints:\n";
    echo "curl -H \"Authorization: Bearer {$token}\" \\\n";
    echo "     -H \"Accept: application/json\" \\\n";
    echo "     http://localhost/api/projects/19\n";
    
} else {
    echo "❌ Admin user not found!\n";
}

echo "\n=== Login Test Complete ===\n";
