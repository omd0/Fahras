<?php

namespace App\Constants;

class ProjectStatus
{
    public const DRAFT = 'draft';
    public const SUBMITTED = 'submitted';
    public const UNDER_REVIEW = 'under_review';
    public const APPROVED = 'approved';
    public const REJECTED = 'rejected';
    public const COMPLETED = 'completed';

    /**
     * Get all available project statuses
     *
     * @return array
     */
    public static function all(): array
    {
        return [
            self::DRAFT,
            self::SUBMITTED,
            self::UNDER_REVIEW,
            self::APPROVED,
            self::REJECTED,
            self::COMPLETED,
        ];
    }

    /**
     * Get validation rule string for project statuses
     *
     * @return string
     */
    public static function validationRule(): string
    {
        return 'in:' . implode(',', self::all());
    }

    /**
     * Check if a status is valid
     *
     * @param string $status
     * @return bool
     */
    public static function isValid(string $status): bool
    {
        return in_array($status, self::all());
    }
}
