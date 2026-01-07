<?php

namespace App\Constants;

class ApprovalStatus
{
    public const PENDING = 'pending';
    public const APPROVED = 'approved';
    public const REJECTED = 'rejected';
    public const HIDDEN = 'hidden';
    public const NEEDS_REVISION = 'needs_revision';

    /**
     * Get all available approval statuses
     *
     * @return array
     */
    public static function all(): array
    {
        return [
            self::PENDING,
            self::APPROVED,
            self::REJECTED,
            self::HIDDEN,
            self::NEEDS_REVISION,
        ];
    }

    /**
     * Get validation rule string for approval statuses
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
