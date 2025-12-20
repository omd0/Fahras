<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleController extends Controller
{
    /**
     * Get all roles with user and permission counts
     */
    public function index()
    {
        $roles = Role::withCount(['users', 'permissions'])
            ->with('permissions')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'is_system_role' => $role->is_system_role ?? false,
                    'is_template' => $role->is_template ?? false,
                    'user_count' => $role->users_count,
                    'permission_count' => $role->permissions_count,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'code' => $permission->code,
                            'category' => $permission->category,
                            'description' => $permission->description,
                            'scope' => $permission->pivot->scope ?? 'all',
                        ];
                    }),
                ];
            });

        return response()->json($roles);
    }

    /**
     * Get all permissions
     */
    public function getPermissions()
    {
        $permissions = Permission::all()->map(function ($permission) {
            return [
                'id' => $permission->id,
                'code' => $permission->code,
                'name' => $permission->name ?? $permission->code,
                'category' => $permission->category ?? 'System',
                'description' => $permission->description,
            ];
        });

        return response()->json($permissions);
    }

    /**
     * Create a new role
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*.permission_id' => 'required|exists:permissions,id',
            'permissions.*.scope' => 'required|in:all,department,own,none',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $role = Role::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_system_role' => false,
                'is_template' => false,
            ]);

            // Attach permissions with scopes
            if ($request->has('permissions')) {
                $permissionsData = [];
                foreach ($request->permissions as $perm) {
                    if ($perm['scope'] !== 'none') {
                        $permissionsData[$perm['permission_id']] = ['scope' => $perm['scope']];
                    }
                }
                $role->permissions()->attach($permissionsData);
            }

            DB::commit();

            $role->load(['permissions', 'users']);
            $role->loadCount(['users', 'permissions']);

            return response()->json([
                'message' => 'Role created successfully',
                'role' => $this->formatRole($role)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating role: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create role',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Update a role
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        // Prevent editing system roles
        if ($role->is_system_role) {
            return response()->json([
                'message' => 'Cannot modify system roles'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $id,
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*.permission_id' => 'required|exists:permissions,id',
            'permissions.*.scope' => 'required|in:all,department,own,none',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update role fields
            if ($request->has('name')) {
                $role->name = $request->name;
            }
            if ($request->has('description')) {
                $role->description = $request->description;
            }
            $role->save();

            // Update permissions
            if ($request->has('permissions')) {
                $permissionsData = [];
                foreach ($request->permissions as $perm) {
                    if ($perm['scope'] !== 'none') {
                        $permissionsData[$perm['permission_id']] = ['scope' => $perm['scope']];
                    }
                }
                $role->permissions()->sync($permissionsData);
            }

            DB::commit();

            $role->load(['permissions', 'users']);
            $role->loadCount(['users', 'permissions']);

            return response()->json([
                'message' => 'Role updated successfully',
                'role' => $this->formatRole($role)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating role: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update role',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Delete a role
     */
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);

            // Prevent deleting system roles
            if ($role->is_system_role) {
                return response()->json([
                    'message' => 'Cannot delete system roles'
                ], 403);
            }

            // Check if role has users
            if ($role->users()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete role that is assigned to users'
                ], 422);
            }

            $role->delete();

            return response()->json([
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting role: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete role',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Format role for response
     */
    private function formatRole($role)
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'description' => $role->description,
            'is_system_role' => $role->is_system_role ?? false,
            'is_template' => $role->is_template ?? false,
            'user_count' => $role->users_count ?? $role->users()->count(),
            'permission_count' => $role->permissions_count ?? $role->permissions()->count(),
            'permissions' => $role->permissions->map(function ($permission) use ($role) {
                $pivot = $role->permissions()->where('permission_id', $permission->id)->first()?->pivot;
                return [
                    'id' => $permission->id,
                    'code' => $permission->code,
                    'category' => $permission->category,
                    'description' => $permission->description,
                    'scope' => $pivot->scope ?? 'all',
                ];
            }),
        ];
    }
}

