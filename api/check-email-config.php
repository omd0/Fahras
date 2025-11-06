<?php

/**
 * Email Configuration Checker and Setup Guide
 * 
 * This script helps you verify and configure your email settings.
 * 
 * Usage: 
 *   php check-email-config.php
 *   OR
 *   docker compose exec php php check-email-config.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "\n";
echo "═══════════════════════════════════════════════════════════════\n";
echo "  Email Configuration Checker for Fahras\n";
echo "═══════════════════════════════════════════════════════════════\n";
echo "\n";

// Check if .env file exists
$envPath = __DIR__ . '/.env';
if (!file_exists($envPath)) {
    echo "❌ ERROR: .env file not found at: $envPath\n";
    echo "   Please copy env.example to .env first:\n";
    echo "   cp env.example .env\n";
    exit(1);
}
echo "✅ .env file exists\n";

// Read .env file
$envContent = file_get_contents($envPath);

// Check email configuration
echo "\n--- Current Email Configuration ---\n";

$mailSettings = [
    'MAIL_MAILER' => null,
    'MAIL_HOST' => null,
    'MAIL_PORT' => null,
    'MAIL_USERNAME' => null,
    'MAIL_PASSWORD' => null,
    'MAIL_ENCRYPTION' => null,
    'MAIL_FROM_ADDRESS' => null,
    'MAIL_FROM_NAME' => null,
];

$issues = [];
$warnings = [];

foreach ($mailSettings as $key => $value) {
    // Extract value from .env file
    if (preg_match('/^' . preg_quote($key, '/') . '=(.*)$/m', $envContent, $matches)) {
        $value = trim($matches[1], ' "\'');
        $mailSettings[$key] = $value;
        
        // Check for placeholder values
        $placeholders = [
            'yourgmail@gmail.com',
            'your_app_password',
            'your_email@gmail.com',
            'your_email@example.com',
        ];
        
        $isPlaceholder = false;
        foreach ($placeholders as $placeholder) {
            if (stripos($value, $placeholder) !== false || $value === $placeholder) {
                $isPlaceholder = true;
                break;
            }
        }
        
        if (empty($value) || $isPlaceholder) {
            $issues[] = "$key is not configured (still has placeholder value: $value)";
            echo "❌ $key: NOT CONFIGURED (placeholder: $value)\n";
        } else {
            if ($key === 'MAIL_PASSWORD') {
                echo "✅ $key: SET (hidden)\n";
            } elseif ($key === 'MAIL_USERNAME') {
                echo "✅ $key: " . substr($value, 0, 3) . "***" . substr($value, -4) . "\n";
            } else {
                echo "✅ $key: $value\n";
            }
        }
    } else {
        $issues[] = "$key is missing from .env file";
        echo "❌ $key: MISSING\n";
    }
}

// Check loaded config values
echo "\n--- Loaded Configuration (from Laravel) ---\n";
$mailer = config('mail.default');
$host = config('mail.mailers.smtp.host');
$port = config('mail.mailers.smtp.port');
$username = config('mail.mailers.smtp.username');
$password = config('mail.mailers.smtp.password');
$encryption = config('mail.mailers.smtp.encryption');
$fromEmail = config('mail.from.address');
$fromName = config('mail.from.name');

echo "Mailer: " . ($mailer ?: 'NOT SET') . "\n";
echo "Host: " . ($host ?: 'NOT SET') . "\n";
echo "Port: " . ($port ?: 'NOT SET') . "\n";
echo "Username: " . ($username ? substr($username, 0, 3) . "***" . substr($username, -4) : 'NOT SET') . "\n";
echo "Password: " . ($password ? 'SET' : 'NOT SET') . "\n";
echo "Encryption: " . ($encryption ?: 'NOT SET') . "\n";
echo "From Email: " . ($fromEmail ?: 'NOT SET') . "\n";
echo "From Name: " . ($fromName ?: 'NOT SET') . "\n";

// Validate email format
if ($fromEmail && !filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
    $issues[] = "MAIL_FROM_ADDRESS is not a valid email address: $fromEmail";
}

// Summary
echo "\n--- Summary ---\n";
if (empty($issues)) {
    echo "✅ All email settings are configured!\n";
    echo "\n⚠️  If you're still getting authentication errors:\n";
    echo "   1. For Gmail, make sure you're using an App Password (not your regular password)\n";
    echo "   2. Make sure 2-Step Verification is enabled on your Google account\n";
    echo "   3. Clear config cache: php artisan config:clear\n";
    echo "   4. Try sending a test email\n";
} else {
    echo "❌ Configuration issues found:\n";
    foreach ($issues as $issue) {
        echo "   - $issue\n";
    }
    
    echo "\n--- How to Fix ---\n";
    echo "1. Open your .env file: api/.env\n";
    echo "2. Update the following settings:\n\n";
    
    if (empty($mailSettings['MAIL_USERNAME']) || $mailSettings['MAIL_USERNAME'] === 'yourgmail@gmail.com') {
        echo "   MAIL_USERNAME=your_actual_email@gmail.com\n";
    }
    if (empty($mailSettings['MAIL_PASSWORD']) || $mailSettings['MAIL_PASSWORD'] === 'your_app_password') {
        echo "   MAIL_PASSWORD=your_app_password_here\n";
    }
    if (empty($mailSettings['MAIL_FROM_ADDRESS']) || $mailSettings['MAIL_FROM_ADDRESS'] === 'yourgmail@gmail.com') {
        echo "   MAIL_FROM_ADDRESS=your_actual_email@gmail.com\n";
    }
    
    echo "\n3. For Gmail, you need to:\n";
    echo "   a. Enable 2-Step Verification: https://myaccount.google.com/security\n";
    echo "   b. Generate an App Password: https://myaccount.google.com/apppasswords\n";
    echo "   c. Use that App Password (16 characters) for MAIL_PASSWORD\n";
    echo "\n4. After updating .env, clear the config cache:\n";
    echo "   docker compose exec php php artisan config:clear\n";
    echo "   OR\n";
    echo "   php artisan config:clear\n";
}

echo "\n--- Test Your Configuration ---\n";
echo "Visit: http://localhost/api/test-email-config\n";
echo "This will show you a detailed status of your email configuration.\n";

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "\n";

exit(empty($issues) ? 0 : 1);

