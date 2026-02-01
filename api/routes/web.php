<?php

use Illuminate\Support\Facades\Route;

// Health check route for CranL/Load Balancer
Route::get('/', function () {
    return response()->json(['status' => 'ok', 'service' => 'Fahras API']);
});

// Root route is handled by React app via Nginx proxy
// All API routes are in api.php
