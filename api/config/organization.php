<?php

/**
 * Organization Configuration
 * 
 * This configuration file loads values from organization-config.yml
 * and makes them available throughout the Laravel application.
 */

use Symfony\Component\Yaml\Yaml;

// Path to the organization config YAML file
$configPath = base_path('../organization-config.yml');

// Try to load from YAML, fallback to defaults if file doesn't exist
$config = [];
if (file_exists($configPath)) {
    try {
        $config = Yaml::parseFile($configPath);
    } catch (\Exception $e) {
        \Log::warning('Failed to load organization-config.yml: ' . $e->getMessage());
    }
}

// Helper function to safely get nested config values
$get = function ($key, $default = null) use ($config) {
    $keys = explode('.', $key);
    $value = $config;
    
    foreach ($keys as $k) {
        if (!isset($value[$k])) {
            return $default;
        }
        $value = $value[$k];
    }
    
    return $value;
};

return [
    /*
    |--------------------------------------------------------------------------
    | Organization Information
    |--------------------------------------------------------------------------
    */
    'organization' => [
        'name' => $get('organization.name', 'Fahras-Org'),
        'display_name' => [
            'en' => $get('organization.display_name.en', 'Fahras Organization'),
            'ar' => $get('organization.display_name.ar', 'منظمة فهرس'),
        ],
        'description' => [
            'en' => $get('organization.description.en', 'Fahras Project Organization'),
            'ar' => $get('organization.description.ar', 'منظمة مشروع الفهرس'),
        ],
        'slug' => $get('organization.slug', 'fahras-org'),
        'parent_organization' => [
            'name' => $get('organization.parent_organization.name', 'TVTC'),
            'display_name' => [
                'en' => $get('organization.parent_organization.display_name.en', 'Technical and Vocational Training Corporation'),
                'ar' => $get('organization.parent_organization.display_name.ar', 'المؤسسة العامة للتدريب التقني والمهني'),
            ],
            'abbreviation' => $get('organization.parent_organization.abbreviation', 'TVTC'),
            'website' => $get('organization.parent_organization.website', 'https://www.tvtc.gov.sa'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Project Information
    |--------------------------------------------------------------------------
    */
    'project' => [
        'name' => $get('project.name', 'Fahras'),
        'display_name' => [
            'en' => $get('project.display_name.en', 'Fahras'),
            'ar' => $get('project.display_name.ar', 'فهرس'),
        ],
        'description' => [
            'en' => $get('project.description.en', 'Project Management System'),
            'ar' => $get('project.description.ar', 'نظام إدارة المشاريع'),
        ],
        'full_description' => [
            'en' => $get('project.full_description.en', 'Fahras - A comprehensive project management system for technical and vocational training projects'),
            'ar' => $get('project.full_description.ar', 'فهرس - نظام شامل لإدارة مشاريع التدريب التقني والمهني'),
        ],
        'version' => $get('project.version', '1.0.0'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Contact Information
    |--------------------------------------------------------------------------
    */
    'contact' => [
        'email' => [
            'support' => $get('contact.email.support', 'support@fahras.org'),
            'info' => $get('contact.email.info', 'info@fahras.org'),
            'admin' => $get('contact.email.admin', 'admin@fahras.org'),
        ],
        'phone' => [
            'primary' => $get('contact.phone.primary', '+966-XX-XXX-XXXX'),
            'support' => $get('contact.phone.support', '+966-XX-XXX-XXXX'),
        ],
        'address' => [
            'en' => $get('contact.address.en', 'Technical and Vocational Training Corporation, Riyadh, Saudi Arabia'),
            'ar' => $get('contact.address.ar', 'المؤسسة العامة للتدريب التقني والمهني، الرياض، المملكة العربية السعودية'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | URLs
    |--------------------------------------------------------------------------
    */
    'urls' => [
        'app' => [
            'production' => $get('urls.app.production', 'https://fahras.tvtc.gov.sa'),
            'staging' => $get('urls.app.staging', 'https://staging.fahras.tvtc.gov.sa'),
            'development' => $get('urls.app.development', 'http://localhost:5173'),
        ],
        'api' => [
            'production' => $get('urls.api.production', 'https://api.fahras.tvtc.gov.sa'),
            'staging' => $get('urls.api.staging', 'https://api-staging.fahras.tvtc.gov.sa'),
            'development' => $get('urls.api.development', 'http://localhost:8000'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Legal & Compliance
    |--------------------------------------------------------------------------
    */
    'legal' => [
        'copyright' => [
            'year' => $get('legal.copyright.year', '2024'),
            'holder' => $get('legal.copyright.holder', 'Technical and Vocational Training Corporation'),
            'text' => $get('legal.copyright.text', '© 2024 Technical and Vocational Training Corporation. All rights reserved.'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Application Settings (from config)
    |--------------------------------------------------------------------------
    */
    'app' => [
        'name' => $get('app.name', env('APP_NAME', 'Fahras')),
        'name_full' => $get('app.name_full', 'Fahras Project Management System'),
        'timezone' => $get('app.timezone', 'Asia/Riyadh'),
        'locale' => [
            'default' => $get('app.locale.default', 'en'),
            'fallback' => $get('app.locale.fallback', 'en'),
            'supported' => $get('app.locale.supported', ['en', 'ar']),
        ],
        'email' => [
            'from_address' => $get('app.email.from_address', env('MAIL_FROM_ADDRESS', 'noreply@fahras.tvtc.gov.sa')),
            'from_name' => $get('app.email.from_name', env('MAIL_FROM_NAME', 'Fahras System')),
            'reply_to' => $get('app.email.reply_to', 'support@fahras.org'),
        ],
    ],
];

