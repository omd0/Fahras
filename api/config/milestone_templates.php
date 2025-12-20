<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Milestone Template Steps
    |--------------------------------------------------------------------------
    |
    | These are the default steps that will be created when a new milestone
    | template is created without any items provided. You can customize these
    | per program or department by modifying this configuration.
    |
    */

    'default_steps' => [
        [
            'title' => 'Start',
            'description' => 'Project initiation and setup',
            'estimated_days' => 0,
            'is_required' => true,
            'allowed_roles' => ['admin', 'faculty', 'student'],
            'allowed_actions' => ['start', 'view'],
        ],
        [
            'title' => 'Submit',
            'description' => 'Submit project for review',
            'estimated_days' => 30,
            'is_required' => true,
            'allowed_roles' => ['admin', 'faculty', 'student'],
            'allowed_actions' => ['view', 'edit'],
        ],
        [
            'title' => 'Review',
            'description' => 'Review and evaluation phase',
            'estimated_days' => 14,
            'is_required' => true,
            'allowed_roles' => ['admin', 'faculty'],
            'allowed_actions' => ['view', 'edit', 'complete'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Valid Roles
    |--------------------------------------------------------------------------
    |
    | List of valid roles that can be assigned to milestone steps.
    |
    */

    'valid_roles' => ['admin', 'faculty', 'student'],

    /*
    |--------------------------------------------------------------------------
    | Valid Actions
    |--------------------------------------------------------------------------
    |
    | List of valid actions that can be assigned to milestone steps.
    |
    */

    'valid_actions' => ['start', 'pause', 'extend', 'view', 'edit', 'complete'],
];

