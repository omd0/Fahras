<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

echo "=== User Creation Utility ===\n";

// Get command line arguments
$email = $argv[1] ?? 'test@example.com';
$name = $argv[2] ?? 'Test User';
$password = $argv[3] ?? 'password';
$role = $argv[4] ?? 'student';

try {
    // Create or update user with properly hashed password
    $user = User::updateOrCreate(
        ['email' => $email],
        [
            'full_name' => $name,
            'password' => Hash::make($password),
            'status' => 'active',
        ]
    );

    // Assign role if specified
    $roleModel = Role::where('name', $role)->first();
    if ($roleModel) {
        $user->roles()->sync([$roleModel->id]);
        echo "✅ User created/updated: {$user->email}\n";
        echo "✅ User ID: {$user->id}\n";
        echo "✅ Role assigned: {$role}\n";
    } else {
        echo "✅ User created/updated: {$user->email}\n";
        echo "✅ User ID: {$user->id}\n";
        echo "⚠️  Role '{$role}' not found. Available roles:\n";
        foreach (Role::all() as $r) {
            echo "   - {$r->name}\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nUsage: php create_user.php <email> <name> <password> <role>\n";
echo "Example: php create_user.php john@example.com 'John Doe' secret123 admin\n";
