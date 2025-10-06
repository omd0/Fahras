<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create or update user with properly hashed password
$user = User::updateOrCreate(
    ['email' => 'test@example.com'],
    [
        'full_name' => 'Test User',
        'password' => Hash::make('password'),
    ]
);

echo "User created/updated: " . $user->email . "\n";
echo "User ID: " . $user->id . "\n";
