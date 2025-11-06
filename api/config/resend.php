<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Resend API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Resend email service used for sending transactional emails.
    |
    */

    'api_key' => env('RESEND_API_KEY', null),

    'from' => [
        'email' => env('RESEND_FROM_EMAIL', 'noreply@fahras.edu'),
        'name' => env('RESEND_FROM_NAME', 'Fahras'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Resend API Endpoint
    |--------------------------------------------------------------------------
    |
    | The Resend API endpoint for sending emails.
    |
    */

    'api_endpoint' => env('RESEND_API_ENDPOINT', 'https://api.resend.com/emails'),

];

