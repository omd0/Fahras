<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Faculty;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get all users with their roles
     */
    public function index(): JsonResponse
    {
        $users = User::with('roles')->get()->map(function ($user) {
            // Add legacy status to user data
            $userArray = $user->toArray();
            $userArray['is_legacy_user'] = $user->isLegacyUser();
            return $userArray;
        });
        return response()->json($users);
    }

    /**
     * Get all roles
     */
    public function getRoles(): JsonResponse
    {
        $roles = Role::all();
        return response()->json($roles);
    }

    /**
     * Create a new user
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
            'role_ids' => 'required|array|min:1',
            'role_ids.*' => 'exists:roles,id',
            'status' => 'nullable|string|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Default password if not provided
            $password = $request->password ?? 'password';
            
            // Create user
            $user = User::create([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($password),
                'status' => $request->status ?? 'active',
            ]);

            // Assign roles
            $user->roles()->attach($request->role_ids);

            // If faculty role is assigned, create faculty record
            $facultyRole = Role::where('name', 'faculty')->first();
            if ($facultyRole && in_array($facultyRole->id, $request->role_ids)) {
                Faculty::create([
                    'user_id' => $user->id,
                    'department_id' => $request->department_id ?? null,
                    'faculty_no' => $request->faculty_no ?? null,
                    'is_supervisor' => $request->is_supervisor ?? true,
                ]);
            }

            DB::commit();

            $userData = $user->load('roles', 'faculty')->toArray();
            $userData['is_legacy_user'] = $user->isLegacyUser();
            
            return response()->json([
                'message' => 'User created successfully',
                'user' => $userData
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a user
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role_ids' => 'sometimes|required|array|min:1',
            'role_ids.*' => 'exists:roles,id',
            'status' => 'nullable|string|in:active,inactive,suspended',
            'department_id' => 'nullable|exists:departments,id',
            'faculty_no' => 'nullable|string|max:255',
            'is_supervisor' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update user fields
            $updateData = [];
            if ($request->has('full_name')) {
                $updateData['full_name'] = $request->full_name;
            }
            if ($request->has('email')) {
                $updateData['email'] = $request->email;
            }
            // Only hash password if it's provided and not empty
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }

            if (!empty($updateData)) {
                $user->update($updateData);
            }

            // Update roles if provided
            if ($request->has('role_ids')) {
                $user->roles()->sync($request->role_ids);

                // Handle faculty record
                $facultyRole = Role::where('name', 'faculty')->first();
                $hasFacultyRole = $facultyRole && in_array($facultyRole->id, $request->role_ids);

                if ($hasFacultyRole && !$user->faculty) {
                    // Create faculty record if it doesn't exist
                    // Get department_id - use provided one, or first department, or create a default
                    $departmentId = $request->department_id;
                    if (!$departmentId) {
                        $firstDepartment = \App\Models\Department::first();
                        if ($firstDepartment) {
                            $departmentId = $firstDepartment->id;
                        } else {
                            throw new \Exception('No department found. Please create a department first.');
                        }
                    }

                    // Generate faculty_no if not provided
                    $facultyNo = $request->faculty_no;
                    if (!$facultyNo) {
                        // Generate unique faculty number based on user ID
                        $facultyNo = 'FAC' . str_pad($user->id, 4, '0', STR_PAD_LEFT);
                        // Ensure uniqueness
                        $counter = 1;
                        while (Faculty::where('faculty_no', $facultyNo)->exists()) {
                            $facultyNo = 'FAC' . str_pad($user->id, 4, '0', STR_PAD_LEFT) . '-' . $counter;
                            $counter++;
                        }
                    }

                    Faculty::create([
                        'user_id' => $user->id,
                        'department_id' => $departmentId,
                        'faculty_no' => $facultyNo,
                        'is_supervisor' => $request->has('is_supervisor') ? (bool)$request->is_supervisor : true,
                    ]);
                } elseif (!$hasFacultyRole && $user->faculty) {
                    // Delete faculty record if faculty role is removed
                    $user->faculty()->delete();
                } elseif ($hasFacultyRole && $user->faculty) {
                    // Update faculty record if it exists
                    $facultyUpdateData = [];
                    if ($request->has('department_id')) {
                        $facultyUpdateData['department_id'] = $request->department_id;
                    }
                    if ($request->filled('faculty_no')) {
                        $facultyUpdateData['faculty_no'] = $request->faculty_no;
                    }
                    if ($request->has('is_supervisor')) {
                        $facultyUpdateData['is_supervisor'] = (bool)$request->is_supervisor;
                    }
                    
                    if (!empty($facultyUpdateData)) {
                        $user->faculty->update($facultyUpdateData);
                    }
                }
            }

            DB::commit();

            $userData = $user->fresh()->load('roles', 'faculty')->toArray();
            $userData['is_legacy_user'] = $user->fresh()->isLegacyUser();
            
            return response()->json([
                'message' => 'User updated successfully',
                'user' => $userData
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            Log::error('Database error updating user: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update user: Database error',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while updating the user'
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating user: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update user',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while updating the user'
            ], 500);
        }
    }

    /**
     * Delete a user
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle user status
     */
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update(['status' => $request->status]);

        $userData = $user->load('roles')->toArray();
        $userData['is_legacy_user'] = $user->isLegacyUser();
        
        return response()->json([
            'message' => 'User status updated successfully',
            'user' => $userData
        ]);
    }
}

