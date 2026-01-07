<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class OptionalAuthSanctum
{
    /**
     * Handle an incoming request.
     *
     * This middleware will attempt to authenticate the user via Sanctum if a token is present.
     * If successful, the user will be available in the request.
     * If not, the request will proceed without a user (guest).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if Authorization header is present
        if ($request->bearerToken() || $request->header('Authorization')) {
            try {
                // Use Sanctum's token resolution to authenticate the user
                // This will find and validate the token if present
                $token = $request->bearerToken();
                
                if ($token) {
                    // Find the personal access token
                    $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                    
                    if ($accessToken) {
                        // Get the user associated with the token
                        $user = $accessToken->tokenable;
                        
                        if ($user) {
                            // Set the authenticated user for the request
                            // This ensures request()->user() works in controllers
                            Auth::setUser($user);
                            $request->setUserResolver(function () use ($user) {
                                return $user;
                            });
                        }
                    }
                }
            } catch (\Exception $e) {
                // If authentication fails, just continue without a user
                // This allows the request to proceed as a guest
            }
        }

        return $next($request);
    }
}

