<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Schema;

echo "=== Role API Diagnostic ===\n\n";

// Check if migration columns exist
echo "1. Checking database schema...\n";
$rolesTable = Schema::getColumnListing('roles');
echo "   Roles table columns: " . implode(', ', $rolesTable) . "\n";

if (in_array('is_system_role', $rolesTable)) {
    echo "   ✓ is_system_role column exists\n";
} else {
    echo "   ✗ is_system_role column MISSING - Migration not run!\n";
}

$permissionsTable = Schema::getColumnListing('permissions');
echo "   Permissions table columns: " . implode(', ', $permissionsTable) . "\n";

if (in_array('category', $permissionsTable)) {
    echo "   ✓ category column exists\n";
} else {
    echo "   ✗ category column MISSING - Migration not run!\n";
}

$permissionRoleTable = Schema::getColumnListing('permission_role');
echo "   Permission_role table columns: " . implode(', ', $permissionRoleTable) . "\n";

if (in_array('scope', $permissionRoleTable)) {
    echo "   ✓ scope column exists\n";
} else {
    echo "   ✗ scope column MISSING - Migration not run!\n";
}

// Check permissions count
echo "\n2. Checking permissions...\n";
try {
    $permissionCount = Permission::count();
    echo "   Total permissions: $permissionCount\n";
    if ($permissionCount > 0) {
        $sample = Permission::first();
        echo "   Sample permission: {$sample->code} (category: " . ($sample->category ?? 'NULL') . ")\n";
    }
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

// Check roles count
echo "\n3. Checking roles...\n";
try {
    $roleCount = Role::count();
    echo "   Total roles: $roleCount\n";
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== End Diagnostic ===\n";

