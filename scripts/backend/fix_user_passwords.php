<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Exception;

echo "=== Fix User Passwords Script ===\n\n";

// Verify database connection
try {
    DB::connection()->getPdo();
    echo "✅ Database connection verified\n\n";
} catch (Exception $e) {
    echo "❌ Error: Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Faculty emails to fix
$facultyEmails = [
    'a-altalhi@cti.edu.sa',
    'abdw2004@cti.edu.sa',
    'alabbadi@cti.edu.sa',
    'nasser@cti.edu.sa',
    'faleha5@cti.edu.sa',
    'aalshehri2@cti.edu.sa',
    'alafari@cti.edu.sa',
];

$defaultPassword = 'password';
$fixedCount = 0;
$notFoundCount = 0;

foreach ($facultyEmails as $email) {
    try {
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            echo "❌ User not found: {$email}\n";
            $notFoundCount++;
            continue;
        }
        
        echo "Processing: {$user->full_name} ({$email})\n";
        
        // Explicitly hash the password using Hash::make()
        $hashedPassword = Hash::make($defaultPassword);
        
        // Update password directly in database to bypass any cast issues
        DB::table('users')
            ->where('id', $user->id)
            ->update(['password' => $hashedPassword]);
        
        // Verify the password works
        $user->refresh();
        if (Hash::check($defaultPassword, $user->password)) {
            echo "   ✅ Password fixed and verified\n";
            $fixedCount++;
        } else {
            echo "   ❌ Error: Password verification still failed after fix\n";
        }
        
        // Also ensure user is active
        if ($user->status !== 'active') {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['status' => 'active']);
            echo "   ✅ User status set to active\n";
        }
        
        echo "\n";
        
    } catch (Exception $e) {
        echo "   ❌ Error: " . $e->getMessage() . "\n\n";
    }
}

echo "=== Password Fix Complete ===\n";
echo "Fixed: {$fixedCount}\n";
echo "Not found: {$notFoundCount}\n";
echo "\nAll users should now be able to login with password: 'password'\n";

