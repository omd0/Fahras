<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Define allowed email domains
        $allowedDomains = ['cti.edu.sa', 'tvtc.edu.sa'];
        
        // Normalize email: lowercase and trim
        $normalizedEmail = strtolower(trim($request->email));
        
        $validator = Validator::make(array_merge($request->all(), ['email' => $normalizedEmail]), [
            'full_name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                function ($attribute, $value, $fail) {
                    $exists = User::whereRaw('LOWER(email) = ?', [strtolower($value)])->exists();
                    if ($exists) {
                        $fail('The email has already been taken.');
                    }
                },
                function ($attribute, $value, $fail) use ($allowedDomains) {
                    $emailParts = explode('@', $value);
                    if (count($emailParts) !== 2) {
                        return; // Let the 'email' rule handle invalid format
                    }
                    $domain = strtolower(trim($emailParts[1]));
                    if (!in_array($domain, $allowedDomains)) {
                        $fail('Invalid email domain.');
                    }
                },
            ],
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create the new user
            $user = User::create([
                'full_name' => $request->full_name,
                'email' => $normalizedEmail,
                'password' => $request->password,
            ]);

            // Automatically assign role based on email domain
            $emailParts = explode('@', $normalizedEmail);
            $domain = strtolower(trim($emailParts[1]));
            
            // Determine role based on domain
            $roleName = ($domain === 'cti.edu.sa') ? 'faculty' : 'student';
            $role = \App\Models\Role::where('name', $roleName)->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            DB::commit();

            $token = $user->createToken('auth_token')->plainTextToken;
            $userData = $user->load('roles')->toArray();

            return response()->json([
                'message' => 'Registration successful',
                'user' => $userData,
                'token' => $token,
                'token_type' => 'Bearer'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Registration error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred during registration.'
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Normalize email for case-insensitive login
        $credentials = $request->only('email', 'password');
        $credentials['email'] = strtolower(trim($credentials['email']));

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();
        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $userData = $user->load('roles')->toArray();

        return response()->json([
            'message' => 'Login successful',
            'user' => $userData,
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $userData = $user->load('roles')->toArray();
        
        return response()->json([
            'user' => $userData
        ]);
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        // Normalize email if provided
        $data = $request->only(['full_name', 'email']);
        if (isset($data['email'])) {
            $data['email'] = strtolower(trim($data['email']));
        }
        
        $validator = Validator::make($data, [
            'full_name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                function ($attribute, $value, $fail) use ($user) {
                    // Case-insensitive unique check (excluding current user)
                    $exists = User::whereRaw('LOWER(email) = ?', [strtolower($value)])
                        ->where('id', '!=', $user->id)
                        ->exists();
                    if ($exists) {
                        $fail('The email has already been taken.');
                    }
                },
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($data);

        $userData = $user->load('roles')->toArray();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $userData
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Delete old avatar if exists
        if ($user->avatar_url && \Storage::disk('public')->exists($user->avatar_url)) {
            \Storage::disk('public')->delete($user->avatar_url);
        }

        // Store new avatar
        $avatarPath = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_url' => $avatarPath]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => \Storage::disk('public')->url($avatarPath),
            'user' => $user->load('roles')
        ]);
    }

    public function deleteAvatar(Request $request)
    {
        $user = $request->user();
        
        if ($user->avatar_url && \Storage::disk('public')->exists($user->avatar_url)) {
            \Storage::disk('public')->delete($user->avatar_url);
        }
        
        $user->update(['avatar_url' => null]);

        return response()->json([
            'message' => 'Avatar deleted successfully',
            'user' => $user->load('roles')
        ]);
    }
}
