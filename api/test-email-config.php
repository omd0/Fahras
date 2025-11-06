<?php

/**
 * Test script to verify Resend email configuration
 * 
 * Usage: php test-email-config.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Resend Email Configuration Test ===\n\n";

// Check if config file exists
$configPath = __DIR__ . '/config/resend.php';
if (!file_exists($configPath)) {
    echo "❌ ERROR: Config file not found at: $configPath\n";
    exit(1);
}
echo "✅ Config file exists\n";

// Check environment variables
echo "\n--- Environment Variables ---\n";
$resendApiKey = env('RESEND_API_KEY');
$resendFromEmail = env('RESEND_FROM_EMAIL');
$resendFromName = env('RESEND_FROM_NAME');

echo "RESEND_API_KEY: " . ($resendApiKey ? "✅ Set (length: " . strlen($resendApiKey) . ")" : "❌ Not set") . "\n";
echo "RESEND_FROM_EMAIL: " . ($resendFromEmail ? "✅ Set ($resendFromEmail)" : "❌ Not set") . "\n";
echo "RESEND_FROM_NAME: " . ($resendFromName ? "✅ Set ($resendFromName)" : "❌ Not set") . "\n";

// Check config values
echo "\n--- Config Values ---\n";
$configApiKey = config('resend.api_key');
$configFromEmail = config('resend.from.email');
$configFromName = config('resend.from.name');

echo "config('resend.api_key'): " . ($configApiKey ? "✅ Set (length: " . strlen($configApiKey) . ")" : "❌ Not set") . "\n";
echo "config('resend.from.email'): " . ($configFromEmail ? "✅ Set ($configFromEmail)" : "❌ Not set") . "\n";
echo "config('resend.from.name'): " . ($configFromName ? "✅ Set ($configFromName)" : "❌ Not set") . "\n";

// Validate configuration
echo "\n--- Validation ---\n";
$errors = [];

if (empty($configApiKey)) {
    $errors[] = "RESEND_API_KEY is not configured";
} elseif (strlen($configApiKey) < 10) {
    $errors[] = "RESEND_API_KEY appears to be invalid (too short)";
}

if (empty($configFromEmail)) {
    $errors[] = "RESEND_FROM_EMAIL is not configured";
} elseif (!filter_var($configFromEmail, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "RESEND_FROM_EMAIL is not a valid email address: $configFromEmail";
}

if (empty($configFromName)) {
    $errors[] = "RESEND_FROM_NAME is not configured";
}

if (empty($errors)) {
    echo "✅ All configuration checks passed!\n";
    echo "\n--- Summary ---\n";
    echo "API Key: Configured\n";
    echo "From Email: $configFromEmail\n";
    echo "From Name: $configFromName\n";
    echo "\n✅ Email configuration is valid and ready to use.\n";
    exit(0);
} else {
    echo "❌ Configuration errors found:\n";
    foreach ($errors as $error) {
        echo "  - $error\n";
    }
    echo "\n--- Troubleshooting ---\n";
    echo "1. Make sure your .env file has RESEND_API_KEY set\n";
    echo "2. Make sure your .env file has RESEND_FROM_EMAIL set\n";
    echo "3. Make sure your .env file has RESEND_FROM_NAME set\n";
    echo "4. Clear config cache: php artisan config:clear\n";
    echo "5. Make sure the from email is verified in your Resend account\n";
    exit(1);
}

