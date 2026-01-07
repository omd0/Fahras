<?php

namespace App\Constants;

class MemberRole
{
    public const LEAD = 'LEAD';
    public const MEMBER = 'MEMBER';

    /**
     * Get all available member roles
     *
     * @return array
     */
    public static function all(): array
    {
        return [
            self::LEAD,
            self::MEMBER,
        ];
    }

    /**
     * Get validation rule string for member roles
     *
     * @return string
     */
    public static function validationRule(): string
    {
        return 'in:' . implode(',', self::all());
    }

    /**
     * Check if a role is valid
     *
     * @param string $role
     * @return bool
     */
    public static function isValid(string $role): bool
    {
        return in_array($role, self::all());
    }
}
