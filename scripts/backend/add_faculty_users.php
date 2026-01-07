<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Exception;

echo "=== Faculty Users Creation Script ===\n\n";

// Verify database connection
try {
    DB::connection()->getPdo();
    echo "✅ Database connection verified\n\n";
} catch (Exception $e) {
    echo "❌ Error: Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Define faculty users
$facultyUsers = [
    [
        'name' => 'احمد الطلحي',
        'email' => 'a-altalhi@cti.edu.sa',
        'role' => 'faculty',
    ],
    [
        'name' => 'عبدالرحمن المالكي',
        'email' => 'abdw2004@cti.edu.sa',
        'role' => 'faculty',
    ],
    [
        'name' => 'عادي العبادي',
        'email' => 'alabbadi@cti.edu.sa',
        'role' => 'faculty',
    ],
    [
        'name' => 'ناصر عبدالواحد',
        'email' => 'nasser@cti.edu.sa',
        'role' => 'faculty',
    ],
    [
        'name' => 'فالح القحطاني',
        'email' => 'faleha5@cti.edu.sa',
        'role' => 'faculty',
    ],
    [
        'name' => 'عبدالله الشهري',
        'email' => 'aalshehri2@cti.edu.sa',
        'role' => 'faculty',
    ],
    [
        'name' => 'خالد العفاري',
        'email' => 'alafari@cti.edu.sa',
        'role' => 'faculty',
    ],
];

// Default password for all users (change this or make it configurable)
$defaultPassword = 'password';

// Get or create faculty role
$facultyRole = Role::where('name', 'faculty')->first();
if (!$facultyRole) {
    echo "❌ Error: Faculty role not found. Please run database seeders first.\n";
    exit(1);
}

// Get first available department (or use Computer Science if it exists)
$department = Department::where('name', 'Computer Science')->first();
if (!$department) {
    $department = Department::first();
    if (!$department) {
        echo "❌ Error: No departments found. Please run database seeders first.\n";
        exit(1);
    }
    echo "⚠️  Warning: Using first available department: {$department->name}\n";
}

// Verify permissions exist (login is not a permission, but projects.create is)
$permissions = ['login', 'add_project'];
$permissionCodes = ['projects.create']; // login is not a permission in the system

echo "Permissions requested: " . implode(', ', $permissions) . "\n";
echo "Note: 'login' is not a permission (all authenticated users can login)\n";
echo "Note: 'add_project' maps to 'projects.create' permission\n\n";

// Check if faculty role has projects.create permission
$hasProjectCreate = $facultyRole->permissions()->where('code', 'projects.create')->exists();
if (!$hasProjectCreate) {
    echo "⚠️  Warning: Faculty role does not have 'projects.create' permission.\n";
    echo "   The faculty role will be assigned this permission.\n";
    
    $projectCreatePermission = Permission::where('code', 'projects.create')->first();
    if ($projectCreatePermission) {
        $facultyRole->permissions()->syncWithoutDetaching([$projectCreatePermission->id]);
        echo "✅ Added 'projects.create' permission to faculty role.\n\n";
    }
} else {
    echo "✅ Faculty role already has 'projects.create' permission.\n\n";
}

// Counter for faculty numbers
$facultyCounter = 1;

// Track statistics
$createdCount = 0;
$updatedCount = 0;
$errorCount = 0;

// Process each user
foreach ($facultyUsers as $index => $userData) {
    try {
        $email = $userData['email'];
        $name = $userData['name'];
        
        echo "Processing user " . ($index + 1) . "/" . count($facultyUsers) . ": {$name} ({$email})\n";
        
        // Check if user already exists
        $existingUser = User::where('email', $email)->first();
        
        if ($existingUser) {
            echo "   ⚠️  User already exists with email: {$email}\n";
            
            // Update password to default password - use update() to ensure cast works
            $existingUser->update([
                'password' => $defaultPassword, // Plain password - Laravel cast will hash it
                'status' => 'active', // Ensure user is active
            ]);
            echo "   ✅ Password reset to default password\n";
            echo "   ✅ User status set to active\n";
            
            // Refresh to get the updated model
            $existingUser->refresh();
            
            // Check if user already has faculty role
            if ($existingUser->hasRole('faculty')) {
                echo "   ✅ User already has faculty role\n";
                
                // Check if faculty record exists
                if (!$existingUser->faculty) {
                    // Create faculty record
                    $facultyNo = 'FAC' . str_pad($facultyCounter++, 3, '0', STR_PAD_LEFT);
                    Faculty::create([
                        'user_id' => $existingUser->id,
                        'department_id' => $department->id,
                        'faculty_no' => $facultyNo,
                        'is_supervisor' => true, // All these are project supervisors
                    ]);
                    echo "   ✅ Created faculty record for existing user\n";
                } else {
                    echo "   ✅ Faculty record already exists\n";
                }
            } else {
                // Add faculty role
                $existingUser->roles()->syncWithoutDetaching([$facultyRole->id]);
                echo "   ✅ Added faculty role to existing user\n";
                
                // Create faculty record if it doesn't exist
                if (!$existingUser->faculty) {
                    $facultyNo = 'FAC' . str_pad($facultyCounter++, 3, '0', STR_PAD_LEFT);
                    Faculty::create([
                        'user_id' => $existingUser->id,
                        'department_id' => $department->id,
                        'faculty_no' => $facultyNo,
                        'is_supervisor' => true,
                    ]);
                    echo "   ✅ Created faculty record\n";
                }
            }
            
            // Verify password hash
            $existingUser->refresh();
            if (Hash::check($defaultPassword, $existingUser->password)) {
                echo "   ✅ Password hash verified\n";
            } else {
                echo "   ⚠️  Warning: Password verification failed - attempting manual fix\n";
                // Force password hash if verification failed
                $existingUser->update([
                    'password' => Hash::make($defaultPassword)
                ]);
                $existingUser->refresh();
                if (Hash::check($defaultPassword, $existingUser->password)) {
                    echo "   ✅ Password hash fixed and verified\n";
                } else {
                    echo "   ❌ Error: Could not fix password hash\n";
                }
            }
        } else {
            // Create new user using transaction to ensure data integrity
            DB::beginTransaction();
            try {
                // Create user - pass plain password, Laravel's 'hashed' cast will handle it
                $user = User::create([
                    'full_name' => $name,
                    'email' => $email,
                    'password' => $defaultPassword, // Plain password - Laravel casts will hash it
                    'status' => 'active',
                ]);
                
                // Verify user was created
                if (!$user || !$user->id) {
                    throw new Exception("Failed to create user record");
                }
                
                // Assign faculty role
                $user->roles()->attach($facultyRole->id);
                echo "   ✅ User created: ID {$user->id}\n";
                echo "   ✅ Faculty role assigned\n";
                
                // Create faculty record
                $facultyNo = 'FAC' . str_pad($facultyCounter++, 3, '0', STR_PAD_LEFT);
                $faculty = Faculty::create([
                    'user_id' => $user->id,
                    'department_id' => $department->id,
                    'faculty_no' => $facultyNo,
                    'is_supervisor' => true, // All these are project supervisors
                ]);
                
                if (!$faculty || !$faculty->id) {
                    throw new Exception("Failed to create faculty record");
                }
                
                echo "   ✅ Faculty record created (Faculty No: {$facultyNo})\n";
                
                // Verify the user can be retrieved
                $verifyUser = User::with('roles', 'faculty')->find($user->id);
                if (!$verifyUser) {
                    throw new Exception("User verification failed - user not found after creation");
                }
                
                // Verify password hash
                $user->refresh();
                if (!Hash::check($defaultPassword, $user->password)) {
                    echo "   ⚠️  Warning: Password verification failed - attempting manual fix\n";
                    // Force password hash if verification failed
                    $user->update([
                        'password' => Hash::make($defaultPassword)
                    ]);
                    $user->refresh();
                    if (Hash::check($defaultPassword, $user->password)) {
                        echo "   ✅ Password hash fixed and verified\n";
                    } else {
                        echo "   ❌ Error: Could not fix password hash\n";
                    }
                } else {
                    echo "   ✅ Password hash verified\n";
                }
                
                DB::commit();
                $createdCount++;
            } catch (Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } else {
            $updatedCount++;
        }
        
        echo "\n";
        
    } catch (Exception $e) {
        $errorCount++;
        echo "   ❌ Error: " . $e->getMessage() . "\n";
        echo "   Stack trace: " . $e->getTraceAsString() . "\n\n";
    }
}

echo "=== Faculty Users Creation Complete ===\n";
echo "\nSummary:\n";
echo "- Users created: {$createdCount}\n";
echo "- Users updated: {$updatedCount}\n";
echo "- Errors encountered: {$errorCount}\n";
echo "- Default password for all users: {$defaultPassword}\n";
echo "- Department: {$department->name}\n";
echo "- All users are set as project supervisors (is_supervisor = true)\n";
echo "- Faculty role has 'projects.create' permission (equivalent to 'add_project')\n";
echo "- 'login' permission is not needed (all authenticated users can login)\n";

// Final verification - list all created faculty users
echo "\n=== Verification: Listing Faculty Users ===\n";
$facultyUsersInDb = User::whereHas('roles', function($query) {
    $query->where('name', 'faculty');
})->whereIn('email', array_column($facultyUsers, 'email'))->get();

if ($facultyUsersInDb->count() > 0) {
    echo "Found {$facultyUsersInDb->count()} faculty users in database:\n";
    foreach ($facultyUsersInDb as $facultyUser) {
        echo "  - ID: {$facultyUser->id}, Name: {$facultyUser->full_name}, Email: {$facultyUser->email}\n";
        echo "    Status: {$facultyUser->status}, Roles: " . $facultyUser->roles->pluck('name')->implode(', ') . "\n";
        if ($facultyUser->faculty) {
            echo "    Faculty No: {$facultyUser->faculty->faculty_no}, Supervisor: " . ($facultyUser->faculty->is_supervisor ? 'Yes' : 'No') . "\n";
        }
        // Test password
        if (Hash::check($defaultPassword, $facultyUser->password)) {
            echo "    ✅ Password verified: 'password' works\n";
        } else {
            echo "    ⚠️  Password verification failed\n";
        }
    }
} else {
    echo "⚠️  Warning: No faculty users found in database with the provided emails.\n";
    echo "Please check if the script ran successfully.\n";
}

