<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
         // Register optional authentication middleware
         $middleware->alias([
             'auth.optional' => \App\Http\Middleware\OptionalAuthSanctum::class,
         ]);

         // Trust proxies for PaaS deployments
         $middleware->trustProxies(
             at: '*',
             headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR |
                      \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST |
                      \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT |
                      \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO |
                      \Illuminate\Http\Request::HEADER_X_FORWARDED_AWS_ELB
         );
     })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
