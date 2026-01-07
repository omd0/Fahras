<?php

namespace App\Constants;

class AdvisorRole
{
    public const MAIN = 'MAIN';
    public const CO_ADVISOR = 'CO_ADVISOR';
    public const REVIEWER = 'REVIEWER';

    /**
     * Get all available advisor roles
     *
     * @return array
     */
    public static function all(): array
    {
        return [
            self::MAIN,
            self::CO_ADVISOR,
            self::REVIEWER,
        ];
    }

    /**
     * Get validation rule string for advisor roles
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
