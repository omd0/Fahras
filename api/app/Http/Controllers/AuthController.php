<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\EmailVerification;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
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

    public function login(Request $request): JsonResponse
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

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $userData = $user->load('roles')->toArray();
        
        return response()->json([
            'user' => $userData
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
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

    public function uploadAvatar(Request $request): JsonResponse
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
        if ($user->avatar_url && \Storage::disk()->exists($user->avatar_url)) {
            \Storage::disk()->delete($user->avatar_url);
        }

        // Store new avatar
        $avatarPath = $request->file('avatar')->store('avatars');
        $user->update(['avatar_url' => $avatarPath]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => \Storage::disk()->url($avatarPath),
            'user' => $user->load('roles')
        ]);
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if ($user->avatar_url && \Storage::disk()->exists($user->avatar_url)) {
            \Storage::disk()->delete($user->avatar_url);
        }
        
        $user->update(['avatar_url' => null]);

        return response()->json([
            'message' => 'Avatar deleted successfully',
            'user' => $user->load('roles')
        ]);
    }

    /**
     * Send email verification code
     */
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(trim($request->email));

        // Check if user exists
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Check if already verified
        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified'
            ], 400);
        }

        // Delete old verification codes for this email
        EmailVerification::where('email', $email)->delete();

        // Generate 6-digit code and magic token
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $magicToken = Str::random(64);

        // Create verification record (expires in 15 minutes)
        EmailVerification::create([
            'email' => $email,
            'code' => $code,
            'magic_token' => $magicToken,
            'expires_at' => now()->addMinutes(15),
        ]);

        // TODO: Send email with verification code and magic link
        // Magic link: {FRONTEND_URL}/verify-email?token={magicToken}
        // For now, just log it (in production, use Mail::send)
        \Log::info("Verification code for {$email}: {$code}");
        \Log::info("Magic link for {$email}: " . env('FRONTEND_URL', 'http://localhost:3000') . "/verify-email?token={$magicToken}");

        return response()->json([
            'message' => 'Verification code sent to your email',
            'debug_code' => config('app.debug') ? $code : null, // Only show in debug mode
            'debug_magic_link' => config('app.debug') ? env('FRONTEND_URL', 'http://localhost:3000') . "/verify-email?token={$magicToken}" : null,
        ]);
    }

    /**
     * Verify email with code
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(trim($request->email));

        // Find valid verification code
        $verification = EmailVerification::where('email', $email)
            ->where('code', $request->code)
            ->valid()
            ->first();

        if (!$verification) {
            return response()->json([
                'message' => 'Invalid or expired verification code'
            ], 400);
        }

        // Find user and mark as verified
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $user->update(['email_verified_at' => now()]);

        // Refresh user to get updated email_verified_at
        $user->refresh();

        // Delete verification code
        $verification->delete();

        // Generate a new token for the user (ensures they can access protected routes)
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully',
            'user' => $user->load('roles'),
            'token' => $token
        ]);
    }

    /**
     * Verify email with magic link token
     */
    public function verifyMagicLink(string $magicToken): JsonResponse
    {
        // Find valid verification record with magic token
        $verification = EmailVerification::where('magic_token', $magicToken)
            ->valid()
            ->first();

        if (!$verification) {
            return response()->json([
                'message' => 'Invalid or expired verification link'
            ], 400);
        }

        // Find user and mark as verified
        $user = User::whereRaw('LOWER(email) = ?', [strtolower($verification->email)])->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Check if already verified
        if ($user->email_verified_at) {
            // Delete verification record
            $verification->delete();

            return response()->json([
                'message' => 'Email already verified',
                'user' => $user->load('roles')
            ]);
        }

        $user->update(['email_verified_at' => now()]);

        // Refresh user to get updated email_verified_at
        $user->refresh();

        // Delete verification record
        $verification->delete();

        // Generate new token for the user
        $authToken = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully',
            'user' => $user->load('roles'),
            'token' => $authToken,
            'token_type' => 'Bearer'
        ]);
    }

    /**
     * Resend email verification code (for authenticated users)
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if already verified
        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified'
            ], 400);
        }

        // Delete old verification codes
        EmailVerification::where('email', $user->email)->delete();

        // Generate 6-digit code and magic token
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $magicToken = Str::random(64);

        // Create verification record (expires in 15 minutes)
        EmailVerification::create([
            'email' => $user->email,
            'code' => $code,
            'magic_token' => $magicToken,
            'expires_at' => now()->addMinutes(15),
        ]);

        // TODO: Send email with verification code and magic link
        \Log::info("Verification code for {$user->email}: {$code}");
        \Log::info("Magic link for {$user->email}: " . env('FRONTEND_URL', 'http://localhost:3000') . "/verify-email?token={$magicToken}");

        return response()->json([
            'message' => 'Verification code sent to your email',
            'debug_code' => config('app.debug') ? $code : null,
            'debug_magic_link' => config('app.debug') ? env('FRONTEND_URL', 'http://localhost:3000') . "/verify-email?token={$magicToken}" : null,
        ]);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(trim($request->email));

        // Check if user exists
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user) {
            // Don't reveal if user exists or not for security
            return response()->json([
                'message' => 'If an account exists with this email, a password reset link has been sent'
            ]);
        }

        // Delete old password reset tokens for this email
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Generate secure token
        $token = Str::random(64);

        // Create password reset token record
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // TODO: Send email with reset link
        // Reset link format: frontend_url/reset-password?token={token}&email={email}
        \Log::info("Password reset token for {$email}: {$token}");

        return response()->json([
            'message' => 'If an account exists with this email, a password reset link has been sent',
            'debug_token' => config('app.debug') ? $token : null, // Only show in debug mode
        ]);
    }

    /**
     * Reset password with token
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(trim($request->email));

        // Find password reset token
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Invalid password reset token'
            ], 400);
        }

        // Check if token matches
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'message' => 'Invalid password reset token'
            ], 400);
        }

        // Check if token has expired (60 minutes)
        $createdAt = \Carbon\Carbon::parse($resetRecord->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            // Delete expired token
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            
            return response()->json([
                'message' => 'Password reset token has expired'
            ], 400);
        }

        // Find user and update password
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $user->update(['password' => $request->password]);

        // Delete password reset token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully'
        ]);
    }

    /**
     * Change password for authenticated user
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Update password
        $user->update(['password' => $request->new_password]);

        // Optionally revoke all other tokens (keep current session)
        // $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Logout from all devices (revoke all tokens)
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Delete all tokens for this user
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Logged out from all devices successfully'
        ]);
    }
}
