<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as AI providers, Mailgun, Postmark, AWS and more. This file provides the
    | de facto location for this type of information, allowing packages
    | to have a conventional file to locate the various service credentials.
    |
    */

    'ai' => [
        'provider' => env('AI_PROVIDER', 'gemini'), // gemini, openai, claude, or fallback
        'api_key' => env('AI_API_KEY'),
        'model' => env('AI_MODEL', 'gemini-2.5-pro'),
        'timeout' => env('AI_TIMEOUT', 60),
        'enabled' => env('AI_ENABLED', false),
        'auto_analyze' => env('AI_AUTO_ANALYZE', false), // Auto-analyze new projects
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-2.5-pro'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4-turbo-preview'),
        'organization' => env('OPENAI_ORGANIZATION'),
    ],

    'claude' => [
        'api_key' => env('CLAUDE_API_KEY'),
        'model' => env('CLAUDE_MODEL', 'claude-3-sonnet-20240229'),
    ],

];
