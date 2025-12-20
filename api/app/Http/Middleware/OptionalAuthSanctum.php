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
            // Attempt to authenticate using Sanctum guard
            if (Auth::guard('sanctum')->check()) {
                // Set the authenticated user for the request
                Auth::setUser(Auth::guard('sanctum')->user());
            }
        }

        return $next($request);
    }
}

